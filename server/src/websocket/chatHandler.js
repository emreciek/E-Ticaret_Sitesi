// =============================================================================
// E-TİCARET MARKETPLACE - WEBSOCKET CHAT HANDLER
// =============================================================================
// Bu dosya Socket.io ile gerçek zamanlı mesajlaşmayı yönetir.
// Mesaj gönderme, moderasyon ve bildirimler burada işlenir.
// =============================================================================

const jwt = require('jsonwebtoken');
const { Message, User } = require('../config/database');
const { analyzeMessage, applyPenalty, checkBanStatus, sanitizeMessage } = require('../services/moderationService');
const { v4: uuidv4 } = require('uuid');

// =============================================================================
// WEBSOCKET KURULUM FONKSİYONU
// =============================================================================
const setupWebSocket = (io) => {

    // -------------------------------------------------------------------------
    // BAĞLANTI KİMLİK DOĞRULAMASI
    // -------------------------------------------------------------------------
    // Her bağlantıda JWT token doğrulaması yapar
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Kimlik doğrulama gerekli'));
            }

            // Token'ı doğrula
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

            // Kullanıcıyı bul
            const user = await User.findByPk(decoded.userId);

            if (!user) {
                return next(new Error('Kullanıcı bulunamadı'));
            }

            // Ban kontrolü
            const banStatus = await checkBanStatus(user.id);
            if (banStatus.isBanned) {
                return next(new Error(banStatus.message));
            }

            // Kullanıcı bilgisini socket'e ekle
            socket.user = user;
            socket.userId = user.id;

            next();
        } catch (error) {
            console.error('WebSocket Auth Hatası:', error.message);
            return next(new Error('Geçersiz token'));
        }
    });

    // -------------------------------------------------------------------------
    // BAĞLANTI OLAYI
    // -------------------------------------------------------------------------
    io.on('connection', (socket) => {
        console.log(`✅ Kullanıcı bağlandı: ${socket.user.name} (${socket.userId})`);

        // Kullanıcıyı kendi odasına ekle (özel mesajlar için)
        socket.join(socket.userId);

        // -----------------------------------------------------------------------
        // MESAJ GÖNDERME
        // -----------------------------------------------------------------------
        socket.on('send_message', async (data) => {
            try {
                const { receiver_id, content, conversation_id } = data;

                // Gerekli alanları kontrol et
                if (!receiver_id || !content) {
                    socket.emit('error', { message: 'Alıcı ve mesaj içeriği gerekli' });
                    return;
                }

                // Ban kontrolü
                const banStatus = await checkBanStatus(socket.userId);
                if (banStatus.isBanned) {
                    socket.emit('moderation_warning', {
                        type: 'banned',
                        message: banStatus.message,
                        bannedUntil: banStatus.bannedUntil
                    });
                    return;
                }

                // Mesajı temizle (XSS koruması)
                const sanitizedContent = sanitizeMessage(content);

                // Moderasyon analizi
                const analysis = analyzeMessage(sanitizedContent);

                // Uygunsuz içerik tespit edildi
                if (!analysis.isClean) {
                    console.log(`⚠️ Uygunsuz içerik tespit edildi - Kullanıcı: ${socket.user.name}, Tür: ${analysis.offenseType}`);

                    // Ceza uygula
                    const penalty = await applyPenalty(
                        socket.userId,
                        analysis.offenseType,
                        analysis.detectedWords.join(', ')
                    );

                    // Uyarı mesajı oluştur
                    let warningMessage = '';
                    switch (penalty.offenseCount) {
                        case 1:
                            warningMessage = '⚠️ Uygunsuz içerik tespit edildi. 1 saat boyunca mesaj gönderemezsiniz.';
                            break;
                        case 2:
                            warningMessage = '⚠️ 2. ihlal! 24 saat boyunca mesaj gönderemezsiniz.';
                            break;
                        case 3:
                            warningMessage = '⚠️ 3. ihlal! 1 hafta boyunca mesaj gönderemezsiniz.';
                            break;
                        default:
                            warningMessage = '🚫 Çok sayıda ihlal nedeniyle hesabınız incelemeye alınmıştır.';
                    }

                    socket.emit('moderation_warning', {
                        type: 'violation',
                        message: warningMessage,
                        offenseCount: penalty.offenseCount,
                        bannedUntil: penalty.bannedUntil,
                        isPermanent: penalty.isPermanent
                    });

                    return; // Mesajı gönderme
                }

                // Konuşma ID'si yoksa oluştur
                const convId = conversation_id || uuidv4();

                // Mesajı veritabanına kaydet
                const message = await Message.create({
                    conversation_id: convId,
                    sender_id: socket.userId,
                    receiver_id: receiver_id,
                    content: sanitizedContent,
                    is_flagged: false,
                    is_read: false
                });

                // Mesaj objesini hazırla
                const messageData = {
                    id: message.id,
                    conversation_id: convId,
                    sender_id: socket.userId,
                    receiver_id: receiver_id,
                    content: sanitizedContent,
                    is_flagged: false,
                    created_at: message.createdAt,
                    sender_name: socket.user.name
                };

                // Gönderene de teyit gönder
                socket.emit('message_sent', messageData);

                // Alıcıya mesajı gönder
                io.to(receiver_id).emit('new_message', messageData);

                console.log(`📨 Mesaj gönderildi: ${socket.user.name} → ${receiver_id}`);

            } catch (error) {
                console.error('Mesaj Gönderme Hatası:', error);
                socket.emit('error', { message: 'Mesaj gönderilemedi' });
            }
        });

        // -----------------------------------------------------------------------
        // MESAJ OKUNDU BİLDİRİMİ
        // -----------------------------------------------------------------------
        socket.on('mark_read', async (data) => {
            try {
                const { conversation_id } = data;

                // Konuşmadaki okunmamış mesajları güncelle
                await Message.update(
                    { is_read: true },
                    {
                        where: {
                            conversation_id: conversation_id,
                            receiver_id: socket.userId,
                            is_read: false
                        }
                    }
                );

                console.log(`👁️ Mesajlar okundu: ${conversation_id}`);
            } catch (error) {
                console.error('Okundu İşaretleme Hatası:', error);
            }
        });

        // -----------------------------------------------------------------------
        // YAZMA DURUMU
        // -----------------------------------------------------------------------
        socket.on('typing', (data) => {
            const { receiver_id, isTyping } = data;

            // Alıcıya yazma durumunu bildir
            io.to(receiver_id).emit('user_typing', {
                sender_id: socket.userId,
                sender_name: socket.user.name,
                isTyping: isTyping
            });
        });

        // -----------------------------------------------------------------------
        // BAĞLANTI KOPMA
        // -----------------------------------------------------------------------
        socket.on('disconnect', () => {
            console.log(`❌ Kullanıcı ayrıldı: ${socket.user.name}`);
        });
    });
};

module.exports = { setupWebSocket };

// =============================================================================
// E-TİCARET MARKETPLACE - MESAJ ROTALARI
// =============================================================================
// Bu dosya mesajlaşma API endpoint'lerini içerir.
// Konuşma listesi ve mesaj geçmişi işlemleri.
// =============================================================================

const express = require('express');
const { Message, User } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { Op, Sequelize } = require('sequelize');

const router = express.Router();

// =============================================================================
// KONUŞMA LİSTESİ
// =============================================================================
// GET /api/messages/conversations
// Kullanıcının tüm konuşmalarını getirir
router.get('/conversations', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Kullanıcının dahil olduğu tüm konuşmaları bul
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { sender_id: userId },
                    { receiver_id: userId }
                ]
            },
            order: [['created_at', 'DESC']],
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name'] },
                { model: User, as: 'receiver', attributes: ['id', 'name'] }
            ]
        });

        // Konuşmaları grupla
        const conversationsMap = new Map();

        messages.forEach(msg => {
            const convId = msg.conversation_id;

            if (!conversationsMap.has(convId)) {
                // Karşı tarafın bilgilerini belirle
                const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;

                conversationsMap.set(convId, {
                    id: convId,
                    other_user_id: otherUser.id,
                    other_user_name: otherUser.name,
                    last_message: msg.content,
                    last_message_time: msg.createdAt,
                    unread_count: 0
                });
            }

            // Okunmamış mesaj sayısı
            if (msg.receiver_id === userId && !msg.is_read) {
                const conv = conversationsMap.get(convId);
                conv.unread_count++;
            }
        });

        // Map'i array'e çevir ve sırala
        const conversations = Array.from(conversationsMap.values())
            .sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));

        res.json({
            success: true,
            conversations
        });
    } catch (error) {
        console.error('Konuşma Listesi Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Konuşmalar yüklenirken bir hata oluştu'
        });
    }
});

// =============================================================================
// KONUŞMA MESAJLARI
// =============================================================================
// GET /api/messages/:conversationId
// Belirli bir konuşmanın mesajlarını getirir
router.get('/:conversationId', authenticateToken, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        // Konuşmanın mesajlarını getir
        const messages = await Message.findAll({
            where: {
                conversation_id: conversationId,
                [Op.or]: [
                    { sender_id: userId },
                    { receiver_id: userId }
                ]
            },
            order: [['created_at', 'ASC']],
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name'] },
                { model: User, as: 'receiver', attributes: ['id', 'name'] }
            ]
        });

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Mesaj Geçmişi Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Mesajlar yüklenirken bir hata oluştu'
        });
    }
});

// =============================================================================
// MESAJLARI OKUNDU OLARAK İŞARETLE
// =============================================================================
// PUT /api/messages/:conversationId/read
router.put('/:conversationId/read', authenticateToken, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        // Kullanıcının aldığı okunmamış mesajları güncelle
        await Message.update(
            { is_read: true },
            {
                where: {
                    conversation_id: conversationId,
                    receiver_id: userId,
                    is_read: false
                }
            }
        );

        res.json({
            success: true,
            message: 'Mesajlar okundu olarak işaretlendi'
        });
    } catch (error) {
        console.error('Okundu İşaretleme Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Mesajlar işaretlenirken bir hata oluştu'
        });
    }
});

// =============================================================================
// MESAJ GÖNDER (HTTP - Socket olmadan)
// =============================================================================
// POST /api/messages
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { receiver_id, content, conversation_id } = req.body;
        const { v4: uuidv4 } = require('uuid');
        const { sanitizeMessage, analyzeMessage, applyPenalty, checkBanStatus } = require('../services/moderationService');

        // Ban kontrolü
        const banStatus = await checkBanStatus(req.user.id);
        if (banStatus.isBanned) {
            return res.status(403).json({
                success: false,
                message: banStatus.message
            });
        }

        // Mesajı temizle
        const sanitizedContent = sanitizeMessage(content);

        // Moderasyon analizi
        const analysis = analyzeMessage(sanitizedContent);

        if (!analysis.isClean) {
            // Ceza uygula
            const penalty = await applyPenalty(req.user.id, analysis.offenseType, analysis.detectedWords.join(', '));

            return res.status(400).json({
                success: false,
                message: 'Mesajınız uygunsuz içerik içermektedir',
                moderation: {
                    offenseCount: penalty.offenseCount,
                    bannedUntil: penalty.bannedUntil
                }
            });
        }

        // Konuşma ID
        const convId = conversation_id || uuidv4();

        // Mesaj oluştur
        const message = await Message.create({
            conversation_id: convId,
            sender_id: req.user.id,
            receiver_id,
            content: sanitizedContent,
            is_flagged: false,
            is_read: false
        });

        res.status(201).json({
            success: true,
            message: message
        });
    } catch (error) {
        console.error('Mesaj Gönderme Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Mesaj gönderilemedi'
        });
    }
});

module.exports = router;

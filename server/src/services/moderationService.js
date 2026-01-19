// =============================================================================
// E-TİCARET MARKETPLACE - MODERASYON SERVİSİ
// =============================================================================
// Bu servis mesaj içeriklerini analiz eder ve uygunsuz içerikleri tespit eder.
// NLP tabanlı filtreleme ve progresif ban sistemi içerir.
// =============================================================================

const Filter = require('bad-words');
const { User, ModerationLog } = require('../config/database');

// =============================================================================
// KÖTÜ KELİME FİLTRESİ KURULUMU
// =============================================================================
// bad-words kütüphanesini Türkçe kelimelerle genişletiyoruz
const filter = new Filter();

// Türkçe uygunsuz kelimeler listesi
// NOT: Bu temel bir listedir, üretimde daha kapsamlı bir liste kullanılmalı
const turkishBadWords = [
    // Hakaret içeren kelimeler (kısaltılmış örnekler)
    'aptal', 'salak', 'gerizekalı', 'ahmak', 'dangalak',
    'mal', 'geri zekalı', 'beyinsiz', 'embesil',
    // Irkçı/Nefret söylemi (temel örnekler)
    // Gerçek uygulamada daha kapsamlı ve profesyonel bir liste kullanılmalı
];

// Türkçe kelimeleri filtreye ekle
filter.addWords(...turkishBadWords);

// =============================================================================
// MESAJ ANALİZ FONKSİYONU
// =============================================================================
// Bir mesajın uygunsuz içerik içerip içermediğini kontrol eder
const analyzeMessage = (content) => {
    // Sonuç objesi
    const result = {
        isClean: true,       // Mesaj temiz mi?
        isProfanity: false,  // Küfür içeriyor mu?
        isHateSpeech: false, // Nefret söylemi içeriyor mu?
        isSpam: false,       // Spam mı?
        detectedWords: [],   // Tespit edilen kelimeler
        offenseType: null    // Suç türü
    };

    // Boş mesaj kontrolü
    if (!content || content.trim().length === 0) {
        return result;
    }

    const lowerContent = content.toLowerCase();

    // -------------------------------------------------------------------------
    // KÜFÜR KONTROLÜ
    // -------------------------------------------------------------------------
    try {
        if (filter.isProfane(content)) {
            result.isClean = false;
            result.isProfanity = true;
            result.offenseType = 'profanity';

            // Hangi kelimelerin tespit edildiğini bul
            const words = content.split(/\s+/);
            words.forEach(word => {
                if (filter.isProfane(word)) {
                    result.detectedWords.push(word);
                }
            });
        }
    } catch (err) {
        console.error('Küfür filtresi hatası:', err);
    }

    // -------------------------------------------------------------------------
    // NEFRET SÖYLEMİ KONTROLÜ
    // -------------------------------------------------------------------------
    // Temel nefret söylemi kalıpları
    const hateSpeechPatterns = [
        /ırk\s*(ç|c)ı/i,
        /faşist/i,
        /nazi/i,
        /ölü?n/i,  // Ölüm tehditleri
        /öldür/i,
        /gebertir/i
    ];

    for (const pattern of hateSpeechPatterns) {
        if (pattern.test(lowerContent)) {
            result.isClean = false;
            result.isHateSpeech = true;
            result.offenseType = 'hate_speech';
            break;
        }
    }

    // -------------------------------------------------------------------------
    // SPAM KONTROLÜ
    // -------------------------------------------------------------------------
    // Tekrarlayan karakterler veya kelimeler
    const repeatedChars = /(.)\1{4,}/; // 5+ aynı karakter
    const repeatedWords = /(\b\w+\b)(\s+\1){2,}/i; // 3+ aynı kelime

    if (repeatedChars.test(content) || repeatedWords.test(content)) {
        // Spam tek başına ban sebebi değil, sadece işaretle
        result.isSpam = true;
        if (!result.offenseType) {
            result.offenseType = 'spam';
        }
    }

    return result;
};

// =============================================================================
// PROGRESİF BAN SİSTEMİ
// =============================================================================
// İhlal sayısına göre ceza uygular:
// 1. İhlal: 1 saat
// 2. İhlal: 24 saat
// 3. İhlal: 1 hafta
// 4+ İhlal: Kalıcı ban incelemesi

const BAN_DURATIONS = {
    1: 60 * 60 * 1000,           // 1 saat (milisaniye)
    2: 24 * 60 * 60 * 1000,      // 24 saat
    3: 7 * 24 * 60 * 60 * 1000,  // 1 hafta
    4: null                       // Kalıcı (null = sınırsız)
};

const BAN_ACTIONS = {
    1: '1hr_ban',
    2: '24hr_ban',
    3: '1week_ban',
    4: 'permanent_review'
};

// =============================================================================
// KULLANICIYA CEZA UYGULA
// =============================================================================
const applyPenalty = async (userId, offenseType, detectedContent, messageId = null) => {
    try {
        // Kullanıcıyı bul
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('Kullanıcı bulunamadı');
        }

        // Mevcut ban durumunu al
        const currentBanStatus = user.ban_status || { offense_count: 0, banned_until: null, permanent: false };

        // İhlal sayısını artır
        const newOffenseCount = currentBanStatus.offense_count + 1;

        // Uygulanacak cezayı belirle
        const penaltyLevel = Math.min(newOffenseCount, 4); // Maksimum 4
        const banDuration = BAN_DURATIONS[penaltyLevel];
        const actionTaken = BAN_ACTIONS[penaltyLevel];

        // Yeni ban bitiş tarihi
        let bannedUntil = null;
        let isPermanent = false;

        if (banDuration === null) {
            // Kalıcı ban (inceleme gerekli)
            isPermanent = true;
        } else if (banDuration) {
            bannedUntil = new Date(Date.now() + banDuration);
        }

        // Ban durumunu güncelle
        await user.update({
            ban_status: {
                offense_count: newOffenseCount,
                banned_until: bannedUntil,
                permanent: isPermanent
            }
        });

        // Moderasyon loguna kaydet
        const moderationLog = await ModerationLog.create({
            user_id: userId,
            message_id: messageId,
            offense_type: offenseType,
            detected_content: detectedContent,
            action_taken: actionTaken,
            banned_until: bannedUntil
        });

        // Sonuç döndür
        return {
            success: true,
            offenseCount: newOffenseCount,
            action: actionTaken,
            bannedUntil: bannedUntil,
            isPermanent: isPermanent,
            logId: moderationLog.id
        };
    } catch (error) {
        console.error('Ceza Uygulama Hatası:', error);
        throw error;
    }
};

// =============================================================================
// BAN DURUMU KONTROLÜ
// =============================================================================
const checkBanStatus = async (userId) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return { isBanned: false };
        }

        const banStatus = user.ban_status;

        // Kalıcı ban kontrolü
        if (banStatus?.permanent) {
            return {
                isBanned: true,
                isPermanent: true,
                message: 'Hesabınız kalıcı olarak askıya alınmıştır.'
            };
        }

        // Geçici ban kontrolü
        if (banStatus?.banned_until) {
            const bannedUntil = new Date(banStatus.banned_until);

            if (bannedUntil > new Date()) {
                return {
                    isBanned: true,
                    isPermanent: false,
                    bannedUntil: bannedUntil,
                    message: `Hesabınız ${bannedUntil.toLocaleString('tr-TR')} tarihine kadar askıya alınmıştır.`
                };
            } else {
                // Ban süresi dolmuş, temizle
                await user.update({
                    ban_status: {
                        ...banStatus,
                        banned_until: null
                    }
                });
            }
        }

        return { isBanned: false };
    } catch (error) {
        console.error('Ban Kontrolü Hatası:', error);
        return { isBanned: false };
    }
};

// =============================================================================
// MESAJ TEMİZLEME (SANİTİZE)
// =============================================================================
// XSS saldırılarına karşı mesaj içeriğini temizler
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const sanitizeMessage = (content) => {
    if (!content) return '';

    // HTML etiketlerini temizle
    let sanitized = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [],  // Hiçbir HTML etiketi izin verilmez
        ALLOWED_ATTR: []   // Hiçbir attribute izin verilmez
    });

    // Trim ve uzunluk sınırı
    sanitized = sanitized.trim().substring(0, 5000);

    return sanitized;
};

// =============================================================================
// DIŞA AKTARMA
// =============================================================================
module.exports = {
    analyzeMessage,
    applyPenalty,
    checkBanStatus,
    sanitizeMessage,
    filter,
    BAN_DURATIONS,
    BAN_ACTIONS
};

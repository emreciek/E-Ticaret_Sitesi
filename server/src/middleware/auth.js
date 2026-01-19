// =============================================================================
// E-TİCARET MARKETPLACE - KİMLİK DOĞRULAMA MİDDLEWARE
// =============================================================================
// Bu middleware JWT token doğrulaması yapar.
// Korunan rotalar için kullanıcı kimliğini kontrol eder.
// =============================================================================

const jwt = require('jsonwebtoken');
const { User } = require('../config/database');

// =============================================================================
// JWT TOKEN DOĞRULAMA MİDDLEWARE
// =============================================================================
// Bu middleware Authorization header'ından token alır ve doğrular
const authenticateToken = async (req, res, next) => {
    try {
        // Authorization header'ını al
        const authHeader = req.headers.authorization;

        // Header yoksa veya Bearer ile başlamıyorsa hata
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Yetkilendirme token\'ı bulunamadı'
            });
        }

        // Token'ı ayıkla (Bearer kısmını çıkar)
        const token = authHeader.split(' ')[1];

        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        // Kullanıcıyı veritabanından al
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        // Ban kontrolü
        if (user.ban_status?.permanent) {
            return res.status(403).json({
                success: false,
                message: 'Hesabınız kalıcı olarak askıya alınmıştır'
            });
        }

        if (user.ban_status?.banned_until) {
            const bannedUntil = new Date(user.ban_status.banned_until);
            if (bannedUntil > new Date()) {
                return res.status(403).json({
                    success: false,
                    message: `Hesabınız ${bannedUntil.toLocaleString('tr-TR')} tarihine kadar askıya alınmıştır`,
                    banned_until: bannedUntil
                });
            }
        }

        // Kullanıcı bilgisini request'e ekle
        req.user = user;

        // Sonraki middleware'e geç
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token süresi dolmuş, lütfen tekrar giriş yapın'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz token'
            });
        }

        console.error('Auth Middleware Hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Kimlik doğrulama hatası'
        });
    }
};

// =============================================================================
// SATICI YETKİSİ KONTROLÜ
// =============================================================================
// Sadece satıcı veya admin rolündeki kullanıcılara izin verir
const requireSeller = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Önce giriş yapmalısınız'
        });
    }

    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Bu işlem için satıcı yetkisi gereklidir'
        });
    }

    next();
};

// =============================================================================
// ADMİN YETKİSİ KONTROLÜ
// =============================================================================
// Sadece admin rolündeki kullanıcılara izin verir
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Önce giriş yapmalısınız'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Bu işlem için admin yetkisi gereklidir'
        });
    }

    next();
};

// =============================================================================
// OPSİYONEL KİMLİK DOĞRULAMA
// =============================================================================
// Token varsa kullanıcıyı ekler, yoksa devam eder
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            const user = await User.findByPk(decoded.userId);

            if (user) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Token hatası olsa bile devam et
        next();
    }
};

module.exports = {
    authenticateToken,
    requireSeller,
    requireAdmin,
    optionalAuth
};

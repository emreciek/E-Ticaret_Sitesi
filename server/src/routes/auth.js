// =============================================================================
// E-TİCARET MARKETPLACE - KİMLİK DOĞRULAMA ROTALARI
// =============================================================================
// Bu dosya kullanıcı giriş, kayıt ve profil yönetimi API'lerini içerir.
// JWT token tabanlı kimlik doğrulama kullanılır.
// =============================================================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// =============================================================================
// KULLANICI KAYIT
// =============================================================================
// POST /api/auth/register
// Yeni kullanıcı kaydı oluşturur
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // E-posta kontrolü
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Bu e-posta adresi zaten kullanılıyor'
            });
        }

        // Satıcı için telefon zorunlu
        if (role === 'seller' && !phone) {
            return res.status(400).json({
                success: false,
                message: 'Satıcılar için telefon numarası zorunludur'
            });
        }

        // Şifreyi hash'le
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // Kullanıcı oluştur
        const user = await User.create({
            name,
            email,
            password_hash: passwordHash,
            role: role || 'buyer',
            phone: phone || null,
            is_verified: false,
            ban_status: { offense_count: 0, banned_until: null, permanent: false }
        });

        // JWT token oluştur
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Kayıt başarılı',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                is_verified: user.is_verified
            }
        });
    } catch (error) {
        console.error('Kayıt Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kayıt sırasında bir hata oluştu'
        });
    }
});

// =============================================================================
// KULLANICI GİRİŞ
// =============================================================================
// POST /api/auth/login
// E-posta ve şifre ile giriş yapar
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kullanıcıyı bul (şifre dahil)
        const user = await User.scope('withPassword').findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'E-posta veya şifre hatalı'
            });
        }

        // Şifre kontrolü
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'E-posta veya şifre hatalı'
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
                    message: `Hesabınız ${bannedUntil.toLocaleString('tr-TR')} tarihine kadar askıya alınmıştır`
                });
            }
        }

        // JWT token oluştur
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            message: 'Giriş başarılı',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                is_verified: user.is_verified
            }
        });
    } catch (error) {
        console.error('Giriş Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Giriş sırasında bir hata oluştu'
        });
    }
});

// =============================================================================
// MEVCUT KULLANICI BİLGİSİ
// =============================================================================
// GET /api/auth/me
// Token'dan kullanıcı bilgisi döner
router.get('/me', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                phone: req.user.phone,
                is_verified: req.user.is_verified
            }
        });
    } catch (error) {
        console.error('Kullanıcı Bilgisi Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı bilgisi alınamadı'
        });
    }
});

// =============================================================================
// PROFİL GÜNCELLEME
// =============================================================================
// PUT /api/auth/profile
// Kullanıcı profil bilgilerini günceller
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { name, phone } = req.body;

        // Güncellenecek alanlar
        const updates = {};
        if (name) updates.name = name;
        if (phone) updates.phone = phone;

        await req.user.update(updates);

        res.json({
            success: true,
            message: 'Profil güncellendi',
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                phone: req.user.phone,
                is_verified: req.user.is_verified
            }
        });
    } catch (error) {
        console.error('Profil Güncelleme Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Profil güncellenemedi'
        });
    }
});

// =============================================================================
// ŞİFRE DEĞİŞTİRME
// =============================================================================
// PUT /api/auth/password
router.put('/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Mevcut kullanıcıyı şifre ile al
        const user = await User.scope('withPassword').findByPk(req.user.id);

        // Mevcut şifre kontrolü
        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Mevcut şifre hatalı'
            });
        }

        // Yeni şifreyi hash'le
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await user.update({ password_hash: passwordHash });

        res.json({
            success: true,
            message: 'Şifre başarıyla değiştirildi'
        });
    } catch (error) {
        console.error('Şifre Değiştirme Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Şifre değiştirilemedi'
        });
    }
});

module.exports = router;

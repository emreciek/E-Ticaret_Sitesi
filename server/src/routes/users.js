// =============================================================================
// E-TİCARET MARKETPLACE - KULLANICI ROTALARI
// =============================================================================
// Bu dosya kullanıcı profil görüntüleme API'lerini içerir.
// Satıcı mağaza bilgileri için kullanılır.
// =============================================================================

const express = require('express');
const { User } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// =============================================================================
// KULLANICI PROFİLİ (HERKESE AÇIK)
// =============================================================================
// GET /api/users/:id
// Satıcı mağaza sayfası için kullanıcı bilgisi
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'name', 'email', 'phone', 'role', 'is_verified', 'createdAt']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        // Sadece satıcı ise detaylı bilgi ver
        if (user.role !== 'seller' && user.role !== 'admin') {
            // Alıcı profilleri gizli
            return res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    role: user.role
                }
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                is_verified: user.is_verified,
                member_since: user.createdAt
            }
        });
    } catch (error) {
        console.error('Kullanıcı Profil Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı bilgisi alınamadı'
        });
    }
});

module.exports = router;

// =============================================================================
// E-TİCARET MARKETPLACE - BOOST PLANLARI ROTALARI
// =============================================================================
// Bu dosya satıcı görünürlük planları için API endpoint'lerini içerir.
// Satıcılar bu planları satın alarak ürünlerini öne çıkarabilir.
// =============================================================================

const express = require('express');
const { BoostSubscription, Product, User } = require('../config/database');
const { authenticateToken, requireSeller } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// =============================================================================
// BOOST PLAN TANIMLARI
// =============================================================================
const BOOST_PLANS = [
    {
        tier: 1,
        name: 'Bronze',
        nameT: 'Bronz',
        description: 'Temel görünürlük artışı',
        price: 49.99,
        duration: 7, // gün
        features: [
            'Arama sonuçlarında öncelik',
            '7 gün geçerli'
        ],
        color: 'bronze'
    },
    {
        tier: 2,
        name: 'Silver',
        nameT: 'Gümüş',
        description: 'Gelişmiş görünürlük ve öne çıkarma',
        price: 99.99,
        duration: 15, // gün
        features: [
            'Arama sonuçlarında yüksek öncelik',
            'Ana sayfada gösterim',
            '15 gün geçerli'
        ],
        color: 'silver'
    },
    {
        tier: 3,
        name: 'Gold',
        nameT: 'Altın',
        description: 'Maksimum görünürlük ve premium özellikler',
        price: 199.99,
        duration: 30, // gün
        features: [
            'En yüksek arama önceliği',
            'Ana sayfada premium gösterim',
            'Öne çıkan ürünler bölümünde yer alma',
            '30 gün geçerli'
        ],
        color: 'gold'
    }
];

// =============================================================================
// MEVCUT PLANLARI LİSTELE
// =============================================================================
// GET /api/boost-plans
router.get('/', async (req, res) => {
    res.json({
        success: true,
        plans: BOOST_PLANS
    });
});

// =============================================================================
// SATICININ AKTİF ABONELİĞİ
// =============================================================================
// GET /api/boost-plans/my-subscription
router.get('/my-subscription', authenticateToken, requireSeller, async (req, res) => {
    try {
        const activeSubscription = await BoostSubscription.findOne({
            where: {
                seller_id: req.user.id,
                status: 'active',
                expires_at: { [Op.gt]: new Date() }
            },
            order: [['tier', 'DESC']]
        });

        if (!activeSubscription) {
            return res.json({
                success: true,
                subscription: null,
                message: 'Aktif abonelik bulunamadı'
            });
        }

        // Plan detaylarını ekle
        const planDetails = BOOST_PLANS.find(p => p.tier === activeSubscription.tier);

        res.json({
            success: true,
            subscription: {
                ...activeSubscription.toJSON(),
                plan: planDetails
            }
        });
    } catch (error) {
        console.error('Abonelik Sorgulama Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Abonelik bilgisi alınamadı'
        });
    }
});

// =============================================================================
// ABONELİK GEÇMİŞİ
// =============================================================================
// GET /api/boost-plans/history
router.get('/history', authenticateToken, requireSeller, async (req, res) => {
    try {
        const subscriptions = await BoostSubscription.findAll({
            where: { seller_id: req.user.id },
            order: [['created_at', 'DESC']],
            limit: 10
        });

        res.json({
            success: true,
            subscriptions
        });
    } catch (error) {
        console.error('Abonelik Geçmişi Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Abonelik geçmişi alınamadı'
        });
    }
});

// =============================================================================
// PLANA ABONE OL
// =============================================================================
// POST /api/boost-plans/subscribe
router.post('/subscribe', authenticateToken, requireSeller, async (req, res) => {
    try {
        const { tier } = req.body;

        // Plan kontrolü
        const plan = BOOST_PLANS.find(p => p.tier === tier);
        if (!plan) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz plan seçimi'
            });
        }

        // Mevcut aktif abonelik kontrolü
        const existingSubscription = await BoostSubscription.findOne({
            where: {
                seller_id: req.user.id,
                status: 'active',
                expires_at: { [Op.gt]: new Date() }
            }
        });

        // Aynı veya daha yüksek tier varsa hata
        if (existingSubscription && existingSubscription.tier >= tier) {
            return res.status(400).json({
                success: false,
                message: 'Zaten aynı veya daha yüksek seviye bir aboneliğiniz var'
            });
        }

        // Başlangıç ve bitiş tarihlerini hesapla
        const startsAt = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + plan.duration);

        // Abonelik oluştur
        const subscription = await BoostSubscription.create({
            seller_id: req.user.id,
            tier: tier,
            starts_at: startsAt,
            expires_at: expiresAt,
            amount_paid: plan.price,
            status: 'active'
        });

        // Eski aboneliği iptal et (varsa)
        if (existingSubscription) {
            await existingSubscription.update({ status: 'upgraded' });
        }

        // Satıcının tüm ürünlerinin boost_tier'ını güncelle
        await Product.update(
            { boost_tier: tier },
            { where: { seller_id: req.user.id, is_published: true } }
        );

        res.status(201).json({
            success: true,
            message: `${plan.nameT} planına başarıyla abone oldunuz!`,
            subscription: {
                ...subscription.toJSON(),
                plan: plan
            }
        });
    } catch (error) {
        console.error('Abonelik Oluşturma Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Abonelik oluşturulurken bir hata oluştu'
        });
    }
});

// =============================================================================
// ABONELİĞİ İPTAL ET
// =============================================================================
// DELETE /api/boost-plans/cancel
router.delete('/cancel', authenticateToken, requireSeller, async (req, res) => {
    try {
        const subscription = await BoostSubscription.findOne({
            where: {
                seller_id: req.user.id,
                status: 'active',
                expires_at: { [Op.gt]: new Date() }
            }
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Aktif abonelik bulunamadı'
            });
        }

        // Aboneliği iptal et
        await subscription.update({ status: 'cancelled' });

        // Ürünlerin boost_tier'ını sıfırla
        await Product.update(
            { boost_tier: 0 },
            { where: { seller_id: req.user.id } }
        );

        res.json({
            success: true,
            message: 'Abonelik iptal edildi'
        });
    } catch (error) {
        console.error('Abonelik İptal Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Abonelik iptal edilirken bir hata oluştu'
        });
    }
});

module.exports = router;

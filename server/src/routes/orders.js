// =============================================================================
// E-TİCARET MARKETPLACE - SİPARİŞ ROTALARI
// =============================================================================
// Bu dosya sipariş işlemleri için API endpoint'lerini içerir.
// Sipariş oluşturma ve %5 komisyon hesaplaması dahil.
// =============================================================================

const express = require('express');
const { Transaction, Product, User } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Komisyon oranı (%5)
const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE || 5) / 100;

// =============================================================================
// KULLANICININ SİPARİŞLERİ
// =============================================================================
// GET /api/orders
// Alıcının aldığı veya satıcının sattığı siparişler
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const isSeller = req.user.role === 'seller' || req.user.role === 'admin';

        // Sorgu koşulları
        const where = isSeller
            ? { seller_id: userId }  // Satıcı: sattıkları
            : { buyer_id: userId };   // Alıcı: aldıkları

        const orders = await Transaction.findAll({
            where,
            order: [['created_at', 'DESC']],
            include: [
                { model: Product, as: 'product', attributes: ['id', 'title', 'images'] },
                { model: User, as: 'buyer', attributes: ['id', 'name'] },
                { model: User, as: 'seller', attributes: ['id', 'name'] }
            ]
        });

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Sipariş Listesi Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Siparişler yüklenirken bir hata oluştu'
        });
    }
});

// =============================================================================
// SİPARİŞ DETAYI
// =============================================================================
// GET /api/orders/:id
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const order = await Transaction.findByPk(req.params.id, {
            include: [
                { model: Product, as: 'product' },
                { model: User, as: 'buyer', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone'] }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Sipariş bulunamadı'
            });
        }

        // Kullanıcı bu siparişe erişebilir mi?
        if (order.buyer_id !== req.user.id &&
            order.seller_id !== req.user.id &&
            req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bu siparişi görüntüleme yetkiniz yok'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Sipariş Detay Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sipariş bilgisi alınamadı'
        });
    }
});

// =============================================================================
// YENİ SİPARİŞ OLUŞTUR
// =============================================================================
// POST /api/orders
// Ürün satın alma işlemi - %5 komisyon otomatik hesaplanır
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { product_id } = req.body;
        const buyerId = req.user.id;

        // Ürünü bul
        const product = await Product.findByPk(product_id, {
            include: [{ model: User, as: 'seller' }]
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı'
            });
        }

        // Kendi ürününü satın alamaz
        if (product.seller_id === buyerId) {
            return res.status(400).json({
                success: false,
                message: 'Kendi ürününüzü satın alamazsınız'
            });
        }

        // Fiyat ve komisyon hesapla
        const amount = parseFloat(product.price);
        const commission = amount * COMMISSION_RATE; // %5 komisyon

        // Sipariş oluştur
        const order = await Transaction.create({
            product_id: product.id,
            buyer_id: buyerId,
            seller_id: product.seller_id,
            amount: amount,
            commission: commission,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Sipariş oluşturuldu',
            order: {
                id: order.id,
                amount: amount,
                commission: commission,
                net_amount: amount - commission, // Satıcıya gidecek tutar
                status: order.status
            }
        });
    } catch (error) {
        console.error('Sipariş Oluşturma Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sipariş oluşturulurken bir hata oluştu'
        });
    }
});

// =============================================================================
// SİPARİŞ DURUMU GÜNCELLE
// =============================================================================
// PUT /api/orders/:id/status
router.put('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'completed', 'refunded', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz sipariş durumu'
            });
        }

        const order = await Transaction.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Sipariş bulunamadı'
            });
        }

        // Yetki kontrolü (sadece satıcı veya admin)
        if (order.seller_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bu siparişi güncelleme yetkiniz yok'
            });
        }

        await order.update({ status });

        res.json({
            success: true,
            message: 'Sipariş durumu güncellendi',
            order
        });
    } catch (error) {
        console.error('Sipariş Güncelleme Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sipariş güncellenirken bir hata oluştu'
        });
    }
});

module.exports = router;

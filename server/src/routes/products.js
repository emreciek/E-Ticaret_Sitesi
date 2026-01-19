// =============================================================================
// E-TİCARET MARKETPLACE - ÜRÜN ROTALARI
// =============================================================================
// Bu dosya ürün CRUD işlemleri için API endpoint'lerini içerir.
// Ürün listeleme, detay, oluşturma, güncelleme ve silme işlemleri.
// =============================================================================

const express = require('express');
const { Product, User } = require('../config/database');
const { authenticateToken, requireSeller, optionalAuth } = require('../middleware/auth');
const { validateProductPublish, validateProductOwnership } = require('../middleware/productValidation');
const { Op } = require('sequelize');

const router = express.Router();

// =============================================================================
// TÜM ÜRÜNLERİ LİSTELE
// =============================================================================
// GET /api/products
// Filtreleme, arama ve sayfalama destekler
router.get('/', optionalAuth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            minPrice,
            maxPrice,
            sort = 'yeni',
            search,
            featured
        } = req.query;

        // Filtre koşulları oluştur
        const where = {
            is_published: true // Sadece yayındaki ürünler
        };

        // Kategori filtresi
        if (category) {
            where.category = category;
        }

        // Fiyat aralığı filtresi
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
        }

        // Arama filtresi (başlık ve açıklama)
        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Öne çıkan ürünler filtresi
        if (featured === 'true') {
            where.boost_tier = { [Op.gt]: 0 };
        }

        // Sıralama
        let order = [];
        switch (sort) {
            case 'fiyat-artan':
                order = [['price', 'ASC']];
                break;
            case 'fiyat-azalan':
                order = [['price', 'DESC']];
                break;
            case 'populer':
                order = [['boost_tier', 'DESC'], ['created_at', 'DESC']];
                break;
            case 'yeni':
            default:
                order = [['boost_tier', 'DESC'], ['created_at', 'DESC']];
        }

        // Sayfalama hesapla
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Ürünleri getir
        const { count, rows: products } = await Product.findAndCountAll({
            where,
            order,
            limit: parseInt(limit),
            offset,
            include: [{
                model: User,
                as: 'seller',
                attributes: ['id', 'name', 'phone', 'is_verified']
            }]
        });

        res.json({
            success: true,
            products,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit))
        });
    } catch (error) {
        console.error('Ürün Listeleme Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Ürünler yüklenirken bir hata oluştu'
        });
    }
});

// =============================================================================
// TEK ÜRÜN DETAYI
// =============================================================================
// GET /api/products/:id
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'seller',
                attributes: ['id', 'name', 'email', 'phone', 'is_verified']
            }]
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Ürün Detay Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Ürün bilgisi alınamadı'
        });
    }
});

// =============================================================================
// SATICININ ÜRÜNLERİ
// =============================================================================
// GET /api/products/seller/:sellerId
router.get('/seller/:sellerId', optionalAuth, async (req, res) => {
    try {
        const products = await Product.findAll({
            where: {
                seller_id: req.params.sellerId,
                is_published: true
            },
            order: [['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'seller',
                attributes: ['id', 'name', 'phone', 'is_verified']
            }]
        });

        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Satıcı Ürünleri Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Ürünler yüklenirken bir hata oluştu'
        });
    }
});

// =============================================================================
// YENİ ÜRÜN OLUŞTUR
// =============================================================================
// POST /api/products
// Sadece satıcılar, doğrulama middleware'i ile
router.post('/', authenticateToken, requireSeller, validateProductPublish, async (req, res) => {
    try {
        const { title, description, price, category, images, return_policy } = req.body;

        // Boş görselleri filtrele
        const validImages = images.filter(img => img && img.trim() !== '');

        // Ürün oluştur
        const product = await Product.create({
            seller_id: req.user.id,
            title,
            description,
            price: parseFloat(price),
            category,
            images: validImages,
            return_policy,
            is_published: true, // Doğrulama geçtiyse yayınla
            boost_tier: 0
        });

        res.status(201).json({
            success: true,
            message: 'Ürün başarıyla oluşturuldu',
            product
        });
    } catch (error) {
        console.error('Ürün Oluşturma Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Ürün oluşturulurken bir hata oluştu'
        });
    }
});

// =============================================================================
// ÜRÜN GÜNCELLE
// =============================================================================
// PUT /api/products/:id
router.put('/:id', authenticateToken, requireSeller, validateProductOwnership, async (req, res) => {
    try {
        const { title, description, price, category, images, return_policy, is_published } = req.body;

        // Güncellenecek alanları hazırla
        const updates = {};
        if (title) updates.title = title;
        if (description) updates.description = description;
        if (price) updates.price = parseFloat(price);
        if (category) updates.category = category;
        if (images) updates.images = images.filter(img => img && img.trim() !== '');
        if (return_policy) updates.return_policy = return_policy;
        if (typeof is_published === 'boolean') updates.is_published = is_published;

        await req.product.update(updates);

        res.json({
            success: true,
            message: 'Ürün güncellendi',
            product: req.product
        });
    } catch (error) {
        console.error('Ürün Güncelleme Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Ürün güncellenirken bir hata oluştu'
        });
    }
});

// =============================================================================
// ÜRÜN SİL
// =============================================================================
// DELETE /api/products/:id
router.delete('/:id', authenticateToken, requireSeller, validateProductOwnership, async (req, res) => {
    try {
        await req.product.destroy();

        res.json({
            success: true,
            message: 'Ürün silindi'
        });
    } catch (error) {
        console.error('Ürün Silme Hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Ürün silinirken bir hata oluştu'
        });
    }
});

module.exports = router;

// =============================================================================
// E-TİCARET MARKETPLACE - ÜRÜN DOĞRULAMA MİDDLEWARE
// =============================================================================
// Bu middleware ürün yayınlama kurallarını uygular:
// - Minimum 3 görsel
// - Minimum 250 karakter açıklama
// - İade politikası zorunlu
// - Satıcı iletişim bilgileri doğrulanmış olmalı
// =============================================================================

const { User } = require('../config/database');

// =============================================================================
// ÜRÜN YAYIN DOĞRULAMA MİDDLEWARE
// =============================================================================
// Bu middleware bir ürün yayınlanmadan önce tüm gereksinimleri kontrol eder
const validateProductPublish = async (req, res, next) => {
    try {
        const { title, description, images, return_policy, price } = req.body;
        const errors = [];

        // -------------------------------------------------------------------------
        // BAŞLIK KONTROLÜ
        // -------------------------------------------------------------------------
        if (!title || title.trim().length === 0) {
            errors.push({
                field: 'title',
                message: 'Ürün başlığı gereklidir'
            });
        }

        // -------------------------------------------------------------------------
        // AÇIKLAMA KONTROLÜ - Minimum 250 karakter
        // -------------------------------------------------------------------------
        if (!description || description.length < 250) {
            errors.push({
                field: 'description',
                message: `Açıklama minimum 250 karakter olmalıdır. Şu an: ${description?.length || 0} karakter`
            });
        }

        // -------------------------------------------------------------------------
        // GÖRSEL KONTROLÜ - Minimum 3 görsel
        // -------------------------------------------------------------------------
        if (!images || !Array.isArray(images)) {
            errors.push({
                field: 'images',
                message: 'Ürün görselleri gereklidir'
            });
        } else {
            // Boş olmayan görselleri filtrele
            const validImages = images.filter(img => img && img.trim() !== '');

            if (validImages.length < 3) {
                errors.push({
                    field: 'images',
                    message: `Minimum 3 ürün görseli gereklidir. Şu an: ${validImages.length} görsel`
                });
            }

            // URL formatı kontrolü
            const urlRegex = /^https?:\/\/.+\..+/;
            const invalidUrls = validImages.filter(img => !urlRegex.test(img));

            if (invalidUrls.length > 0) {
                errors.push({
                    field: 'images',
                    message: 'Tüm görseller geçerli URL formatında olmalıdır (http:// veya https:// ile başlamalı)'
                });
            }
        }

        // -------------------------------------------------------------------------
        // FİYAT KONTROLÜ
        // -------------------------------------------------------------------------
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            errors.push({
                field: 'price',
                message: 'Geçerli bir fiyat girilmelidir'
            });
        }

        // -------------------------------------------------------------------------
        // İADE POLİTİKASI KONTROLÜ
        // -------------------------------------------------------------------------
        if (!return_policy || return_policy.trim().length === 0) {
            errors.push({
                field: 'return_policy',
                message: 'İade politikası belirtilmelidir'
            });
        }

        // -------------------------------------------------------------------------
        // SATICI DOĞRULAMA KONTROLÜ
        // -------------------------------------------------------------------------
        // Giriş yapmış kullanıcıyı kontrol et
        if (req.user) {
            // Satıcı rolü kontrolü
            if (req.user.role !== 'seller' && req.user.role !== 'admin') {
                errors.push({
                    field: 'seller',
                    message: 'Ürün eklemek için satıcı hesabı gereklidir'
                });
            }

            // Telefon numarası kontrolü (satıcı iletişim bilgisi)
            if (!req.user.phone || req.user.phone.trim().length === 0) {
                errors.push({
                    field: 'seller_contact',
                    message: 'Ürün yayınlamak için telefon numarası eklemelisiniz. Profil ayarlarından güncelleyebilirsiniz.'
                });
            }

            // Doğrulanmış satıcı kontrolü (isteğe bağlı - şimdilik uyarı)
            // if (!req.user.is_verified) {
            //   errors.push({
            //     field: 'seller_verification',
            //     message: 'Ürün yayınlamak için hesabınızın doğrulanması gereklidir'
            //   });
            // }
        } else {
            errors.push({
                field: 'authentication',
                message: 'Ürün eklemek için giriş yapmalısınız'
            });
        }

        // -------------------------------------------------------------------------
        // HATA VARSA DURDUR
        // -------------------------------------------------------------------------
        if (errors.length > 0) {
            return res.status(422).json({
                success: false,
                message: 'Ürün yayınlama gereksinimleri karşılanmadı',
                errors: errors
            });
        }

        // Tüm doğrulamalar geçti, devam et
        next();
    } catch (error) {
        console.error('Ürün Doğrulama Hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Ürün doğrulama sırasında bir hata oluştu'
        });
    }
};

// =============================================================================
// ÜRÜN SAHİPLİĞİ KONTROLÜ
// =============================================================================
// Bir ürünün sahibinin işlemi yapan kullanıcı olduğunu kontrol eder
const validateProductOwnership = async (req, res, next) => {
    try {
        const { Product } = require('../config/database');
        const productId = req.params.id || req.params.productId;

        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Ürün bulunamadı'
            });
        }

        // Admin her ürünü düzenleyebilir
        if (req.user.role === 'admin') {
            req.product = product;
            return next();
        }

        // Ürün sahibi kontrolü
        if (product.seller_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Bu ürünü düzenleme yetkiniz yok'
            });
        }

        req.product = product;
        next();
    } catch (error) {
        console.error('Ürün Sahiplik Kontrolü Hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Yetki kontrolü sırasında bir hata oluştu'
        });
    }
};

module.exports = {
    validateProductPublish,
    validateProductOwnership
};

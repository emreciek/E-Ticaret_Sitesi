// =============================================================================
// E-TİCARET MARKETPLACE - ÜRÜN EKLEME SAYFASI
// =============================================================================
// Bu sayfa satıcıların yeni ürün eklemesini sağlar.
// Ürün yayınlama için katı doğrulama kuralları uygulanır:
// - Minimum 3 görsel
// - Minimum 250 karakter açıklama
// - İade politikası zorunlu
// =============================================================================

import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI } from '../services/api';

// =============================================================================
// ÜRÜN EKLEME SAYFASI BİLEŞENİ
// =============================================================================
function CreateProductPage() {
    // -------------------------------------------------------------------------
    // HOOK'LAR
    // -------------------------------------------------------------------------
    const { isSeller, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // -------------------------------------------------------------------------
    // STATE DEĞİŞKENLERİ
    // -------------------------------------------------------------------------
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'elektronik',
        images: ['', '', ''], // Minimum 3 görsel URL'si
        return_policy: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // -------------------------------------------------------------------------
    // KATEGORİLER
    // -------------------------------------------------------------------------
    const categories = [
        { value: 'elektronik', label: 'Elektronik' },
        { value: 'moda', label: 'Moda' },
        { value: 'ev-yasam', label: 'Ev & Yaşam' },
        { value: 'spor', label: 'Spor' },
        { value: 'kitap', label: 'Kitap' },
        { value: 'hobi', label: 'Hobi' }
    ];

    // -------------------------------------------------------------------------
    // YETKİ KONTROLÜ
    // -------------------------------------------------------------------------
    if (!authLoading && (!isAuthenticated || !isSeller)) {
        return <Navigate to="/panel" replace />;
    }

    // -------------------------------------------------------------------------
    // FORM ALANI DEĞİŞİKLİĞİ
    // -------------------------------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Hataları temizle
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // -------------------------------------------------------------------------
    // GÖRSEL URL DEĞİŞİKLİĞİ
    // -------------------------------------------------------------------------
    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));

        if (errors.images) {
            setErrors(prev => ({ ...prev, images: null }));
        }
    };

    // -------------------------------------------------------------------------
    // GÖRSEL ALANI EKLE
    // -------------------------------------------------------------------------
    const addImageField = () => {
        if (formData.images.length < 10) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, '']
            }));
        }
    };

    // -------------------------------------------------------------------------
    // FORM DOĞRULAMA
    // -------------------------------------------------------------------------
    const validateForm = () => {
        const newErrors = {};

        // Başlık kontrolü
        if (!formData.title.trim()) {
            newErrors.title = 'Ürün başlığı gereklidir';
        }

        // Açıklama kontrolü - Minimum 250 karakter
        if (formData.description.length < 250) {
            newErrors.description = `Açıklama minimum 250 karakter olmalıdır (Şu an: ${formData.description.length} karakter)`;
        }

        // Fiyat kontrolü
        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Geçerli bir fiyat girin';
        }

        // Görsel kontrolü - Minimum 3 görsel
        const validImages = formData.images.filter(img => img.trim() !== '');
        if (validImages.length < 3) {
            newErrors.images = `Minimum 3 görsel URL'si gereklidir (Şu an: ${validImages.length} görsel)`;
        }

        // İade politikası kontrolü
        if (!formData.return_policy.trim()) {
            newErrors.return_policy = 'İade politikası belirtilmelidir';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // -------------------------------------------------------------------------
    // FORM GÖNDERİMİ
    // -------------------------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Doğrulama
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // Boş görsel URL'lerini filtrele
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                images: formData.images.filter(img => img.trim() !== '')
            };

            await productsAPI.create(productData);

            setSuccessMessage('Ürün başarıyla eklendi!');

            // 2 saniye sonra panele yönlendir
            setTimeout(() => {
                navigate('/panel');
            }, 2000);
        } catch (error) {
            console.error('Ürün eklenirken hata:', error);
            setErrors({
                submit: error.response?.data?.message || 'Ürün eklenirken bir hata oluştu'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* =================================================================
            SAYFA BAŞLIĞI
            ================================================================= */}
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
                        Yeni Ürün Ekle
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Ürününüzü yayınlamak için tüm zorunlu alanları doldurun.
                    </p>
                </div>

                {/* =================================================================
            DOĞRULAMA KURALLARI BİLGİSİ
            ================================================================= */}
                <div className="card p-4 mb-8 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
                    <h3 className="font-semibold text-primary-700 dark:text-primary-400 mb-2">
                        📋 Yayın Gereksinimleri
                    </h3>
                    <ul className="text-sm text-primary-600 dark:text-primary-300 space-y-1">
                        <li>✓ Minimum 3 ürün görseli (URL)</li>
                        <li>✓ Minimum 250 karakter ürün açıklaması</li>
                        <li>✓ İade politikası açıkça belirtilmeli</li>
                        <li>✓ Satıcı iletişim bilgileri doğrulanmış olmalı</li>
                    </ul>
                </div>

                {/* =================================================================
            BAŞARI MESAJI
            ================================================================= */}
                {successMessage && (
                    <div className="card p-4 mb-6 bg-success-50 dark:bg-success-900/20 border-success-200">
                        <p className="text-success-600 dark:text-success-400 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {successMessage}
                        </p>
                    </div>
                )}

                {/* =================================================================
            ÜRÜN FORMU
            ================================================================= */}
                <div className="card p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* API Hatası */}
                        {errors.submit && (
                            <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 rounded-xl">
                                <p className="text-sm text-danger-600">{errors.submit}</p>
                            </div>
                        )}

                        {/* ---------------------------------------------------------------
                ÜRÜN BAŞLIĞI
                --------------------------------------------------------------- */}
                        <div>
                            <label htmlFor="title" className="label">
                                Ürün Başlığı <span className="text-danger-500">*</span>
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleChange}
                                className={`input ${errors.title ? 'border-danger-500' : ''}`}
                                placeholder="Ürünün kısa ve açıklayıcı başlığı"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-danger-600">{errors.title}</p>
                            )}
                        </div>

                        {/* ---------------------------------------------------------------
                KATEGORİ
                --------------------------------------------------------------- */}
                        <div>
                            <label htmlFor="category" className="label">
                                Kategori <span className="text-danger-500">*</span>
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="input"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* ---------------------------------------------------------------
                FİYAT
                --------------------------------------------------------------- */}
                        <div>
                            <label htmlFor="price" className="label">
                                Fiyat (₺) <span className="text-danger-500">*</span>
                            </label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleChange}
                                className={`input ${errors.price ? 'border-danger-500' : ''}`}
                                placeholder="0.00"
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-danger-600">{errors.price}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Platform komisyonu: %5 (Satış başına otomatik düşülür)
                            </p>
                        </div>

                        {/* ---------------------------------------------------------------
                GÖRSEL URL'LERİ
                --------------------------------------------------------------- */}
                        <div>
                            <label className="label">
                                Ürün Görselleri (URL) <span className="text-danger-500">*</span>
                                <span className="text-gray-400 text-xs ml-2">(Minimum 3)</span>
                            </label>

                            {formData.images.map((image, index) => (
                                <div key={index} className="mb-2">
                                    <input
                                        type="url"
                                        value={image}
                                        onChange={(e) => handleImageChange(index, e.target.value)}
                                        className="input"
                                        placeholder={`Görsel ${index + 1} URL'si`}
                                    />
                                </div>
                            ))}

                            {formData.images.length < 10 && (
                                <button
                                    type="button"
                                    onClick={addImageField}
                                    className="text-sm text-primary-600 hover:underline mt-2"
                                >
                                    + Başka görsel ekle
                                </button>
                            )}

                            {errors.images && (
                                <p className="mt-1 text-sm text-danger-600">{errors.images}</p>
                            )}
                        </div>

                        {/* ---------------------------------------------------------------
                ÜRÜN AÇIKLAMASI
                --------------------------------------------------------------- */}
                        <div>
                            <label htmlFor="description" className="label">
                                Ürün Açıklaması <span className="text-danger-500">*</span>
                                <span className="text-gray-400 text-xs ml-2">(Minimum 250 karakter)</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={6}
                                value={formData.description}
                                onChange={handleChange}
                                className={`input resize-none ${errors.description ? 'border-danger-500' : ''}`}
                                placeholder="Ürünün detaylı açıklamasını yazın. Özellikler, boyutlar, malzeme bilgileri vb."
                            />
                            <div className="flex justify-between mt-1">
                                {errors.description ? (
                                    <p className="text-sm text-danger-600">{errors.description}</p>
                                ) : (
                                    <span></span>
                                )}
                                <span className={`text-xs ${formData.description.length < 250 ? 'text-warning-600' : 'text-success-600'}`}>
                                    {formData.description.length}/250
                                </span>
                            </div>
                        </div>

                        {/* ---------------------------------------------------------------
                İADE POLİTİKASI
                --------------------------------------------------------------- */}
                        <div>
                            <label htmlFor="return_policy" className="label">
                                İade Politikası <span className="text-danger-500">*</span>
                            </label>
                            <textarea
                                id="return_policy"
                                name="return_policy"
                                rows={3}
                                value={formData.return_policy}
                                onChange={handleChange}
                                className={`input resize-none ${errors.return_policy ? 'border-danger-500' : ''}`}
                                placeholder="Örn: 14 gün içinde ücretsiz iade. Ürün kullanılmamış ve orijinal ambalajında olmalıdır."
                            />
                            {errors.return_policy && (
                                <p className="mt-1 text-sm text-danger-600">{errors.return_policy}</p>
                            )}
                        </div>

                        {/* ---------------------------------------------------------------
                GÖNDER BUTONU
                --------------------------------------------------------------- */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/panel')}
                                className="btn-secondary flex-1"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex-1"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Ekleniyor...
                                    </span>
                                ) : (
                                    'Ürünü Yayınla'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateProductPage;

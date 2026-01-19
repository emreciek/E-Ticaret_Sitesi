// =============================================================================
// E-TİCARET MARKETPLACE - ÜRÜN DETAY SAYFASI
// =============================================================================
// Bu sayfa tek bir ürünün detaylı görünümünü içerir.
// Görsel galerisi, açıklama, iade politikası ve satıcı bilgileri gösterilir.
// =============================================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// =============================================================================
// ÜRÜN DETAY SAYFASI BİLEŞENİ
// =============================================================================
function ProductDetailPage() {
    // -------------------------------------------------------------------------
    // URL PARAMETRESİ - Ürün ID
    // -------------------------------------------------------------------------
    const { productId } = useParams();

    // -------------------------------------------------------------------------
    // HOOK'LAR VE STATE
    // -------------------------------------------------------------------------
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [error, setError] = useState(null);

    // -------------------------------------------------------------------------
    // ÜRÜN VERİSİNİ YÜKLE
    // -------------------------------------------------------------------------
    useEffect(() => {
        const loadProduct = async () => {
            try {
                const response = await productsAPI.getById(productId);
                setProduct(response.data.product);
            } catch (err) {
                console.error('Ürün yüklenirken hata:', err);
                setError('Ürün bulunamadı');
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [productId]);

    // -------------------------------------------------------------------------
    // YÜKLENİYOR DURUMU
    // -------------------------------------------------------------------------
    if (loading) {
        return (
            <div className="min-h-screen bg-surface-light dark:bg-surface-dark py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
                        <div className="bg-gray-200 dark:bg-gray-700 h-96 rounded-2xl"></div>
                        <div className="space-y-4">
                            <div className="bg-gray-200 dark:bg-gray-700 h-8 rounded w-3/4"></div>
                            <div className="bg-gray-200 dark:bg-gray-700 h-6 rounded w-1/4"></div>
                            <div className="bg-gray-200 dark:bg-gray-700 h-32 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // HATA DURUMU
    // -------------------------------------------------------------------------
    if (error || !product) {
        return (
            <div className="min-h-screen bg-surface-light dark:bg-surface-dark py-8">
                <div className="max-w-7xl mx-auto px-4 text-center py-16">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Ürün Bulunamadı
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Aradığınız ürün mevcut değil veya kaldırılmış olabilir.
                    </p>
                    <Link to="/urunler" className="btn-primary">
                        Ürünlere Dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* =================================================================
            BREADCRUMB NAVİGASYON
            ================================================================= */}
                <nav className="mb-8">
                    <ol className="flex items-center space-x-2 text-sm">
                        <li>
                            <Link to="/" className="text-gray-500 hover:text-primary-600">
                                Ana Sayfa
                            </Link>
                        </li>
                        <li className="text-gray-400">/</li>
                        <li>
                            <Link to="/urunler" className="text-gray-500 hover:text-primary-600">
                                Ürünler
                            </Link>
                        </li>
                        <li className="text-gray-400">/</li>
                        <li className="text-gray-900 dark:text-white font-medium truncate max-w-xs">
                            {product.title}
                        </li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* =================================================================
              ÜRÜN GÖRSELLERİ (Sol Taraf)
              ================================================================= */}
                    <div>
                        {/* Ana Görsel */}
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-4 aspect-square">
                            <img
                                src={product.images?.[selectedImage] || '/placeholder-product.png'}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Görsel Küçük Resimleri */}
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === index
                                                ? 'border-primary-500 ring-2 ring-primary-500/20'
                                                : 'border-transparent hover:border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.title} - Görsel ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* =================================================================
              ÜRÜN BİLGİLERİ (Sağ Taraf)
              ================================================================= */}
                    <div>
                        {/* Ürün Başlığı */}
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">
                            {product.title}
                        </h1>

                        {/* Fiyat */}
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                                ₺{product.price?.toLocaleString('tr-TR')}
                            </span>
                        </div>

                        {/* Satıcı Bilgisi Kartı */}
                        <div className="card p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {/* Satıcı Avatarı */}
                                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                        <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                            {product.seller?.name?.charAt(0).toUpperCase() || 'S'}
                                        </span>
                                    </div>
                                    <div>
                                        <Link
                                            to={`/magaza/${product.seller?.id}`}
                                            className="font-medium text-gray-900 dark:text-white hover:text-primary-600"
                                        >
                                            {product.seller?.name || 'Satıcı'}
                                        </Link>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <span className="badge-success mr-2">Doğrulanmış</span>
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    to={`/magaza/${product.seller?.id}`}
                                    className="btn-secondary text-sm py-2"
                                >
                                    Mağazayı Gör
                                </Link>
                            </div>

                            {/* Satıcı İletişim Bilgileri */}
                            {product.seller?.phone && (
                                <div className="mt-4 pt-4 border-t border-surface-light-border dark:border-surface-dark-border">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {product.seller.phone}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Aksiyon Butonları */}
                        <div className="flex gap-4 mb-8">
                            {isAuthenticated ? (
                                <Link
                                    to={`/mesajlar?satici=${product.seller?.id}`}
                                    className="flex-1 btn-primary text-center"
                                >
                                    Satıcıya Mesaj Gönder
                                </Link>
                            ) : (
                                <Link
                                    to="/giris"
                                    className="flex-1 btn-primary text-center"
                                >
                                    Mesaj Göndermek İçin Giriş Yapın
                                </Link>
                            )}
                        </div>

                        {/* İade Politikası */}
                        {product.return_policy && (
                            <div className="card p-4 mb-6 bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800">
                                <h3 className="font-semibold text-success-700 dark:text-success-400 mb-2 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    İade Politikası
                                </h3>
                                <p className="text-sm text-success-600 dark:text-success-300">
                                    {product.return_policy}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* =================================================================
            ÜRÜN AÇIKLAMASI
            ================================================================= */}
                <div className="mt-12">
                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6">
                        Ürün Açıklaması
                    </h2>
                    <div className="card p-6">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                            {product.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetailPage;

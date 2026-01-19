// =============================================================================
// E-TİCARET MARKETPLACE - ANA SAYFA
// =============================================================================
// Bu sayfa ziyaretçilerin ilk gördüğü sayfadır.
// İçerir: Hero bölümü, öne çıkan ürünler, kategoriler, özellikler
// =============================================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';

// =============================================================================
// ANA SAYFA BİLEŞENİ
// =============================================================================
function HomePage() {
    // -------------------------------------------------------------------------
    // STATE - Öne çıkan ürünler
    // -------------------------------------------------------------------------
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // -------------------------------------------------------------------------
    // ÜRÜN VERİLERİNİ YÜKLE
    // -------------------------------------------------------------------------
    useEffect(() => {
        const loadFeaturedProducts = async () => {
            try {
                // API'den öne çıkan ürünleri al (limit: 8)
                const response = await productsAPI.getAll({ limit: 8, featured: true });
                setFeaturedProducts(response.data.products || []);
            } catch (error) {
                console.error('Ürünler yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };

        loadFeaturedProducts();
    }, []);

    // -------------------------------------------------------------------------
    // KATEGORİLER - Sabit veri
    // -------------------------------------------------------------------------
    const categories = [
        { name: 'Elektronik', icon: '📱', slug: 'elektronik' },
        { name: 'Moda', icon: '👕', slug: 'moda' },
        { name: 'Ev & Yaşam', icon: '🏠', slug: 'ev-yasam' },
        { name: 'Spor', icon: '⚽', slug: 'spor' },
        { name: 'Kitap', icon: '📚', slug: 'kitap' },
        { name: 'Hobi', icon: '🎨', slug: 'hobi' },
    ];

    // -------------------------------------------------------------------------
    // ÖZELLİKLER - Platform avantajları
    // -------------------------------------------------------------------------
    const features = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            title: 'Güvenli Alışveriş',
            description: 'Onaylı satıcılar ve güvenli ödeme sistemi ile güvenle alışveriş yapın.'
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            title: 'Anlık Mesajlaşma',
            description: 'Satıcılarla doğrudan iletişim kurun, sorularınızı anında sorun.'
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            title: 'Doğrulanmış Satıcılar',
            description: 'Tüm satıcıların iletişim bilgileri doğrulanmış ve onaylanmıştır.'
        }
    ];

    return (
        <div className="min-h-screen">
            {/* =================================================================
          HERO BÖLÜMÜ - Ana Tanıtım Alanı
          ================================================================= */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white">
                {/* Dekoratif arka plan deseni */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="text-center">
                        {/* Ana Başlık */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 animate-fade-in">
                            Güvenilir Alışverişin
                            <br />
                            <span className="text-secondary-300">Yeni Adresi</span>
                        </h1>

                        {/* Alt Başlık */}
                        <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto mb-8 animate-slide-up">
                            Onaylı satıcılar, kaliteli ürünler ve güvenli iletişim sistemi ile
                            alışverişin keyfini çıkarın. Hemen keşfetmeye başlayın!
                        </p>

                        {/* Aksiyon Butonları */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
                            <Link
                                to="/urunler"
                                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold 
                           hover:bg-gray-100 transform hover:-translate-y-1 transition-all shadow-lg"
                            >
                                Ürünleri Keşfet
                            </Link>
                            <Link
                                to="/kayit"
                                className="px-8 py-4 bg-white/10 backdrop-blur border border-white/30 rounded-xl 
                           font-semibold hover:bg-white/20 transition-all"
                            >
                                Satıcı Ol
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
          KATEGORİLER BÖLÜMÜ
          ================================================================= */}
            <section className="py-16 bg-surface-light dark:bg-surface-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Bölüm Başlığı */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">
                            Popüler Kategoriler
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            İstediğiniz kategoriyi seçin ve binlerce ürün arasından keşif yapın
                        </p>
                    </div>

                    {/* Kategori Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((category) => (
                            <Link
                                key={category.slug}
                                to={`/urunler?kategori=${category.slug}`}
                                className="card p-6 text-center group hover:border-primary-500 dark:hover:border-primary-400"
                            >
                                {/* Kategori İkonu */}
                                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                                    {category.icon}
                                </div>
                                {/* Kategori Adı */}
                                <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {category.name}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* =================================================================
          ÖNE ÇIKAN ÜRÜNLER BÖLÜMÜ
          ================================================================= */}
            <section className="py-16 bg-surface-light-secondary dark:bg-surface-dark-secondary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Bölüm Başlığı */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
                                Öne Çıkan Ürünler
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                En popüler ve en çok tercih edilen ürünler
                            </p>
                        </div>
                        <Link
                            to="/urunler"
                            className="hidden md:flex items-center text-primary-600 dark:text-primary-400 hover:underline"
                        >
                            Tümünü Gör
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    {/* Ürün Grid */}
                    {loading ? (
                        // Yükleniyor durumu
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="card p-4 animate-pulse">
                                    <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-xl mb-4"></div>
                                    <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4 mb-2"></div>
                                    <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        // Ürün listesi
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    to={`/urun/${product.id}`}
                                    className="card group overflow-hidden"
                                >
                                    {/* Ürün Görseli */}
                                    <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                        <img
                                            src={product.images?.[0] || '/placeholder-product.png'}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {/* Boost rozeti (varsa) */}
                                        {product.boost_tier > 0 && (
                                            <span className="absolute top-2 right-2 badge-warning">
                                                Öne Çıkarılmış
                                            </span>
                                        )}
                                    </div>
                                    {/* Ürün Bilgileri */}
                                    <div className="p-4">
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {product.title}
                                        </h3>
                                        <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                            ₺{product.price?.toLocaleString('tr-TR')}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        // Ürün yok mesajı
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">Henüz öne çıkan ürün bulunmuyor.</p>
                        </div>
                    )}

                    {/* Mobil için "Tümünü Gör" butonu */}
                    <div className="mt-8 text-center md:hidden">
                        <Link to="/urunler" className="btn-secondary">
                            Tüm Ürünleri Gör
                        </Link>
                    </div>
                </div>
            </section>

            {/* =================================================================
          ÖZELLİKLER BÖLÜMÜ
          ================================================================= */}
            <section className="py-16 bg-surface-light dark:bg-surface-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Bölüm Başlığı */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">
                            Neden Bizi Tercih Etmelisiniz?
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Platform olarak sunduğumuz avantajlarla güvenli ve keyifli bir alışveriş deneyimi yaşayın
                        </p>
                    </div>

                    {/* Özellik Kartları */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="card p-8 text-center">
                                {/* İkon */}
                                <div className="w-16 h-16 mx-auto mb-6 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                                    {feature.icon}
                                </div>
                                {/* Başlık */}
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                {/* Açıklama */}
                                <p className="text-gray-600 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =================================================================
          CALL TO ACTION (CTA) BÖLÜMÜ
          ================================================================= */}
            <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                        Satıcı Olmak İster Misiniz?
                    </h2>
                    <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
                        Ürünlerinizi milyonlarca müşteriye ulaştırın. Hemen mağazanızı açın ve satışa başlayın!
                    </p>
                    <Link
                        to="/kayit"
                        className="inline-block px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold 
                       hover:bg-gray-100 transform hover:-translate-y-1 transition-all shadow-lg"
                    >
                        Hemen Başla - Ücretsiz
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default HomePage;

// =============================================================================
// E-TİCARET MARKETPLACE - SATICI MAĞAZASI SAYFASI
// =============================================================================
// Bu sayfa bir satıcının profil ve ürünlerini gösteren vitrin sayfasıdır.
// Satıcı bilgileri, iletişim ve ürün listesi içerir.
// =============================================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import api from '../services/api';

// =============================================================================
// SATICI MAĞAZASI BİLEŞENİ
// =============================================================================
function SellerStorefrontPage() {
    // -------------------------------------------------------------------------
    // URL PARAMETRESİ - Satıcı ID
    // -------------------------------------------------------------------------
    const { sellerId } = useParams();

    // -------------------------------------------------------------------------
    // STATE DEĞİŞKENLERİ
    // -------------------------------------------------------------------------
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // -------------------------------------------------------------------------
    // VERİLERİ YÜKLE
    // -------------------------------------------------------------------------
    useEffect(() => {
        const loadSellerData = async () => {
            try {
                // Satıcı bilgilerini al
                const sellerResponse = await api.get(`/users/${sellerId}`);
                setSeller(sellerResponse.data.user);

                // Satıcının ürünlerini al
                const productsResponse = await productsAPI.getBySeller(sellerId);
                setProducts(productsResponse.data.products || []);
            } catch (err) {
                console.error('Mağaza yüklenirken hata:', err);
                setError('Mağaza bulunamadı');
            } finally {
                setLoading(false);
            }
        };

        loadSellerData();
    }, [sellerId]);

    // -------------------------------------------------------------------------
    // YÜKLENİYOR DURUMU
    // -------------------------------------------------------------------------
    if (loading) {
        return (
            <div className="min-h-screen bg-surface-light dark:bg-surface-dark py-8">
                <div className="max-w-7xl mx-auto px-4 animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-2xl mb-8"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-64 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // HATA DURUMU
    // -------------------------------------------------------------------------
    if (error || !seller) {
        return (
            <div className="min-h-screen bg-surface-light dark:bg-surface-dark py-8">
                <div className="max-w-7xl mx-auto px-4 text-center py-16">
                    <div className="text-6xl mb-4">🏪</div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Mağaza Bulunamadı
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Aradığınız mağaza mevcut değil veya kaldırılmış olabilir.
                    </p>
                    <Link to="/urunler" className="btn-primary">
                        Ürünlere Dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark">

            {/* =================================================================
          MAĞAZA BANNER VE PROFİL
          ================================================================= */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

                        {/* Satıcı Avatarı */}
                        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-4xl font-bold text-primary-600">
                                {seller.name?.charAt(0).toUpperCase() || 'S'}
                            </span>
                        </div>

                        {/* Satıcı Bilgileri */}
                        <div className="text-center md:text-left text-white">
                            <h1 className="text-3xl font-display font-bold mb-2">
                                {seller.name}
                            </h1>

                            {/* Doğrulama Rozeti */}
                            {seller.is_verified && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm mb-4">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Doğrulanmış Satıcı
                                </span>
                            )}

                            {/* İletişim Bilgileri */}
                            <div className="flex flex-col md:flex-row gap-4 text-primary-100">
                                {seller.email && (
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {seller.email}
                                    </div>
                                )}
                                {seller.phone && (
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {seller.phone}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mesaj Gönder Butonu */}
                        <div className="md:ml-auto">
                            <Link
                                to={`/mesajlar?satici=${sellerId}`}
                                className="px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                            >
                                Mesaj Gönder
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* =================================================================
          SATICI ÜRÜNLERİ
          ================================================================= */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-8">
                    Mağaza Ürünleri ({products.length})
                </h2>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
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
                                </div>
                                {/* Ürün Bilgileri */}
                                <div className="p-4">
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
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
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Henüz Ürün Yok
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Bu mağazada henüz ürün bulunmuyor.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SellerStorefrontPage;

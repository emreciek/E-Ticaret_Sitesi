// =============================================================================
// E-TİCARET MARKETPLACE - KULLANICI PANELİ (DASHBOARD)
// =============================================================================
// Bu sayfa alıcı ve satıcılar için kişiselleştirilmiş panel sunar.
// Satıcılar: ürünlerini, siparişlerini ve gelirlerini görür.
// Alıcılar: siparişlerini ve favori ürünlerini görür.
// =============================================================================

import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI, ordersAPI } from '../services/api';

// =============================================================================
// DASHBOARD BİLEŞENİ
// =============================================================================
function DashboardPage() {
    // -------------------------------------------------------------------------
    // HOOK'LAR
    // -------------------------------------------------------------------------
    const { user, isAuthenticated, isSeller, loading: authLoading } = useAuth();

    // -------------------------------------------------------------------------
    // STATE DEĞİŞKENLERİ
    // -------------------------------------------------------------------------
    const [activeTab, setActiveTab] = useState(isSeller ? 'urunler' : 'siparisler');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0
    });

    // -------------------------------------------------------------------------
    // VERİLERİ YÜKLE
    // -------------------------------------------------------------------------
    useEffect(() => {
        const loadDashboardData = async () => {
            if (!isAuthenticated) return;

            try {
                // Siparişleri yükle
                const ordersResponse = await ordersAPI.getAll();
                setOrders(ordersResponse.data.orders || []);

                // Satıcı ise ürünleri de yükle
                if (isSeller) {
                    const productsResponse = await productsAPI.getBySeller(user.id);
                    setProducts(productsResponse.data.products || []);

                    // İstatistikleri hesapla
                    const revenue = (ordersResponse.data.orders || [])
                        .filter(o => o.status === 'completed')
                        .reduce((sum, o) => sum + (o.amount - o.commission), 0);

                    setStats({
                        totalProducts: productsResponse.data.products?.length || 0,
                        totalOrders: ordersResponse.data.orders?.length || 0,
                        totalRevenue: revenue
                    });
                }
            } catch (error) {
                console.error('Dashboard verileri yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [isAuthenticated, isSeller, user?.id]);

    // -------------------------------------------------------------------------
    // GİRİŞ YAPILMAMIŞSA YÖNLENDİR
    // -------------------------------------------------------------------------
    if (!authLoading && !isAuthenticated) {
        return <Navigate to="/giris" replace />;
    }

    // -------------------------------------------------------------------------
    // TABS - Sekme Tanımları
    // -------------------------------------------------------------------------
    const tabs = isSeller
        ? [
            { id: 'urunler', label: 'Ürünlerim', icon: '📦' },
            { id: 'siparisler', label: 'Siparişler', icon: '🛒' },
            { id: 'gelir', label: 'Gelirlerim', icon: '💰' }
        ]
        : [
            { id: 'siparisler', label: 'Siparişlerim', icon: '🛒' },
            { id: 'favoriler', label: 'Favorilerim', icon: '❤️' }
        ];

    return (
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* =================================================================
            KARŞILAMA VE ÖZET
            ================================================================= */}
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
                        Merhaba, {user?.name || 'Kullanıcı'}! 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {isSeller ? 'Mağazanızı buradan yönetebilirsiniz.' : 'Siparişlerinizi buradan takip edebilirsiniz.'}
                    </p>
                </div>

                {/* =================================================================
            SATICI İSTATİSTİK KARTLARI
            ================================================================= */}
                {isSeller && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Toplam Ürün */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                        Toplam Ürün
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {stats.totalProducts}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-2xl">
                                    📦
                                </div>
                            </div>
                        </div>

                        {/* Toplam Sipariş */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                        Toplam Sipariş
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {stats.totalOrders}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl flex items-center justify-center text-2xl">
                                    🛒
                                </div>
                            </div>
                        </div>

                        {/* Toplam Gelir */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                        Toplam Gelir (Net)
                                    </p>
                                    <p className="text-3xl font-bold text-success-600">
                                        ₺{stats.totalRevenue.toLocaleString('tr-TR')}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-xl flex items-center justify-center text-2xl">
                                    💰
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                %5 platform komisyonu düşülmüştür
                            </p>
                        </div>
                    </div>
                )}

                {/* =================================================================
            HIZLI AKSİYONLAR (Satıcı)
            ================================================================= */}
                {isSeller && (
                    <div className="mb-8 flex flex-wrap gap-4">
                        <Link to="/urun-ekle" className="btn-primary inline-flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Yeni Ürün Ekle
                        </Link>
                        <Link to="/boost-planlari" className="btn-secondary inline-flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Boost Planları
                        </Link>
                    </div>
                )}

                {/* =================================================================
            SEKME NAVİGASYONU
            ================================================================= */}
                <div className="border-b border-surface-light-border dark:border-surface-dark-border mb-6">
                    <nav className="flex space-x-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* =================================================================
            SEKME İÇERİKLERİ
            ================================================================= */}
                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-24 rounded-xl"></div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Ürünlerim Sekmesi (Satıcı) */}
                        {activeTab === 'urunler' && isSeller && (
                            <div className="space-y-4">
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <div key={product.id} className="card p-4 flex items-center gap-4">
                                            <img
                                                src={product.images?.[0] || '/placeholder-product.png'}
                                                alt={product.title}
                                                className="w-20 h-20 object-cover rounded-xl"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900 dark:text-white">
                                                    {product.title}
                                                </h3>
                                                <p className="text-primary-600 font-bold">
                                                    ₺{product.price?.toLocaleString('tr-TR')}
                                                </p>
                                                <span className={`text-xs ${product.is_published ? 'badge-success' : 'badge-warning'}`}>
                                                    {product.is_published ? 'Yayında' : 'Taslak'}
                                                </span>
                                            </div>
                                            <Link to={`/urun/${product.id}`} className="btn-secondary text-sm py-2">
                                                Görüntüle
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 mb-4">Henüz ürününüz yok.</p>
                                        <Link to="/urun-ekle" className="btn-primary">
                                            İlk Ürününüzü Ekleyin
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Siparişler Sekmesi */}
                        {activeTab === 'siparisler' && (
                            <div className="space-y-4">
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <div key={order.id} className="card p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-500">
                                                    Sipariş #{order.id?.substring(0, 8)}
                                                </span>
                                                <span className={`badge ${order.status === 'completed' ? 'badge-success' :
                                                    order.status === 'pending' ? 'badge-warning' :
                                                        'badge-danger'
                                                    }`}>
                                                    {order.status === 'completed' ? 'Tamamlandı' :
                                                        order.status === 'pending' ? 'Beklemede' : 'İptal'}
                                                </span>
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                ₺{order.amount?.toLocaleString('tr-TR')}
                                            </p>
                                            {isSeller && (
                                                <p className="text-xs text-gray-500">
                                                    Komisyon: ₺{order.commission?.toLocaleString('tr-TR')} (5%)
                                                </p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">Henüz sipariş yok.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Gelir Sekmesi (Satıcı) */}
                        {activeTab === 'gelir' && isSeller && (
                            <div className="space-y-6">
                                {/* Gelir Özeti */}
                                <div className="card p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Gelir Özeti
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-xl">
                                            <p className="text-sm text-gray-500 mb-1">Toplam Satış</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                ₺{orders.reduce((sum, o) => sum + (o.amount || 0), 0).toLocaleString('tr-TR')}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-xl">
                                            <p className="text-sm text-gray-500 mb-1">Platform Komisyonu (%5)</p>
                                            <p className="text-2xl font-bold text-danger-600">
                                                -₺{orders.reduce((sum, o) => sum + (o.commission || 0), 0).toLocaleString('tr-TR')}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-xl">
                                            <p className="text-sm text-gray-500 mb-1">Net Gelir</p>
                                            <p className="text-2xl font-bold text-success-600">
                                                ₺{stats.totalRevenue.toLocaleString('tr-TR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Son İşlemler */}
                                <div className="card p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Son Satışlar
                                    </h3>
                                    {orders.length > 0 ? (
                                        <div className="space-y-3">
                                            {orders.slice(0, 5).map((order) => (
                                                <div key={order.id} className="flex items-center justify-between p-3 bg-surface-light dark:bg-surface-dark rounded-xl">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            Sipariş #{order.id?.substring(0, 8)}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(order.created_at).toLocaleDateString('tr-TR')}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-success-600">
                                                            +₺{((order.amount || 0) - (order.commission || 0)).toLocaleString('tr-TR')}
                                                        </p>
                                                        <span className={`text-xs ${order.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                                            {order.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">Henüz satış yok.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Favoriler Sekmesi (Alıcı) */}
                        {activeTab === 'favoriler' && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">❤️</div>
                                <p className="text-gray-500 dark:text-gray-400 mb-2">
                                    Favori ürünleriniz burada görünecek.
                                </p>
                                <p className="text-sm text-gray-400">
                                    Ürünleri favorilere eklemek için ürün sayfasındaki kalp simgesine tıklayın.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;

// =============================================================================
// E-TİCARET MARKETPLACE - ÜRÜNLER SAYFASI
// =============================================================================
// Bu sayfa tüm ürünlerin listelendiği arama ve filtreleme sayfasıdır.
// Kategori, fiyat ve sıralama filtreleri içerir.
// =============================================================================

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productsAPI } from '../services/api';

// =============================================================================
// ÜRÜNLER SAYFASI BİLEŞENİ
// =============================================================================
function ProductsPage() {
    // -------------------------------------------------------------------------
    // URL PARAMETRELERİ
    // -------------------------------------------------------------------------
    const [searchParams, setSearchParams] = useSearchParams();

    // -------------------------------------------------------------------------
    // STATE DEĞİŞKENLERİ
    // -------------------------------------------------------------------------
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    // Filtre durumları
    const [filters, setFilters] = useState({
        kategori: searchParams.get('kategori') || '',
        minFiyat: searchParams.get('minFiyat') || '',
        maxFiyat: searchParams.get('maxFiyat') || '',
        siralama: searchParams.get('siralama') || 'yeni',
        arama: searchParams.get('arama') || ''
    });

    // -------------------------------------------------------------------------
    // KATEGORİLER
    // -------------------------------------------------------------------------
    const categories = [
        { value: '', label: 'Tüm Kategoriler' },
        { value: 'elektronik', label: 'Elektronik' },
        { value: 'moda', label: 'Moda' },
        { value: 'ev-yasam', label: 'Ev & Yaşam' },
        { value: 'spor', label: 'Spor' },
        { value: 'kitap', label: 'Kitap' },
        { value: 'hobi', label: 'Hobi' }
    ];

    // -------------------------------------------------------------------------
    // SIRALAMA SEÇENEKLERİ
    // -------------------------------------------------------------------------
    const sortOptions = [
        { value: 'yeni', label: 'En Yeni' },
        { value: 'fiyat-artan', label: 'Fiyat: Düşükten Yükseğe' },
        { value: 'fiyat-azalan', label: 'Fiyat: Yüksekten Düşüğe' },
        { value: 'populer', label: 'En Popüler' }
    ];

    // -------------------------------------------------------------------------
    // ÜRÜNLERİ YÜKLE
    // -------------------------------------------------------------------------
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const response = await productsAPI.getAll({
                    page: currentPage,
                    limit: 12,
                    category: filters.kategori,
                    minPrice: filters.minFiyat,
                    maxPrice: filters.maxFiyat,
                    sort: filters.siralama,
                    search: filters.arama
                });

                setProducts(response.data.products || []);
                setTotalProducts(response.data.total || 0);
            } catch (error) {
                console.error('Ürünler yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [currentPage, filters]);

    // -------------------------------------------------------------------------
    // FİLTRE DEĞİŞİKLİĞİ
    // -------------------------------------------------------------------------
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1); // Sayfa numarasını sıfırla

        // URL'i güncelle
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(name, value);
        } else {
            newParams.delete(name);
        }
        setSearchParams(newParams);
    };

    // -------------------------------------------------------------------------
    // FİLTRELERİ TEMİZLE
    // -------------------------------------------------------------------------
    const clearFilters = () => {
        setFilters({
            kategori: '',
            minFiyat: '',
            maxFiyat: '',
            siralama: 'yeni',
            arama: ''
        });
        setSearchParams({});
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* =================================================================
            SAYFA BAŞLIĞI
            ================================================================= */}
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
                        Ürünler
                    </h1>
                    {filters.arama && (
                        <p className="text-gray-600 dark:text-gray-400">
                            "{filters.arama}" için arama sonuçları
                        </p>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* =================================================================
              FİLTRE PANELİ (Sol Taraf)
              ================================================================= */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="card p-6 sticky top-24">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Filtreler
                            </h3>

                            {/* Kategori Filtresi */}
                            <div className="mb-6">
                                <label className="label">Kategori</label>
                                <select
                                    name="kategori"
                                    value={filters.kategori}
                                    onChange={handleFilterChange}
                                    className="input"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Fiyat Aralığı */}
                            <div className="mb-6">
                                <label className="label">Fiyat Aralığı</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        name="minFiyat"
                                        placeholder="Min"
                                        value={filters.minFiyat}
                                        onChange={handleFilterChange}
                                        className="input"
                                    />
                                    <input
                                        type="number"
                                        name="maxFiyat"
                                        placeholder="Max"
                                        value={filters.maxFiyat}
                                        onChange={handleFilterChange}
                                        className="input"
                                    />
                                </div>
                            </div>

                            {/* Sıralama */}
                            <div className="mb-6">
                                <label className="label">Sıralama</label>
                                <select
                                    name="siralama"
                                    value={filters.siralama}
                                    onChange={handleFilterChange}
                                    className="input"
                                >
                                    {sortOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filtreleri Temizle */}
                            <button
                                onClick={clearFilters}
                                className="w-full btn-secondary text-sm"
                            >
                                Filtreleri Temizle
                            </button>
                        </div>
                    </aside>

                    {/* =================================================================
              ÜRÜN GRİD (Sağ Taraf)
              ================================================================= */}
                    <main className="flex-1">
                        {/* Sonuç Sayısı */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-600 dark:text-gray-400">
                                <span className="font-medium text-gray-900 dark:text-white">{totalProducts}</span> ürün bulundu
                            </p>
                        </div>

                        {loading ? (
                            // Yükleniyor durumu
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="card p-4 animate-pulse">
                                        <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-xl mb-4"></div>
                                        <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4 mb-2"></div>
                                        <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            // Ürün listesi
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                                                {product.description?.substring(0, 100)}...
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                                    ₺{product.price?.toLocaleString('tr-TR')}
                                                </p>
                                                <span className="badge-success text-xs">
                                                    Doğrulanmış Satıcı
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            // Ürün bulunamadı
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Ürün Bulunamadı
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Arama kriterlerinize uygun ürün bulunamadı. Filtreleri değiştirmeyi deneyin.
                                </p>
                                <button onClick={clearFilters} className="btn-primary">
                                    Filtreleri Temizle
                                </button>
                            </div>
                        )}

                        {/* Sayfalama */}
                        {totalProducts > 12 && (
                            <div className="flex justify-center mt-8 gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="btn-secondary px-4 py-2 disabled:opacity-50"
                                >
                                    Önceki
                                </button>
                                <span className="flex items-center px-4 text-gray-600 dark:text-gray-400">
                                    Sayfa {currentPage} / {Math.ceil(totalProducts / 12)}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={currentPage >= Math.ceil(totalProducts / 12)}
                                    className="btn-secondary px-4 py-2 disabled:opacity-50"
                                >
                                    Sonraki
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default ProductsPage;

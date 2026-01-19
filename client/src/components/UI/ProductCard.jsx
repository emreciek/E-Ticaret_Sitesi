// =============================================================================
// E-TİCARET MARKETPLACE - ÜRÜN KART BİLEŞENİ
// =============================================================================
// Bu bileşen ürün listelerinde kullanılan tekrar kullanılabilir karttır.
// Görsel, başlık, fiyat ve satıcı bilgisi gösterir.
// =============================================================================

import { Link } from 'react-router-dom';

// =============================================================================
// ÜRÜN KARTI BİLEŞENİ
// =============================================================================
function ProductCard({ product }) {
    return (
        <Link
            to={`/urun/${product.id}`}
            className="card group overflow-hidden"
        >
            {/* ---------------------------------------------------------------
          ÜRÜN GÖRSELİ
          --------------------------------------------------------------- */}
            <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <img
                    src={product.images?.[0] || '/placeholder-product.png'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />

                {/* Boost rozeti (varsa) */}
                {product.boost_tier > 0 && (
                    <span className="absolute top-2 right-2 badge-warning">
                        Öne Çıkarılmış
                    </span>
                )}
            </div>

            {/* ---------------------------------------------------------------
          ÜRÜN BİLGİLERİ
          --------------------------------------------------------------- */}
            <div className="p-4">
                {/* Ürün Başlığı */}
                <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {product.title}
                </h3>

                {/* Kısa Açıklama */}
                {product.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                        {product.description.substring(0, 80)}...
                    </p>
                )}

                {/* Fiyat ve Satıcı */}
                <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        ₺{product.price?.toLocaleString('tr-TR')}
                    </p>

                    {product.seller?.is_verified && (
                        <span className="badge-success text-xs">
                            ✓ Doğrulanmış
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;

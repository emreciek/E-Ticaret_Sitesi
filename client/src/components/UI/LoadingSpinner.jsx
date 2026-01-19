// =============================================================================
// E-TİCARET MARKETPLACE - YÜKLENİYOR BİLEŞENİ
// =============================================================================
// Bu bileşen veri yüklenirken gösterilen animasyonlu spinner'dır.
// =============================================================================

// =============================================================================
// SPİNNER BİLEŞENİ
// =============================================================================
function LoadingSpinner({ size = 'md', text = 'Yükleniyor...' }) {
    // Boyut sınıfları
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16'
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            {/* Dönen Spinner */}
            <div className={`${sizeClasses[size]} animate-spin`}>
                <svg
                    className="text-primary-600 dark:text-primary-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            </div>

            {/* Yükleniyor Metni */}
            {text && (
                <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">
                    {text}
                </p>
            )}
        </div>
    );
}

// =============================================================================
// TAM SAYFA YÜKLENİYOR
// =============================================================================
function FullPageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark">
            <LoadingSpinner size="lg" text="Sayfa yükleniyor..." />
        </div>
    );
}

// =============================================================================
// SKELETON KART (Placeholder)
// =============================================================================
function SkeletonCard() {
    return (
        <div className="card p-4 animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-xl mb-4"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4 mb-2"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2"></div>
        </div>
    );
}

export { LoadingSpinner, FullPageLoader, SkeletonCard };
export default LoadingSpinner;

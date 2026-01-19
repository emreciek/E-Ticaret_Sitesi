// =============================================================================
// E-TİCARET MARKETPLACE - BUTON BİLEŞENİ
// =============================================================================
// Bu bileşen farklı varyantlarda tekrar kullanılabilir butonlar sağlar.
// =============================================================================

// =============================================================================
// BUTON BİLEŞENİ
// =============================================================================
function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className = '',
    onClick,
    type = 'button',
    ...props
}) {
    // Varyant sınıfları
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'btn-danger',
        ghost: 'px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-surface-dark-tertiary rounded-xl transition-all'
    };

    // Boyut sınıfları
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-3',
        lg: 'px-8 py-4 text-lg'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
        ${variantClasses[variant]}
        ${variant !== 'ghost' ? sizeClasses[size] : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
            {...props}
        >
            {loading ? (
                <span className="flex items-center justify-center">
                    {/* Yükleniyor Spinner */}
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                    Yükleniyor...
                </span>
            ) : (
                children
            )}
        </button>
    );
}

export default Button;

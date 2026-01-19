// =============================================================================
// E-TİCARET MARKETPLACE - MODAL BİLEŞENİ
// =============================================================================
// Bu bileşen genel amaçlı modal (popup) penceresi sağlar.
// =============================================================================

import { useEffect } from 'react';

// =============================================================================
// MODAL BİLEŞENİ
// =============================================================================
function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    // ESC tuşu ile kapatma
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            // Body scroll'u devre dışı bırak
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Modal kapalıysa gösterme
    if (!isOpen) return null;

    // Boyut sınıfları
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };

    return (
        // Overlay arkaplan
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Karartılmış arkaplan */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className={`relative bg-white dark:bg-surface-dark-secondary rounded-2xl shadow-xl ${sizeClasses[size]} w-full animate-slide-up`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Başlık */}
                    {title && (
                        <div className="flex items-center justify-between p-6 border-b border-surface-light-border dark:border-surface-dark-border">
                            <h3
                                id="modal-title"
                                className="text-lg font-semibold text-gray-900 dark:text-white"
                            >
                                {title}
                            </h3>
                            {/* Kapatma butonu */}
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-surface-dark-tertiary transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* İçerik */}
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;

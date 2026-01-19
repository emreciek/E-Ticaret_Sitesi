// =============================================================================
// E-TİCARET MARKETPLACE - TAİLWİND CSS YAPILANDIRMASI
// =============================================================================
// Bu dosya Tailwind CSS framework'ünün özelleştirilmiş ayarlarını içerir.
// Renk paleti, karanlık mod ve özel tasarım tokenları burada tanımlanır.
// =============================================================================

/** @type {import('tailwindcss').Config} */
export default {
    // ==========================================================================
    // KARANLIK MOD AYARI
    // ==========================================================================
    // 'class' değeri: HTML'de 'dark' class'ı eklendiğinde karanlık mod aktif olur
    // 'media' değeri: İşletim sistemi tercihine göre otomatik geçiş yapar
    darkMode: 'class',

    // ==========================================================================
    // İÇERİK DOSYALARI
    // ==========================================================================
    // Tailwind'in hangi dosyalarda class araması gerektiğini belirtir
    // Kullanılmayan class'lar üretim build'inde otomatik temizlenir
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],

    // ==========================================================================
    // TEMA ÖZELLEŞTİRMELERİ
    // ==========================================================================
    theme: {
        extend: {
            // ========================================================================
            // RENK PALETİ
            // ========================================================================
            // Profesyonel ve modern bir e-ticaret görünümü için özel renkler
            colors: {
                // Ana marka rengi - Mor tonları (Premium his)
                primary: {
                    50: '#faf5ff',
                    100: '#f3e8ff',
                    200: '#e9d5ff',
                    300: '#d8b4fe',
                    400: '#c084fc',
                    500: '#a855f7',   // Ana renk
                    600: '#9333ea',
                    700: '#7e22ce',
                    800: '#6b21a8',
                    900: '#581c87',
                    950: '#3b0764',
                },

                // İkincil renk - Cam göbeği (Güven ve profesyonellik)
                secondary: {
                    50: '#ecfeff',
                    100: '#cffafe',
                    200: '#a5f3fc',
                    300: '#67e8f9',
                    400: '#22d3ee',
                    500: '#06b6d4',   // Ana renk
                    600: '#0891b2',
                    700: '#0e7490',
                    800: '#155e75',
                    900: '#164e63',
                },

                // Başarı rengi - Yeşil (Onay, satış tamamlandı vs.)
                success: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },

                // Uyarı rengi - Turuncu (Dikkat gerektiren durumlar)
                warning: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                },

                // Hata rengi - Kırmızı (Yasak mesaj, ban vs.)
                danger: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                },

                // Yüzey renkleri - Arayüz arka planları
                surface: {
                    // Açık tema yüzeyleri
                    light: {
                        DEFAULT: '#ffffff',
                        secondary: '#f8fafc',
                        tertiary: '#f1f5f9',
                        border: '#e2e8f0',
                    },
                    // Koyu tema yüzeyleri
                    dark: {
                        DEFAULT: '#0f172a',
                        secondary: '#1e293b',
                        tertiary: '#334155',
                        border: '#475569',
                    }
                }
            },

            // ========================================================================
            // FONT AİLESİ
            // ========================================================================
            fontFamily: {
                // Modern ve okunabilir sans-serif font
                sans: ['Inter', 'system-ui', 'sans-serif'],
                // Başlıklar için alternatif font
                display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
            },

            // ========================================================================
            // GÖLGE EFEKTLERİ
            // ========================================================================
            // Glassmorphism ve kart tasarımları için özel gölgeler
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            },

            // ========================================================================
            // ANİMASYONLAR
            // ========================================================================
            // Mikro-etkileşimler için özel animasyonlar
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },

            // ========================================================================
            // ARKA PLAN GÖRSELLERİ
            // ========================================================================
            // Gradient arka planlar için özel tanımlar
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-pattern': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
        },
    },

    // ==========================================================================
    // EKLENTİLER
    // ==========================================================================
    plugins: [],
};

// =============================================================================
// E-TİCARET MARKETPLACE - TEMA CONTEXT'İ
// =============================================================================
// Bu dosya uygulamanın tema (Açık/Koyu mod) yönetimini sağlar.
// React Context API kullanarak tema durumunu tüm bileşenlere iletir.
// =============================================================================

import { createContext, useContext, useState, useEffect } from 'react';

// =============================================================================
// TEMA CONTEXT'İ OLUŞTURMA
// =============================================================================
// Context, React bileşen ağacında veri paylaşımı sağlar
// Prop drilling yapmadan derinlerdeki bileşenlere veri aktarılır
const ThemeContext = createContext(null);

// =============================================================================
// TEMA SAĞLAYICI BİLEŞENİ (PROVIDER)
// =============================================================================
// Bu bileşen, tema durumunu ve değiştirme fonksiyonunu sağlar
// Uygulama genelinde tema kontrolü için bu bileşen kullanılır
export function ThemeProvider({ children }) {
    // -------------------------------------------------------------------------
    // TEMA DURUMU (STATE)
    // -------------------------------------------------------------------------
    // true = koyu mod, false = açık mod
    // Başlangıçta localStorage'dan veya sistem tercihinden alınır
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Tarayıcı ortamında mı kontrol et
        if (typeof window !== 'undefined') {
            // Önce localStorage'dan kayıtlı tercihi kontrol et
            const savedTheme = localStorage.getItem('theme');

            if (savedTheme) {
                // Kayıtlı tercih varsa onu kullan
                return savedTheme === 'dark';
            }

            // Kayıtlı tercih yoksa, işletim sistemi tercihini kullan
            // matchMedia ile sistem koyu mod tercihini kontrol ediyoruz
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        // Varsayılan olarak açık mod
        return false;
    });

    // -------------------------------------------------------------------------
    // TEMA DEĞİŞİKLİĞİ ETKİSİ (EFFECT)
    // -------------------------------------------------------------------------
    // isDarkMode değiştiğinde HTML elementine class ekle/çıkar
    // Tailwind'in dark mode özelliği bu class'ı kullanır
    useEffect(() => {
        const root = window.document.documentElement;

        if (isDarkMode) {
            // Koyu mod aktif - 'dark' class'ını ekle
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            // Açık mod aktif - 'dark' class'ını kaldır
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // -------------------------------------------------------------------------
    // TEMA DEĞİŞTİRME FONKSİYONU
    // -------------------------------------------------------------------------
    // Bu fonksiyon koyu ve açık mod arasında geçiş yapar
    const toggleTheme = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    // -------------------------------------------------------------------------
    // BELİRLİ BİR TEMAYA GEÇİŞ FONKSİYONU
    // -------------------------------------------------------------------------
    // Doğrudan belirli bir temaya geçmek için kullanılır
    const setTheme = (theme) => {
        setIsDarkMode(theme === 'dark');
    };

    // -------------------------------------------------------------------------
    // CONTEXT DEĞER NESNES İ
    // -------------------------------------------------------------------------
    // Tüm alt bileşenlere sunulacak değerler
    const value = {
        isDarkMode,        // Mevcut tema durumu
        toggleTheme,       // Tema değiştirme fonksiyonu
        setTheme,          // Belirli temaya geçiş
        theme: isDarkMode ? 'dark' : 'light'  // Tema adı (string)
    };

    // Context.Provider ile children'ı sarmalıyoruz
    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

// =============================================================================
// TEMA HOOK'U
// =============================================================================
// Bileşenlerin tema bilgisine kolay erişimi için custom hook
// Kullanım: const { isDarkMode, toggleTheme } = useTheme();
export function useTheme() {
    const context = useContext(ThemeContext);

    // Context dışında kullanılırsa hata fırlat
    if (context === null) {
        throw new Error('useTheme hook\'u ThemeProvider içinde kullanılmalıdır');
    }

    return context;
}

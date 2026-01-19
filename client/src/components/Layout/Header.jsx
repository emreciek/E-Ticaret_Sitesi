// =============================================================================
// E-TİCARET MARKETPLACE - ÜST NAVİGASYON ÇUBUĞU (HEADER)
// =============================================================================
// Bu bileşen sayfanın üst kısmındaki navigasyon çubuğunu oluşturur.
// İçerir: Logo, arama kutusu, navigasyon linkleri, tema değiştirici, kullanıcı menüsü
// =============================================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// =============================================================================
// HEADER BİLEŞENİ
// =============================================================================
function Header() {
    // -------------------------------------------------------------------------
    // HOOK'LAR VE STATE
    // -------------------------------------------------------------------------

    // Kimlik doğrulama bilgileri
    const { user, isAuthenticated, isSeller, logout } = useAuth();

    // Tema bilgileri
    const { isDarkMode, toggleTheme } = useTheme();

    // Sayfa yönlendirmesi
    const navigate = useNavigate();

    // Arama kutusu değeri
    const [searchQuery, setSearchQuery] = useState('');

    // Mobil menü açık/kapalı durumu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Kullanıcı dropdown menüsü açık/kapalı
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // -------------------------------------------------------------------------
    // ARAMA İŞLEMİ
    // -------------------------------------------------------------------------
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Arama sonuçları sayfasına yönlendir
            navigate(`/urunler?arama=${encodeURIComponent(searchQuery)}`);
        }
    };

    // -------------------------------------------------------------------------
    // ÇIKIŞ İŞLEMİ
    // -------------------------------------------------------------------------
    const handleLogout = () => {
        logout();
        navigate('/');
        setIsUserMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-lg border-b border-surface-light-border dark:border-surface-dark-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* ===============================================================
              LOGO VE MARKA
              =============================================================== */}
                    <Link
                        to="/"
                        className="flex items-center space-x-2 group"
                    >
                        {/* Logo İkonu */}
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        {/* Marka Adı */}
                        <span className="text-xl font-display font-bold text-gradient">
                            E-Ticaret
                        </span>
                    </Link>

                    {/* ===============================================================
              ARAMA KUTUSU (Masaüstü)
              =============================================================== */}
                    <form
                        onSubmit={handleSearch}
                        className="hidden md:flex flex-1 max-w-md mx-8"
                    >
                        <div className="relative w-full">
                            {/* Arama İkonu */}
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            {/* Arama Input */}
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Ürün ara..."
                                className="input pl-10 pr-4 py-2"
                            />
                        </div>
                    </form>

                    {/* ===============================================================
              SAĞ TARAF - NAVİGASYON VE KULLANICI
              =============================================================== */}
                    <div className="flex items-center space-x-4">

                        {/* Ürünler Linki */}
                        <Link to="/urunler" className="hidden md:block nav-link">
                            Ürünler
                        </Link>

                        {/* ---------------------------------------------------------------
                TEMA DEĞİŞTİRİCİ - Açık/Koyu Mod
                --------------------------------------------------------------- */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-dark-tertiary transition-colors"
                            aria-label="Tema değiştir"
                        >
                            {isDarkMode ? (
                                // Güneş ikonu - Açık moda geç
                                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                // Ay ikonu - Koyu moda geç
                                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            )}
                        </button>

                        {/* ---------------------------------------------------------------
                KULLANICI MENÜSÜ
                --------------------------------------------------------------- */}
                        {isAuthenticated ? (
                            // Giriş yapılmış - Kullanıcı dropdown menüsü
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-dark-tertiary transition-colors"
                                >
                                    {/* Kullanıcı Avatarı */}
                                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                            {user?.name?.charAt(0).toUpperCase() || 'K'}
                                        </span>
                                    </div>
                                    {/* Kullanıcı Adı */}
                                    <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {user?.name || 'Kullanıcı'}
                                    </span>
                                    {/* Aşağı Ok */}
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menü */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-dark-secondary rounded-xl shadow-lg border border-surface-light-border dark:border-surface-dark-border py-1 animate-fade-in">
                                        {/* Panel Linki */}
                                        <Link
                                            to="/panel"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-dark-tertiary"
                                        >
                                            Panelim
                                        </Link>

                                        {/* Mesajlar */}
                                        <Link
                                            to="/mesajlar"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-dark-tertiary"
                                        >
                                            Mesajlar
                                        </Link>

                                        {/* Satıcı İçin: Ürün Ekle */}
                                        {isSeller && (
                                            <Link
                                                to="/urun-ekle"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-dark-tertiary"
                                            >
                                                Ürün Ekle
                                            </Link>
                                        )}

                                        {/* Ayırıcı Çizgi */}
                                        <hr className="my-1 border-surface-light-border dark:border-surface-dark-border" />

                                        {/* Çıkış Yap */}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                                        >
                                            Çıkış Yap
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Giriş yapılmamış - Giriş ve Kayıt butonları
                            <div className="flex items-center space-x-2">
                                <Link to="/giris" className="nav-link">
                                    Giriş
                                </Link>
                                <Link to="/kayit" className="btn-primary text-sm py-2 px-4">
                                    Kayıt Ol
                                </Link>
                            </div>
                        )}

                        {/* ---------------------------------------------------------------
                MOBİL MENÜ BUTONU
                --------------------------------------------------------------- */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-dark-tertiary"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* =================================================================
            MOBİL MENÜ
            ================================================================= */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-surface-light-border dark:border-surface-dark-border animate-slide-up">
                        {/* Mobil Arama */}
                        <form onSubmit={handleSearch} className="mb-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Ürün ara..."
                                className="input"
                            />
                        </form>

                        {/* Mobil Navigasyon */}
                        <nav className="space-y-2">
                            <Link to="/urunler" className="block nav-link">Ürünler</Link>
                            {isAuthenticated && (
                                <>
                                    <Link to="/panel" className="block nav-link">Panelim</Link>
                                    <Link to="/mesajlar" className="block nav-link">Mesajlar</Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;

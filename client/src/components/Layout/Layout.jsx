// =============================================================================
// E-TİCARET MARKETPLACE - ANA DÜZEN BİLEŞENİ (LAYOUT)
// =============================================================================
// Bu bileşen tüm sayfalarda ortak olan elemanları içerir:
// - Üst navigasyon çubuğu (Header)
// - Alt bilgi alanı (Footer)
// - Sayfa içeriği alanı
// =============================================================================

import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// =============================================================================
// LAYOUT BİLEŞENİ
// =============================================================================
function Layout() {
    return (
        // Ana sayfa konteyner'ı - tam ekran yüksekliği
        <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark transition-colors duration-300">
            {/* 
        Üst Navigasyon Çubuğu
        Logo, menü linkleri ve kullanıcı işlemleri burada
      */}
            <Header />

            {/* 
        Ana İçerik Alanı
        Outlet: React Router'dan gelen sayfa içeriği buraya render edilir
        flex-grow: Footer'ı sayfanın altına itmek için alan genişler
      */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* 
        Alt Bilgi Alanı
        Linkler, telif hakkı ve sosyal medya
      */}
            <Footer />
        </div>
    );
}

export default Layout;

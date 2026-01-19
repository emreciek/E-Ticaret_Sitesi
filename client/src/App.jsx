// =============================================================================
// E-TİCARET MARKETPLACE - ANA UYGULAMA BİLEŞENİ
// =============================================================================
// Bu dosya uygulamanın ana bileşenidir (root component).
// Router yapılandırması, tema yönetimi ve global sağlayıcılar burada tanımlanır.
// =============================================================================

// React ve gerekli hook'ları içe aktarıyoruz
import { useState, useEffect } from 'react';

// React Router - sayfa yönlendirmesi için
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Context sağlayıcıları - global state yönetimi
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Düzen bileşenleri
import Layout from './components/Layout/Layout';

// Sayfa bileşenleri
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SellerStorefrontPage from './pages/SellerStorefrontPage';
import DashboardPage from './pages/DashboardPage';
import MessagesPage from './pages/MessagesPage';
import CreateProductPage from './pages/CreateProductPage';
import BoostPlansPage from './pages/BoostPlansPage';

// =============================================================================
// ANA UYGULAMA BİLEŞENİ
// =============================================================================
function App() {
    return (
        // Tema sağlayıcısı - Açık/Koyu mod yönetimi
        <ThemeProvider>
            {/* Kimlik doğrulama sağlayıcısı - Kullanıcı oturum bilgileri */}
            <AuthProvider>
                {/* Router - Sayfa yönlendirmesi */}
                <BrowserRouter>
                    {/* 
            Routes - Tüm sayfa rotalarını tanımlar
            Her Route, bir URL yolunu bir bileşene eşler
          */}
                    <Routes>
                        {/* 
              Ana düzen bileşeni içindeki sayfalar
              Layout: Header, Footer ve ortak elemanları içerir
            */}
                        <Route path="/" element={<Layout />}>
                            {/* Ana sayfa - Öne çıkan ürünler ve kategoriler */}
                            <Route index element={<HomePage />} />

                            {/* Kimlik doğrulama sayfaları */}
                            <Route path="giris" element={<LoginPage />} />
                            <Route path="kayit" element={<RegisterPage />} />

                            {/* Ürün sayfaları */}
                            <Route path="urunler" element={<ProductsPage />} />
                            <Route path="urun/:productId" element={<ProductDetailPage />} />

                            {/* Satıcı mağazası - Her satıcının kendi sayfası */}
                            <Route path="magaza/:sellerId" element={<SellerStorefrontPage />} />

                            {/* Kullanıcı paneli - Alıcı/Satıcı dashboardu */}
                            <Route path="panel" element={<DashboardPage />} />

                            {/* Mesajlaşma sayfası - Alıcı-Satıcı iletişimi */}
                            <Route path="mesajlar" element={<MessagesPage />} />
                            <Route path="mesajlar/:conversationId" element={<MessagesPage />} />

                            {/* Ürün oluşturma - Sadece satıcılar için */}
                            <Route path="urun-ekle" element={<CreateProductPage />} />

                            {/* Boost Planları - Satıcı görünürlük abonelikleri */}
                            <Route path="boost-planlari" element={<BoostPlansPage />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

// Bileşeni dışa aktarıyoruz
export default App;

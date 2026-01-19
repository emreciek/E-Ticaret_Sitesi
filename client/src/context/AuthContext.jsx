// =============================================================================
// E-TİCARET MARKETPLACE - KİMLİK DOĞRULAMA CONTEXT'İ
// =============================================================================
// Bu dosya kullanıcı kimlik doğrulama işlemlerini yönetir.
// Giriş, çıkış, kayıt ve kullanıcı bilgilerini tüm uygulamaya sağlar.
// =============================================================================

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// =============================================================================
// AUTH CONTEXT OLUŞTURMA
// =============================================================================
const AuthContext = createContext(null);

// =============================================================================
// KİMLİK DOĞRULAMA SAĞLAYICI BİLEŞENİ
// =============================================================================
export function AuthProvider({ children }) {
    // -------------------------------------------------------------------------
    // DURUM DEĞİŞKENLERİ (STATE)
    // -------------------------------------------------------------------------

    // Mevcut kullanıcı bilgileri (null = giriş yapılmamış)
    const [user, setUser] = useState(null);

    // Yükleniyor durumu - başlangıçta token kontrolü yapılırken true
    const [loading, setLoading] = useState(true);

    // Hata mesajı - giriş/kayıt hatalarında kullanılır
    const [error, setError] = useState(null);

    // -------------------------------------------------------------------------
    // BAŞLANGIÇ TOKEN KONTROLÜ
    // -------------------------------------------------------------------------
    // Uygulama açıldığında localStorage'da token var mı kontrol et
    useEffect(() => {
        const initAuth = async () => {
            // localStorage'dan token al
            const token = localStorage.getItem('authToken');

            if (token) {
                try {
                    // Token geçerli mi kontrol et - backend'e istek gönder
                    const response = await api.get('/auth/me');

                    // Kullanıcı bilgilerini state'e kaydet
                    setUser(response.data.user);
                } catch (err) {
                    // Token geçersiz veya süresi dolmuş
                    // Geçersiz token'ı temizle
                    console.error('Token doğrulama hatası:', err);
                    localStorage.removeItem('authToken');
                }
            }

            // Yükleme tamamlandı
            setLoading(false);
        };

        initAuth();
    }, []);

    // -------------------------------------------------------------------------
    // GİRİŞ YAPMA FONKSİYONU
    // -------------------------------------------------------------------------
    // Email ve şifre ile kullanıcı girişi yapar
    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);

            // Backend'e giriş isteği gönder
            const response = await api.post('/auth/login', { email, password });

            // Token'ı localStorage'a kaydet
            const { token, user: userData } = response.data;
            localStorage.setItem('authToken', token);

            // Kullanıcı bilgilerini state'e kaydet
            setUser(userData);

            return { success: true };
        } catch (err) {
            // Hata mesajını ayarla
            const errorMessage = err.response?.data?.message || 'Giriş başarısız';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // -------------------------------------------------------------------------
    // KAYIT OLMA FONKSİYONU
    // -------------------------------------------------------------------------
    // Yeni kullanıcı kaydı oluşturur
    const register = async (userData) => {
        try {
            setError(null);
            setLoading(true);

            // Backend'e kayıt isteği gönder
            const response = await api.post('/auth/register', userData);

            // Otomatik giriş yap
            const { token, user: newUser } = response.data;
            localStorage.setItem('authToken', token);
            setUser(newUser);

            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Kayıt başarısız';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // -------------------------------------------------------------------------
    // ÇIKIŞ YAPMA FONKSİYONU
    // -------------------------------------------------------------------------
    // Kullanıcı oturumunu sonlandırır
    const logout = () => {
        // Token'ı temizle
        localStorage.removeItem('authToken');

        // Kullanıcı bilgisini sıfırla
        setUser(null);

        // Hata mesajını temizle
        setError(null);
    };

    // -------------------------------------------------------------------------
    // PROFİL GÜNCELLEME FONKSİYONU
    // -------------------------------------------------------------------------
    // Kullanıcı profil bilgilerini günceller
    const updateProfile = async (profileData) => {
        try {
            setError(null);

            const response = await api.put('/auth/profile', profileData);

            // Güncellenmiş kullanıcı bilgilerini kaydet
            setUser(response.data.user);

            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Profil güncellenemedi';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // -------------------------------------------------------------------------
    // YARDIMCI FONKSİYONLAR
    // -------------------------------------------------------------------------

    // Kullanıcı giriş yapmış mı?
    const isAuthenticated = !!user;

    // Kullanıcı satıcı mı?
    const isSeller = user?.role === 'seller' || user?.role === 'admin';

    // Kullanıcı admin mi?
    const isAdmin = user?.role === 'admin';

    // -------------------------------------------------------------------------
    // CONTEXT DEĞER NESNESİ
    // -------------------------------------------------------------------------
    const value = {
        // Durum değişkenleri
        user,
        loading,
        error,

        // Durum kontrolleri
        isAuthenticated,
        isSeller,
        isAdmin,

        // Fonksiyonlar
        login,
        register,
        logout,
        updateProfile,

        // Hata temizleme
        clearError: () => setError(null)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// =============================================================================
// AUTH HOOK
// =============================================================================
// Bileşenlerin kimlik doğrulama bilgilerine kolay erişimi için
// Kullanım: const { user, login, logout } = useAuth();
export function useAuth() {
    const context = useContext(AuthContext);

    if (context === null) {
        throw new Error('useAuth hook\'u AuthProvider içinde kullanılmalıdır');
    }

    return context;
}

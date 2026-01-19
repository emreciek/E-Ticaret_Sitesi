// =============================================================================
// E-TİCARET MARKETPLACE - GİRİŞ SAYFASI
// =============================================================================
// Bu sayfa kullanıcı giriş formunu içerir.
// Email ve şifre ile kimlik doğrulama yapılır.
// =============================================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// =============================================================================
// GİRİŞ SAYFASI BİLEŞENİ
// =============================================================================
function LoginPage() {
    // -------------------------------------------------------------------------
    // HOOK'LAR VE STATE
    // -------------------------------------------------------------------------
    const { login, error, clearError, loading } = useAuth();
    const navigate = useNavigate();

    // Form verileri
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Şifre görünürlüğü
    const [showPassword, setShowPassword] = useState(false);

    // -------------------------------------------------------------------------
    // FORM ALANI DEĞİŞİKLİĞİ
    // -------------------------------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Hata varsa temizle
        if (error) clearError();
    };

    // -------------------------------------------------------------------------
    // FORM GÖNDERİMİ
    // -------------------------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await login(formData.email, formData.password);

        if (result.success) {
            // Başarılı giriş - panele yönlendir
            navigate('/panel');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* =================================================================
            BAŞLIK ALANI
            ================================================================= */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
                        Hoş Geldiniz
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Hesabınıza giriş yapın ve alışverişe devam edin
                    </p>
                </div>

                {/* =================================================================
            GİRİŞ FORMU
            ================================================================= */}
                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* ---------------------------------------------------------------
                HATA MESAJI
                --------------------------------------------------------------- */}
                        {error && (
                            <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-xl">
                                <p className="text-sm text-danger-600 dark:text-danger-400">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* ---------------------------------------------------------------
                E-POSTA ALANI
                --------------------------------------------------------------- */}
                        <div>
                            <label htmlFor="email" className="label">
                                E-posta Adresi
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="input"
                                placeholder="ornek@email.com"
                            />
                        </div>

                        {/* ---------------------------------------------------------------
                ŞİFRE ALANI
                --------------------------------------------------------------- */}
                        <div>
                            <label htmlFor="password" className="label">
                                Şifre
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input pr-10"
                                    placeholder="••••••••"
                                />
                                {/* Şifre göster/gizle butonu */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        // Gizle ikonu
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        // Göster ikonu
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* ---------------------------------------------------------------
                HATIRLA VE ŞİFREMİ UNUTTUM
                --------------------------------------------------------------- */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                    Beni hatırla
                                </span>
                            </label>
                            <Link
                                to="/sifremi-unuttum"
                                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                            >
                                Şifremi unuttum
                            </Link>
                        </div>

                        {/* ---------------------------------------------------------------
                GİRİŞ BUTONU
                --------------------------------------------------------------- */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    {/* Yükleniyor animasyonu */}
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Giriş yapılıyor...
                                </span>
                            ) : (
                                'Giriş Yap'
                            )}
                        </button>
                    </form>

                    {/* =================================================================
              AYIRICI
              ================================================================= */}
                    <div className="mt-6 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-surface-light-border dark:border-surface-dark-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-surface-dark-secondary text-gray-500">
                                veya
                            </span>
                        </div>
                    </div>

                    {/* =================================================================
              KAYIT LİNKİ
              ================================================================= */}
                    <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Hesabınız yok mu?{' '}
                        <Link to="/kayit" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                            Hemen kayıt olun
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;

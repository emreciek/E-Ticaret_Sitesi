// =============================================================================
// E-TİCARET MARKETPLACE - KAYIT SAYFASI
// =============================================================================
// Bu sayfa yeni kullanıcı kayıt formunu içerir.
// Alıcı veya Satıcı olarak kayıt seçeneği sunar.
// =============================================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// =============================================================================
// KAYIT SAYFASI BİLEŞENİ
// =============================================================================
function RegisterPage() {
    // -------------------------------------------------------------------------
    // HOOK'LAR VE STATE
    // -------------------------------------------------------------------------
    const { register, error, clearError, loading } = useAuth();
    const navigate = useNavigate();

    // Form verileri
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'buyer', // Varsayılan: Alıcı
        phone: '',     // Satıcılar için zorunlu
        acceptTerms: false
    });

    // Form hataları
    const [formErrors, setFormErrors] = useState({});

    // Şifre görünürlüğü
    const [showPassword, setShowPassword] = useState(false);

    // -------------------------------------------------------------------------
    // FORM ALANI DEĞİŞİKLİĞİ
    // -------------------------------------------------------------------------
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Hataları temizle
        if (error) clearError();
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // -------------------------------------------------------------------------
    // FORM DOĞRULAMA
    // -------------------------------------------------------------------------
    const validateForm = () => {
        const errors = {};

        // İsim kontrolü
        if (!formData.name.trim()) {
            errors.name = 'İsim gereklidir';
        }

        // E-posta kontrolü
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            errors.email = 'Geçerli bir e-posta adresi girin';
        }

        // Şifre kontrolü
        if (formData.password.length < 8) {
            errors.password = 'Şifre en az 8 karakter olmalıdır';
        }

        // Şifre eşleşme kontrolü
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Şifreler eşleşmiyor';
        }

        // Satıcı için telefon kontrolü
        if (formData.role === 'seller' && !formData.phone.trim()) {
            errors.phone = 'Satıcılar için telefon numarası zorunludur';
        }

        // Şartlar kabul kontrolü
        if (!formData.acceptTerms) {
            errors.acceptTerms = 'Kullanım şartlarını kabul etmelisiniz';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // -------------------------------------------------------------------------
    // FORM GÖNDERİMİ
    // -------------------------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Form doğrulama
        if (!validateForm()) return;

        // Kayıt isteği gönder
        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            phone: formData.phone
        });

        if (result.success) {
            // Başarılı kayıt - panele yönlendir
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
                        Hesap Oluştur
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Hemen ücretsiz hesap oluşturun ve alışverişe başlayın
                    </p>
                </div>

                {/* =================================================================
            KAYIT FORMU
            ================================================================= */}
                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* ---------------------------------------------------------------
                API HATA MESAJI
                --------------------------------------------------------------- */}
                        {error && (
                            <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-xl">
                                <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
                            </div>
                        )}

                        {/* ---------------------------------------------------------------
                HESAP TÜRÜ SEÇİMİ
                --------------------------------------------------------------- */}
                        <div>
                            <label className="label">Hesap Türü</label>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Alıcı seçeneği */}
                                <label
                                    className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.role === 'buyer'
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                            : 'border-surface-light-border dark:border-surface-dark-border hover:border-primary-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value="buyer"
                                        checked={formData.role === 'buyer'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className="text-center">
                                        <span className="text-2xl mb-1 block">🛒</span>
                                        <span className={`font-medium ${formData.role === 'buyer' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                            Alıcı
                                        </span>
                                    </div>
                                </label>

                                {/* Satıcı seçeneği */}
                                <label
                                    className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.role === 'seller'
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                            : 'border-surface-light-border dark:border-surface-dark-border hover:border-primary-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value="seller"
                                        checked={formData.role === 'seller'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className="text-center">
                                        <span className="text-2xl mb-1 block">🏪</span>
                                        <span className={`font-medium ${formData.role === 'seller' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                            Satıcı
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* ---------------------------------------------------------------
                İSİM ALANI
                --------------------------------------------------------------- */}
                        <div>
                            <label htmlFor="name" className="label">
                                {formData.role === 'seller' ? 'Mağaza / İşletme Adı' : 'Ad Soyad'}
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className={`input ${formErrors.name ? 'border-danger-500' : ''}`}
                                placeholder={formData.role === 'seller' ? 'Mağaza adınız' : 'Adınız Soyadınız'}
                            />
                            {formErrors.name && (
                                <p className="mt-1 text-sm text-danger-600">{formErrors.name}</p>
                            )}
                        </div>

                        {/* ---------------------------------------------------------------
                E-POSTA ALANI
                --------------------------------------------------------------- */}
                        <div>
                            <label htmlFor="email" className="label">E-posta Adresi</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className={`input ${formErrors.email ? 'border-danger-500' : ''}`}
                                placeholder="ornek@email.com"
                            />
                            {formErrors.email && (
                                <p className="mt-1 text-sm text-danger-600">{formErrors.email}</p>
                            )}
                        </div>

                        {/* ---------------------------------------------------------------
                TELEFON ALANI (Sadece Satıcılar)
                --------------------------------------------------------------- */}
                        {formData.role === 'seller' && (
                            <div>
                                <label htmlFor="phone" className="label">
                                    Telefon Numarası
                                    <span className="text-danger-500 ml-1">*</span>
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`input ${formErrors.phone ? 'border-danger-500' : ''}`}
                                    placeholder="05XX XXX XX XX"
                                />
                                {formErrors.phone && (
                                    <p className="mt-1 text-sm text-danger-600">{formErrors.phone}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    * Satıcıların iletişim bilgileri doğrulanır ve müşterilere gösterilir.
                                </p>
                            </div>
                        )}

                        {/* ---------------------------------------------------------------
                ŞİFRE ALANI
                --------------------------------------------------------------- */}
                        <div>
                            <label htmlFor="password" className="label">Şifre</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`input pr-10 ${formErrors.password ? 'border-danger-500' : ''}`}
                                    placeholder="En az 8 karakter"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {formErrors.password && (
                                <p className="mt-1 text-sm text-danger-600">{formErrors.password}</p>
                            )}
                        </div>

                        {/* ---------------------------------------------------------------
                ŞİFRE TEKRAR ALANI
                --------------------------------------------------------------- */}
                        <div>
                            <label htmlFor="confirmPassword" className="label">Şifre Tekrar</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`input ${formErrors.confirmPassword ? 'border-danger-500' : ''}`}
                                placeholder="Şifrenizi tekrar girin"
                            />
                            {formErrors.confirmPassword && (
                                <p className="mt-1 text-sm text-danger-600">{formErrors.confirmPassword}</p>
                            )}
                        </div>

                        {/* ---------------------------------------------------------------
                ŞARTLAR KABUL
                --------------------------------------------------------------- */}
                        <div>
                            <label className="flex items-start">
                                <input
                                    type="checkbox"
                                    name="acceptTerms"
                                    checked={formData.acceptTerms}
                                    onChange={handleChange}
                                    className="w-4 h-4 mt-1 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Link to="/kullanim-sartlari" className="text-primary-600 dark:text-primary-400 hover:underline">
                                        Kullanım Şartları
                                    </Link>
                                    {' '}ve{' '}
                                    <Link to="/gizlilik" className="text-primary-600 dark:text-primary-400 hover:underline">
                                        Gizlilik Politikası
                                    </Link>
                                    'nı okudum ve kabul ediyorum.
                                </span>
                            </label>
                            {formErrors.acceptTerms && (
                                <p className="mt-1 text-sm text-danger-600">{formErrors.acceptTerms}</p>
                            )}
                        </div>

                        {/* ---------------------------------------------------------------
                KAYIT BUTONU
                --------------------------------------------------------------- */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Kayıt yapılıyor...
                                </span>
                            ) : (
                                'Hesap Oluştur'
                            )}
                        </button>
                    </form>

                    {/* =================================================================
              GİRİŞ LİNKİ
              ================================================================= */}
                    <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Zaten hesabınız var mı?{' '}
                        <Link to="/giris" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                            Giriş yapın
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;

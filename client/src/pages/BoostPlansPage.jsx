// =============================================================================
// E-TİCARET MARKETPLACE - BOOST PLANLARI SAYFASI
// =============================================================================
// Bu sayfa satıcıların görünürlük planlarını görüntüleyip satın almasını sağlar.
// Bronz, Gümüş ve Altın tier seçenekleri sunar.
// =============================================================================

import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { boostPlansAPI } from '../services/api';

// =============================================================================
// BOOST PLANLARI BİLEŞENİ
// =============================================================================
function BoostPlansPage() {
    // -------------------------------------------------------------------------
    // HOOK'LAR
    // -------------------------------------------------------------------------
    const { user, isAuthenticated, isSeller, loading: authLoading } = useAuth();

    // -------------------------------------------------------------------------
    // STATE DEĞİŞKENLERİ
    // -------------------------------------------------------------------------
    const [plans, setPlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [message, setMessage] = useState(null);

    // -------------------------------------------------------------------------
    // VERİLERİ YÜKLE
    // -------------------------------------------------------------------------
    useEffect(() => {
        const loadData = async () => {
            if (!isAuthenticated || !isSeller) return;

            try {
                // Planları ve aktif aboneliği paralel yükle
                const [plansRes, subRes] = await Promise.all([
                    boostPlansAPI.getPlans(),
                    boostPlansAPI.getMySubscription()
                ]);

                setPlans(plansRes.data.plans || []);
                setCurrentSubscription(subRes.data.subscription);
            } catch (error) {
                console.error('Veri yükleme hatası:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isAuthenticated, isSeller]);

    // -------------------------------------------------------------------------
    // GİRİŞ/YETKİ KONTROLÜ
    // -------------------------------------------------------------------------
    if (!authLoading && !isAuthenticated) {
        return <Navigate to="/giris" replace />;
    }

    if (!authLoading && !isSeller) {
        return <Navigate to="/panel" replace />;
    }

    // -------------------------------------------------------------------------
    // PLANA ABONE OL
    // -------------------------------------------------------------------------
    const handleSubscribe = async (tier) => {
        setSubscribing(true);
        setMessage(null);

        try {
            const response = await boostPlansAPI.subscribe(tier);
            setCurrentSubscription(response.data.subscription);
            setMessage({
                type: 'success',
                text: response.data.message
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Abonelik oluşturulamadı'
            });
        } finally {
            setSubscribing(false);
        }
    };

    // -------------------------------------------------------------------------
    // ABONELİĞİ İPTAL ET
    // -------------------------------------------------------------------------
    const handleCancel = async () => {
        if (!confirm('Aboneliğinizi iptal etmek istediğinize emin misiniz?')) return;

        try {
            await boostPlansAPI.cancel();
            setCurrentSubscription(null);
            setMessage({
                type: 'success',
                text: 'Abonelik iptal edildi'
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'İptal işlemi başarısız'
            });
        }
    };

    // -------------------------------------------------------------------------
    // PLAN KARTLARI RENKLERİ
    // -------------------------------------------------------------------------
    const tierColors = {
        1: {
            gradient: 'from-amber-700 to-amber-900',
            border: 'border-amber-500',
            badge: 'bg-amber-100 text-amber-800',
            button: 'bg-amber-600 hover:bg-amber-700'
        },
        2: {
            gradient: 'from-gray-400 to-gray-600',
            border: 'border-gray-400',
            badge: 'bg-gray-100 text-gray-800',
            button: 'bg-gray-500 hover:bg-gray-600'
        },
        3: {
            gradient: 'from-yellow-400 to-yellow-600',
            border: 'border-yellow-400',
            badge: 'bg-yellow-100 text-yellow-800',
            button: 'bg-yellow-500 hover:bg-yellow-600'
        }
    };

    return (
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* =================================================================
            SAYFA BAŞLIĞI
            ================================================================= */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
                        🚀 Boost Planları
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Ürünlerinizi öne çıkarın ve daha fazla müşteriye ulaşın.
                        Planınızı seçin, satışlarınızı artırın!
                    </p>
                </div>

                {/* =================================================================
            MESAJ BİLDİRİMİ
            ================================================================= */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl ${message.type === 'success'
                        ? 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-200'
                        : 'bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-200'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* =================================================================
            AKTİF ABONELİK BİLGİSİ
            ================================================================= */}
                {currentSubscription && (
                    <div className="mb-8 card p-6 border-2 border-primary-500">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Aktif Planınız</span>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {currentSubscription.plan?.nameT || 'Boost'} Planı
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Bitiş: {new Date(currentSubscription.expires_at).toLocaleDateString('tr-TR')}
                                </p>
                            </div>
                            <button
                                onClick={handleCancel}
                                className="btn-secondary text-danger-600 border-danger-300 hover:bg-danger-50"
                            >
                                İptal Et
                            </button>
                        </div>
                    </div>
                )}

                {/* =================================================================
            PLAN KARTLARI
            ================================================================= */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="card p-8 animate-pulse">
                                <div className="bg-gray-200 dark:bg-gray-700 h-8 w-24 rounded mb-4"></div>
                                <div className="bg-gray-200 dark:bg-gray-700 h-12 w-32 rounded mb-6"></div>
                                <div className="space-y-2">
                                    <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded"></div>
                                    <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => {
                            const colors = tierColors[plan.tier];
                            const isCurrentPlan = currentSubscription?.tier === plan.tier;
                            const isLowerPlan = currentSubscription && currentSubscription.tier > plan.tier;

                            return (
                                <div
                                    key={plan.tier}
                                    className={`card overflow-hidden transition-transform hover:scale-105 ${isCurrentPlan ? 'ring-4 ring-primary-500' : ''
                                        }`}
                                >
                                    {/* Plan Header */}
                                    <div className={`bg-gradient-to-br ${colors.gradient} text-white p-6`}>
                                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${colors.badge}`}>
                                            {plan.name}
                                        </span>
                                        <h3 className="text-3xl font-bold mt-4">
                                            {plan.nameT}
                                        </h3>
                                        <p className="text-white/80 text-sm mt-1">
                                            {plan.description}
                                        </p>
                                    </div>

                                    {/* Plan Body */}
                                    <div className="p-6">
                                        {/* Fiyat */}
                                        <div className="mb-6">
                                            <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                                ₺{plan.price.toLocaleString('tr-TR')}
                                            </span>
                                            <span className="text-gray-500 dark:text-gray-400">
                                                /{plan.duration} gün
                                            </span>
                                        </div>

                                        {/* Özellikler */}
                                        <ul className="space-y-3 mb-6">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <svg className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Aksiyon Butonu */}
                                        {isCurrentPlan ? (
                                            <button
                                                disabled
                                                className="w-full py-3 px-4 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                                            >
                                                Aktif Plan
                                            </button>
                                        ) : isLowerPlan ? (
                                            <button
                                                disabled
                                                className="w-full py-3 px-4 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                                            >
                                                Mevcut Planınız Daha Yüksek
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleSubscribe(plan.tier)}
                                                disabled={subscribing}
                                                className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-colors ${colors.button} disabled:opacity-50`}
                                            >
                                                {subscribing ? 'İşleniyor...' : 'Şimdi Satın Al'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* =================================================================
            GERİ DÖN LİNKİ
            ================================================================= */}
                <div className="mt-12 text-center">
                    <Link to="/panel" className="text-primary-600 dark:text-primary-400 hover:underline">
                        ← Panele Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default BoostPlansPage;

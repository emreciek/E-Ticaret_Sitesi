// =============================================================================
// E-TİCARET MARKETPLACE - API SERVİS MODÜLÜ
// =============================================================================
// Bu dosya backend API ile iletişimi sağlar.
// Axios kütüphanesi kullanarak HTTP istekleri yapar.
// Token yönetimi ve hata işleme burada merkezi olarak yapılır.
// =============================================================================

import axios from 'axios';

// =============================================================================
// API İSTEMCİSİ OLUŞTURMA
// =============================================================================
// Axios instance oluşturuyoruz - tüm istekler bu üzerinden gönderilir
const api = axios.create({
    // Backend sunucu adresi
    baseURL: '/api',

    // İstek timeout süresi (30 saniye)
    timeout: 30000,

    // Varsayılan header'lar
    headers: {
        'Content-Type': 'application/json'
    }
});

// =============================================================================
// İSTEK INTERCEPTOR'U (REQUEST INTERCEPTOR)
// =============================================================================
// Her istek gönderilmeden önce bu fonksiyon çalışır
// Token'ı otomatik olarak header'a ekler
api.interceptors.request.use(
    (config) => {
        // localStorage'dan JWT token'ı al
        const token = localStorage.getItem('authToken');

        // Token varsa Authorization header'ına ekle
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // İstek oluşturma hatası
        console.error('API istek hatası:', error);
        return Promise.reject(error);
    }
);

// =============================================================================
// YANIT INTERCEPTOR'U (RESPONSE INTERCEPTOR)
// =============================================================================
// Her yanıt alındığında bu fonksiyon çalışır
// Hata işleme ve token yenileme burada yapılır
api.interceptors.response.use(
    (response) => {
        // Başarılı yanıtı doğrudan döndür
        return response;
    },
    (error) => {
        // Hata yanıtını işle

        if (error.response) {
            // Sunucudan yanıt geldi ama hata kodlu
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Yetkisiz erişim - Token geçersiz veya süresi dolmuş
                    console.warn('Oturum süresi doldu, yeniden giriş yapın');

                    // Token'ı temizle ve giriş sayfasına yönlendir
                    localStorage.removeItem('authToken');

                    // Eğer zaten giriş sayfasında değilsek yönlendir
                    if (!window.location.pathname.includes('/giris')) {
                        window.location.href = '/giris';
                    }
                    break;

                case 403:
                    // Erişim reddedildi - Yetki yok
                    console.error('Bu işlem için yetkiniz yok');
                    break;

                case 404:
                    // Kaynak bulunamadı
                    console.error('İstenen kaynak bulunamadı');
                    break;

                case 422:
                    // Doğrulama hatası - Form verileri geçersiz
                    console.error('Doğrulama hatası:', data.errors);
                    break;

                case 429:
                    // Çok fazla istek - Rate limiting
                    console.warn('Çok fazla istek gönderildi, lütfen bekleyin');
                    break;

                case 500:
                    // Sunucu hatası
                    console.error('Sunucu hatası oluştu');
                    break;

                default:
                    console.error(`Beklenmeyen hata (${status}):`, data.message);
            }
        } else if (error.request) {
            // İstek gönderildi ama yanıt alınamadı
            console.error('Sunucuya ulaşılamıyor, internet bağlantınızı kontrol edin');
        } else {
            // İstek oluşturulurken hata
            console.error('İstek hatası:', error.message);
        }

        return Promise.reject(error);
    }
);

// =============================================================================
// API FONKSİYONLARI
// =============================================================================
// Sık kullanılan API işlemleri için yardımcı fonksiyonlar

// -------------------------------------------------------------------------
// KİMLİK DOĞRULAMA API'LERİ
// -------------------------------------------------------------------------
export const authAPI = {
    // Kullanıcı girişi
    login: (email, password) => api.post('/auth/login', { email, password }),

    // Kullanıcı kaydı
    register: (userData) => api.post('/auth/register', userData),

    // Mevcut kullanıcı bilgisi
    me: () => api.get('/auth/me'),

    // Profil güncelleme
    updateProfile: (data) => api.put('/auth/profile', data),

    // Şifre değiştirme
    changePassword: (data) => api.put('/auth/password', data)
};

// -------------------------------------------------------------------------
// ÜRÜN API'LERİ
// -------------------------------------------------------------------------
export const productsAPI = {
    // Tüm ürünleri getir (filtreleme ve sayfalama ile)
    getAll: (params) => api.get('/products', { params }),

    // Tek ürün detayı
    getById: (id) => api.get(`/products/${id}`),

    // Yeni ürün oluştur (sadece satıcılar)
    create: (data) => api.post('/products', data),

    // Ürün güncelle
    update: (id, data) => api.put(`/products/${id}`, data),

    // Ürün sil
    delete: (id) => api.delete(`/products/${id}`),

    // Satıcının ürünleri
    getBySeller: (sellerId) => api.get(`/products/seller/${sellerId}`)
};

// -------------------------------------------------------------------------
// MESAJ API'LERİ
// -------------------------------------------------------------------------
export const messagesAPI = {
    // Konuşma listesi
    getConversations: () => api.get('/messages/conversations'),

    // Belirli konuşmanın mesajları
    getMessages: (conversationId) => api.get(`/messages/${conversationId}`),

    // Yeni mesaj gönder
    send: (data) => api.post('/messages', data),

    // Mesajları okundu olarak işaretle
    markAsRead: (conversationId) => api.put(`/messages/${conversationId}/read`)
};

// -------------------------------------------------------------------------
// SİPARİŞ API'LERİ
// -------------------------------------------------------------------------
export const ordersAPI = {
    // Siparişleri getir
    getAll: () => api.get('/orders'),

    // Sipariş detayı
    getById: (id) => api.get(`/orders/${id}`),

    // Yeni sipariş oluştur
    create: (data) => api.post('/orders', data),

    // Sipariş durumu güncelle
    updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status })
};

// -------------------------------------------------------------------------
// BOOST PLANLARI API'LERİ
// -------------------------------------------------------------------------
export const boostPlansAPI = {
    // Mevcut planları getir
    getPlans: () => api.get('/boost-plans'),

    // Aktif aboneliği getir
    getMySubscription: () => api.get('/boost-plans/my-subscription'),

    // Abonelik geçmişi
    getHistory: () => api.get('/boost-plans/history'),

    // Plana abone ol
    subscribe: (tier) => api.post('/boost-plans/subscribe', { tier }),

    // Aboneliği iptal et
    cancel: () => api.delete('/boost-plans/cancel')
};

// Varsayılan API instance'ını dışa aktar
export default api;


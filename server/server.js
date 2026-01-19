// =============================================================================
// E-TİCARET MARKETPLACE - ANA SUNUCU DOSYASI
// =============================================================================
// Bu dosya Node.js/Express sunucusunun giriş noktasıdır.
// HTTP sunucusu, WebSocket, veritabanı bağlantısı ve rotalar burada başlatılır.
// =============================================================================

// Ortam değişkenlerini yükle (.env dosyasından)
require('dotenv').config();

// Gerekli modülleri içe aktar
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

// Veritabanı bağlantısı
const { sequelize } = require('./src/config/database');

// Rotalar
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const messageRoutes = require('./src/routes/messages');
const orderRoutes = require('./src/routes/orders');
const userRoutes = require('./src/routes/users');
const boostPlanRoutes = require('./src/routes/boostPlans');

// WebSocket handlers
const { setupWebSocket } = require('./src/websocket/chatHandler');

// =============================================================================
// UYGULAMA OLUŞTURMA
// =============================================================================
const app = express();
const server = http.createServer(app);

// =============================================================================
// GÜVENLİK MİDDLEWARE'LERİ
// =============================================================================

// Helmet - HTTP güvenlik header'ları ekler
// XSS, clickjacking ve diğer saldırılara karşı koruma
app.use(helmet({
    contentSecurityPolicy: false, // React için devre dışı
    crossOriginEmbedderPolicy: false
}));

// CORS - Cross-Origin Resource Sharing
// Farklı domainlerden gelen isteklere izin verir
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Rate Limiting - DDoS ve brute force koruması
// Aynı IP'den çok fazla istek gelirse engelle
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // Her 15 dakikada maksimum 100 istek
    message: {
        error: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.'
    }
});
app.use('/api', limiter);

// =============================================================================
// BODY PARSER - İstek gövdelerini işle
// =============================================================================
app.use(express.json({ limit: '10mb' })); // JSON verileri için
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Form verileri için

// =============================================================================
// API ROTALARI
// =============================================================================

// Sağlık kontrolü - Sunucunun çalışıp çalışmadığını kontrol eder
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'E-Ticaret API çalışıyor',
        timestamp: new Date().toISOString()
    });
});

// Kimlik doğrulama rotaları (giriş, kayıt, profil)
app.use('/api/auth', authRoutes);

// Ürün rotaları (listeleme, ekleme, güncelleme)
app.use('/api/products', productRoutes);

// Mesaj rotaları (konuşmalar, mesajlar)
app.use('/api/messages', messageRoutes);

// Sipariş rotaları
app.use('/api/orders', orderRoutes);

// Kullanıcı rotaları (profil görüntüleme)
app.use('/api/users', userRoutes);

// Boost planları rotaları (satıcı görünürlük abonelikleri)
app.use('/api/boost-plans', boostPlanRoutes);

// =============================================================================
// GLOBAL HATA YÖNETİMİ
// =============================================================================
// Tüm rotalardan gelen hataları yakalar ve uygun yanıt döner
app.use((err, req, res, next) => {
    console.error('Sunucu Hatası:', err);

    // Doğrulama hatası
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Doğrulama hatası',
            errors: err.errors
        });
    }

    // JWT hatası
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Geçersiz veya süresi dolmuş token'
        });
    }

    // Genel hata
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Sunucu hatası oluştu'
    });
});

// 404 - Bulunamadı
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'İstenen kaynak bulunamadı'
    });
});

// =============================================================================
// WEBSOCKET (SOCKET.IO) KURULUMU
// =============================================================================
// Gerçek zamanlı mesajlaşma için WebSocket sunucusu
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// WebSocket handler'larını kur
setupWebSocket(io);

// =============================================================================
// SUNUCU BAŞLATMA
// =============================================================================
const PORT = process.env.PORT || 3001;

// Veritabanı bağlantısını kontrol et ve sunucuyu başlat
async function startServer() {
    try {
        // Veritabanı bağlantısını test et
        await sequelize.authenticate();
        console.log('✅ Veritabanı bağlantısı başarılı');

        // Modelleri senkronize et (geliştirme için)
        // Üretimde migrations kullanılmalı
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: true });
            console.log('✅ Veritabanı modelleri senkronize edildi');
        }

        // Sunucuyu başlat
        server.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log('🚀 E-Ticaret API Sunucusu Başlatıldı');
            console.log(`📍 Port: ${PORT}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`🔌 WebSocket: Aktif`);
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('❌ Sunucu başlatılamadı:', error);
        process.exit(1);
    }
}

// Sunucuyu başlat
startServer();

// Graceful shutdown - Sunucu kapatılırken temizlik
process.on('SIGTERM', async () => {
    console.log('📴 Sunucu kapatılıyor...');
    await sequelize.close();
    server.close(() => {
        console.log('👋 Sunucu kapatıldı');
        process.exit(0);
    });
});

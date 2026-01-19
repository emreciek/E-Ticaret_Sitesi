# 🛒 E-Ticaret Marketplace

Modern, güvenli ve tam özellikli bir e-ticaret pazaryeri uygulaması.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18.2-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Proje Hakkında

Bu proje, alıcılar ve satıcıların bir araya geldiği **tam özellikli bir e-ticaret pazaryeri** platformudur. Sahibinden, Letgo veya N11 benzeri bir yapıya sahiptir.

### ✨ Özellikler

- 🔐 **JWT Tabanlı Kimlik Doğrulama** - Güvenli giriş/kayıt sistemi
- 🛍️ **Ürün Yönetimi** - CRUD işlemleri, filtreleme, arama, sayfalama
- 💬 **Gerçek Zamanlı Mesajlaşma** - Socket.io ile anlık iletişim
- 🛡️ **Otomatik Moderasyon** - Küfür ve uygunsuz içerik tespiti
- 🚀 **Boost Planları** - Satıcı görünürlük abonelikleri
- 📦 **Sipariş Sistemi** - %5 komisyon hesaplaması
- 🌙 **Koyu/Açık Mod** - Tema desteği
- 🔒 **Güvenlik** - Helmet, Rate Limiting, XSS koruması

## 🛠️ Teknolojiler

### Frontend
- React 18 + Vite
- TailwindCSS
- React Router 6
- Socket.io-client
- Axios
- Electron (masaüstü desteği)

### Backend
- Node.js + Express
- Sequelize ORM
- SQLite (geliştirme) / PostgreSQL (üretim)
- Socket.io
- JWT + bcrypt
- Helmet + Rate Limiting

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/KULLANICI_ADINIZ/e-ticaret-marketplace.git
cd e-ticaret-marketplace
```

### 2. Backend Kurulumu
```bash
cd server
npm install
cp .env.example .env  # Ortam değişkenlerini ayarlayın
npm run dev
```

### 3. Frontend Kurulumu
```bash
cd client
npm install
npm run dev
```

### 4. Tarayıcıda Açın
```
http://localhost:5173
```

## 📁 Proje Yapısı

```
E-ticaret/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # UI bileşenleri
│   │   ├── context/        # React Context (Auth, Theme)
│   │   ├── pages/          # Sayfa bileşenleri
│   │   └── services/       # API servisleri
│   └── package.json
│
├── server/                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/         # Veritabanı yapılandırması
│   │   ├── middleware/     # Auth, validation
│   │   ├── routes/         # API endpoint'leri
│   │   ├── services/       # İş mantığı
│   │   └── websocket/      # Socket.io handlers
│   ├── .env.example        # Örnek ortam değişkenleri
│   └── package.json
│
└── README.md
```

## 🔑 Ortam Değişkenleri

`server/.env` dosyasını oluşturun:

```env
# Sunucu
PORT=3001
NODE_ENV=development

# Veritabanı (PostgreSQL - üretim için)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eticaret_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Client
CLIENT_URL=http://localhost:5173

# Komisyon (%)
COMMISSION_RATE=5
```

## 📱 Ekran Görüntüleri

| Ana Sayfa | Ürünler | Mesajlar |
|-----------|---------|----------|
| Hero, kategoriler, öne çıkan ürünler | Filtreleme, arama, sayfalama | Gerçek zamanlı chat |

## 🔒 Güvenlik Özellikleri

- **JWT Authentication** - Token tabanlı kimlik doğrulama
- **bcrypt** - Şifre hashleme (12 round salt)
- **Helmet** - HTTP güvenlik headers
- **Rate Limiting** - DDoS koruması (100 istek/15dk)
- **CORS** - Cross-Origin koruma
- **XSS Koruması** - DOMPurify ile HTML temizleme
- **Progresif Ban** - İhlal sayısına göre artan cezalar

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/login` - Giriş
- `GET /api/auth/me` - Kullanıcı bilgisi

### Ürünler
- `GET /api/products` - Ürün listesi
- `GET /api/products/:id` - Ürün detayı
- `POST /api/products` - Ürün oluştur
- `PUT /api/products/:id` - Ürün güncelle
- `DELETE /api/products/:id` - Ürün sil

### Mesajlar
- `GET /api/messages/conversations` - Konuşmalar
- `GET /api/messages/:id` - Mesaj geçmişi
- `POST /api/messages` - Mesaj gönder

### Siparişler
- `GET /api/orders` - Sipariş listesi
- `POST /api/orders` - Sipariş oluştur
- `PUT /api/orders/:id/status` - Durum güncelle

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

Sorularınız için iletişime geçebilirsiniz.
linkedn:www.linkedin.com/in/emre-cicek-3a847b212
instagram:emreciek
---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

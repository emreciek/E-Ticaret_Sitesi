// =============================================================================
// E-TİCARET MARKETPLACE - ELECTRON ANA SÜREÇ DOSYASI
// =============================================================================
// Bu dosya Electron uygulamasının ana sürecini (main process) yönetir.
// Masaüstü uygulamasının penceresini oluşturur ve kontrol eder.
// =============================================================================

// Electron modüllerini içe aktarıyoruz
// app: Uygulama yaşam döngüsünü kontrol eder
// BrowserWindow: Masaüstü penceresi oluşturur
const { app, BrowserWindow } = require('electron');
const path = require('path');

// =============================================================================
// UYGULAMA PENCERESİ OLUŞTURMA FONKSİYONU
// =============================================================================
// Bu fonksiyon ana uygulama penceresini oluşturur ve yapılandırır
function createWindow() {
  // Yeni bir tarayıcı penceresi oluşturuyoruz
  const mainWindow = new BrowserWindow({
    width: 1400,        // Pencere genişliği (piksel)
    height: 900,        // Pencere yüksekliği (piksel)
    minWidth: 1024,     // Minimum genişlik - kullanıcı bundan küçültemez
    minHeight: 700,     // Minimum yükseklik
    
    // Web sayfası tercihleri - güvenlik ayarları
    webPreferences: {
      nodeIntegration: false,      // Güvenlik: Node.js erişimini kapat
      contextIsolation: true,      // Güvenlik: İzolasyon modunu aç
      sandbox: true                // Güvenlik: Sandbox modunu aktif et
    },
    
    // Pencere görünüm ayarları
    icon: path.join(__dirname, '../public/icon.png'),  // Uygulama ikonu
    show: false,        // Hazır olana kadar gösterme (flicker önleme)
    backgroundColor: '#0f172a'  // Koyu tema arka plan rengi
  });

  // Geliştirme modunda mı, üretim modunda mı kontrol ediyoruz
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (isDev) {
    // GELİŞTİRME MODU: Vite dev sunucusundan yükle
    mainWindow.loadURL('http://localhost:5173');
    
    // Geliştirici araçlarını otomatik aç (debug için)
    mainWindow.webContents.openDevTools();
  } else {
    // ÜRETİM MODU: Derlenmiş dosyalardan yükle
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Pencere yüklendiğinde göster (flicker önleme)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

// =============================================================================
// UYGULAMA YAŞAM DÖNGÜSÜ OLAYLARI
// =============================================================================

// Uygulama hazır olduğunda pencereyi oluştur
app.whenReady().then(() => {
  createWindow();

  // macOS için: Dock'tan tıklandığında pencere yoksa yeniden oluştur
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Tüm pencereler kapandığında uygulamayı kapat (macOS hariç)
app.on('window-all-closed', () => {
  // macOS'ta uygulamalar genellikle açık kalır
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// =============================================================================
// GÜVENLİK: Uzak içerik yüklemesini engelle
// =============================================================================
// Bu, XSS ve diğer güvenlik açıklarını önlemeye yardımcı olur
app.on('web-contents-created', (event, contents) => {
  // Yeni pencere açmayı engelle (güvenlik)
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
});

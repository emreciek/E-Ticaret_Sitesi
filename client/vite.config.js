// =============================================================================
// E-TİCARET MARKETPLACE - VİTE YAPILANDIRMA DOSYASI
// =============================================================================
// Bu dosya Vite build aracının ayarlarını içerir.
// React eklentisi ve geliştirme sunucusu yapılandırması burada tanımlanır.
// =============================================================================

import { defineConfig } from 'vite';   // Vite yapılandırma fonksiyonu
import react from '@vitejs/plugin-react'; // React desteği için eklenti

// Vite yapılandırmasını dışa aktarıyoruz
export default defineConfig({
    // ==========================================================================
    // EKLENTİLER
    // ==========================================================================
    // React eklentisi: JSX dönüşümü ve Fast Refresh özelliği sağlar
    plugins: [react()],

    // ==========================================================================
    // GELİŞTİRME SUNUCUSU AYARLARI
    // ==========================================================================
    server: {
        port: 5173,        // Sunucu portu
        strictPort: true,  // Port meşgulse hata ver (rastgele port kullanma)

        // CORS ayarları - Electron'dan gelen isteklere izin ver
        cors: true,

        // API isteklerini backend'e yönlendir (proxy)
        proxy: {
            // /api ile başlayan istekler Node.js sunucusuna gider
            '/api': {
                target: 'http://localhost:3001',  // Backend sunucu adresi
                changeOrigin: true,               // Origin header'ı değiştir
                secure: false                     // HTTPS sertifikası gerektirme
            },
            // WebSocket bağlantıları için Socket.io proxy'si
            '/socket.io': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                ws: true  // WebSocket desteğini aç
            }
        }
    },

    // ==========================================================================
    // DERLEME (BUILD) AYARLARI
    // ==========================================================================
    build: {
        outDir: 'dist',           // Çıktı klasörü
        emptyOutDir: true,        // Derleme öncesi klasörü temizle
        sourcemap: false,         // Üretimde sourcemap oluşturma (güvenlik)

        // Rollup ayarları (Vite, Rollup kullanır)
        rollupOptions: {
            output: {
                // Chunk (parça) dosya isimlendirmesi
                manualChunks: {
                    // Vendor kütüphanelerini ayrı dosyaya ayır
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    socket: ['socket.io-client']
                }
            }
        }
    },

    // ==========================================================================
    // ÇÖZÜMLEME (RESOLVE) AYARLARI
    // ==========================================================================
    resolve: {
        alias: {
            // '@' karakteri 'src' klasörüne işaret eder
            // Örnek: import Button from '@/components/Button'
            '@': '/src'
        }
    }
});

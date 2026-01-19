// =============================================================================
// E-TİCARET MARKETPLACE - POSTCSS YAPILANDIRMASI
// =============================================================================
// PostCSS, CSS dosyalarını işleyen bir araçtır.
// Tailwind CSS ve Autoprefixer burada etkinleştirilir.
// =============================================================================

export default {
    plugins: {
        // Tailwind CSS eklentisi - utility class'ları oluşturur
        tailwindcss: {},

        // Autoprefixer - tarayıcı uyumluluğu için CSS prefix'leri ekler
        // Örnek: -webkit-, -moz-, -ms- gibi önekler otomatik eklenir
        autoprefixer: {},
    },
};

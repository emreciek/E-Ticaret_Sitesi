// =============================================================================
// E-TİCARET MARKETPLACE - REACT UYGULAMA GİRİŞ NOKTASI
// =============================================================================
// Bu dosya React uygulamasının başlatıldığı ana dosyadır.
// DOM'a React uygulamasını bağlar (mount eder).
// =============================================================================

// React kütüphanesi - UI oluşturmak için kullanılır
import React from 'react';

// ReactDOM - React bileşenlerini tarayıcı DOM'una render eder
import ReactDOM from 'react-dom/client';

// Ana uygulama bileşeni
import App from './App.jsx';

// Global CSS stilleri (Tailwind dahil)
import './index.css';

// =============================================================================
// UYGULAMA RENDER İŞLEMİ
// =============================================================================
// 'root' ID'li HTML elementine React uygulamasını bağlıyoruz
// StrictMode: Geliştirme modunda potansiyel sorunları tespit eder
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);

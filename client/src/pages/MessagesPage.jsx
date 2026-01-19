// =============================================================================
// E-TİCARET MARKETPLACE - MESAJLAŞMA SAYFASI
// =============================================================================
// Bu sayfa alıcı ve satıcı arasındaki mesajlaşma arayüzünü sağlar.
// Gerçek zamanlı mesajlaşma ve moderasyon sistemi içerir.
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messagesAPI } from '../services/api';
import io from 'socket.io-client';

// =============================================================================
// MESAJLAŞMA SAYFASI BİLEŞENİ
// =============================================================================
function MessagesPage() {
    // -------------------------------------------------------------------------
    // HOOK'LAR VE PARAMETRELER
    // -------------------------------------------------------------------------
    const { conversationId } = useParams();
    const [searchParams] = useSearchParams();
    const newSellerChat = searchParams.get('satici');

    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // -------------------------------------------------------------------------
    // STATE DEĞİŞKENLERİ
    // -------------------------------------------------------------------------
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedConversation, setSelectedConversation] = useState(conversationId || null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [moderationWarning, setModerationWarning] = useState(null);

    // -------------------------------------------------------------------------
    // SOCKET.IO BAĞLANTISI
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (!isAuthenticated) return;

        // Socket.io bağlantısı oluştur
        socketRef.current = io('http://localhost:3001', {
            auth: { token: localStorage.getItem('authToken') }
        });

        // Yeni mesaj alındığında
        socketRef.current.on('new_message', (message) => {
            if (message.conversation_id === selectedConversation) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
            // Konuşma listesini güncelle
            loadConversations();
        });

        // Moderasyon uyarısı alındığında
        socketRef.current.on('moderation_warning', (data) => {
            setModerationWarning(data);
            setTimeout(() => setModerationWarning(null), 5000);
        });

        // Temizleme
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [isAuthenticated, selectedConversation]);

    // -------------------------------------------------------------------------
    // KONUŞMALARI YÜKLE
    // -------------------------------------------------------------------------
    const loadConversations = async () => {
        try {
            const response = await messagesAPI.getConversations();
            setConversations(response.data.conversations || []);
        } catch (error) {
            console.error('Konuşmalar yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadConversations();
        }
    }, [isAuthenticated]);

    // -------------------------------------------------------------------------
    // MESAJLARI YÜKLE
    // -------------------------------------------------------------------------
    useEffect(() => {
        const loadMessages = async () => {
            if (!selectedConversation) return;

            try {
                const response = await messagesAPI.getMessages(selectedConversation);
                setMessages(response.data.messages || []);

                // Mesajları okundu olarak işaretle
                await messagesAPI.markAsRead(selectedConversation);

                scrollToBottom();
            } catch (error) {
                console.error('Mesajlar yüklenirken hata:', error);
            }
        };

        loadMessages();
    }, [selectedConversation]);

    // -------------------------------------------------------------------------
    // YARDIMCI FONKSİYONLAR
    // -------------------------------------------------------------------------
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // -------------------------------------------------------------------------
    // MESAJ GÖNDER
    // -------------------------------------------------------------------------
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            // Socket üzerinden mesaj gönder
            socketRef.current?.emit('send_message', {
                conversation_id: selectedConversation,
                receiver_id: newSellerChat || conversations.find(c => c.id === selectedConversation)?.other_user_id,
                content: newMessage
            });

            setNewMessage('');
        } catch (error) {
            console.error('Mesaj gönderilemedi:', error);
        } finally {
            setSending(false);
        }
    };

    // -------------------------------------------------------------------------
    // GİRİŞ KONTROLÜ
    // -------------------------------------------------------------------------
    if (!authLoading && !isAuthenticated) {
        return <Navigate to="/giris" replace />;
    }

    return (
        <div className="min-h-[80vh] bg-surface-light dark:bg-surface-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="card overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                    <div className="flex h-full">

                        {/* =============================================================
                KONUŞMA LİSTESİ (Sol Panel)
                ============================================================= */}
                        <div className="w-80 border-r border-surface-light-border dark:border-surface-dark-border flex flex-col">
                            {/* Başlık */}
                            <div className="p-4 border-b border-surface-light-border dark:border-surface-dark-border">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Mesajlar
                                </h2>
                            </div>

                            {/* Konuşma Listesi */}
                            <div className="flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="p-4 space-y-3 animate-pulse">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : conversations.length > 0 ? (
                                    conversations.map((conv) => (
                                        <button
                                            key={conv.id}
                                            onClick={() => setSelectedConversation(conv.id)}
                                            className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-surface-dark-tertiary transition-colors ${selectedConversation === conv.id
                                                    ? 'bg-primary-50 dark:bg-primary-900/20'
                                                    : ''
                                                }`}
                                        >
                                            {/* Avatar */}
                                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                                    {conv.other_user_name?.charAt(0).toUpperCase() || 'K'}
                                                </span>
                                            </div>
                                            {/* İsim ve Son Mesaj */}
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                                    {conv.other_user_name}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {conv.last_message}
                                                </p>
                                            </div>
                                            {/* Okunmamış Sayısı */}
                                            {conv.unread_count > 0 && (
                                                <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <div className="text-4xl mb-2">💬</div>
                                        <p>Henüz mesajınız yok</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* =============================================================
                MESAJ ALANI (Sağ Panel)
                ============================================================= */}
                        <div className="flex-1 flex flex-col">
                            {selectedConversation ? (
                                <>
                                    {/* Mesaj Listesi */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                                                    }`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender_id === user?.id
                                                            ? 'bg-primary-600 text-white'
                                                            : 'bg-gray-100 dark:bg-surface-dark-tertiary text-gray-900 dark:text-white'
                                                        } ${msg.is_flagged ? 'border-2 border-warning-500' : ''}`}
                                                >
                                                    <p>{msg.content}</p>
                                                    {msg.is_flagged && (
                                                        <p className="text-xs mt-1 opacity-75">
                                                            ⚠️ Bu mesaj moderasyon tarafından işaretlendi
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Moderasyon Uyarısı */}
                                    {moderationWarning && (
                                        <div className="mx-4 mb-2 p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 rounded-xl">
                                            <p className="text-sm text-danger-600 dark:text-danger-400">
                                                ⚠️ {moderationWarning.message}
                                            </p>
                                        </div>
                                    )}

                                    {/* Mesaj Gönderme Formu */}
                                    <form onSubmit={handleSendMessage} className="p-4 border-t border-surface-light-border dark:border-surface-dark-border">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Mesajınızı yazın..."
                                                className="input flex-1"
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending || !newMessage.trim()}
                                                className="btn-primary px-6 disabled:opacity-50"
                                            >
                                                {sending ? (
                                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                // Konuşma seçilmedi
                                <div className="flex-1 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">💬</div>
                                        <p>Bir konuşma seçin veya yeni bir sohbet başlatın</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessagesPage;

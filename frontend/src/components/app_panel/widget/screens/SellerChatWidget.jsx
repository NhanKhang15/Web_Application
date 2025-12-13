import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Minimize2, Search, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { postJSON, getJSON, API_BASE_URL } from "../../../../lib/api_url";
import { useChat } from "./ChatContext.jsx";
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useCallback } from 'react';

export default function GlobalChatWidget({ currentUserId, externalOpen, onClose }) {
    const { t } = useTranslation();
    const { isOpen: contextIsOpen, setIsOpen: setContextIsOpen, chatState } = useChat();
    const [internalOpen, setInternalOpen] = useState(false);

    // 👇 SỬA LỖI: Khai báo đúng cú pháp [state, setState]
    // eslint-disable-next-line no-unused-vars
    const [isOpenState, setIsOpenState] = useState(() => {
        const saved = localStorage.getItem(`chat_is_open_${currentUserId}`);
        return saved ? JSON.parse(saved) : false;
    });

    const [activePartner, setActivePartner] = useState(() => {
        const saved = localStorage.getItem(`chat_active_partner_${currentUserId}`);
        return saved ? JSON.parse(saved) : null;
    });

    // Logic xác định trạng thái mở:
    // Nếu Menu điều khiển (externalOpen khác undefined) -> Dùng Menu.
    // Nếu không (Menu đóng/chưa load) -> Dùng Context hoặc Internal.
    const isOpen = externalOpen !== undefined ? externalOpen : (internalOpen || contextIsOpen);

    const handleClose = () => {
        setInternalOpen(false);
        setContextIsOpen(false); // Đóng trong Context để lần sau mở lại được
        if (onClose) onClose();
    };

    // Effect: Khi activePartner thay đổi -> Lưu ngay vào Storage
    useEffect(() => {
        if (activePartner) {
            localStorage.setItem(`chat_active_partner_${currentUserId}`, JSON.stringify(activePartner));
        } else {
            localStorage.removeItem(`chat_active_partner_${currentUserId}`);
        }
    }, [activePartner, currentUserId]);

    // Đồng bộ từ Context (Khi bấm nút "Chat ngay")
    useEffect(() => {
        if (chatState.partnerId) {
            const newPartner = { id: chatState.partnerId, name: chatState.partnerName };
            setActivePartner(newPartner);
            // Lưu ý: Việc mở widget (isOpen=true) sẽ do UtilityMenu xử lý nhờ useEffect lắng nghe Context
        }
    }, [chatState]);

    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [conversations, setConversations] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [isSending, setIsSending] = useState(false);
    const [incomingProductInfo, setIncomingProductInfo] = useState(null);
    const [sendStatus, setSendStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'failed'
    const [failedMessage, setFailedMessage] = useState(null); // lưu tin nhắn thất bại để retry
    const [isPartnerTyping, setIsPartnerTyping] = useState(false); // typing indicator
    const [searchQuery, setSearchQuery] = useState(""); // message search
    const [searchResults, setSearchResults] = useState([]); // kết quả tìm kiếm
    const [isSearching, setIsSearching] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null); // để debounce typing event
    const stompClientRef = useRef(null); // lưu reference để gửi typing
    const searchTimeoutRef = useRef(null); // để debounce search
    const activePartnerRef = useRef(null); // track activePartner cho WebSocket callbacks

    // --- 1. LOGIC WEBSOCKET ---
    useEffect(() => {
        if (!currentUserId) return;
        const socket = new SockJS(`${API_BASE_URL}/ws`);
        const stompClient = Stomp.over(socket);
        stompClient.debug = () => { };

        stompClient.connect({}, () => {
            // Subscribe tin nhắn
            stompClient.subscribe(`/topic/user-${currentUserId}`, (msg) => {
                const payload = JSON.parse(msg.body);
                handleIncomingMessage(payload);
            });
            // Subscribe typing indicator
            stompClient.subscribe(`/topic/typing-${currentUserId}`, (msg) => {
                const payload = JSON.parse(msg.body);
                handleTypingEvent(payload);
            });
            stompClientRef.current = stompClient;
        }, (err) => console.error("❌ Socket Error:", err));

        return () => { if (stompClient.connected) stompClient.disconnect(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId]);

    // Xử lý typing event từ partner
    const handleTypingEvent = (event) => {
        // Sử dụng ref để lấy giá trị activePartner mới nhất (tránh stale closure)
        const currentActivePartner = activePartnerRef.current;
        console.log('Typing event received:', event, 'currentActivePartner:', currentActivePartner);

        if (currentActivePartner && String(event.senderId) === String(currentActivePartner.id)) {
            setIsPartnerTyping(event.typing);
            // Tự động tắt sau 3s nếu không nhận được update
            if (event.typing) {
                setTimeout(() => setIsPartnerTyping(false), 3000);
            }
        }
    };

    const handleIncomingMessage = (newMsg) => {
        if (String(newMsg.senderId) === String(currentUserId)) return;

        setActivePartner(current => {
            if (current && String(current.id) === String(newMsg.senderId)) {
                setChatHistory(prev => {
                    const isDuplicate = prev.some(msg => msg.content === newMsg.content && Math.abs(new Date(msg.createdAt) - new Date(newMsg.createdAt)) < 1000);
                    if (isDuplicate) return prev;
                    return [...prev, { content: newMsg.content, isMine: false, createdAt: newMsg.createdAt }];
                });
                if (newMsg.auctionId && newMsg.itemTitle) {
                    setIncomingProductInfo({ id: newMsg.auctionId, title: newMsg.itemTitle });
                }
            }
            return current;
        });

        setConversations(prev => {
            const others = prev.filter(c => String(c.partnerId) !== String(newMsg.senderId));
            const updated = {
                partnerId: newMsg.senderId,
                partnerName: newMsg.senderName || "User",
                lastMessage: newMsg.content,
                timeAgo: t('Just_now', { defaultValue: 'Vừa xong' }),
                rawTime: newMsg.createdAt
            };
            return [updated, ...others];
        });
    };

    // --- 2. CÁC EFFECT KHÁC ---
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const list = await getJSON('/api/messages/conversations');
                if (chatState.partnerId && chatState.partnerId !== currentUserId) {
                    const isInData = list.some(c => c.partnerId === chatState.partnerId);
                    if (!isInData) {
                        const tempUser = {
                            partnerId: chatState.partnerId,
                            partnerName: chatState.partnerName,
                            lastMessage: t('New_conversation', { defaultValue: 'Bắt đầu trò chuyện' }),
                            timeAgo: t('Now', { defaultValue: 'Mới' }),
                            rawTime: new Date().toISOString()
                        };
                        setConversations([tempUser, ...list]);
                        return;
                    }
                }
                setConversations(list);
            } catch (err) { console.error("Fetch conv error:", err); }
        };
        if (isOpen) fetchConversations();
    }, [isOpen, chatState, currentUserId]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!activePartner?.id || !currentUserId) return;
            try {
                // Updated API: dùng partnerId thay vì senderId/receiverId
                const url = `/api/messages/history?partnerId=${activePartner.id}`;
                const data = await getJSON(url);
                setChatHistory(Array.isArray(data) ? data : []);
            } catch (err) { setChatHistory([]); }
        };
        if (isOpen && activePartner) fetchHistory();
    }, [isOpen, activePartner, currentUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    // Reset typing khi đổi partner và sync activePartnerRef
    useEffect(() => {
        setIsPartnerTyping(false);
        activePartnerRef.current = activePartner; // sync ref với state
    }, [activePartner]);

    // Gửi typing event (debounced)
    const sendTypingEvent = useCallback(async (isTyping) => {
        if (!activePartner) return;
        try {
            await postJSON('/api/typing', {
                receiverId: activePartner.id,
                typing: isTyping
            });
        } catch (err) {
            // Silent fail - typing indicator không quan trọng lắm
        }
    }, [activePartner]);

    // Handle input change với typing indicator
    const handleMessageChange = (e) => {
        setMessage(e.target.value);

        // Debounce typing event
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Gửi typing=true
        sendTypingEvent(true);

        // Sau 2s không gõ, gửi typing=false
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingEvent(false);
        }, 2000);
    };

    // Handle search change - lọc danh sách conversations theo tên
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Lọc conversations theo search query
    const filteredConversations = searchQuery.trim()
        ? conversations.filter(conv =>
            conv.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : conversations;

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !activePartner) return;

        const tempMsg = { content: message, isMine: true, createdAt: new Date().toISOString() };
        setChatHistory(prev => [...prev, tempMsg]);

        setConversations(prev => {
            const newList = prev.filter(c => c.partnerId !== activePartner.id);
            const updated = {
                partnerId: activePartner.id,
                partnerName: activePartner.name,
                lastMessage: message,
                timeAgo: t('Just_now', { defaultValue: 'Vừa xong' })
            };
            return [updated, ...newList];
        });

        const msgToSend = message;
        setMessage("");
        setSendStatus('sending');
        setIsSending(true);

        try {
            await postJSON('/api/messages', {
                receiverId: activePartner.id,
                auctionId: chatState.auctionId || incomingProductInfo?.id,
                content: msgToSend
            });
            setSendStatus('sent');
            setFailedMessage(null);
            // Reset status sau 2 giây
            setTimeout(() => setSendStatus('idle'), 2000);
        } catch (err) {
            console.error(err);
            setSendStatus('failed');
            setFailedMessage(msgToSend);
        } finally {
            setIsSending(false);
        }
    };

    const handleRetry = () => {
        if (failedMessage && activePartner) {
            setMessage(failedMessage);
            setSendStatus('idle');
            setFailedMessage(null);
        }
    };

    const currentProduct = (activePartner && chatState.partnerId === activePartner.id && chatState.itemTitle)
        ? { title: chatState.itemTitle, status: "Đang xem" }
        : incomingProductInfo
            ? { title: incomingProductInfo.title, status: "Sản phẩm liên quan" }
            : null;

    if (!currentUserId) return null;
    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 md:inset-auto md:bottom-24 md:right-24 z-[9990] flex flex-col items-center md:items-end font-sans pointer-events-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-white dark:bg-[#1A1F25] w-full h-full md:w-[800px] md:h-[500px] md:rounded-xl shadow-2xl border-0 md:border border-gray-200 dark:border-gray-700 flex overflow-hidden md:mb-4"
                    >
                        {/* CỘT TRÁI - Full width on mobile when no activePartner, normal on sm+ */}
                        <div className={`${activePartner ? 'hidden' : 'flex'} sm:flex w-full sm:w-[220px] md:w-[280px] border-r-0 sm:border-r border-gray-200 dark:border-gray-700 flex-col bg-gray-50 dark:bg-[#14191F]`}>
                            {/* Header for conversation list - with close button on mobile */}
                            <div className="h-[54px] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:hidden">
                                <h3 className="font-bold text-gray-900 dark:text-white">{t('chat_conversations', { defaultValue: 'Tin nhắn' })}</h3>
                                <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-500">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={t('chat_search_users', { defaultValue: 'Tìm người dùng...' })}
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="w-full pl-9 pr-8 py-1.5 text-xs bg-white dark:bg-[#0B0F13] border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-[#e43137] text-gray-900 dark:text-white"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {/* Lọc và hiển thị danh sách conversations */}
                                {filteredConversations.length === 0 && searchQuery ? (
                                    <div className="p-4 text-center text-xs text-gray-500">
                                        {t('chat_no_user_found', { defaultValue: 'Không tìm thấy người dùng' })}
                                    </div>
                                ) : (
                                    filteredConversations.map((conv) => (
                                        <div key={conv.partnerId} onClick={() => setActivePartner({ id: conv.partnerId, name: conv.partnerName })} className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${activePartner?.id === conv.partnerId ? 'bg-white dark:bg-[#1A1F25] border-l-4 border-[#e43137]' : ''}`}>
                                            <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                                                <img src={`https://ui-avatars.com/api/?name=${conv.partnerName}&background=random`} alt="" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline">
                                                    <h4 className={`text-sm truncate ${activePartner?.id === conv.partnerId ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{conv.partnerName}</h4>
                                                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{conv.timeAgo}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        {/* CỘT PHẢI - Hidden on mobile when no activePartner, full on sm+ */}
                        <div className={`${!activePartner ? 'hidden' : 'flex'} sm:flex flex-1 flex-col bg-white dark:bg-[#1A1F25]`}>
                            <div className="h-[54px] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
                                <div className="flex items-center gap-2">
                                    {/* Back button - only on mobile */}
                                    <button
                                        onClick={() => setActivePartner(null)}
                                        className="sm:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{activePartner ? activePartner.name : t('Select_conversation')}</h3>
                                </div>
                                <div className="flex gap-2 text-gray-500">
                                    <button onClick={handleClose}><X className="w-5 h-5 hover:text-red-500" /></button>
                                </div>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto bg-[#F5F5F5] dark:bg-[#0B0F13] space-y-3">
                                {currentProduct && (
                                    <div className="flex items-center gap-3 bg-white dark:bg-[#14191F] p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-4 shadow-sm">
                                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">IMG</div>
                                        <div>
                                            <p className="text-sm font-medium line-clamp-1 dark:text-gray-200">{currentProduct.title}</p>
                                            <p className="text-xs text-[#e43137]">{currentProduct.status}</p>
                                        </div>
                                    </div>
                                )}
                                {!activePartner ? (
                                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-20">{t('chat_select_conversation')}</div>
                                ) : chatHistory.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.isMine ? 'bg-[#e43137] text-white rounded-tr-none' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-tl-none'}`}>{msg.content}</div>
                                    </div>
                                ))}
                                {/* Typing Indicator */}
                                {isPartnerTyping && activePartner && (
                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm">
                                            <div className="flex gap-1 items-center">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            {activePartner && (
                                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                                    {/* Error/Retry UI */}
                                    {sendStatus === 'failed' && (
                                        <div onClick={handleRetry} className="flex items-center gap-2 text-red-500 text-xs mb-2 cursor-pointer hover:text-red-600">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{t('chat_send_failed')}</span>
                                        </div>
                                    )}
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input
                                            value={message}
                                            onChange={handleMessageChange}
                                            placeholder={t('chat_type_message')}
                                            className="flex-1 bg-gray-100 dark:bg-[#0B0F13] border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-[#e43137] text-gray-900 dark:text-white"
                                            disabled={sendStatus === 'sending'}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!message.trim() || sendStatus === 'sending'}
                                            className="text-[#e43137] p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full disabled:opacity-50"
                                        >
                                            {sendStatus === 'sending' ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5" />
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
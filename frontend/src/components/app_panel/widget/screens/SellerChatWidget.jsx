import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, X, Send, Minimize2, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { postJSON, getJSON, API_BASE_URL } from "../../../../lib/api_url";
import { useChat } from "./ChatContext.jsx";
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export default function GlobalChatWidget({ currentUserId }) {
    const { t } = useTranslation();
    const { isOpen: contextIsOpen, setIsOpen: setContextIsOpen, chatState } = useChat();

    const [isOpen, setIsOpenState] = useState(() => {
        const saved = localStorage.getItem(`chat_is_open_${currentUserId}`);
        return saved ? JSON.parse(saved) : false;
    });

    // Lưu người đang chat cùng (Active Partner)
    const [activePartner, setActivePartner] = useState(() => {
        const saved = localStorage.getItem(`chat_active_partner_${currentUserId}`);
        return saved ? JSON.parse(saved) : null;
    });

    // Hàm wrapper để cập nhật cả State lẫn Context và LocalStorage
    const setIsOpen = (val) => {
        setIsOpenState(val);
        setContextIsOpen(val);
        localStorage.setItem(`chat_is_open_${currentUserId}`, JSON.stringify(val));
    };

    // Effect: Khi activePartner thay đổi -> Lưu ngay vào Storage
    useEffect(() => {
        if (activePartner) {
            localStorage.setItem(`chat_active_partner_${currentUserId}`, JSON.stringify(activePartner));
        } else {
            localStorage.removeItem(`chat_active_partner_${currentUserId}`); // Xóa nếu null
        }
    }, [activePartner, currentUserId]);

    // Đồng bộ từ Context (Khi bấm nút "Chat ngay" từ trang sản phẩm)
    useEffect(() => {
        if (chatState.partnerId) {
            const newPartner = { id: chatState.partnerId, name: chatState.partnerName };
            setActivePartner(newPartner);
            setIsOpen(true); // Tự động mở
        }
    }, [chatState]);

    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [isSending, setIsSending] = useState(false);

    // Thêm state lưu thông tin sản phẩm từ tin nhắn đến
    const [incomingProductInfo, setIncomingProductInfo] = useState(null);

    const messagesEndRef = useRef(null);

    // --- 1. LOGIC WEBSOCKET ---
    useEffect(() => {
        if (!currentUserId) {
            console.log("⚠️ ChatWidget: Missing currentUserId");
            return;
        }

        console.log("🔌 Connecting Socket for User:", currentUserId);
        const socket = new SockJS(`${API_BASE_URL}/ws`);
        const stompClient = Stomp.over(socket);
        stompClient.debug = () => { }; // Tắt log thư viện

        stompClient.connect({}, () => {
            console.log("✅ Socket Connected!");
            stompClient.subscribe(`/topic/user-${currentUserId}`, (msg) => {
                const payload = JSON.parse(msg.body);
                console.log("📩 New Message Received:", payload);
                handleIncomingMessage(payload);
            });
        }, (err) => console.error("❌ Socket Error:", err));

        return () => {
            if (stompClient && stompClient.connected) stompClient.disconnect();
        };
    }, [currentUserId]);

    const handleIncomingMessage = (newMsg) => {
        // newMsg: { content, senderId, senderName, createdAt, auctionId, itemTitle }

        // 1. QUAN TRỌNG: So sánh ID bằng String để tránh lỗi khác kiểu dữ liệu (123 vs "123")
        // Nếu tin nhắn do chính mình gửi -> Bỏ qua (vì đã hiện ở handleSendMessage rồi)
        if (String(newMsg.senderId) === String(currentUserId)) return;

        // 2. Cập nhật khung chat
        setActivePartner(current => {
            // Chỉ thêm nếu đang mở chat với đúng người gửi này
            if (current && String(current.id) === String(newMsg.senderId)) {

                // 3. KIỂM TRA TRÙNG LẶP (An toàn tuyệt đối)
                // Đôi khi mạng lag socket có thể bắn 2 lần, ta check xem tin này đã có trong history chưa
                setChatHistory(prev => {
                    const isDuplicate = prev.some(msg =>
                        msg.content === newMsg.content &&
                        Math.abs(new Date(msg.createdAt) - new Date(newMsg.createdAt)) < 1000 // Chênh lệch < 1 giây
                    );

                    if (isDuplicate) return prev; // Nếu trùng thì không thêm nữa

                    return [...prev, {
                        content: newMsg.content,
                        isMine: false, // Chắc chắn là tin của người khác
                        createdAt: newMsg.createdAt
                    }];
                });

                // Lưu info sản phẩm nếu có
                if (newMsg.auctionId && newMsg.itemTitle) {
                    setIncomingProductInfo({
                        id: newMsg.auctionId,
                        title: newMsg.itemTitle
                    });
                }
            }
            return current;
        });

        // 3. Cập nhật danh sách bên trái
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

    // Đồng bộ activePartner khi bấm "Chat ngay" từ trang chi tiết
    useEffect(() => {
        if (chatState.partnerId) {
            setActivePartner({ id: chatState.partnerId, name: chatState.partnerName });
            // Reset incoming info vì ta đang dùng info từ context
            setIncomingProductInfo(null);
        }
    }, [chatState]);

    // Load danh sách hội thoại
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

    // Load lịch sử chat
    useEffect(() => {
        const fetchHistory = async () => {
            if (!activePartner?.id || !currentUserId) return;
            try {
                // New API: senderId (me) -> receiverId (partner)
                const url = `/api/messages/history?senderId=${currentUserId}&receiverId=${activePartner.id}`;

                const data = await getJSON(url);
                setChatHistory(Array.isArray(data) ? data : []);
            } catch (err) { setChatHistory([]); }
        };
        if (isOpen && activePartner) fetchHistory();
    }, [isOpen, activePartner, currentUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

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
        setIsSending(true);

        try {
            await postJSON('/api/messages', {
                receiverId: activePartner.id,
                // Gửi kèm auctionId nếu có (từ context hoặc tin nhắn cũ)
                auctionId: chatState.auctionId || incomingProductInfo?.id,
                content: msgToSend
            });
        } catch (err) { console.error(err); } finally { setIsSending(false); }
    };

    // --- LOGIC HIỂN THỊ BANNER SẢN PHẨM ---
    // Hiển thị nếu:
    // 1. (Người mua) Đang mở từ trang chi tiết (chatState có dữ liệu)
    // 2. (Người bán) Nhận được tin nhắn có kèm thông tin sản phẩm (incomingProductInfo)
    const currentProduct = (activePartner && chatState.partnerId === activePartner.id && chatState.itemTitle)
        ? { title: chatState.itemTitle, status: "Đang xem" }
        : incomingProductInfo
            ? { title: incomingProductInfo.title, status: "Sản phẩm liên quan" }
            : null;

    if (!currentUserId) return null;

    return createPortal(
        <div className="fixed bottom-16 right-6 z-[9999] flex flex-col items-end font-sans pointer-events-none">
            {isOpen && (
                <div className="pointer-events-auto bg-white dark:bg-[#1A1F25] w-[800px] h-[500px] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex overflow-hidden animate-in slide-in-from-bottom-10 duration-200 origin-bottom-right mb-4">

                    {/* CỘT TRÁI */}
                    <div className="w-[280px] border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-[#14191F]">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder={t('Search')} className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#0B0F13] border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-[#e43137]" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.partnerId}
                                    onClick={() => setActivePartner({ id: conv.partnerId, name: conv.partnerName })}
                                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${activePartner?.id === conv.partnerId ? 'bg-white dark:bg-[#1A1F25] border-l-4 border-[#e43137]' : ''}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                                        <img src={`https://ui-avatars.com/api/?name=${conv.partnerName}&background=random`} alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className={`text-sm truncate ${activePartner?.id === conv.partnerId ? 'font-bold dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{conv.partnerName}</h4>
                                            <span className="text-[10px] text-gray-400">{conv.timeAgo}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CỘT PHẢI */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-[#1A1F25]">
                        <div className="h-[54px] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
                            <h3 className="font-bold text-gray-900 dark:text-white">{activePartner ? activePartner.name : t('Select_conversation')}</h3>
                            <div className="flex gap-2 text-gray-500">
                                <button onClick={() => setIsOpen(false)}><Minimize2 className="w-5 h-5 hover:text-gray-800" /></button>
                                <button onClick={() => setIsOpen(false)}><X className="w-5 h-5 hover:text-red-500" /></button>
                            </div>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto bg-[#F5F5F5] dark:bg-[#0B0F13] space-y-3">
                            {/* 👇 BANNER SẢN PHẨM HIỆN Ở ĐÂY */}
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
                                <div className="text-center text-sm text-gray-400 mt-20">Chọn một cuộc hội thoại để bắt đầu</div>
                            ) : chatHistory.map((msg, index) => (
                                <div key={index} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.isMine ? 'bg-[#e43137] text-white rounded-tr-none' : 'bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-tl-none'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {activePartner && (
                            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 bg-gray-100 dark:bg-[#0B0F13] border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-[#e43137]" />
                                    <button type="submit" disabled={!message.trim()} className="text-[#e43137] p-2 hover:bg-red-50 rounded-full"><Send className="w-5 h-5" /></button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="pointer-events-auto bg-[#e43137] hover:bg-[#c42329] text-white shadow-lg w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative mb-6">
                    <MessageCircle className="w-7 h-7" />
                    <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Tin nhắn</span>
                </button>
            )}
        </div>,
        document.body
    );
}
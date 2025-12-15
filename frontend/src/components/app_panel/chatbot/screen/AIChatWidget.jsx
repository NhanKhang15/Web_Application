import React, { useState, useRef, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessageToBot } from "../lib/chatService.js";

export default function AIChatWidget({ externalOpen, onClose, currentUserId }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { id: 1, text: "Xin chào! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn về sản phẩm?\n\n💡 Gợi ý: Nhắn 'tìm laptop' hoặc 'đặt giá 500k cho sản phẩm #1'", sender: "bot" }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    // 👇 State mới: Lưu thông tin bid đang chờ xác nhận
    const [pendingBid, setPendingBid] = useState(null);

    const messagesEndRef = useRef(null);

    const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
    const handleClose = onClose || (() => setInternalOpen(false));

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = input;
        setInput("");

        const currentHistory = messages.filter(m => !m.isError);

        setMessages((prev) => [...prev, { id: Date.now(), text: userMessage, sender: "user" }]);
        setIsLoading(true);

        try {
            // 👇 Debug: Log pendingBid before sending
            console.log("Sending to backend:", { message: userMessage, pendingBid });

            // 👇 Gửi pendingBid nếu có (cho flow xác nhận)
            const botReply = await sendMessageToBot(userMessage, currentHistory, currentUserId, pendingBid);

            // 👇 Kiểm tra response có phải là yêu cầu xác nhận không
            if (botReply.startsWith("CONFIRM_BID|")) {
                // Parse thông tin từ CONFIRM_BID|auctionId|slug|title|amount
                const parts = botReply.split("\n")[0].split("|");
                if (parts.length >= 5) {
                    const newPendingBid = {
                        auctionId: parseInt(parts[1]),
                        auctionSlug: parts[2],
                        auctionTitle: parts[3],
                        bidAmount: parseFloat(parts[4]),
                        awaitingConfirmation: true
                    };
                    setPendingBid(newPendingBid);

                    // Hiển thị phần message cho user (bỏ dòng đầu)
                    const displayMessage = botReply.split("\n").slice(2).join("\n");
                    setMessages((prev) => [...prev, { id: Date.now() + 1, text: displayMessage, sender: "bot" }]);
                }
            } else {
                // Response bình thường hoặc kết quả đặt giá
                // Clear pendingBid nếu đã xử lý xong (có/không)
                if (pendingBid && (botReply.includes("✅") || botReply.includes("🔙") || botReply.includes("❌"))) {
                    setPendingBid(null);
                }

                setMessages((prev) => [...prev, { id: Date.now() + 1, text: botReply, sender: "bot" }]);
            }
        } catch (error) {
            setMessages((prev) => [...prev, { id: Date.now() + 1, text: "Xin lỗi, hệ thống đang bận.", sender: "bot", isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSend();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-24 z-[9990] flex flex-col items-center md:items-end pointer-events-auto">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-full h-full md:mb-4 md:w-[350px] lg:w-[380px] md:h-[450px] bg-white dark:bg-neutral-900 md:rounded-2xl shadow-2xl border-0 md:border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col"
                        style={{ maxHeight: "calc(100vh - 120px)" }}
                    >
                        <div className="bg-blue-600 dark:bg-neutral-800 p-4 flex items-center justify-between text-white">
                            <span className="font-semibold flex items-center gap-2">
                                🤖 Trợ lý AI
                                {pendingBid && (
                                    <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">
                                        Đang chờ xác nhận
                                    </span>
                                )}
                            </span>
                            <button onClick={handleClose} className="hover:bg-white/20 p-1 rounded-full transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-[#111]">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
                                            ${msg.sender === "user"
                                                ? "bg-blue-600 text-white rounded-br-none"
                                                : "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-bl-none shadow-sm whitespace-pre-wrap"
                                            }`}
                                    >
                                        {msg.text.replace(/\*\*/g, "")}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-neutral-800 p-3 rounded-2xl rounded-bl-none border border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
                                        <Loader2 className="animate-spin text-blue-600" size={16} />
                                        <span className="text-xs text-neutral-500">AI đang trả lời...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={pendingBid ? "Trả lời 'Có' hoặc 'Không'..." : "Hỏi về sản phẩm..."}
                                className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-4 py-2.5 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            <button onClick={handleSend} disabled={!input.trim() || isLoading} className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors">
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
import React, { useState, useEffect } from "react"; // Nhớ import useEffect
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Calculator, Bot, X, LayoutGrid } from "lucide-react";
import AIChatWidget from "../../chatbot/screen/AIChatWidget";
import CalculatorWidget from "./CalculatorWidget";
import SellerChatWidget from "./SellerChatWidget";
// 👇 BỔ SUNG IMPORT QUAN TRỌNG NÀY
import { useChat } from "./ChatContext.jsx";

export default function UtilityMenu({ currentUserId }) {
    // Lấy state từ Context để biết khi nào cần tự động mở Chat
    const { isOpen: isChatOpenFromContext } = useChat();

    const [isOpen, setIsOpen] = useState(false);
    const [activeWidget, setActiveWidget] = useState(null); // 'ai' | 'chat' | 'calc' | null

    const toggleWidget = (key) => {
        if (activeWidget === key) {
            setActiveWidget(null);
        } else {
            setActiveWidget(key);
            setIsOpen(false);
        }
    };

    // 👇 EFFECT QUAN TRỌNG: Tự động mở Widget Chat khi Context yêu cầu
    useEffect(() => {
        if (isChatOpenFromContext) {
            setActiveWidget('chat');
        }
    }, [isChatOpenFromContext]);

    const menuItems = [
        {
            key: "ai",
            icon: <Bot size={20} />,
            label: "Trợ lý AI",
            color: "bg-blue-600",
            onClick: () => toggleWidget("ai"),
        },
        {
            key: "chat",
            icon: <MessageCircle size={20} />,
            label: "Tin nhắn",
            color: "bg-red-600",
            onClick: () => toggleWidget("chat"),
        },
        {
            key: "calc",
            icon: <Calculator size={20} />,
            label: "Máy tính",
            color: "bg-emerald-600",
            onClick: () => toggleWidget("calc"),
        },
    ];

    return (
        <>
            <AIChatWidget
                externalOpen={activeWidget === 'ai'}
                onClose={() => setActiveWidget(null)}
                currentUserId={currentUserId}
            />

            <SellerChatWidget
                currentUserId={currentUserId}
                // Nếu đang chọn chat thì mở (true), nếu không thì đóng (false)
                externalOpen={activeWidget === 'chat'}
                onClose={() => setActiveWidget(null)}
            />

            <CalculatorWidget
                externalOpen={activeWidget === 'calc'}
                onClose={() => setActiveWidget(null)}
            />

            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 font-sans">
                <AnimatePresence>
                    {isOpen && (
                        <div className="flex flex-col gap-3 items-end mb-2">
                            {menuItems.map((item, index) => (
                                <motion.div
                                    key={item.key}
                                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-3 group cursor-pointer"
                                    onClick={item.onClick}
                                >
                                    <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {item.label}
                                    </span>
                                    <div className={`w-10 h-10 rounded-full ${item.color} text-white flex items-center justify-center shadow-lg hover:brightness-110 transition-all`}>
                                        {item.icon}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-colors duration-300 z-[10000]
                        ${isOpen ? "bg-neutral-800 text-white rotate-45" : "bg-indigo-600 hover:bg-indigo-700 text-white rotate-0"}
                    `}
                >
                    {isOpen ? <X size={28} /> : <LayoutGrid size={28} />}
                </motion.button>
            </div>
        </>
    );
}
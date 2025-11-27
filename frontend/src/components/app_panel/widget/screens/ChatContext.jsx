import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Lưu thông tin người đang chat cùng & sản phẩm đang quan tâm
    const [chatState, setChatState] = useState({
        partnerId: null,
        partnerName: null,
        auctionId: null,
        itemTitle: null,
    });

    // Hàm gọi mở chat (Dùng ở trang Detail hoặc bất cứ đâu)
    const openChat = (partnerId, partnerName, auctionId = null, itemTitle = null) => {
        setChatState({ partnerId, partnerName, auctionId, itemTitle });
        setIsOpen(true);
    };

    const closeChat = () => setIsOpen(false);

    return (
        <ChatContext.Provider value={{ isOpen, setIsOpen, chatState, openChat, closeChat }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
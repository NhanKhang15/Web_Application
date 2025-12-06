// src/services/chatService.js
import { API_BASE_URL } from "../../../../lib/api_url";

const API_URL = `${API_BASE_URL}/api/chatbot/message`;

/**
 * Gửi tin nhắn đến Chatbot AI và nhận phản hồi.
 * @param {string} message - Tin nhắn của người dùng
 * @param {Array} history - Lịch sử chat
 * @param {number} userId - ID người dùng
 * @param {Object} pendingBid - Thông tin bid đang chờ xác nhận (nếu có)
 * @returns {Promise<string>} - Phản hồi từ AI
 */
export const sendMessageToBot = async (message, history = [], userId = null, pendingBid = null) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: message,
                history: history.map(m => ({ text: m.text, sender: m.sender })),
                userId: userId,
                pendingBid: pendingBid // 👈 Gửi thông tin bid đang chờ xác nhận
            }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error("Chat Service Error:", error);
        throw error;
    }
};
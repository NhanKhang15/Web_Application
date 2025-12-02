// src/services/chatService.js

// Định nghĩa URL API (nên đưa vào biến môi trường trong thực tế)
const API_URL = "http://localhost:8081/api/chatbot/message";

/**
 * Gửi tin nhắn đến Chatbot AI và nhận phản hồi.
 * @param {string} message - Tin nhắn của người dùng
 * @param history
 * @param userId
 * @returns {Promise<string>} - Phản hồi từ AI
 */
export const sendMessageToBot = async (message, history = [], userId = null) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: message,
                history: history,
                userId: userId
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
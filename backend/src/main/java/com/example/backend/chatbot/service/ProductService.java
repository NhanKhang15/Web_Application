package com.example.backend.chatbot.service;

import org.springframework.stereotype.Service;

@Service
public class ProductService {
    // In a real application, you would @Autowired ProductRepository here to query
    // SQL

    public String getProductStatus(String userMessage) {
        // Simple logic: Check what product the user is asking about
        // This is a mock example, in reality you would use "LIKE" query in SQL
        if (userMessage.toLowerCase().contains("iphone 15")) {
            return "Sản phẩm: iPhone 15 Pro Max. Trạng thái: Còn hàng. Số lượng: 12 cái. Giá: 30 triệu.";
        } else if (userMessage.toLowerCase().contains("samsung")) {
            return "Sản phẩm: Samsung S24. Trạng thái: Hết hàng.";
        }
        return "Không tìm thấy thông tin sản phẩm cụ thể trong database.";
    }
}

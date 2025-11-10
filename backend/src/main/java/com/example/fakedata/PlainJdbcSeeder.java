package com.example.fakedata;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class PlainJdbcSeeder {
    public static void main(String[] args) throws Exception {
        String url  = "jdbc:mysql://localhost:3306/AuctionSite?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        String user = "root";
        String pass = "0919329900Phuc_C"; // (Hãy cân nhắc dùng biến môi trường cho mật khẩu)

        try (Connection con = DriverManager.getConnection(url, user, pass)) {

            // --- BƯỚC 1: LẤY TẤT CẢ ITEM ID ---
            List<Integer> itemIds = new ArrayList<>();
            try (PreparedStatement ps = con.prepareStatement("SELECT ItemID FROM AuctionItems");
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) itemIds.add(rs.getInt(1));
            }

            if (itemIds.isEmpty()) {
                System.out.println("Không tìm thấy vật phẩm nào, không seeding ảnh.");
                return;
            }

            System.out.println(String.format("Đang seeding ảnh cho %d vật phẩm...", itemIds.size()));

            // --- BƯỚC 2: INSERT ẢNH VÀO BẢNG ItemImages (Giữ nguyên) ---
            String sql = "INSERT INTO ItemImages (ItemID, ImgUrl, IsMain) VALUES (?, ?, ?)";
            try (PreparedStatement ins = con.prepareStatement(sql)) {
                for (Integer itemId : itemIds) {
                    for (int i = 1; i <= 7; i++) {
                        String urlImg = String.format("https://picsum.photos/seed/item%d_%d/800/600", itemId, i);
                        ins.setInt(1, itemId);
                        ins.setString(2, urlImg);
                        ins.setBoolean(3, i == 1); // Ảnh đầu tiên (i=1) là ảnh chính
                        ins.addBatch();
                    }
                }
                ins.executeBatch();
            }
            System.out.println("✅ Bước 1/2: Đã thêm ảnh vào ItemImages.");


            // --- BƯỚC 3: CẬP NHẬT ẢNH CHÍNH TRÊN BẢNG AuctionItems (PHẦN BỊ THIẾU) ---
            String updateSql = "UPDATE AuctionItems SET ImgUrl = ?, Thumbnail = ? WHERE ItemID = ?";
            try (PreparedStatement upd = con.prepareStatement(updateSql)) {
                for (Integer itemId : itemIds) {
                    // Lấy URL của ảnh chính (luôn là ảnh số 1)
                    String mainImageUrl = String.format("https://picsum.photos/seed/item%d_1/800/600", itemId);

                    upd.setString(1, mainImageUrl);
                    upd.setString(2, mainImageUrl); // Dùng chung cho cả Thumbnail
                    upd.setInt(3, itemId);
                    upd.addBatch();
                }
                upd.executeBatch();
            }
            System.out.println("✅ Bước 2/2: Đã cập nhật ảnh chính trên AuctionItems.");
        }

        System.out.println("🎉 Hoàn tất seeding ảnh!");
    }
}
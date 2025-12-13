package com.example.fakedata;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Random;

public class PlainJdbcSeeder {

    // =====================================================================
    // SẢN PHẨM ĐẤU GIÁ THEO 5 CATEGORY TRONG DATABASE
    // Format: [title, keyword cho ảnh Unsplash]
    // =====================================================================
    private static final Map<String, String[][]> PRODUCTS_BY_CATEGORY = new HashMap<>();

    static {
        // 1. ELECTRONICS - Đồ điện tử cao cấp đấu giá
        PRODUCTS_BY_CATEGORY.put("Electronics", new String[][] {
                { "iPhone 15 Pro Max 256GB Titanium Chính Hãng", "iphone,smartphone" },
                { "MacBook Pro M3 Max 16 inch 1TB", "macbook,laptop" },
                { "Samsung Galaxy S24 Ultra 512GB", "samsung,phone" },
                { "Sony PlayStation 5 Pro Console Bundle", "playstation,gaming" },
                { "iPad Pro 12.9 inch M2 Chip 256GB", "ipad,tablet" },
                { "Apple Watch Ultra 2 Titanium 49mm", "smartwatch,apple" },
                { "Sony WH-1000XM5 Premium Headphones", "headphones,sony" },
                { "DJI Mavic 3 Pro Drone 4K Combo", "drone,dji" },
                { "Canon EOS R5 Mirrorless Camera Body", "canon,camera" },
                { "Sony A7 IV Full Frame Camera Kit", "sony,mirrorless" },
                { "Nintendo Switch OLED Model Limited", "nintendo,gaming" },
                { "Bose QuietComfort Ultra Earbuds", "earbuds,bose" }
        });

        // 2. CLOTHING - Quần áo thời trang cao cấp đấu giá
        PRODUCTS_BY_CATEGORY.put("Clothing", new String[][] {
                { "Louis Vuitton Monogram Jacket Limited", "luxury,fashion" },
                { "Gucci GG Marmont Leather Jacket", "gucci,jacket" },
                { "Nike Air Jordan 1 Retro High OG Chicago", "jordan,sneakers" },
                { "Adidas Yeezy Boost 350 V2 Zebra", "yeezy,sneakers" },
                { "Chanel Tweed Jacket Classic Collection", "chanel,fashion" },
                { "Hermès Birkin 25 Togo Leather Bag", "hermes,luxury" },
                { "Rolex Submariner Date 41mm Black", "rolex,watch" },
                { "Omega Speedmaster Moonwatch Professional", "omega,watch" },
                { "Burberry Trench Coat Heritage Classic", "burberry,coat" },
                { "Dior Saddle Bag Oblique Canvas", "dior,bag" },
                { "Prada Re-Nylon Jacket Black", "prada,fashion" },
                { "Balenciaga Triple S Sneakers", "balenciaga,sneakers" }
        });

        // 3. HOME & GARDEN - Đồ gia dụng & Vườn cao cấp đấu giá
        PRODUCTS_BY_CATEGORY.put("Home & Garden", new String[][] {
                { "Dyson V15 Detect Complete Vacuum", "dyson,vacuum" },
                { "Herman Miller Aeron Chair Remastered", "ergonomic,chair" },
                { "iRobot Roomba j9+ Self-Emptying Robot", "roomba,robot" },
                { "Vitamix A3500 Blender Ascent Series", "vitamix,kitchen" },
                { "KitchenAid Artisan Stand Mixer 5Qt", "kitchenaid,mixer" },
                { "Breville Oracle Touch Espresso Machine", "espresso,coffee" },
                { "Weber Genesis EPX-470 Gas Grill", "grill,outdoor" },
                { "Le Creuset Signature Dutch Oven 7.25Qt", "lecreuset,cookware" },
                { "Sonos Arc Premium Smart Soundbar", "sonos,speaker" },
                { "Miele Complete C3 Vacuum Cleaner", "miele,vacuum" },
                { "Nespresso Vertuo Next Premium Bundle", "nespresso,coffee" },
                { "Philips Hue Smart Light Starter Kit", "philips,lighting" }
        });

        // 4. BOOKS - Sách quý hiếm đấu giá
        PRODUCTS_BY_CATEGORY.put("Books", new String[][] {
                { "Harry Potter First Edition Boxed Set Signed", "harrypotter,books" },
                { "The Lord of the Rings 1st Edition 1954", "lotr,vintage" },
                { "Sách Cổ Việt Nam Thế Kỷ 19 Quý Hiếm", "antique,book" },
                { "Encyclopedia Britannica Complete Set Leather", "encyclopedia,library" },
                { "Manga One Piece Box Set Volume 1-90", "manga,onepiece" },
                { "The Great Gatsby First Edition 1925", "gatsby,classic" },
                { "Art of War Sun Tzu Ancient Manuscript Copy", "sunzu,ancient" },
                { "Shakespeare Complete Works Leather Bound", "shakespeare,classic" },
                { "Batman Detective Comics #27 Reprint Limited", "batman,comics" },
                { "Marvel Comics Spider-Man #1 Signed Stan Lee", "spiderman,marvel" },
                { "Từ Điển Bách Khoa Việt Nam Bản Gốc", "dictionary,vietnamese" },
                { "National Geographic Collection 1960-2000", "natgeo,magazine" }
        });

        // 5. COLLECTIBLES - Đồ sưu tầm quý hiếm đấu giá
        PRODUCTS_BY_CATEGORY.put("Collectibles", new String[][] {
                { "Rolex Daytona Vintage 1969 Paul Newman", "rolex,vintage" },
                { "Pokemon Charizard PSA 10 1st Edition Holo", "pokemon,card" },
                { "LEGO Star Wars Millennium Falcon 75192", "lego,starwars" },
                { "Vintage Coca-Cola Sign 1950s Original", "cocacola,vintage" },
                { "Michael Jordan Rookie Card PSA 9 Fleer", "jordan,basketball" },
                { "Antique Chinese Porcelain Vase Dynasty", "chinese,antique" },
                { "Star Wars Original Movie Poster 1977", "starwars,poster" },
                { "Tượng Phật Cổ Việt Nam Thế Kỷ 18", "buddha,antique" },
                { "Beatles Abbey Road Signed Vinyl LP", "beatles,vinyl" },
                { "Đồng Tiền Cổ Việt Nam Triều Nguyễn", "coin,vietnamese" },
                { "Hot Wheels Redline Collection 1968 Set", "hotwheels,vintage" },
                { "Vintage Leica M3 Camera 1954 Mint", "leica,camera" }
        });
    }

    // Danh sách mô tả sản phẩm đấu giá
    private static final String[] DESCRIPTIONS = {
            "🔥 SẢN PHẨM CHÍNH HÃNG 100%% - Còn nguyên seal, đầy đủ phụ kiện, bảo hành 12 tháng. Cam kết hoàn tiền 200%% nếu phát hiện hàng giả.",
            "⭐ LIKE NEW 99%% - Sử dụng cực kỳ cẩn thận, không trầy xước, đầy đủ hộp và phụ kiện gốc. Lý do bán: nâng cấp lên phiên bản mới hơn.",
            "🏆 PHIÊN BẢN GIỚI HẠN LIMITED EDITION - Rất hiếm trên thị trường, chỉ sản xuất số lượng giới hạn. Cơ hội sở hữu không thể bỏ lỡ!",
            "🎨 SẢN PHẨM VINTAGE CỔ ĐIỂN - Được bảo quản tốt qua nhiều thập kỷ, có giá trị sưu tầm và đầu tư rất cao.",
            "📦 HÀNG NHẬP KHẨU CHÍNH NGẠCH - Có đầy đủ giấy tờ, hóa đơn và chứng nhận nguồn gốc xuất xứ rõ ràng.",
            "💎 SẢN PHẨM CAO CẤP PREMIUM - Chất lượng tuyệt đỉnh, không có bất kỳ lỗi nào. Đã được kiểm tra kỹ lưỡng bởi chuyên gia.",
            "✨ TÌNH TRẠNG NHƯ MỚI 98%% - Được sử dụng nhẹ nhàng, còn trong thời hạn bảo hành hãng. Tiết kiệm đáng kể so với mua mới.",
            "🎖️ COLLECTOR'S EDITION - Có số seri riêng biệt và chứng nhận xác thực từ nhà sản xuất. Dành cho người sưu tầm thực thụ.",
            "🇻🇳 PHIÊN BẢN ĐẶC BIỆT VIỆT NAM - Hàng độc quyền, số lượng cực kỳ giới hạn. Không bán tại bất kỳ đâu khác.",
            "🌟 BEST SELLER TOP RATED - Sản phẩm nhận được hàng nghìn đánh giá 5 sao từ người dùng. Chất lượng đã được kiểm chứng."
    };

    // Danh sách địa điểm
    private static final String[] LOCATIONS = {
            "Quận 1, TP. Hồ Chí Minh", "Quận 7, TP. Hồ Chí Minh", "Quận Bình Thạnh, TP. Hồ Chí Minh",
            "Quận Hoàn Kiếm, Hà Nội", "Quận Cầu Giấy, Hà Nội", "Quận Đống Đa, Hà Nội",
            "Quận Hải Châu, Đà Nẵng", "Quận Ninh Kiều, Cần Thơ",
            "TP. Nha Trang, Khánh Hòa", "TP. Đà Lạt, Lâm Đồng"
    };

    // ===========================================
    // MAIN METHOD
    // ===========================================
    public static void main(String[] args) throws Exception {
        // Đọc credentials từ file .env
        Map<String, String> env = loadEnvFile();

        String url = "jdbc:mysql://localhost:3306/AuctionSite?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        String user = env.getOrDefault("SPRING_DATASOURCE_USERNAME", "root");
        String pass = env.getOrDefault("SPRING_DATASOURCE_PASSWORD", "");

        System.out.println("🔗 Kết nối database với user: " + user);

        // ⚙️ CẤU HÌNH: Số lượng auction cần tạo
        final int TOTAL_AUCTIONS = 30;

        Random random = new Random();

        try (Connection con = DriverManager.getConnection(url, user, pass)) {
            con.setAutoCommit(false);

            System.out.println("╔══════════════════════════════════════════════════════════════╗");
            System.out.println("║           🎯 AUCTION SEEDER - TẠO DỮ LIỆU ĐẤU GIÁ            ║");
            System.out.println("╚══════════════════════════════════════════════════════════════╝\n");

            // --- BƯỚC 1: LẤY DANH SÁCH USER IDs ĐÃ XÁC THỰC ---
            List<Integer> userIds = new ArrayList<>();
            try (PreparedStatement ps = con.prepareStatement("SELECT UserID FROM Users WHERE EmailVerified = 1");
                    ResultSet rs = ps.executeQuery()) {
                while (rs.next())
                    userIds.add(rs.getInt(1));
            }

            if (userIds.isEmpty()) {
                System.out.println("❌ Không tìm thấy user đã xác thực email. Hãy tạo user trước.");
                return;
            }
            System.out.println(String.format("✅ Tìm thấy %d users đã xác thực email.", userIds.size()));

            // --- BƯỚC 2: LẤY DANH SÁCH CATEGORIES TỪ DATABASE ---
            Map<Integer, String> categories = new HashMap<>();
            try (PreparedStatement ps = con
                    .prepareStatement("SELECT CategoryID, CategoryName FROM Categories ORDER BY CategoryID");
                    ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    categories.put(rs.getInt(1), rs.getString(2));
                }
            }

            if (categories.isEmpty()) {
                System.out.println("❌ Không tìm thấy danh mục nào. Hãy tạo categories trước.");
                return;
            }
            System.out.println("✅ Danh mục trong hệ thống:");
            categories.forEach((id, name) -> {
                String[][] products = PRODUCTS_BY_CATEGORY.get(name);
                int count = products != null ? products.length : 0;
                System.out.println(String.format("   [%d] %-15s → %d sản phẩm mẫu", id, name, count));
            });
            System.out.println();

            // --- BƯỚC 3: TẠO AUCTION ITEMS ---
            List<Integer> categoryIdList = new ArrayList<>(categories.keySet());
            List<Integer> newItemIds = new ArrayList<>();
            List<String> itemKeywords = new ArrayList<>();

            String insertItemSql = """
                        INSERT INTO AuctionItems (SellerID, CategoryID, Title, Description, ImgUrl, Slug, Thumbnail, Location, CreatedAt, UpdatedAt)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """;

            System.out.println("📦 Đang tạo " + TOTAL_AUCTIONS + " sản phẩm đấu giá...");

            try (PreparedStatement ins = con.prepareStatement(insertItemSql, Statement.RETURN_GENERATED_KEYS)) {
                LocalDateTime now = LocalDateTime.now();
                int userIndex = 0;

                // Chia đều 30 sản phẩm cho 5 categories (mỗi category 6 sản phẩm)
                int productsPerCategory = TOTAL_AUCTIONS / categories.size();
                int remainder = TOTAL_AUCTIONS % categories.size();

                for (Map.Entry<Integer, String> catEntry : categories.entrySet()) {
                    Integer categoryId = catEntry.getKey();
                    String categoryName = catEntry.getValue();

                    String[][] productsForCategory = PRODUCTS_BY_CATEGORY.get(categoryName);
                    if (productsForCategory == null) {
                        System.out.println("   ⚠️ Không tìm thấy sản phẩm cho category: " + categoryName);
                        continue;
                    }

                    // Số sản phẩm cho category này
                    int numProducts = productsPerCategory + (remainder-- > 0 ? 1 : 0);

                    for (int i = 0; i < numProducts; i++) {
                        // Round-robin chọn user
                        Integer sellerId = userIds.get(userIndex % userIds.size());
                        userIndex++;

                        // Chọn sản phẩm (tránh trùng lặp nếu có thể)
                        String[] product = productsForCategory[i % productsForCategory.length];
                        String title = product[0];
                        String keyword = product[1];

                        String description = DESCRIPTIONS[random.nextInt(DESCRIPTIONS.length)];
                        String location = LOCATIONS[random.nextInt(LOCATIONS.length)];

                        // Tạo slug unique (chuẩn hóa tiếng Việt)
                        String slug = normalizeVietnamese(title.toLowerCase())
                                .replaceAll("[^a-z0-9\\s]", "")
                                .replaceAll("\\s+", "-")
                                + "-" + System.currentTimeMillis() + random.nextInt(1000);

                        String tempImgUrl = "https://picsum.photos/800/600";

                        ins.setInt(1, sellerId);
                        ins.setInt(2, categoryId);
                        ins.setString(3, title);
                        ins.setString(4, description);
                        ins.setString(5, tempImgUrl);
                        ins.setString(6, slug);
                        ins.setString(7, tempImgUrl);
                        ins.setString(8, location);
                        ins.setTimestamp(9, Timestamp.valueOf(now.minusHours(random.nextInt(72))));
                        ins.setTimestamp(10, Timestamp.valueOf(now));
                        ins.executeUpdate();

                        try (ResultSet keys = ins.getGeneratedKeys()) {
                            if (keys.next()) {
                                newItemIds.add(keys.getInt(1));
                                itemKeywords.add(keyword);
                            }
                        }

                        System.out.println(String.format("   ✓ [%-15s] %s", categoryName, title));
                    }
                }
            }
            System.out.println(String.format("\n✅ Bước 1/4: Đã tạo %d AuctionItems.", newItemIds.size()));

            // --- BƯỚC 4: TẠO AUCTIONS CHO MỖI ITEM ---
            String insertAuctionSql = """
                        INSERT INTO Auctions (ItemID, Status, StartingPrice, MinStep, CurrentPrice, ReservePrice, BuyNowPrice, StartDate, EndDate)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """;

            int activeCount = 0, scheduledCount = 0;

            try (PreparedStatement ins = con.prepareStatement(insertAuctionSql)) {
                for (Integer itemId : newItemIds) {
                    // Random giá từ 1,000,000 đến 100,000,000 VNĐ
                    long startingPrice = (1000 + random.nextInt(99000)) * 1000L;
                    long minStep = Math.max(50000, (startingPrice / 100) * 5); // Tối thiểu 50,000
                    long reservePrice = startingPrice + (startingPrice / 10); // +10%
                    long buyNowPrice = (long) (startingPrice * (1.5 + random.nextDouble())); // 1.5x - 2.5x

                    // 70% Active, 30% Scheduled
                    boolean isActive = random.nextDouble() < 0.7;
                    LocalDateTime startDate = isActive
                            ? LocalDateTime.now().minusDays(random.nextInt(5))
                            : LocalDateTime.now().plusDays(1 + random.nextInt(7));
                    LocalDateTime endDate = startDate.plusDays(3 + random.nextInt(14));

                    if (isActive)
                        activeCount++;
                    else
                        scheduledCount++;

                    ins.setInt(1, itemId);
                    ins.setString(2, isActive ? "Open" : "Scheduled");
                    ins.setBigDecimal(3, new java.math.BigDecimal(startingPrice));
                    ins.setBigDecimal(4, new java.math.BigDecimal(minStep));
                    ins.setBigDecimal(5, new java.math.BigDecimal(startingPrice));
                    ins.setBigDecimal(6, new java.math.BigDecimal(reservePrice));
                    ins.setBigDecimal(7, new java.math.BigDecimal(buyNowPrice));
                    ins.setTimestamp(8, Timestamp.valueOf(startDate));
                    ins.setTimestamp(9, Timestamp.valueOf(endDate));
                    ins.addBatch();
                }
                ins.executeBatch();
            }
            System.out.println(String.format("✅ Bước 2/4: Đã tạo %d Auctions (%d Active, %d Scheduled).",
                    newItemIds.size(), activeCount, scheduledCount));

            // --- BƯỚC 5: INSERT 7 ẢNH VÀO BẢNG ItemImages ---
            String insertImageSql = "INSERT INTO ItemImages (ItemID, ImgUrl, IsMain) VALUES (?, ?, ?)";
            try (PreparedStatement ins = con.prepareStatement(insertImageSql)) {
                for (int idx = 0; idx < newItemIds.size(); idx++) {
                    Integer itemId = newItemIds.get(idx);

                    for (int i = 1; i <= 7; i++) {
                        // Sử dụng Lorem Picsum - ảnh đẹp và ổn định
                        // Format: https://picsum.photos/seed/{unique_id}/800/600
                        int seed = itemId * 10 + i;
                        String imgUrl = String.format(
                                "https://picsum.photos/seed/%d/800/600", seed);

                        ins.setInt(1, itemId);
                        ins.setString(2, imgUrl);
                        ins.setBoolean(3, i == 1);
                        ins.addBatch();
                    }
                }
                ins.executeBatch();
            }
            System.out.println("✅ Bước 3/4: Đã thêm 7 ảnh/item vào ItemImages (Lorem Picsum).");

            // --- BƯỚC 6: CẬP NHẬT ẢNH CHÍNH ---
            String updateSql = "UPDATE AuctionItems SET ImgUrl = ?, Thumbnail = ? WHERE ItemID = ?";
            try (PreparedStatement upd = con.prepareStatement(updateSql)) {
                for (int idx = 0; idx < newItemIds.size(); idx++) {
                    Integer itemId = newItemIds.get(idx);
                    // Ảnh chính dùng seed = itemId * 10 + 1 (ảnh đầu tiên)
                    int seed = itemId * 10 + 1;
                    String mainImgUrl = String.format(
                            "https://picsum.photos/seed/%d/800/600", seed);

                    upd.setString(1, mainImgUrl);
                    upd.setString(2, mainImgUrl);
                    upd.setInt(3, itemId);
                    upd.addBatch();
                }
                upd.executeBatch();
            }
            System.out.println("✅ Bước 4/4: Đã cập nhật ảnh chính trên AuctionItems.");

            con.commit();

            // Hiển thị kết quả
            System.out.println("\n╔══════════════════════════════════════════════════════════════╗");
            System.out.println("║              🎉 HOÀN TẤT SEEDING DỮ LIỆU ĐẤU GIÁ!            ║");
            System.out.println("╠══════════════════════════════════════════════════════════════╣");
            System.out.println(String.format("║  📦 Tổng Auctions tạo mới  : %-30d ║", newItemIds.size()));
            System.out.println(String.format("║  🟢 Active (đang đấu giá)  : %-30d ║", activeCount));
            System.out.println(String.format("║  🟡 Scheduled (sắp diễn ra): %-30d ║", scheduledCount));
            System.out.println(String.format("║  👥 Users tham gia         : %-30d ║", userIds.size()));
            System.out.println(String.format("║  🖼️  Ảnh tạo mới            : %-30d ║", newItemIds.size() * 7));
            System.out.println("╚══════════════════════════════════════════════════════════════╝");

        } catch (Exception e) {
            System.err.println("\n❌ LỖI KHI SEEDING: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Chuẩn hóa chuỗi tiếng Việt thành không dấu
     */
    private static String normalizeVietnamese(String str) {
        return str
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("đ", "d")
                .replaceAll("[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]", "A")
                .replaceAll("[ÈÉẸẺẼÊỀẾỆỂỄ]", "E")
                .replaceAll("[ÌÍỊỈĨ]", "I")
                .replaceAll("[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]", "O")
                .replaceAll("[ÙÚỤỦŨƯỪỨỰỬỮ]", "U")
                .replaceAll("[ỲÝỴỶỸ]", "Y")
                .replaceAll("Đ", "D");
    }

    /**
     * Đọc file .env từ thư mục backend để lấy credentials
     */
    private static Map<String, String> loadEnvFile() {
        Map<String, String> envMap = new HashMap<>();

        // Tìm file .env - thử nhiều đường dẫn có thể
        String[] possiblePaths = {
                "backend/.env",
                ".env",
                "../.env",
                "src/main/resources/.env"
        };

        Path envPath = null;
        for (String path : possiblePaths) {
            Path p = Paths.get(path);
            if (p.toFile().exists()) {
                envPath = p;
                break;
            }
        }

        if (envPath == null) {
            System.out.println("⚠️ Không tìm thấy file .env, sử dụng credentials mặc định");
            return envMap;
        }

        System.out.println("📄 Đọc credentials từ: " + envPath.toAbsolutePath());

        try (BufferedReader reader = new BufferedReader(new FileReader(envPath.toFile()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                // Bỏ qua comment và dòng trống
                if (line.isEmpty() || line.startsWith("#"))
                    continue;

                int equalsIndex = line.indexOf('=');
                if (equalsIndex > 0) {
                    String key = line.substring(0, equalsIndex).trim();
                    String value = line.substring(equalsIndex + 1).trim();
                    // Loại bỏ quotes nếu có
                    if ((value.startsWith("\"") && value.endsWith("\"")) ||
                            (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.substring(1, value.length() - 1);
                    }
                    envMap.put(key, value);
                }
            }
        } catch (IOException e) {
            System.err.println("⚠️ Không thể đọc file .env: " + e.getMessage());
        }

        return envMap;
    }
}
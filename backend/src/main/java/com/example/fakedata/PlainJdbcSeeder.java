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
import java.util.Locale;
import java.util.Map;
import java.util.Random;

import net.datafaker.Faker;

public class PlainJdbcSeeder {

    // Faker instance với locale tiếng Việt
    private static final Faker faker = new Faker(new Locale("vi"));
    private static final Faker fakerEn = new Faker(Locale.ENGLISH);
    private static final Random random = new Random();

    // =====================================================================
    // CÁC TEMPLATE SẢN PHẨM THEO CATEGORY (dùng Faker để sinh chi tiết)
    // =====================================================================
    private static final Map<String, ProductGenerator> PRODUCT_GENERATORS = new HashMap<>();

    static {
        // 1. ELECTRONICS - Đồ điện tử
        PRODUCT_GENERATORS.put("Electronics", () -> {
            String[] brands = { "Apple", "Samsung", "Sony", "LG", "Xiaomi", "Asus", "Dell", "HP", "Lenovo", "Canon",
                    "Nikon", "DJI" };
            String[] products = { "Smartphone", "Laptop", "Tablet", "Smartwatch", "Headphones", "Camera", "Drone",
                    "Gaming Console", "TV", "Monitor", "Earbuds", "Speaker" };
            String[] specs = { "Pro Max", "Ultra", "Pro", "Plus", "Lite", "Premium", "Limited Edition", "Special",
                    "OLED", "4K" };
            String[] storage = { "128GB", "256GB", "512GB", "1TB", "64GB" };

            String brand = brands[random.nextInt(brands.length)];
            String product = products[random.nextInt(products.length)];
            String spec = specs[random.nextInt(specs.length)];
            String size = storage[random.nextInt(storage.length)];

            return new ProductInfo(
                    String.format("%s %s %s %s %s", brand, product, fakerEn.numerify("##"), spec, size),
                    product.toLowerCase().replace(" ", ",") + "," + brand.toLowerCase());
        });

        // 2. CLOTHING - Quần áo thời trang
        PRODUCT_GENERATORS.put("Clothing", () -> {
            String[] brands = { "Louis Vuitton", "Gucci", "Chanel", "Hermès", "Prada", "Dior", "Burberry", "Nike",
                    "Adidas", "Balenciaga", "Rolex", "Omega" };
            String[] items = { "Jacket", "Coat", "Sneakers", "Bag", "Watch", "Dress", "Suit", "Hoodie", "Boots",
                    "Belt" };
            String[] materials = { "Leather", "Tweed", "Canvas", "Wool", "Cashmere", "Silk", "Denim" };
            String[] editions = { "Classic", "Limited Edition", "Vintage", "Heritage", "Signature", "Premium" };

            String brand = brands[random.nextInt(brands.length)];
            String item = items[random.nextInt(items.length)];
            String material = materials[random.nextInt(materials.length)];
            String edition = editions[random.nextInt(editions.length)];

            return new ProductInfo(
                    String.format("%s %s %s %s", brand, material, item, edition),
                    item.toLowerCase() + "," + brand.toLowerCase().replace(" ", ""));
        });

        // 3. HOME & GARDEN - Đồ gia dụng
        PRODUCT_GENERATORS.put("Home & Garden", () -> {
            String[] brands = { "Dyson", "iRobot", "Vitamix", "KitchenAid", "Breville", "Weber", "Le Creuset", "Sonos",
                    "Miele", "Philips", "Nespresso", "Herman Miller" };
            String[] items = { "Vacuum Cleaner", "Robot Vacuum", "Blender", "Stand Mixer", "Coffee Machine", "Grill",
                    "Dutch Oven", "Soundbar", "Air Purifier", "Smart Light" };
            String[] series = { "Pro", "Elite", "Premium", "Signature", "Deluxe", "Complete", "Ultra", "Smart" };

            String brand = brands[random.nextInt(brands.length)];
            String item = items[random.nextInt(items.length)];
            String serie = series[random.nextInt(series.length)];
            String model = fakerEn.letterify("??").toUpperCase() + "-" + fakerEn.numerify("####");

            return new ProductInfo(
                    String.format("%s %s %s %s", brand, item, serie, model),
                    item.toLowerCase().replace(" ", ",") + "," + brand.toLowerCase());
        });

        // 4. BOOKS - Sách
        PRODUCT_GENERATORS.put("Books", () -> {
            String[] types = { "First Edition", "Signed Copy", "Limited Edition", "Collector's Edition",
                    "Leather Bound", "Boxed Set", "Original Manuscript", "Rare Print" };
            String[] genres = { "Classic Literature", "Fantasy", "Science Fiction", "History", "Art", "Philosophy",
                    "Biography", "Comics" };

            String bookTitle = fakerEn.book().title();
            String author = fakerEn.book().author();
            String type = types[random.nextInt(types.length)];
            String year = String.valueOf(1900 + random.nextInt(124));

            return new ProductInfo(
                    String.format("%s by %s - %s %s", bookTitle, author, type, year),
                    "book,literature," + genres[random.nextInt(genres.length)].toLowerCase().replace(" ", ""));
        });

        // 5. COLLECTIBLES - Đồ sưu tầm
        PRODUCT_GENERATORS.put("Collectibles", () -> {
            String[] types = { "Vintage Watch", "Trading Card", "LEGO Set", "Antique Sign", "Sports Memorabilia",
                    "Porcelain Vase", "Movie Poster", "Vinyl Record", "Rare Coin", "Action Figure" };
            String[] conditions = { "Mint Condition", "Near Mint", "Excellent", "Very Good", "PSA 10", "PSA 9",
                    "Graded", "Authenticated" };
            String[] eras = { "1950s", "1960s", "1970s", "1980s", "1990s", "Vintage", "Antique", "Classic" };

            String type = types[random.nextInt(types.length)];
            String condition = conditions[random.nextInt(conditions.length)];
            String era = eras[random.nextInt(eras.length)];
            String detail = fakerEn.commerce().productName();

            return new ProductInfo(
                    String.format("%s %s %s - %s", era, type, condition, detail),
                    type.toLowerCase().replace(" ", ",") + ",collectible,vintage");
        });
    }

    // Danh sách mô tả sản phẩm đấu giá - sử dụng Faker
    private static String generateDescription() {
        String[] templates = {
                "🔥 SẢN PHẨM CHÍNH HÃNG 100%% - %s. Cam kết hoàn tiền 200%% nếu phát hiện hàng giả.",
                "⭐ LIKE NEW 99%% - %s. Lý do bán: nâng cấp lên phiên bản mới hơn.",
                "🏆 PHIÊN BẢN GIỚI HẠN LIMITED EDITION - %s. Cơ hội sở hữu không thể bỏ lỡ!",
                "🎨 SẢN PHẨM VINTAGE CỔ ĐIỂN - %s. Có giá trị sưu tầm và đầu tư rất cao.",
                "📦 HÀNG NHẬP KHẨU CHÍNH NGẠCH - %s. Đầy đủ giấy tờ và chứng nhận nguồn gốc.",
                "💎 SẢN PHẨM CAO CẤP PREMIUM - %s. Đã được kiểm tra kỹ lưỡng bởi chuyên gia.",
                "✨ TÌNH TRẠNG NHƯ MỚI 98%% - %s. Tiết kiệm đáng kể so với mua mới.",
                "🎖️ COLLECTOR'S EDITION - %s. Dành cho người sưu tầm thực thụ.",
                "🇻🇳 PHIÊN BẢN ĐẶC BIỆT - %s. Số lượng cực kỳ giới hạn.",
                "🌟 BEST SELLER TOP RATED - %s. Chất lượng đã được kiểm chứng."
        };

        String detail = faker.lorem().sentence(8);
        return String.format(templates[random.nextInt(templates.length)], detail);
    }

    // Danh sách địa điểm - sử dụng Faker
    private static String generateLocation() {
        String[] districts = {
                "Quận 1", "Quận 2", "Quận 3", "Quận 7", "Quận Bình Thạnh", "Quận Phú Nhuận",
                "Quận Hoàn Kiếm", "Quận Cầu Giấy", "Quận Đống Đa", "Quận Ba Đình",
                "Quận Hải Châu", "Quận Ninh Kiều", "Quận Liên Chiểu"
        };
        String[] cities = {
                "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Nha Trang", "Đà Lạt", "Hải Phòng"
        };

        return districts[random.nextInt(districts.length)] + ", " + cities[random.nextInt(cities.length)];
    }

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
        System.out.println("🎲 Sử dụng Datafaker để sinh dữ liệu ngẫu nhiên\n");

        // ⚙️ CẤU HÌNH: Số lượng auction cần tạo
        final int TOTAL_AUCTIONS = 30;

        try (Connection con = DriverManager.getConnection(url, user, pass)) {
            con.setAutoCommit(false);

            System.out.println("╔══════════════════════════════════════════════════════════════╗");
            System.out.println("║           🎯 AUCTION SEEDER - TẠO DỮ LIỆU ĐẤU GIÁ            ║");
            System.out.println("║                  (Powered by Datafaker)                      ║");
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
                boolean hasGenerator = PRODUCT_GENERATORS.containsKey(name);
                System.out.println(String.format("   [%d] %-15s → %s",
                        id, name, hasGenerator ? "✓ Faker generator" : "⚠ Fallback generator"));
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

            System.out.println("📦 Đang tạo " + TOTAL_AUCTIONS + " sản phẩm đấu giá (sử dụng Faker)...");

            try (PreparedStatement ins = con.prepareStatement(insertItemSql, Statement.RETURN_GENERATED_KEYS)) {
                LocalDateTime now = LocalDateTime.now();
                int userIndex = 0;

                // Chia đều 30 sản phẩm cho 5 categories (mỗi category 6 sản phẩm)
                int productsPerCategory = TOTAL_AUCTIONS / categories.size();
                int remainder = TOTAL_AUCTIONS % categories.size();

                for (Map.Entry<Integer, String> catEntry : categories.entrySet()) {
                    Integer categoryId = catEntry.getKey();
                    String categoryName = catEntry.getValue();

                    // Lấy generator cho category, hoặc dùng fallback
                    ProductGenerator generator = PRODUCT_GENERATORS.getOrDefault(categoryName,
                            () -> new ProductInfo(
                                    fakerEn.commerce().productName() + " " + fakerEn.commerce().material(),
                                    "product,item"));

                    // Số sản phẩm cho category này
                    int numProducts = productsPerCategory + (remainder-- > 0 ? 1 : 0);

                    for (int i = 0; i < numProducts; i++) {
                        // Round-robin chọn user
                        Integer sellerId = userIds.get(userIndex % userIds.size());
                        userIndex++;

                        // Sinh sản phẩm bằng Faker
                        ProductInfo product = generator.generate();
                        String title = product.title();
                        String keyword = product.keyword();

                        String description = generateDescription();
                        String location = generateLocation();

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
            System.out.println("║  🎲 Data source            : Datafaker Library              ║");
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

    // =====================================================================
    // HELPER CLASSES
    // =====================================================================

    /**
     * Functional interface để sinh sản phẩm cho mỗi category
     */
    @FunctionalInterface
    interface ProductGenerator {
        ProductInfo generate();
    }

    /**
     * Record chứa thông tin sản phẩm được sinh ra
     */
    record ProductInfo(String title, String keyword) {
    }
}
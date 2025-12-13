-- =====================================================
-- UPDATE IMAGES FOR EXISTING AUCTION DATA
-- Sử dụng Lorem Picsum - ảnh đẹp và ổn định
-- =====================================================

USE AuctionSite;

-- Tắt Safe Update Mode tạm thời
SET SQL_SAFE_UPDATES = 0;

-- Bước 1: Update ảnh trong ItemImages
-- Mỗi ảnh dùng ImageID làm seed để có ảnh khác nhau
UPDATE ItemImages 
SET ImgUrl = CONCAT('https://picsum.photos/seed/', ImageID, '/800/600')
WHERE ImageID > 0;

-- Bước 2: Update ảnh chính trên AuctionItems
UPDATE AuctionItems ai
JOIN ItemImages ii ON ai.ItemID = ii.ItemID AND ii.IsMain = 1
SET ai.ImgUrl = ii.ImgUrl,
    ai.Thumbnail = ii.ImgUrl
WHERE ai.ItemID > 0;

-- Bật lại Safe Update Mode
SET SQL_SAFE_UPDATES = 1;

-- Kiểm tra kết quả
SELECT 
    ai.ItemID,
    ai.Title,
    ai.ImgUrl AS MainImage
FROM AuctionItems ai
ORDER BY ai.ItemID DESC
LIMIT 5;

SELECT CONCAT('✅ Đã cập nhật ', (SELECT COUNT(*) FROM ItemImages), ' ảnh thành công!') AS Status;

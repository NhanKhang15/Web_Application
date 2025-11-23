-- Tạo cơ sở dữ liệu nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS AuctionSite;

-- Sử dụng cơ sở dữ liệu
USE AuctionSite;

-- Xóa các bảng nếu đã tồn tại (theo thứ tự ngược với phụ thuộc khóa ngoại)
DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS Deals;
DROP TABLE IF EXISTS Bids;
DROP TABLE IF EXISTS AuctionTags;
DROP TABLE IF EXISTS Auctions;
DROP TABLE IF EXISTS AuctionItems;
DROP TABLE IF EXISTS UserProfiles;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Users;


-- USERS (credential only)
CREATE TABLE IF NOT EXISTS Users (
	UserID             INT AUTO_INCREMENT PRIMARY KEY,
	Username           VARCHAR(50)  NOT NULL UNIQUE,
	Email              VARCHAR(100) NULL,
	PasswordHashed     VARBINARY(255) NULL,
	SocialProvider     ENUM('google','facebook') NULL,
	SocialUID          VARCHAR(255) NULL,
	AuthPrimary        ENUM('local','google','facebook') NOT NULL DEFAULT 'local',
	Status             ENUM('active','disabled','banned') NOT NULL DEFAULT 'active',
	CreatedAt          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	profile_completed  TINYINT(1) DEFAULT 0,
    EmailVerified 	 TINYINT(1) NOT NULL DEFAULT 0,

	CONSTRAINT uq_email  UNIQUE (Email),
	CONSTRAINT uq_social UNIQUE (SocialProvider, SocialUID),

    CONSTRAINT chk_credentials CHECK (
(AuthPrimary = 'local'
 AND PasswordHashed IS NOT NULL
 AND SocialProvider IS NULL
 AND SocialUID IS NULL)
    OR
(AuthPrimary IN ('google','facebook')
    AND PasswordHashed IS NULL
    AND SocialProvider = AuthPrimary
    AND SocialUID IS NOT NULL)
    )
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- USER PROFILES
CREATE TABLE IF NOT EXISTS UserProfiles (
	ProfileID   INT AUTO_INCREMENT PRIMARY KEY,
	UserID      INT NOT NULL UNIQUE,
	FullName    VARCHAR(100),
    Phone       VARCHAR(20),
    Address     VARCHAR(200),
    Bio         VARCHAR(500),
    AvatarUrl   VARCHAR(300),
    DateOfBirth DATE,
    CONSTRAINT FK_UserProfiles_User
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- CATEGORIES
CREATE TABLE IF NOT EXISTS Categories (
                                          CategoryID   INT AUTO_INCREMENT PRIMARY KEY,
                                          CategoryName VARCHAR(100) NOT NULL UNIQUE
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ITEMS (thông tin cố định)
CREATE TABLE IF NOT EXISTS AuctionItems (
	ItemID       INT AUTO_INCREMENT PRIMARY KEY,
	SellerID     INT NOT NULL,
	CategoryID   INT NOT NULL,
	Title        VARCHAR(200) NOT NULL,
    Slug VARCHAR(255) UNIQUE,
    Description  MEDIUMTEXT,
    Location     VARCHAR(200),
    CreatedAt    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_Items_Seller   FOREIGN KEY (SellerID)   REFERENCES Users(UserID),
    CONSTRAINT FK_Items_Category FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS ItemImages (
	ImageID   INT AUTO_INCREMENT PRIMARY KEY,
	ItemID    INT NOT NULL,
	ImgUrl    VARCHAR(500) NOT NULL,
	IsMain    BOOLEAN DEFAULT FALSE,
	CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (ItemID) REFERENCES AuctionItems(ItemID)
	ON DELETE CASCADE
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- helpful indexes
CREATE INDEX idx_items_category ON AuctionItems(CategoryID);
CREATE INDEX idx_items_seller   ON AuctionItems(SellerID);

-- AUCTIONS (phiên đấu)
CREATE TABLE IF NOT EXISTS Auctions (
	AuctionID      INT AUTO_INCREMENT PRIMARY KEY,
	ItemID         INT NOT NULL,
	StartingPrice  DECIMAL(18,2) NOT NULL,
    MinStep        DECIMAL(18,2) NOT NULL,
    CurrentPrice   DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    ReservePrice   DECIMAL(18,2) NULL,
    BuyNowPrice    DECIMAL(18,2) NULL,
    Status         ENUM('Draft','Scheduled','Open','Ended','Closed','Cancelled')
    NOT NULL DEFAULT 'Scheduled',
    StartDate      DATETIME NOT NULL,
    EndDate        DATETIME NOT NULL,
    CreatedAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT FK_Auc_Item FOREIGN KEY (ItemID) REFERENCES AuctionItems(ItemID),

    CONSTRAINT CHK_Price_Positive CHECK (StartingPrice > 0 AND MinStep > 0),

    CONSTRAINT CHK_Reserve_BuyNow CHECK (
(ReservePrice IS NULL OR ReservePrice >= StartingPrice)
    AND (BuyNowPrice IS NULL OR (
(ReservePrice IS NULL AND BuyNowPrice >= StartingPrice) OR
(ReservePrice IS NOT NULL AND BuyNowPrice >= ReservePrice)
    ))
    ),

    CONSTRAINT CHK_Time CHECK (EndDate > StartDate)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX idx_auctions_status_end ON Auctions(Status, EndDate);
CREATE INDEX idx_auctions_item       ON Auctions(ItemID);

-- Auto set CurrentPrice = StartingPrice khi insert
DELIMITER $$
CREATE TRIGGER trg_auctions_init_price
    BEFORE INSERT ON Auctions
    FOR EACH ROW
BEGIN
    IF NEW.CurrentPrice = 0 THEN
    SET NEW.CurrentPrice = NEW.StartingPrice;
END IF;
END$$
DELIMITER ;

-- TAGS
CREATE TABLE IF NOT EXISTS AuctionTags (
	TagID     INT AUTO_INCREMENT PRIMARY KEY,
	AuctionID INT NOT NULL,
	TagName   VARCHAR(50) NOT NULL,
	CONSTRAINT FK_Tags_Auction FOREIGN KEY (AuctionID) REFERENCES Auctions(AuctionID) ON DELETE CASCADE,
	UNIQUE KEY uq_auction_tag (AuctionID, TagName)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX idx_tags_name ON AuctionTags(TagName);

-- BIDS
CREATE TABLE IF NOT EXISTS Bids (
	BidID      INT AUTO_INCREMENT PRIMARY KEY,
	AuctionID  INT NOT NULL,
	BidderID   INT NOT NULL,
	BidAmount  DECIMAL(18,2) NOT NULL,
	BidTime    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT FK_Bids_Auction FOREIGN KEY (AuctionID) REFERENCES Auctions(AuctionID) ON DELETE CASCADE,
	CONSTRAINT FK_Bids_User    FOREIGN KEY (BidderID)  REFERENCES Users(UserID),
	CONSTRAINT CHK_Bid_Positive CHECK (BidAmount > 0)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX idx_bids_top ON Bids (AuctionID, BidAmount DESC, BidTime ASC, BidID ASC);

-- DEALS (kết quả phiên)
CREATE TABLE IF NOT EXISTS Deals (
	DealID     INT AUTO_INCREMENT PRIMARY KEY,
	AuctionID  INT NOT NULL UNIQUE,
	BuyerID    INT NOT NULL,
	SellerID   INT NOT NULL,
	FinalPrice DECIMAL(18,2) NOT NULL,
	DealDate   DATETIME DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT FK_Deals_Auction FOREIGN KEY (AuctionID) REFERENCES Auctions(AuctionID),
	CONSTRAINT FK_Deals_Buyer   FOREIGN KEY (BuyerID)   REFERENCES Users(UserID),
	CONSTRAINT FK_Deals_Seller  FOREIGN KEY (SellerID)  REFERENCES Users(UserID)
	) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX idx_deals_seller ON Deals(SellerID);
CREATE INDEX idx_deals_buyer  ON Deals(BuyerID);

-- MESSAGES (chat)
CREATE TABLE IF NOT EXISTS Messages (
                                        MessageID   INT AUTO_INCREMENT PRIMARY KEY,
                                        SenderID    INT NOT NULL,
                                        ReceiverID  INT NOT NULL,
                                        AuctionID   INT NULL,
                                        Content     TEXT NOT NULL,
                                        SentAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
                                        CONSTRAINT FK_Messages_Sender   FOREIGN KEY (SenderID)   REFERENCES Users(UserID),
    CONSTRAINT FK_Messages_Receiver FOREIGN KEY (ReceiverID) REFERENCES Users(UserID),
    CONSTRAINT FK_Messages_Auction  FOREIGN KEY (AuctionID)  REFERENCES Auctions(AuctionID)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX idx_msg_pair ON Messages(SenderID, ReceiverID, SentAt);
CREATE INDEX idx_msg_auc  ON Messages(AuctionID, SentAt);

-- Trigger chặn tự đấu giá (Self-Bidding)
DELIMITER $$

CREATE TRIGGER trg_prevent_self_bidding
BEFORE INSERT ON Bids
FOR EACH ROW
BEGIN
    DECLARE item_seller_id INT;

    -- 1. Tìm SellerID dựa trên AuctionID của lượt đấu giá này
    SELECT i.SellerID INTO item_seller_id
    FROM Auctions a
    JOIN AuctionItems i ON a.ItemID = i.ItemID
    WHERE a.AuctionID = NEW.AuctionID;

    -- 2. Kiểm tra: Nếu người đặt giá (NEW.BidderID) trùng với chủ hàng
    IF NEW.BidderID = item_seller_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Bạn không thể tự đấu giá sản phẩm của chính mình!';
    END IF;
END$$

DELIMITER ;

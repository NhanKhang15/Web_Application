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
DROP TABLE IF EXISTS UserProfiles;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Users;

-- USERS: login accounts (credentials only)
CREATE TABLE IF NOT EXISTS Users (
    UserID        INT AUTO_INCREMENT PRIMARY KEY,
    Username      VARCHAR(50) NOT NULL UNIQUE,
    Email         VARCHAR(100) NOT NULL UNIQUE,
    PasswordHashed NVARCHAR(255) NOT NULL,
    CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- USER PROFILES: personal details for each user
CREATE TABLE IF NOT EXISTS UserProfiles (
    ProfileID   INT AUTO_INCREMENT PRIMARY KEY,
    UserID      INT NOT NULL UNIQUE,
    FullName    VARCHAR(100),
    Phone       VARCHAR(20),
    Address     VARCHAR(200),
    Bio         VARCHAR(500),
    AvatarUrl   VARCHAR(300),
    DateOfBirth DATE,
    CONSTRAINT FK_UserProfiles_User FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS Categories (
    CategoryID   INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL UNIQUE
);

-- AUCTIONS
CREATE TABLE IF NOT EXISTS Auctions (
    AuctionID     INT AUTO_INCREMENT PRIMARY KEY,
    SellerID      INT NOT NULL,
    CategoryID    INT NOT NULL,
    Title         VARCHAR(200) NOT NULL,
    Description   TEXT,
    StartingPrice DECIMAL(18,2) NOT NULL,
    CurrentPrice  DECIMAL(18,2) NOT NULL,
    StartDate     DATETIME NOT NULL,
    EndDate       DATETIME NOT NULL,
    Status        VARCHAR(20) DEFAULT 'Open',
    CONSTRAINT FK_Auctions_Seller FOREIGN KEY (SellerID) REFERENCES Users(UserID),
    CONSTRAINT FK_Auctions_Category FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-- AUCTION TAGS
CREATE TABLE IF NOT EXISTS AuctionTags (
    TagID     INT AUTO_INCREMENT PRIMARY KEY,
    AuctionID INT NOT NULL,
    TagName   VARCHAR(50) NOT NULL,
    CONSTRAINT FK_Tags_Auction FOREIGN KEY (AuctionID) REFERENCES Auctions(AuctionID) ON DELETE CASCADE
);

-- BIDS
CREATE TABLE IF NOT EXISTS Bids (
    BidID     INT AUTO_INCREMENT PRIMARY KEY,
    AuctionID INT NOT NULL,
    BidderID  INT NOT NULL,
    BidAmount DECIMAL(18,2) NOT NULL,
    BidTime   DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Bids_Auction FOREIGN KEY (AuctionID) REFERENCES Auctions(AuctionID) ON DELETE CASCADE,
    CONSTRAINT FK_Bids_User FOREIGN KEY (BidderID) REFERENCES Users(UserID)
);

-- DEALS
CREATE TABLE IF NOT EXISTS Deals (
    DealID     INT AUTO_INCREMENT PRIMARY KEY,
    AuctionID  INT NOT NULL UNIQUE,
    BuyerID    INT NOT NULL,
    SellerID   INT NOT NULL,
    FinalPrice DECIMAL(18,2) NOT NULL,
    DealDate   DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Deals_Auction FOREIGN KEY (AuctionID) REFERENCES Auctions(AuctionID),
    CONSTRAINT FK_Deals_Buyer FOREIGN KEY (BuyerID) REFERENCES Users(UserID),
    CONSTRAINT FK_Deals_Seller FOREIGN KEY (SellerID) REFERENCES Users(UserID)
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS Messages (
    MessageID   INT AUTO_INCREMENT PRIMARY KEY,
    SenderID    INT NOT NULL,
    ReceiverID  INT NOT NULL,
    AuctionID   INT NULL,
    Content     TEXT NOT NULL,
    SentAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Messages_Sender FOREIGN KEY (SenderID) REFERENCES Users(UserID),
    CONSTRAINT FK_Messages_Receiver FOREIGN KEY (ReceiverID) REFERENCES Users(UserID),
    CONSTRAINT FK_Messages_Auction FOREIGN KEY (AuctionID) REFERENCES Auctions(AuctionID)
);

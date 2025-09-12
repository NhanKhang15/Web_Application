CREATE DATABASE AuctionSite;
GO

USE AuctionSite;
GO

-- USERS: login accounts (credentials only)
CREATE TABLE dbo.Users (
    UserID        INT IDENTITY(1,1) PRIMARY KEY,
    Username      NVARCHAR(50) NOT NULL UNIQUE,
    Email         NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash  NVARCHAR(200) NOT NULL,
    CreatedAt     DATETIME2 DEFAULT SYSDATETIME()
);

-- USER PROFILES: personal details for each user
CREATE TABLE dbo.UserProfiles (
    ProfileID   INT IDENTITY(1,1) PRIMARY KEY,
    UserID      INT NOT NULL UNIQUE,
    FullName    NVARCHAR(100),
    Phone       NVARCHAR(20),
    Address     NVARCHAR(200),
    Bio         NVARCHAR(500),
    AvatarUrl   NVARCHAR(300),
    DateOfBirth DATE,
    CONSTRAINT FK_UserProfiles_User FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
);

-- CATEGORIES
CREATE TABLE dbo.Categories (
    CategoryID   INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL UNIQUE
);

-- AUCTIONS
CREATE TABLE dbo.Auctions (
    AuctionID     INT IDENTITY(1,1) PRIMARY KEY,
    SellerID      INT NOT NULL,
    CategoryID    INT NOT NULL,
    Title         NVARCHAR(200) NOT NULL,
    Description   NVARCHAR(MAX),
    StartingPrice DECIMAL(18,2) NOT NULL,
    CurrentPrice  DECIMAL(18,2) NOT NULL,
    StartDate     DATETIME2 NOT NULL,
    EndDate       DATETIME2 NOT NULL,
    Status        NVARCHAR(20) DEFAULT 'Open',
    CONSTRAINT FK_Auctions_Seller FOREIGN KEY (SellerID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_Auctions_Category FOREIGN KEY (CategoryID) REFERENCES dbo.Categories(CategoryID)
);

-- AUCTION TAGS
CREATE TABLE dbo.AuctionTags (
    TagID     INT IDENTITY(1,1) PRIMARY KEY,
    AuctionID INT NOT NULL,
    TagName   NVARCHAR(50) NOT NULL,
    CONSTRAINT FK_Tags_Auction FOREIGN KEY (AuctionID) REFERENCES dbo.Auctions(AuctionID) ON DELETE CASCADE
);

-- BIDS
CREATE TABLE dbo.Bids (
    BidID     INT IDENTITY(1,1) PRIMARY KEY,
    AuctionID INT NOT NULL,
    BidderID  INT NOT NULL,
    BidAmount DECIMAL(18,2) NOT NULL,
    BidTime   DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Bids_Auction FOREIGN KEY (AuctionID) REFERENCES dbo.Auctions(AuctionID) ON DELETE CASCADE,
    CONSTRAINT FK_Bids_User FOREIGN KEY (BidderID) REFERENCES dbo.Users(UserID)
);

-- DEALS
CREATE TABLE dbo.Deals (
    DealID     INT IDENTITY(1,1) PRIMARY KEY,
    AuctionID  INT NOT NULL UNIQUE,
    BuyerID    INT NOT NULL,
    SellerID   INT NOT NULL,
    FinalPrice DECIMAL(18,2) NOT NULL,
    DealDate   DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Deals_Auction FOREIGN KEY (AuctionID) REFERENCES dbo.Auctions(AuctionID),
    CONSTRAINT FK_Deals_Buyer FOREIGN KEY (BuyerID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_Deals_Seller FOREIGN KEY (SellerID) REFERENCES dbo.Users(UserID)
);

-- MESSAGES
CREATE TABLE dbo.Messages (
    MessageID   INT IDENTITY(1,1) PRIMARY KEY,
    SenderID    INT NOT NULL,
    ReceiverID  INT NOT NULL,
    AuctionID   INT NULL,
    Content     NVARCHAR(MAX) NOT NULL,
    SentAt      DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Messages_Sender FOREIGN KEY (SenderID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_Messages_Receiver FOREIGN KEY (ReceiverID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_Messages_Auction FOREIGN KEY (AuctionID) REFERENCES dbo.Auctions(AuctionID)
);

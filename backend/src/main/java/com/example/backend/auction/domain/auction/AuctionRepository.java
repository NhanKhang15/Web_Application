package com.example.backend.auction.domain.auction;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.auction.domain.auction.dto.ActiveAuctionDto;
import com.example.backend.auction.domain.auction.dto.AuctionDetailProjection;

public interface AuctionRepository extends JpaRepository<Auction, Integer> {
    @Query(value = """
                SELECT
                    a.AuctionID AS auctionId,
                    a.ItemID AS itemId,
                    a.CurrentPrice AS currentPrice,
                    a.BuyNowPrice AS buyNowPrice,
                    ai.Title AS title,
                    ai.Slug AS slug,
                    COALESCE(img.ImgUrl, ai.Thumbnail) AS thumbnail, -- Ưu tiên ảnh Main, nếu không có lấy thumbnail gốc
                    u.Username AS sellerName,
                    ai.CategoryID AS categoryId,
                    c.CategoryName AS categoryName
                FROM Auctions a
                JOIN AuctionItems ai ON a.ItemID = ai.ItemID
                JOIN Users u ON ai.SellerID = u.UserID
                JOIN Categories c ON ai.CategoryID = c.CategoryID
                LEFT JOIN ItemImages img ON ai.ItemID = img.ItemID AND img.IsMain = 1
                WHERE a.Status = 'Open'
                ORDER BY a.StartDate DESC
            """, countQuery = "SELECT COUNT(*) FROM Auctions a WHERE a.Status = 'Open'", nativeQuery = true)
    Page<ActiveAuctionDto> findActiveAuctionsCustom(Pageable pageable);

    @Query("""
            SELECT COUNT(a) > 0
            FROM Auction a
            WHERE a.item.itemId = :itemId
                AND a.status = com.example.backend.auction.domain.item.AuctionStatus.Open
                AND a.endDate > CURRENT_TIMESTAMP
            """)
    boolean existsActiveAuctionForItem(Integer itemId);

    @Query(value = """
                SELECT
                    a.AuctionID AS auctionId,
                    a.ItemID AS itemId,
                    a.CurrentPrice AS currentPrice,
                    a.BuyNowPrice AS buyNowPrice,
                    ai.Title AS title,
                    ai.Slug AS slug,
                    COALESCE(img.ImgUrl, ai.Thumbnail) AS thumbnail,
                    u.Username AS sellerName,
                    ai.CategoryID AS categoryId
                FROM Auctions a
                JOIN AuctionItems ai ON a.ItemID = ai.ItemID
                JOIN Users u ON ai.SellerID = u.UserID
                LEFT JOIN ItemImages img ON ai.ItemID = img.ItemID AND img.IsMain = 1
                WHERE a.Status = 'Open'
                  AND ai.CategoryID = :categoryId  -- 👈 ĐIỀU KIỆN LỌC Ở ĐÂY
                ORDER BY a.StartDate DESC
            """,
            // Câu lệnh đếm tổng số trang cũng phải join bảng AuctionItems để lọc đúng
            countQuery = """
                SELECT COUNT(*)
                FROM Auctions a
                JOIN AuctionItems ai ON a.ItemID = ai.ItemID
                WHERE a.Status = 'Open' AND ai.CategoryID = :categoryId
            """,
            nativeQuery = true)
    Page<ActiveAuctionDto> findActiveAuctionsByCategory(@Param("categoryId") Integer categoryId, Pageable pageable);

    @Query(value = """
                SELECT
                    -- Item Info
                    ai.ItemID AS itemId,
                    ai.SellerID AS sellerId,
                    c.CategoryName AS categoryName,
                    ai.CategoryID AS categoryId,
                    ai.Title AS title,
                    ai.Slug AS slug,
                    ai.Description AS description,
                    ai.Location AS location,
                    COALESCE(img.ImgUrl, ai.Thumbnail) AS thumbnail,

                    -- Auction Info
                    a.StartingPrice AS startingPrice,
                    a.MinStep AS minStep,
                    a.CurrentPrice AS currentPrice,
                    a.ReservePrice AS reservePrice,
                    a.BuyNowPrice AS buyNowPrice,
                    a.Status AS status,
                    a.StartDate AS startDate,
                    a.EndDate AS endDate,
                    a.CreatedAt AS createdAt,
                    a.UpdatedAt AS updatedAt,

                    -- User Info
                    u.Username AS sellerName

                FROM AuctionItems ai
                JOIN Auctions a ON ai.ItemID = a.ItemID
                JOIN Users u ON ai.SellerID = u.UserID
                JOIN Categories c ON ai.CategoryID = c.CategoryID
                LEFT JOIN ItemImages img ON ai.ItemID = img.ItemID AND img.IsMain = 1
                WHERE ai.Slug = :slug
                ORDER BY a.StartDate DESC
                LIMIT 1
            """, nativeQuery = true)
    Optional<AuctionDetailProjection> findDetailBySlug(@Param("slug") String slug);
}
package com.example.backend.auction.domain.auction;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.auction.domain.auction.dto.AuctionDetailProjection;
import com.example.backend.auction.domain.auction.dto.AuctionDto;

import jakarta.persistence.LockModeType;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Auction a WHERE a.auctionID = :id")
    Optional<Auction> findByIdForUpdate(@Param("id") Integer id);

    @Query(value = """
                SELECT
                    a.AuctionID AS auctionId,
                    a.ItemID AS itemId,
                    a.CurrentPrice AS currentPrice,
                    a.BuyNowPrice AS buyNowPrice,
                    a.StartingPrice AS startingPrice,
                    a.StartDate AS startDate,
                    a.EndDate AS endDate,
                    a.Status AS status,
                    ai.Title AS title,
                    ai.Slug AS slug,
                    COALESCE(img.ImgUrl, ai.Thumbnail) AS thumbnail,
                    u.Username AS sellerName,
                    ai.CategoryID AS categoryId,
                    c.CategoryName AS categoryName,
                    ai.Location AS location,
                    a.CreatedAt AS createdAt
                FROM Auctions a
                JOIN AuctionItems ai ON a.ItemID = ai.ItemID
                JOIN Users u ON ai.SellerID = u.UserID
                JOIN Categories c ON ai.CategoryID = c.CategoryID
                LEFT JOIN ItemImages img ON ai.ItemID = img.ItemID AND img.IsMain = 1
                WHERE a.Status = :status
            """, countQuery = "SELECT COUNT(*) FROM Auctions a WHERE a.Status = :status", nativeQuery = true)
    Page<AuctionDto> findAuctionsByStatus(@Param("status") String status, Pageable pageable);

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
                    ai.CategoryID AS categoryId,
                    ai.Location AS location,
                    a.CreatedAt AS createdAt
                FROM Auctions a
                JOIN AuctionItems ai ON a.ItemID = ai.ItemID
                JOIN Users u ON ai.SellerID = u.UserID
                LEFT JOIN ItemImages img ON ai.ItemID = img.ItemID AND img.IsMain = 1
                WHERE a.Status = 'Open'
                    AND ai.CategoryID = :categoryId
                    AND (:fromDate IS NULL OR a.StartDate >= CAST(:fromDate AS DATETIME))
                    AND (:toDate IS NULL OR a.StartDate <= CAST(:toDate AS DATETIME))
            """, countQuery = """
                SELECT COUNT(*)
                FROM Auctions a
                JOIN AuctionItems ai ON a.ItemID = ai.ItemID
                WHERE a.Status = 'Open' AND ai.CategoryID = :categoryId
            """, nativeQuery = true)
    Page<AuctionDto> findActiveAuctionsByCategory(@Param("fromDate") String fromDate, @Param("toDate") String toDate,
            @Param("categoryId") Integer categoryId, Pageable pageable);

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
                     ai.CategoryID AS categoryId,
                     c.CategoryName AS categoryName,
                     ai.Location AS location,
                     a.CreatedAt AS createdAt
                 FROM Auctions a
                 JOIN AuctionItems ai ON a.ItemID = ai.ItemID
                 JOIN Users u ON ai.SellerID = u.UserID
                 JOIN Categories c ON ai.CategoryID = c.CategoryID
                 LEFT JOIN ItemImages img ON ai.ItemID = img.ItemID AND img.IsMain = 1
                 WHERE a.Status = 'Open'
                     AND ai.Title LIKE CONCAT('%', :keyword, '%')
                     AND (:fromDate IS NULL OR a.StartDate >= CAST(:fromDate AS DATETIME))
                     AND (:toDate IS NULL OR a.StartDate <= CAST(:toDate AS DATETIME))
            """, countQuery = """
                 SELECT COUNT(*)
                 FROM Auctions a
                 JOIN AuctionItems ai ON a.ItemID = ai.ItemID
                 WHERE a.Status = 'Open'
                 AND ai.Title LIKE CONCAT('%', :keyword, '%')
                 AND (:fromDate IS NULL OR a.StartDate >= CAST(:fromDate AS DATETIME))
                 AND (:toDate IS NULL OR a.StartDate <= CAST(:toDate AS DATETIME))
            """, nativeQuery = true)
    Page<AuctionDto> searchAuctionsByTitle(@Param("fromDate") String fromDate, @Param("toDate") String toDate,
            @Param("keyword") String keyword, Pageable pageable);

    @Query(value = """
                SELECT
                    -- Item Info
                    a.AuctionID AS auctionId,
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

    @Query(value = """
        SELECT 
            a.AuctionID AS auctionId, 
            i.ItemID AS itemId, 
            i.SellerID AS sellerId,
            a.CurrentPrice AS currentPrice, 
            a.BuyNowPrice AS buyNowPrice, 
            i.Title AS title, 
            i.Thumbnail AS thumbnail, 
            i.Slug AS slug, 
            a.StartingPrice AS startingPrice, 
            a.StartDate AS startDate, 
            a.EndDate AS endDate, 
            a.Status AS status, 
            i.CategoryID AS categoryId, 
            i.Location AS location, 
            a.CreatedAt AS createdAt,
            a.MinStep AS minStep
        FROM Auctions a 
        JOIN AuctionItems i ON a.ItemID = i.ItemID 
        WHERE a.Status = 'Open' 
        AND (
            LOWER(i.Title) LIKE LOWER(CONCAT('%', :keyword, '%')) 
            OR LOWER(:keyword) LIKE LOWER(CONCAT('%', i.Title, '%'))
        )
        AND (:minPrice IS NULL OR a.CurrentPrice >= :minPrice)
        AND (:maxPrice IS NULL OR a.CurrentPrice <= :maxPrice)
        AND (:ownerId IS NULL OR i.SellerID = :ownerId)
        """,
            countQuery = """
        SELECT COUNT(*) FROM Auctions a 
        JOIN AuctionItems i ON a.ItemID = i.ItemID 
        WHERE a.Status = 'Open' 
        AND (LOWER(i.Title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(:keyword) LIKE LOWER(CONCAT('%', i.Title, '%')))
        AND (:minPrice IS NULL OR a.CurrentPrice >= :minPrice)
        AND (:maxPrice IS NULL OR a.CurrentPrice <= :maxPrice)
        """,
            nativeQuery = true)
    Page<AuctionDto> searchAuctionsAdvanced(
            @Param("keyword") String keyword,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("ownerId") Integer ownerId,
            Pageable pageable
    );

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @Query(value = "UPDATE Auctions SET Status = 'Open' WHERE Status = 'Scheduled' AND StartDate <= CURRENT_TIMESTAMP", nativeQuery = true)
    void updateScheduledToOpen();

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @Query(value = "UPDATE Auctions SET Status = 'Ended' WHERE Status = 'Open' AND EndDate < CURRENT_TIMESTAMP", nativeQuery = true)
    void updateOpenToEnded();
}
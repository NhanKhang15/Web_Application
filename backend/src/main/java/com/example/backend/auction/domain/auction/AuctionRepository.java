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
import com.example.backend.auction.domain.auction.dto.EndedAuctionDto;
import com.example.backend.auction.domain.auction.dto.ScheduledAuctionDto;
import com.example.backend.auction.domain.auction.dto.SimilarItemDto;

import jakarta.persistence.LockModeType;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Integer> {

    List<Auction> findAllByStatusAndEndDateBefore(com.example.backend.auction.domain.item.AuctionStatus status,
            java.time.LocalDateTime endDate);

    // Tìm auction theo slug của item (dùng cho chatbot)
    Optional<Auction> findByItem_Slug(String slug);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Auction a WHERE a.auctionID = :id")
    Optional<Auction> findByIdForUpdate(@Param("id") Integer id);

    @Query("SELECT a.auctionID FROM Auction a WHERE a.status = :status AND a.endDate < :now")
    List<Integer> findExpiredAuctionIds(@Param("status") com.example.backend.auction.domain.item.AuctionStatus status,
            @Param("now") java.time.LocalDateTime now);

    // 1. TÁCH SQL RA BIẾN DÙNG CHUNG (Để không phải copy-paste logic JOIN)
    String BASE_QUERY = """
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
            """;

    String COUNT_BASE = "SELECT COUNT(*) FROM Auctions a WHERE a.Status = :status";

    // 2. API CŨ (Active): Trả về Full AuctionDto (Giữ nguyên logic cũ)
    @Query(value = BASE_QUERY + " WHERE a.Status = :status", countQuery = COUNT_BASE, nativeQuery = true)
    Page<AuctionDto> findActiveAuctions(@Param("status") String status, Pageable pageable);

    // 3. API MỚI (Ended/Closed): Trả về EndedAuctionDto (Tự động lọc bớt cột thừa)
    @Query(value = """
                SELECT
                    a.AuctionID AS auctionId,
                    ai.Title AS title,
                    a.CurrentPrice AS finalPrice,
                    a.Status AS status,
                    w.Username AS winnerName,
                    a.EndDate AS endDate
                FROM Auctions a
                JOIN AuctionItems ai ON a.ItemID = ai.ItemID
                LEFT JOIN Users w ON a.WinnerID = w.UserID
                WHERE a.Status IN (:statuses)
            """, countQuery = "SELECT COUNT(*) FROM Auctions a WHERE a.Status IN (:statuses)", nativeQuery = true)
    Page<EndedAuctionDto> findEndedAuctions(@Param("statuses") List<String> statuses, Pageable pageable);

    // 4. API MỚI (Scheduled): Trả về ScheduledAuctionDto
    @Query(value = """
                SELECT
                    a.AuctionID AS auctionId,
                    ai.Title AS title,
                    a.MinStep AS minStep,
                    u.Username AS sellerName,
                    a.StartingPrice AS startingPrice,
                    a.BuyNowPrice AS buyNowPrice,
                    a.StartDate AS startDate,
                    a.EndDate AS endDate
                FROM Auctions a
                JOIN AuctionItems ai ON a.ItemID = ai.ItemID
                JOIN Users u ON ai.SellerID = u.UserID
                WHERE a.Status = 'Scheduled'
            """, countQuery = "SELECT COUNT(*) FROM Auctions a WHERE a.Status = 'Scheduled'", nativeQuery = true)
    Page<ScheduledAuctionDto> findScheduledAuctions(Pageable pageable);

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
            """, countQuery = """
            SELECT COUNT(*) FROM Auctions a
            JOIN AuctionItems i ON a.ItemID = i.ItemID
            WHERE a.Status = 'Open'
            AND (LOWER(i.Title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(:keyword) LIKE LOWER(CONCAT('%', i.Title, '%')))
            AND (:minPrice IS NULL OR a.CurrentPrice >= :minPrice)
            AND (:maxPrice IS NULL OR a.CurrentPrice <= :maxPrice)
            """, nativeQuery = true)
    Page<AuctionDto> searchAuctionsAdvanced(
            @Param("keyword") String keyword,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("ownerId") Integer ownerId,
            Pageable pageable);

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
            WHERE a.Status = 'Open'
                -- 1. SỬA LẠI: Dùng SpEL để check null cho List Categories
                AND ( :#{#categories == null} = true OR c.CategoryName IN (:#{#categories}) )

                -- 2. SỬA LẠI: Dùng SpEL để check null cho List Locations
                AND ( :#{#locations == null} = true OR ai.Location IN (:#{#locations}) )

                -- 3. Date Range (Giữ nguyên, vì tham số String đơn check IS NULL vẫn ổn)
                AND (:fromDate IS NULL OR a.StartDate >= CAST(:fromDate AS DATETIME))
                AND (:toDate IS NULL OR a.StartDate <= CAST(:toDate AS DATETIME))

                -- 4. Negotiated
                AND (:negotiated IS NULL OR :negotiated IS NULL) -- (Logic tạm nếu chưa có cột DB)

            """, countQuery = """
            SELECT COUNT(a.AuctionID)
            FROM Auctions a
            JOIN AuctionItems ai ON a.ItemID = ai.ItemID
            JOIN Categories c ON ai.CategoryID = c.CategoryID
            WHERE a.Status = 'Open'
                AND ( :#{#categories == null} = true OR c.CategoryName IN (:#{#categories}) )
                AND ( :#{#locations == null} = true OR ai.Location IN (:#{#locations}) )
                AND (:fromDate IS NULL OR a.StartDate >= CAST(:fromDate AS DATETIME))
                AND (:toDate IS NULL OR a.StartDate <= CAST(:toDate AS DATETIME))
            """, nativeQuery = true)
    Page<AuctionDto> findActiveAuctionsFiltered(
            @Param("categories") List<String> categories,
            @Param("locations") List<String> locations,
            @Param("fromDate") String fromDate,
            @Param("toDate") String toDate,
            @Param("negotiated") Boolean negotiated,
            Pageable pageable);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @Query(value = "UPDATE Auctions SET Status = 'Open' WHERE Status = 'Scheduled' AND StartDate <= CURRENT_TIMESTAMP", nativeQuery = true)
    void updateScheduledToOpen();

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @Query(value = "UPDATE Auctions SET Status = 'Ended' WHERE Status = 'Open' AND EndDate < CURRENT_TIMESTAMP", nativeQuery = true)
    void updateOpenToEnded();

    // ========== SELLER AUCTIONS ==========
    // Find all auctions by seller ID with optional status filter
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
                WHERE ai.SellerID = :sellerId
                    AND (:status IS NULL OR a.Status = :status)
                ORDER BY a.CreatedAt DESC
            """, countQuery = """
                SELECT COUNT(*)
                FROM Auctions a
                JOIN AuctionItems ai ON a.ItemID = ai.ItemID
                WHERE ai.SellerID = :sellerId
                    AND (:status IS NULL OR a.Status = :status)
            """, nativeQuery = true)
    Page<AuctionDto> findAuctionsBySellerId(
            @Param("sellerId") Integer sellerId,
            @Param("status") String status,
            Pageable pageable);

    // Find all auctions by seller ID (all statuses)
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
                WHERE ai.SellerID = :sellerId
                ORDER BY a.CreatedAt DESC
            """, countQuery = """
                SELECT COUNT(*)
                FROM Auctions a
                JOIN AuctionItems ai ON a.ItemID = ai.ItemID
                WHERE ai.SellerID = :sellerId
            """, nativeQuery = true)
    List<AuctionDto> findAllAuctionsBySellerId(@Param("sellerId") Integer sellerId);

    // ========== SIMILAR ITEMS ==========
    // Find similar auctions in the same category, excluding the current item
    @Query(value = """
                        SELECT
                            ai.ItemID AS itemId,
            ai.Title AS title,
            ai.Slug AS slug,

            COALESCE(img.ImgUrl, ai.Thumbnail) AS thumbnail,
                            a.CreatedAt AS createdAt
                        FROM Auctions a
                        JOIN AuctionItems ai ON a.ItemID = ai.ItemID
                        LEFT JOIN ItemImages img ON ai.ItemID = img.ItemID AND img.IsMain = 1
                        WHERE a.Status = 'Open'
                            AND ai.CategoryID = :categoryId
                            AND ai.ItemID != :excludeItemId
                        ORDER BY a.CreatedAt DESC
                        LIMIT :limit
                    """, nativeQuery = true)

    List<SimilarItemDto> findSimilarAuctions(
            @Param("categoryId") Integer categoryId,
            @Param("excludeItemId") Integer excludeItemId,
            @Param("limit") int limit);
}
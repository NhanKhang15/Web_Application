package com.example.backend.auction.domain.item;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AuctionItemsRepository extends JpaRepository<AuctionItems, Long> {
    Optional<AuctionItems> findBySlug(String slug);

    @Query(value = """
        SELECT DISTINCT ai.location
        FROM AuctionItems ai
        JOIN Auctions a ON ai.itemId = a.itemID
        WHERE a.status = 'Open' AND ai.location IS NOT NULL AND ai.location <> ''
    """, nativeQuery = true)
    List<String> findDistinctLocations();
}
package com.example.backend.auction_items.items;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuctionItemsRepository extends JpaRepository<AuctionItems, Long> {
    Optional<AuctionItems> findBySlug(String slug);
}

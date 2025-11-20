package com.example.backend.auction.domain.item;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuctionItemsRepository extends JpaRepository<AuctionItems, Long> {
    Optional<AuctionItems> findBySlug(String slug);

}

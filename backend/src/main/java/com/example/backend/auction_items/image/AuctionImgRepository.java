package com.example.backend.auction_items.image;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionImgRepository extends JpaRepository<AuctionImg, Integer> {

    // Lấy toàn bộ ảnh của 1 item, ưu tiên ảnh chính trước
    List<AuctionImg> findByItemIdOrderByIsMainDescCreatedAtAsc(Integer itemId);

    // Lấy ảnh chính (nếu có)
    Optional<AuctionImg> findFirstByItemIdAndIsMainTrue(Integer itemId);
}
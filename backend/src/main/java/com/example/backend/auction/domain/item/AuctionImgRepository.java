package com.example.backend.auction.domain.item;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AuctionImgRepository extends JpaRepository<AuctionImg, Integer> {
    
    // Hàm cũ của bạn (trả về Entity)
    List<AuctionImg> findByItemIdInOrderByIsMainDescCreatedAtAsc(List<Integer> itemIds);

    // Hàm mới: Lấy danh sách URL ảnh của 1 Item cụ thể
    @Query("SELECT img.imgUrl FROM AuctionImg img WHERE img.itemId = :itemId ORDER BY img.isMain DESC, img.createdAt ASC")
    List<String> findAllImgUrlsByItemId(Integer itemId);
}
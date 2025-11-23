package com.example.backend.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    // 👇 HÀM MỚI: Lấy danh mục có sản phẩm đang mở bán (Status = 'Open')
    // Chúng ta dùng Native Query để join các bảng với nhau
    @Query(value = """
        SELECT DISTINCT c.* FROM Categories c
        INNER JOIN AuctionItems ai ON c.CategoryID = ai.CategoryID
        INNER JOIN Auctions a ON ai.ItemID = a.ItemID
        WHERE a.Status = 'Open'
    """, nativeQuery = true)
    List<Category> findActiveCategories();
}
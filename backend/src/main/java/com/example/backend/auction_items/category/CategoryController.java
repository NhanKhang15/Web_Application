package com.example.backend.auction_items.category;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
// @CrossOrigin (Xóa đi, vì chúng ta đã dùng WebConfig toàn cục)
public class CategoryController {

    // 1. Chỉ inject Service
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // GET: List all categories
    // 2. Trả về List<CategoryDto>
    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        List<CategoryDto> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    // GET: Get category by ID
    // 3. Trả về CategoryDto
    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryDto> getCategoryById(@PathVariable Integer categoryId) {
        return categoryService.getCategoryById(categoryId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST: Create new category (admin only)
    // 4. Nhận CreateCategoryRequest, trả về CategoryDto
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody CreateCategoryRequest request) {
        try {
            // Chỉ cần gọi service, toàn bộ logic đã ở bên trong
            CategoryDto saved = categoryService.createCategory(request);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            // Bắt lỗi (ví dụ: "Tên đã tồn tại") từ Service
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
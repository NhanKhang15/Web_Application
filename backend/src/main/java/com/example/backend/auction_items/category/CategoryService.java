package com.example.backend.auction_items.category;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepo;

    public CategoryService(CategoryRepository categoryRepo) {
        this.categoryRepo = categoryRepo;
    }

    /**
     * Helper
     * Chuyển Entity (Database) -> DTO (API Response)
     */
    private CategoryDto convertToDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setCategoryId(category.getCategoryId());
        dto.setCategoryName(category.getCategoryName());
        return dto;
    }

    // --- Logic Lấy Dữ Liệu ---

    public List<CategoryDto> getAllCategories() {
        return categoryRepo.findAll()
                .stream()
                .map(this::convertToDto) // Chuyển đổi hàng loạt
                .collect(Collectors.toList());
    }

    public Optional<CategoryDto> getCategoryById(Integer categoryId) {
        return categoryRepo.findById(categoryId)
                .map(this::convertToDto); // Chuyển đổi 1 đối tượng
    }

    // --- Logic Nghiệp Vụ (Tạo) ---

    @Transactional
    public CategoryDto createCategory(CreateCategoryRequest request) {
        // 1. Validate (Kiểm tra logic nghiệp vụ)
        if (request.getCategoryName() == null || request.getCategoryName().isBlank()) {
            throw new RuntimeException("Category name cannot be empty");
        }

        // 2. SỬA LỖI: Kiểm tra tên trùng lặp
        if (categoryRepo.findByCategoryName(request.getCategoryName()).isPresent()) {
            throw new RuntimeException("Category name already exists: " + request.getCategoryName());
        }

        // 3. Chỉ khi mọi thứ hợp lệ, mới tạo Entity
        Category newCategory = new Category();
        newCategory.setCategoryName(request.getCategoryName());

        // 4. Lưu vào DB
        Category saved = categoryRepo.save(newCategory);

        // 5. Trả về DTO cho Controller
        return convertToDto(saved);
    }
}
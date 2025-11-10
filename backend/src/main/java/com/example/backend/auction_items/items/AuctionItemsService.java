package com.example.backend.auction_items.items;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuctionItemsService {

    private final AuctionItemsRepository itemRepo;
    private final String uploadPath = "uploads"; // Hoặc lấy từ application.properties

    public AuctionItemsService(AuctionItemsRepository itemRepo) {
        this.itemRepo = itemRepo;
    }

    /**
     * Helper
     * Chuyển Entity (Database) -> DTO (API Response)
     */
    private AuctionItemDto convertToDto(AuctionItems item) {
        AuctionItemDto dto = new AuctionItemDto();
        dto.setItemId(item.getItemId());
        dto.setSellerId(item.getSellerId());
        dto.setCategoryId(item.getCategoryId());
        dto.setTitle(item.getTitle());
        dto.setDescription(item.getDescription());
        dto.setImgUrl(item.getImgUrl());
        dto.setSlug(item.getSlug());
        dto.setThumbnail(item.getThumbnail());
        dto.setLocation(item.getLocation());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        return dto;
    }

    // --- Logic Lấy Dữ Liệu (MỚI) ---

    public Page<AuctionItemDto> getPaginatedItems(Pageable pageable) {
        // Gọi Repo, lấy Page<Entity> và chuyển đổi sang Page<DTO>
        return itemRepo.findAll(pageable).map(this::convertToDto);
    }

    public Optional<AuctionItemDto> getItemBySlug(String slug) {
        return itemRepo.findBySlug(slug).map(this::convertToDto);
    }

    // --- Logic Nghiệp Vụ (Cập nhật) ---

    @Transactional
    public AuctionItemDto createItem(CreateItemRequest request, Integer sellerId) {
        AuctionItems item = new AuctionItems();
        item.setSellerId(sellerId);
        item.setCategoryId(request.getCategoryId());
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setLocation(request.getLocation() != null ? request.getLocation() : "Unknown");

        // Logic Slug: Ưu tiên slug người dùng, nếu không có thì tự tạo
        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = generateSlug(request.getTitle());
        }
        item.setSlug(slug);

        // Đặt imgUrl và thumbnail tạm thời
        item.setImgUrl("placeholder.jpg");
        item.setThumbnail("placeholder.jpg");

        // (Không cần setCreatedAt/UpdatedAt, Entity @PrePersist sẽ tự làm)
        // (Bạn nên thêm @PrePersist và @PreUpdate vào AuctionItems.java)
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());

        AuctionItems saved = itemRepo.save(item);
        return convertToDto(saved);
    }

    @Transactional
    public AuctionItemDto updateItem(Integer itemId, CreateItemRequest request) {
        AuctionItems item = itemRepo.findById(Long.valueOf(itemId))
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (request.getTitle() != null) item.setTitle(request.getTitle());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getCategoryId() != null) item.setCategoryId(request.getCategoryId());
        if (request.getLocation() != null) item.setLocation(request.getLocation());

        item.setUpdatedAt(LocalDateTime.now()); // (Nên dùng @PreUpdate)

        AuctionItems updated = itemRepo.save(item);
        return convertToDto(updated);
    }

    /**
     * HÀM CÒN THIẾU (CHO BƯỚC ẢNH)
     * Cập nhật ảnh chính cho vật phẩm sau khi upload
     */
    @Transactional
    public void updateItemMainImage(Integer itemId, String imageUrl) {
        AuctionItems item = itemRepo.findById(Long.valueOf(itemId))
                .orElseThrow(() -> new RuntimeException("Item not found while updating image: " + itemId));

        item.setImgUrl(imageUrl);
        item.setThumbnail(imageUrl); // (Bạn có thể tạo thumbnail riêng sau)
        item.setUpdatedAt(LocalDateTime.now());

        itemRepo.save(item);
    }

    // --- Logic Tiện Ích (Giữ nguyên) ---

    public String uploadFile(MultipartFile file) throws IOException {
        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // Tạo tên file unique
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = System.currentTimeMillis() + "_" + UUID.randomUUID() + extension;

        Path filePath = uploadDir.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // ✅ QUAN TRỌNG: Chỉ trả về tên file, KHÔNG có prefix /uploads/
        return filename;
    }

    public String generateSlug(String title) {
        // ... (Giữ nguyên code generateSlug của bạn)
        if (title == null || title.isBlank()) {
            return UUID.randomUUID().toString();
        }
        String normalized = Normalizer.normalize(title, Normalizer.Form.NFD);
        String slug = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        slug = slug.toLowerCase();
        slug = slug.replaceAll("[^a-z0-9\\s-]", "");
        slug = slug.replaceAll("\\s+", "-");
        slug = slug.replaceAll("^-+|-+$", "");
        if (slug.isBlank()) {
            return UUID.randomUUID().toString();
        }
        return slug;
    }
}
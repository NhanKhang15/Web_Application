package com.example.backend.auction_items.items;

// Imports cho logic Ảnh (gộp từ file cũ)
import com.example.backend.auction_items.image.AuctionImg;
import com.example.backend.auction_items.image.AuctionImgService;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.io.IOException;
// ---

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/items") // Chỉ một Controller được phép dùng path này
public class AuctionItemsController {

    private final AuctionItemsService itemsService;
    private final AuctionImgService imgService; // 1. Inject Service Ảnh

    public AuctionItemsController(AuctionItemsService itemsService,
                                  AuctionImgService imgService) { // 2. Thêm vào constructor
        this.itemsService = itemsService;
        this.imgService = imgService;
    }

    // ===== API VẬT PHẨM (Giữ nguyên) =====

    // GET: /api/items
    @GetMapping
    public ResponseEntity<Page<AuctionItemDto>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        // (Logic parse)
        if (size > 50) size = 50;
        if (size <= 0) size = 20;
        String[] parts = sort.split(",", 2);
        String field = parts.length > 0 && !parts[0].isBlank() ? parts[0] : "createdAt";
        Sort.Direction dir = (parts.length == 2 && "asc".equalsIgnoreCase(parts[1]))
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, field));

        Page<AuctionItemDto> itemPage = itemsService.getPaginatedItems(pageable);
        return ResponseEntity.ok(itemPage);
    }

    // GET: /api/items/by-slug/{slug}
    @GetMapping("/by-slug/{slug}")
    public ResponseEntity<AuctionItemDto> getBySlug(@PathVariable String slug) {
        return itemsService.getItemBySlug(slug)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST: /api/items
    @PostMapping
    public ResponseEntity<Map<String, Object>> createItem(@RequestBody CreateItemRequest request) {
        try {
            Integer sellerId = 1; // TODO: Lấy sellerId từ JWT
            AuctionItemDto item = itemsService.createItem(request, sellerId);
            Map<String, Object> response = new HashMap<>();
            response.put("itemId", item.getItemId());
            response.put("slug", item.getSlug());
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // PUT: /api/items/{itemId}
    @PutMapping("/{itemId}")
    public ResponseEntity<Map<String, Object>> updateItem(
            @PathVariable Integer itemId,
            @RequestBody CreateItemRequest request
    ) {
        try {
            AuctionItemDto item = itemsService.updateItem(itemId, request);
            Map<String, Object> response = new HashMap<>();
            response.put("itemId", item.getItemId());
            response.put("title", item.getTitle());
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }


    // ===== API ẢNH (Đã gộp vào đây) =====

    // GET: /api/items/{itemId}/images
    @GetMapping("/{itemId}/images")
    public ResponseEntity<List<AuctionImg>> getImagesByItem(@PathVariable Integer itemId) {
        // 3. Gọi ImgService
        List<AuctionImg> images = imgService.getImagesByItem(itemId);
        return ResponseEntity.ok(images);
    }

    // POST: /api/items/{itemId}/images
    @PostMapping("/{itemId}/images")
    public ResponseEntity<?> uploadImages(
            @PathVariable Integer itemId,
            @RequestParam("images") MultipartFile[] files) {
        try {
            // 4. Gọi ImgService
            List<AuctionImg> savedImages = imgService.uploadImages(itemId, files);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("uploaded", savedImages.size());
            response.put("images", savedImages);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // DELETE: /api/items/images/{imageId}
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<?> deleteImage(@PathVariable Integer imageId) {
        try {
            // 5. Gọi ImgService
            imgService.deleteImage(imageId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Image deleted successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
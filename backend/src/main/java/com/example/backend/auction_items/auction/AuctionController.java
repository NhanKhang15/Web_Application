package com.example.backend.auction_items.auction;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auctions")
// @CrossOrigin (Bạn nên dùng WebConfig toàn cục thay vì ở đây)
public class AuctionController {

    // 2. KHÔNG DÙNG REPO, dùng SERVICE
    private final AuctionService auctionService;

    public AuctionController(AuctionService auctionService) {
        this.auctionService = auctionService;
    }

    // 3. Trả về List<AuctionDto>
    @GetMapping
    public ResponseEntity<List<AuctionDto>> getAllAuctions() {
        List<AuctionDto> auctions = auctionService.getAllAuctions();
        return ResponseEntity.ok(auctions);
    }

    // 4. Trả về AuctionDto
    @GetMapping("/{auctionId}")
    public ResponseEntity<AuctionDto> getAuctionById(@PathVariable Integer auctionId) {
        return auctionService.getAuctionById(auctionId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<AuctionDto> getAuctionByItemId(@PathVariable Integer itemId) {
        return auctionService.getAuctionByItemId(itemId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 5. Nhận CreateAuctionRequest, trả về AuctionDto
    @PostMapping
    public ResponseEntity<?> createAuction(@RequestBody CreateAuctionRequest request) {
        try {
            // Chỉ cần gọi service, toàn bộ logic đã ở bên trong
            AuctionDto savedAuction = auctionService.createAuction(request);

            // (Bạn có thể trả về DTO đầy đủ)
            return ResponseEntity.ok(savedAuction);

            /* (Hoặc trả về Map như cũ nếu bạn muốn)
            Map<String, Object> response = new HashMap<>();
            response.put("auctionId", savedAuction.getAuctionId());
            response.put("status", savedAuction.getStatus());
            response.put("success", true);
            return ResponseEntity.ok(response);
            */

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // 6. Trả về AuctionDto
    @PutMapping("/{auctionId}/status")
    public ResponseEntity<?> updateAuctionStatus(
            @PathVariable Integer auctionId,
            @RequestParam String status
    ) {
        try {
            AuctionDto updatedAuction = auctionService.updateAuctionStatus(auctionId, status);
            return ResponseEntity.ok(updatedAuction);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
// 7. XÓA class CreateAuctionRequest ở đây
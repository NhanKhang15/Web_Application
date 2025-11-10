package com.example.backend.auction_items.image;

import com.example.backend.auction_items.items.AuctionItemsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class AuctionImgService {

    private final AuctionImgRepository imgRepo;
    private final AuctionItemsService itemsService; // Dùng để gọi hàm uploadFile & updateItemMainImage

    public AuctionImgService(AuctionImgRepository imgRepo, AuctionItemsService itemsService) {
        this.imgRepo = imgRepo;
        this.itemsService = itemsService;
    }

    // --- Logic Lấy Dữ Liệu ---

    public List<AuctionImg> getImagesByItem(Integer itemId) {
        // Trả về Entity (hoặc DTO nếu bạn muốn)
        return imgRepo.findByItemIdOrderByIsMainDescCreatedAtAsc(itemId);
    }

    // --- Logic Nghiệp Vụ (Tạo/Xóa) ---

    @Transactional
    public List<AuctionImg> uploadImages(Integer itemId, MultipartFile[] files) throws IOException {
        if (files == null || files.length == 0) {
            throw new RuntimeException("No images provided");
        }

        List<AuctionImg> savedImages = new ArrayList<>();
        String mainImageUrl = null;

        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];

            // 1. Lưu file vật lý - trả về chỉ tên file
            String filename = itemsService.uploadFile(file);

            // 2. Tạo URL đầy đủ với prefix /uploads/
            String imageUrl = "/uploads/" + filename;

            // 3. Tạo record trong bảng ItemImages
            AuctionImg image = new AuctionImg();
            image.setItemId(itemId);
            image.setImgUrl(imageUrl); // Lưu full path: "/uploads/xxx.jpg"
            image.setMain(i == 0);

            savedImages.add(imgRepo.save(image));

            if (i == 0) {
                mainImageUrl = imageUrl;
            }
        }

        // 4. Cập nhật ảnh chính
        if (mainImageUrl != null) {
            itemsService.updateItemMainImage(itemId, mainImageUrl);
        }

        return savedImages;
    }

    @Transactional
    public void deleteImage(Integer imageId) {
        // (Kiểm tra xem ảnh có tồn tại không)
        AuctionImg img = imgRepo.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        // (Nâng cao: Xóa file vật lý khỏi server)
        // itemsService.deleteFile(img.getImgUrl());

        // Xóa record trong DB
        imgRepo.delete(img);
    }
}
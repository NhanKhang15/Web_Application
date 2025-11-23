package com.example.backend.auction.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.auction.domain.auction.Auction;
import com.example.backend.auction.domain.auction.AuctionRepository;
import com.example.backend.auction.domain.auction.dto.CreateAuctionRequest;
import com.example.backend.auction.domain.item.AuctionImg;
import com.example.backend.auction.domain.item.AuctionImgRepository;
import com.example.backend.auction.domain.item.AuctionItems;
import com.example.backend.auction.domain.item.AuctionItemsRepository;
import com.example.backend.auction.domain.item.AuctionStatus;
import com.example.backend.utils.SlugUtils;

@Service
public class AuctionWriteService {

    private final AuctionRepository auctionRepo;
    private final AuctionItemsRepository itemRepo;
    private final AuctionImgRepository imgRepo;

    // Đường dẫn lưu ảnh (Config trong properties thì tốt hơn, ở đây hardcode ví dụ)
    private final String UPLOAD_DIR = "uploads/";

    public AuctionWriteService(AuctionRepository auctionRepo, AuctionItemsRepository itemRepo,
            AuctionImgRepository imgRepo) {
        this.auctionRepo = auctionRepo;
        this.itemRepo = itemRepo;
        this.imgRepo = imgRepo;
    }

    @Transactional(rollbackFor = Exception.class) // Nếu lỗi bất kỳ bước nào thì rollback sạch
    public Auction createAuction(CreateAuctionRequest request, MultipartFile[] files) throws IOException {

        // Validate Prices
        if (request.getStartingPrice() == null) {
            throw new IllegalArgumentException("Starting price is required");
        }

        // 1. Reserve Price >= Starting Price
        if (request.getReservePrice() != null) {
            if (request.getReservePrice().compareTo(request.getStartingPrice()) < 0) {
                throw new IllegalArgumentException("Reserve Price must be greater than or equal to Starting Price");
            }
        }

        // 2. Buy Now Price > Starting Price
        if (request.getBuyNowPrice() != null) {
            if (request.getBuyNowPrice().compareTo(request.getStartingPrice()) <= 0) {
                throw new IllegalArgumentException("Buy Now Price must be greater than Starting Price");
            }

            // 3. Buy Now Price >= Reserve Price
            if (request.getReservePrice() != null) {
                if (request.getBuyNowPrice().compareTo(request.getReservePrice()) < 0) {
                    throw new IllegalArgumentException("Buy Now Price must be greater than or equal to Reserve Price");
                }
            }
        }

        // BƯỚC 1: Tạo và lưu AuctionItems
        AuctionItems newItem = new AuctionItems();
        newItem.setSellerId(request.getSellerId());
        newItem.setCategoryId(request.getCategoryId()); // Lưu CategoryID
        newItem.setTitle(request.getTitle());
        newItem.setDescription(request.getDescription());
        newItem.setLocation(request.getLocation());

        // Tạo Slug tự động
        newItem.setSlug(SlugUtils.toSlug(request.getTitle()));

        newItem.setCreatedAt(LocalDateTime.now());
        newItem.setUpdatedAt(LocalDateTime.now());
        newItem.setImgUrl(""); // Lưu tạm rỗng, sẽ update sau khi upload

        // Lưu Item để lấy ID
        newItem = itemRepo.save(newItem);

        // BƯỚC 2: Xử lý Upload Ảnh (Lưu vào bảng ItemImages)
        String mainThumbnail = "";

        if (files != null && files.length > 0) {
            // Tạo thư mục nếu chưa có
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath))
                Files.createDirectories(uploadPath);

            for (int i = 0; i < files.length; i++) {
                MultipartFile file = files[i];
                // Tạo tên file duy nhất
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                String fileUrl = "/uploads/" + fileName;

                // Lưu vào bảng ItemImages
                AuctionImg img = new AuctionImg();
                img.setItemId(newItem.getItemId());
                img.setImgUrl(fileUrl);
                img.setCreatedAt(LocalDateTime.now());

                // Ảnh đầu tiên là ảnh chính (Main)
                if (i == 0) {
                    img.setMain(true);
                    mainThumbnail = fileUrl;
                } else {
                    img.setMain(false);
                }
                imgRepo.save(img);
            }

            // Update ngược lại thumbnail cho Item (để query nhanh)
            newItem.setImgUrl(mainThumbnail); // Cột ImgUrl trong bảng Items
            newItem.setThumbnail(mainThumbnail);
            itemRepo.save(newItem);
        }

        // BƯỚC 3: Tạo và lưu Auctions
        Auction newAuction = new Auction();
        newAuction.setItem(newItem); // Link với Item vừa tạo
        newAuction.setStartingPrice(request.getStartingPrice());
        newAuction.setMinStep(request.getMinStep());
        newAuction.setReservePrice(request.getReservePrice());
        newAuction.setBuyNowPrice(request.getBuyNowPrice());

        // Mặc định giá hiện tại = giá khởi điểm
        newAuction.setCurrentPrice(request.getStartingPrice());

        // Assign start/end directly from request (frontend sends naive LocalDateTime from datetime-local)
        if (request.getStartDate() != null) {
            newAuction.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            newAuction.setEndDate(request.getEndDate());
        }

        // Tự động set trạng thái dựa vào thời gian bắt đầu
        if (newAuction.getStartDate() != null && newAuction.getStartDate().isBefore(LocalDateTime.now())) {
            newAuction.setStatus(AuctionStatus.Open);
        } else {
            newAuction.setStatus(AuctionStatus.Scheduled);
        }

        return auctionRepo.save(newAuction);
    }
}

package com.example.backend.auction_items.image;

import java.time.LocalDateTime;

public class AuctionImgDto {

    private Integer imageId;
    private Integer itemId;
    private String imgUrl;
    private boolean isMain;
    private LocalDateTime createdAt;

    // Getters and Setters
    public Integer getImageId() { return imageId; }
    public void setImageId(Integer imageId) { this.imageId = imageId; }

    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }

    public String getImgUrl() { return imgUrl; }
    public void setImgUrl(String imgUrl) { this.imgUrl = imgUrl; }

    public boolean isMain() { return isMain; }
    public void setMain(boolean main) { isMain = main; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
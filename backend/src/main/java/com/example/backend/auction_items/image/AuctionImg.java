package com.example.backend.auction_items.image;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ItemImages")
public class AuctionImg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ImageID")
    private Integer imageId;

    @Column(name = "ItemID", nullable = false)
    private Integer itemId;

    @Column(name = "ImgUrl", nullable = false, length = 500)
    private String imgUrl;

    @Column(name = "IsMain", nullable = false)
    private boolean isMain = false;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    // getters & setters
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
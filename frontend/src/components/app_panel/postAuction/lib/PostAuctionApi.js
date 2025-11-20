// src/api/postAuctionApi.js
import { postJSON } from "../../../../lib/api_url";

export class PostAuctionApi {
    /**
     * Create a new auction item with images
     * @param {Object} itemData - Item details
     * @param {File[]} images - Array of image files
     * @returns {Promise} API response
     */
    static async createAuctionItem(itemData, images = []) {
        try {
            // Step 1: Create the item
            const itemPayload = {
                title: itemData.title,
                description: itemData.description,
                categoryId: parseInt(itemData.categoryId),
                location: itemData.location || "Unknown",
                slug: this.generateSlug(itemData.title)
            };

            // ✅ Endpoint đúng: /api/items (khớp với AuctionItemsController)
            const itemResponse = await postJSON("/api/items", itemPayload);

            // ✅ Backend trả về { itemId, slug, success }
            const itemId = itemResponse.itemId;

            if (!itemId) {
                throw new Error("Failed to get item ID from response");
            }

            console.log("✅ Item created:", itemResponse);

            // Step 2: Upload images if any
            if (images.length > 0 && itemId) {
                await this.uploadImages(itemId, images);
                console.log("✅ Images uploaded");
            }

            // Step 3: Create the auction
            const auctionPayload = {
                itemId: itemId,
                startingPrice: parseFloat(itemData.startingPrice),
                minStep: itemData.minStep ? parseFloat(itemData.minStep) : 100,
                reservePrice: itemData.reservePrice ? parseFloat(itemData.reservePrice) : null,
                buyNowPrice: itemData.buyNowPrice ? parseFloat(itemData.buyNowPrice) : null,
                // ✅ Format datetime đúng cho LocalDateTime
                startDate: this.formatDateTime(itemData.startDate),
                endDate: this.formatDateTime(itemData.endDate),
                status: "Scheduled"
            };

            // ✅ Endpoint đúng: /api/auctions (khớp với AuctionController)
            const auctionResponse = await postJSON("/api/auctions", auctionPayload);
            console.log("✅ Auction created:", auctionResponse);

            // ✅ Backend trả về AuctionDto object trực tiếp
            return {
                item: itemResponse,
                auction: auctionResponse,
                success: true
            };

        } catch (error) {
            console.error("❌ Error creating auction:", error);

            // ✅ Better error handling
            if (error.response) {
                const errorData = await error.response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed_to_create_auction");
            }

            throw error;
        }
    }

    /**
     * Upload images for an item
     * @param {number} itemId - Item ID
     * @param {File[]} images - Array of image files
     */
    static async uploadImages(itemId, images) {
        const formData = new FormData();

        images.forEach((file) => {
            formData.append("images", file);
        });

        // ✅ Endpoint đúng: /api/items/{itemId}/images
        const response = await fetch(`http://localhost:8081/api/items/${itemId}/images`, {
            method: "POST",
            body: formData,
            credentials: "include"
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || "Failed_to_load_categories");
        }

        return response.json();
    }

    /**
     * Get all categories
     */
    static async getCategories() {
        const response = await fetch("http://localhost:8081/api/categories", {
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch categories: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get images for an item
     * @param {number} itemId - Item ID
     * @returns {Promise<Array>} Array of image objects
     */
    static async getItemImages(itemId) {
        const response = await fetch(`http://localhost:8081/api/items/${itemId}/images`, {
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch images: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get full image URL from relative path
     * @param {string} imgUrl - Relative image URL from backend (e.g., "/uploads/abc.jpg")
     * @returns {string} Full URL (e.g., "http://localhost:8081/uploads/abc.jpg")
     */
    static getFullImageUrl(imgUrl) {
        if (!imgUrl) return "";
        if (imgUrl.startsWith("http")) return imgUrl;
        // Remove leading slash if present to avoid double slash
        const cleanPath = imgUrl.startsWith("/") ? imgUrl : `/${imgUrl}`;
        return `http://localhost:8081${cleanPath}`;
    }

    /**
     * Get main image for an item (first image or imgUrl from item)
     * @param {Object} item - Item object
     * @returns {string} Image URL
     */
    static getItemMainImage(item) {
        // Try to use imgUrl field
        const imgUrl = item?.imgUrl || item?.ImgUrl || item?.thumbnail || item?.Thumbnail;
        if (imgUrl && imgUrl !== "placeholder.jpg") {
            return this.getFullImageUrl(imgUrl);
        }
        // Fallback to placeholder
        return "https://via.placeholder.com/400x300?text=No+Image";
    }

    /**
     * Format datetime for Spring Boot LocalDateTime
     * Converts "2024-01-15T10:30" -> "2024-01-15T10:30:00"
     * @param {string} dateTimeLocal - datetime-local input value
     * @returns {string} ISO formatted datetime
     */
    static formatDateTime(dateTimeLocal) {
        if (!dateTimeLocal) return null;

        // Spring Boot LocalDateTime accepts ISO-8601 format
        // datetime-local input gives "YYYY-MM-DDTHH:mm"
        // We need to add seconds if missing
        if (dateTimeLocal.length === 16) {
            return `${dateTimeLocal}:00`;
        }

        return dateTimeLocal;
    }

    /**
     * Generate URL-friendly slug from title
     * @param {string} title - Item title
     * @returns {string} URL slug
     */
    static generateSlug(title) {
        if (!title) return "";

        return title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
}

export default PostAuctionApi;
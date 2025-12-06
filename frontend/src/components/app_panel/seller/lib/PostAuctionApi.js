// src/api/postAuctionApi.js
import { API_BASE_URL, getToken } from "../../../../lib/api_url.js";

export class PostAuctionApi {
    /**
     * Create a new auction item with images using unified endpoint
     * @param {Object} itemData - Item details
     * @param {File[]} images - Array of image files
     * @returns {Promise} API response
     */
    static async createAuctionItem(itemData, images = []) {
        try {
            const formData = new FormData();

            // Prepare auction request data
            const auctionRequest = {
                title: itemData.title,
                description: itemData.description || "",
                categoryId: parseInt(itemData.categoryId),
                location: itemData.location || "Unknown",
                startingPrice: parseFloat(itemData.startingPrice),
                minStep: itemData.minStep ? parseFloat(itemData.minStep) : 100,
                reservePrice: itemData.reservePrice ? parseFloat(itemData.reservePrice) : null,
                buyNowPrice: itemData.buyNowPrice ? parseFloat(itemData.buyNowPrice) : null,
                startDate: this.formatDateTime(itemData.startDate),
                endDate: this.formatDateTime(itemData.endDate)
            };

            // Add JSON data as string (backend expects 'data' part as String)
            formData.append("data", JSON.stringify(auctionRequest));

            // Add images (backend expects 'files' part)
            if (images && images.length > 0) {
                images.forEach((file) => {
                    formData.append("files", file);
                });
            }

            console.log("📤 Sending auction creation request:", auctionRequest);

            // Call the unified endpoint
            const response = await fetch(`${API_BASE_URL}/api/seller/create-auction`, {
                method: "POST",
                headers: {
                    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
                },
                body: formData,
                credentials: "include"
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || `HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log("✅ Auction created successfully:", result);

            return {
                success: true,
                data: result,
                item: { itemId: result.itemId } // For backward compatibility
            };

        } catch (error) {
            console.error("❌ Error creating auction:", error);
            throw error;
        }
    }

    /**
     * Get all categories
     */
    static async getCategories() {
        const response = await fetch(`${API_BASE_URL}/api/categories`, {
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch categories: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get full image URL from relative path
     * @param {string} imgUrl - Relative image URL from backend
     * @returns {string} Full URL
     */
    static getFullImageUrl(imgUrl) {
        if (!imgUrl) return "";
        if (imgUrl.startsWith("http")) return imgUrl;
        const cleanPath = imgUrl.startsWith("/") ? imgUrl : `/${imgUrl}`;
        return `${API_BASE_URL}${cleanPath}`;
    }

    /**
     * Get main image for an item
     * @param {Object} item - Item object
     * @returns {string} Image URL
     */
    static getItemMainImage(item) {
        const imgUrl = item?.imgUrl || item?.ImgUrl || item?.thumbnail || item?.Thumbnail;
        if (imgUrl && imgUrl !== "placeholder.jpg") {
            return this.getFullImageUrl(imgUrl);
        }
        return "https://via.placeholder.com/400x300?text=No+Image";
    }

    /**
     * Format datetime for Spring Boot LocalDateTime
     * @param {string} dateTimeLocal - datetime-local input value
     * @returns {string} ISO formatted datetime
     */
    static formatDateTime(dateTimeLocal) {
        if (!dateTimeLocal) return null;
        if (dateTimeLocal.length === 16) {
            return `${dateTimeLocal}:00`;
        }
        return dateTimeLocal;
    }
}

export default PostAuctionApi;
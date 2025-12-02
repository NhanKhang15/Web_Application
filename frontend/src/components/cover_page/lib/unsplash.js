// src/api/unsplash.js

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const BASE_URL = "https://api.unsplash.com";

/**
 * Hàm tìm 1 ảnh đầu tiên dựa trên từ khóa (Keyword)
 */
export const searchPhoto = async (query) => {
    if (!query) return null;

    // Cache key dựa trên từ khóa
    const cacheKey = `unsplash_search_${query}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
        return JSON.parse(cachedData);
    }

    try {
        // Gọi API Search, chỉ lấy 1 ảnh (per_page=1)
        const response = await fetch(`${BASE_URL}/search/photos?query=${query}&per_page=1&client_id=${ACCESS_KEY}`);

        if (!response.ok) throw new Error(`Error searching ${query}`);

        const data = await response.json();

        // Lấy ảnh đầu tiên trong kết quả tìm kiếm
        const photoUrl = data.results[0]?.urls?.regular || null;

        if (photoUrl) {
            localStorage.setItem(cacheKey, JSON.stringify(photoUrl));
        }

        return photoUrl;
    } catch (error) {
        console.error("Unsplash Search Error:", error);
        return null;
    }
};

/**
 * Hàm tiện ích để tìm danh sách ảnh từ danh sách từ khóa
 */
export const getPhotosByQueries = async (queries = []) => {
    // Chạy song song các từ khóa
    const promises = queries.map((query) => searchPhoto(query));
    const results = await Promise.all(promises);
    return results;
};
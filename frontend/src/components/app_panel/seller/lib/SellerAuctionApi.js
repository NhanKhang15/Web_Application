// src/components/app_panel/seller/lib/SellerAuctionApi.js
import { API_BASE_URL, getToken } from "../../../../lib/api_url.js";

/**
 * API functions for seller auction actions
 */
export class SellerAuctionApi {
    /**
     * Edit auction details (title, prices)
     */
    static async editAuction(auctionId, data) {
        const response = await fetch(`${API_BASE_URL}/api/seller/auctions/${auctionId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
            },
            body: JSON.stringify(data),
            credentials: "include"
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * End auction early - highest bidder wins
     */
    static async earlyEndAuction(auctionId) {
        const response = await fetch(`${API_BASE_URL}/api/seller/auctions/${auctionId}/early-end`, {
            method: "POST",
            headers: {
                ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
            },
            credentials: "include"
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `HTTP ${response.status}`);
        }

        return response.text();
    }

    /**
     * Cancel auction - refund all bidders
     */
    static async cancelAuction(auctionId) {
        const response = await fetch(`${API_BASE_URL}/api/seller/auctions/${auctionId}/cancel`, {
            method: "POST",
            headers: {
                ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
            },
            credentials: "include"
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `HTTP ${response.status}`);
        }

        return response.text();
    }

    /**
     * Reopen a closed auction with new dates
     */
    static async reopenAuction(auctionId, startDate, endDate) {
        const response = await fetch(`${API_BASE_URL}/api/seller/auctions/${auctionId}/reopen`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
            },
            body: JSON.stringify({
                startDate: startDate,
                endDate: endDate
            }),
            credentials: "include"
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `HTTP ${response.status}`);
        }

        return response.json();
    }
}

export default SellerAuctionApi;

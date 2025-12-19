import { postJSON } from "../../../../lib/api_url.js";

export class BidApi {
    /**
     * Executes the Buy Now action for a specific auction.
     * @param {number|string} auctionId - The ID of the auction.
     * @returns {Promise<any>} - The response from the server.
     */
    static async buyNow(auctionId) {
        return postJSON(`/api/bids/${auctionId}/buy-now`);
    }
}

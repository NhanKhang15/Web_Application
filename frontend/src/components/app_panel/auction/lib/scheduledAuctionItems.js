import { getJSON } from "../../../../lib/api_url";

export async function fetchScheduledAuctionItems({
    page = 0,
    size = 16,
    sort = "createdAt_desc", 
    filters = {}
} = {}) {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort: sort
    });

    // 1. Filter Category
    if (filters.categories && filters.categories.size > 0) {
        params.append("category", Array.from(filters.categories).join(","));
    }

    // 2. Filter Branch/Location
    if (filters.branches && filters.branches.size > 0) {
        params.append("location", Array.from(filters.branches).join(","));
    }

    // 3. Date/Time (Client-side filtering sẽ xử lý nếu cần)
    if (filters.dateFrom) params.append("from", filters.dateFrom);
    if (filters.dateTo) params.append("to", filters.dateTo);

    // 4. Negotiated (Nếu có)
    if (filters.negotiated !== null && filters.negotiated !== undefined) {
        params.append("negotiated", filters.negotiated.toString());
    }

    // Gọi endpoint /api/auctions/scheduled (trả về ScheduledAuctionDto có endDate)
    return getJSON(`/api/auctions/scheduled?${params.toString()}`);
}
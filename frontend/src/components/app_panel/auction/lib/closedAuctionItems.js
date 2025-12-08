import { getJSON } from "../../../../lib/api_url";

export async function fetchClosedAuctionItems({
    page = 0,
    size = 16,
    sort = "endDate, desc", 
    filters = {}
} = {}) {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort: sort
    });

    // 1. Filter Category (Backend nhận List<String>, Frontend gửi String join bằng ',')
    if (filters.categories && filters.categories.size > 0) {
        // Chuyển Set<string> thành chuỗi 'Category A,Category B'
        params.append("category", Array.from(filters.categories).join(","));
    }

    // 2. Filter Branch/Location
    if (filters.branches && filters.branches.size > 0) {
        params.append("location", Array.from(filters.branches).join(","));
    }

    // 3. Date/Time
    if (filters.dateFrom) params.append("from", filters.dateFrom);
    if (filters.dateTo) params.append("to", filters.dateTo);

    // 4. Negotiated (Nếu có)
    if (filters.negotiated !== null && filters.negotiated !== undefined) {
        params.append("negotiated", filters.negotiated.toString());
    }

    // (Bỏ qua types vì chưa có trong backend)

    // Trả về đường dẫn đã có đầy đủ params
    return getJSON(`/api/auctions/ended?${params.toString()}`);
}
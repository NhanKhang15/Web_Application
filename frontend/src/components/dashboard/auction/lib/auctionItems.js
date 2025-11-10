import { getJSON } from "../../../../lib/api_url";

export async function fetchAuctionItems({ page = 0, size = 20, sort = "createdAt,desc" } = {}) {
  const qs = new URLSearchParams({ page, size, sort }).toString();
  return getJSON(`/api/items?${qs}`);
}

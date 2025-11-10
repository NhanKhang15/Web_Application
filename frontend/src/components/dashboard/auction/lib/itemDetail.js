// src/api/itemsApi.js
import { getJSON } from "../../../../lib/api_url";

const qs = (obj = {}) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

export class ItemsApi {
  static getBySlug(slug) {
    return getJSON(`/api/items/by-slug/${encodeURIComponent(slug)}`);
  }

  static getImages(itemId) {
    return getJSON(`/api/items/${itemId}/images`);
  }

}

export default ItemsApi;

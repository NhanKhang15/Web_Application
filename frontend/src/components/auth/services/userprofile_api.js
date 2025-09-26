import { getJSON, putJSON } from "../../../lib/api_url";

export function getCurrentUser() {
  try {
    const raw = JSON.parse(sessionStorage.getItem("user") || "{}");
    return {
      userId: raw?.userId ?? raw?.id ?? null, 
      username: raw?.username ?? raw?.name ?? "",
      email: raw?.email ?? "",
    };
  } catch {
    return {};
  }
}

export async function getProfileByUserId(userId) {
  return getJSON(`/api/profile/${userId}`);
}

export async function getProfileByUsername(username) {
  return getJSON(`/api/profile/by-username/${encodeURIComponent(username)}`);
}

export async function upsertProfile(userId, payload) {
  return putJSON(`/api/profile/${userId}`, payload);
}

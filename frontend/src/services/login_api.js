import { postJSON } from "../lib/api_url";

/** Gọi /api/login theo format backend của bạn */
export async function login({ username, password }) {
  return postJSON("/api/login", { username, password });
}

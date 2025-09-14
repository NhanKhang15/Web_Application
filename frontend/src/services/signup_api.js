import { postJSON } from "../lib/api_url";

// đã có login(...) ở đây rồi, giờ thêm:
export async function signup({ username, email, password }) {
  return postJSON("/api/signup", { username, email, password });
}

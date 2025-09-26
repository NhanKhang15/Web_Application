import { API_BASE_URL, postJSON, setToken } from "../../../lib/api_url";

export async function loginLocal({ username, password }) {
  const res = await postJSON("/api/login", { username, password });

  if (res?.success) {
    // Cookie JSESSIONID đã được browser tự lưu (do credentials: "include")
    // -> chỉ cần return res thôi
    console.log("Login OK, cookie stored by browser");
  } else {
    console.error("Login failed:", res?.message);
  }

  return res;
}

export function startGoogleLogin() {
  // Mở flow OAuth2 (backend sẽ redirect về FE: /auth/callback?token=...)
  window.location.assign(`${API_BASE_URL}/oauth2/authorization/google`);
}

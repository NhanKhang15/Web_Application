import { postJSON } from "../../../lib/api_url";

/**
 * Gửi yêu cầu gửi email xác thực đến server
 * @param {string} email
 * @returns {Promise<any>} response data
 */
export async function requestEmailVerification(email) {
  const trimmed = (email || "").trim();

  if (!trimmed) {
    throw new Error("Email không được để trống");
  }

  // validate sơ
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    throw new Error("Email không hợp lệ");
  }

  const payload = { email: trimmed };

  const data = await postJSON("/auth/resend-verification-email", payload);

  // tuỳ backend bạn trả gì, ở đây check sơ success/message
  if (data?.error) {
    throw new Error(data.error || "Gửi yêu cầu xác thực thất bại");
  }

  return data;
}

/**
 * Gửi mã xác thực để verify email
 * @param {string} email
 * @param {string} code
 * @returns {Promise<any>}
 */
export async function verifyEmail(email, code) {
  const e = (email || "").trim();
  const c = (code || "").trim();

  if (!e || !c) {
    throw new Error("Email và mã xác thực không được để trống");
  }

  // Backend dùng @RequestParam nên ta nối query string
  // POST /auth/verify-email?email=...&code=...
  const params = new URLSearchParams({ email: e, code: c });
  const url = `/auth/verify-email?${params.toString()}`;

  // Body để null hoặc {} tuỳ postJSON, nhưng quan trọng là query params
  const data = await postJSON(url, {}); 
  
  if (data?.error) {
    throw new Error(data.error || "Xác thực thất bại");
  }
  return data;
}

/**
 * Đổi email nếu người dùng nhập sai
 * @param {string} currentEmail
 * @param {string} newEmail
 * @returns {Promise<any>}
 */
export async function changeEmail(currentEmail, newEmail) {
  const c = (currentEmail || "").trim();
  const n = (newEmail || "").trim();

  if (!c || !n) {
    throw new Error("Email không được để trống");
  }

  const payload = { currentEmail: c, newEmail: n };
  const data = await postJSON("/api/change-email", payload);

  if (data?.success === false) {
     throw new Error(data.message || "Đổi email thất bại");
  }

  return data;
}

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").replace(/\/+$/, "");

// ----- Auth helpers -----
export function getToken() {
  return sessionStorage.getItem("token") || "";
}
export function setToken(t) {
  if (t) sessionStorage.setItem("token", t);
}
export function clearToken() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}

// ----- Internal helpers -----
const joinUrl = (base, path) => `${base}${path.startsWith("/") ? "" : "/"}${path}`;
const authHeader = () => (getToken() ? { Authorization: `Bearer ${getToken()}` } : {});

// parse JSON hoặc text; ném Error kèm status + data
async function handleResponse(res) {
  const raw = await res.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw || null; }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      res.statusText ||
      `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data; // có thể là object hoặc null (204)
}

// Core JSON request (DRY)
async function requestJSON(method, path, body, opts = {}) {
  const headers = {
    ...(body != null ? { "Content-Type": "application/json" } : {}), // chỉ set khi có body
    ...authHeader(),
    ...(opts.headers || {}),
  };

  const res = await fetch(joinUrl(API_BASE_URL, path), {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    credentials: "include",
    ...opts,
  });

  return handleResponse(res);
}

// ----- Public JSON helpers (giữ API cũ) -----
export function getJSON(path, opts) {
  return requestJSON("GET", path, undefined, opts);
}
export function postJSON(path, body, opts) {
  return requestJSON("POST", path, body, opts);
}
export function putJSON(path, body, opts) {
  return requestJSON("PUT", path, body, opts);
}

// export function patchJSON(path, body, opts) {
//   return requestJSON("PATCH", path, body, opts);
// }
// export function deleteJSON(path, opts) {
//   return requestJSON("DELETE", path, undefined, opts);
// }

// ----- multipart/form-data (upload file) -----
export async function postFormData(path, formData, opts = {}) {
  const headers = {
    ...authHeader(),
    ...(opts.headers || {}),
    // KHÔNG set Content-Type cho form-data → browser sẽ tự gắn boundary
  };

  const res = await fetch(joinUrl(API_BASE_URL, path), {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
    ...opts,
  });

  return handleResponse(res);
}

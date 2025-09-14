export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export async function postJSON(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data = null;
  try { data = await res.json(); } catch { /* ignore */ }

  if (!res.ok && !data) {
    throw new Error(`HTTP ${res.status}`);
  }
  return data;
}

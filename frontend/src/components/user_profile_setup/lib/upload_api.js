import { postFormData } from "../../../lib/api_url";

export async function uploadAvatar(file) {
  if (!file) return ""; 
  const form = new FormData();
  form.append("file", file);

  const data = await postFormData("/api/files/upload", form);
  if (!data?.success || !data?.url) {
    throw new Error(data?.message || "Upload avatar thất bại");
  }
  return data.url;
}

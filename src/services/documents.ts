import { apiFetch, type ApiSuccess } from "@/lib/api";

export async function uploadDocument(file: File, type: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  return apiFetch<ApiSuccess<{ url: string }>>("/api/documents/upload", {
    method: "POST",
    body: formData,
  });
}

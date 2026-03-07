// ─── Messages API service ─────────────────────────────────────
import { apiFetch, type ApiPaginated, type ApiSuccess } from "@/lib/api";

export interface ApiMessage {
  id: string;
  senderId: string;
  receiverId: string;
  propertyId: string | null;
  content: string;
  createdAt: string;
  sender?: { id: string; name: string };
  receiver?: { id: string; name: string };
}

export interface SendMessageData {
  receiverId: string;
  content: string;
  propertyId?: string;
}

/**
 * Fetch messages for the current user.
 * If userId is provided, it returns the conversation with that user.
 */
export async function fetchMessages(partnerId?: string, page = 1) {
  const query = new URLSearchParams();
  if (partnerId) query.set("userId", partnerId);
  query.set("page", String(page));
  query.set("limit", "50");

  return apiFetch<ApiPaginated<ApiMessage>>(`/api/messages?${query.toString()}`);
}

/**
 * Fetch unread message count for the authenticated user.
 */
export async function fetchUnreadCount() {
  const res = await apiFetch<ApiSuccess<{ count: number }>>("/api/messages/unread");
  return res.data.count;
}

/**
 * Send a new message.
 */
export async function sendMessage(data: SendMessageData) {
  return apiFetch<ApiSuccess<ApiMessage>>("/api/messages", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

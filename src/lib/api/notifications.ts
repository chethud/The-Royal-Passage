import { apiFetch } from "@/lib/api/client";

export type NotificationSummary = {
  id: string;
  type: string;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

export function fetchNotifications(accessToken: string) {
  return apiFetch<NotificationSummary[]>("/api/v1/notifications", { accessToken });
}

export function markNotificationRead(accessToken: string, notificationId: string) {
  return apiFetch<NotificationSummary>(`/api/v1/notifications/${notificationId}/read`, {
    method: "POST",
    accessToken,
  });
}

export function markAllNotificationsRead(accessToken: string) {
  return apiFetch<{ ok: boolean; count: number }>("/api/v1/notifications/read-all", {
    method: "POST",
    accessToken,
  });
}

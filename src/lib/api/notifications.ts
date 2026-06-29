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

function normalizeNotification(raw: NotificationSummary): NotificationSummary {
  return {
    id: String(raw.id ?? ""),
    type: String(raw.type ?? ""),
    title: String(raw.title ?? ""),
    body: String(raw.body ?? ""),
    metadata:
      raw.metadata && typeof raw.metadata === "object" && !Array.isArray(raw.metadata)
        ? { ...raw.metadata }
        : {},
    readAt: raw.readAt != null ? String(raw.readAt) : null,
    createdAt: String(raw.createdAt ?? ""),
  };
}

export function fetchNotifications(accessToken: string) {
  return apiFetch<NotificationSummary[]>("/api/v1/notifications", { accessToken }).then((rows) =>
    rows.map((row) => normalizeNotification(row)),
  );
}

export function markNotificationRead(accessToken: string, notificationId: string) {
  return apiFetch<NotificationSummary>(`/api/v1/notifications/${notificationId}/read`, {
    accessToken,
    method: "POST",
  }).then((row) => normalizeNotification(row));
}

export function markAllNotificationsRead(accessToken: string) {
  return apiFetch<{ ok: boolean; count: number }>("/api/v1/notifications/read-all", {
    accessToken,
    method: "POST",
  });
}

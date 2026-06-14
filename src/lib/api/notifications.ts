import { create } from "@bufbuild/protobuf";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import { MarkNotificationReadRequestSchema } from "@/gen/royalpassage/v1/service_pb";

export type NotificationSummary = {
  id: string;
  type: string;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

function normalizeNotification(raw: {
  id?: string;
  type?: string;
  title?: string;
  body?: string;
  metadata?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt?: string;
}): NotificationSummary {
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
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listNotifications({});
    return response.notifications.map((row) => normalizeNotification(row));
  });
}

export function markNotificationRead(accessToken: string, notificationId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const result = await client.markNotificationRead(
      create(MarkNotificationReadRequestSchema, { notificationId }),
    );
    return normalizeNotification(result);
  });
}

export function markAllNotificationsRead(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() => client.markAllNotificationsRead({}));
}

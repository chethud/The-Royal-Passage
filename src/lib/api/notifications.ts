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

export function fetchNotifications(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listNotifications({});
    return response.notifications as NotificationSummary[];
  });
}

export function markNotificationRead(accessToken: string, notificationId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.markNotificationRead(create(MarkNotificationReadRequestSchema, { notificationId })),
  ) as Promise<NotificationSummary>;
}

export function markAllNotificationsRead(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() => client.markAllNotificationsRead({}));
}

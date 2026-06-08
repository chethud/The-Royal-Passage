import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isApiConfigured } from "@/lib/api/client";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationSummary,
} from "@/lib/api/notifications";

export type { NotificationSummary };

const tokenSchema = z.object({ accessToken: z.string().min(1) });

export const listNotifications = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema)
  .handler(async ({ data }): Promise<NotificationSummary[]> => {
    if (!isApiConfigured()) return [];
    return fetchNotifications(data.accessToken);
  });

export const readNotification = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema.extend({ notificationId: z.string().min(1) }))
  .handler(async ({ data }): Promise<NotificationSummary> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return markNotificationRead(data.accessToken, data.notificationId);
  });

export const readAllNotifications = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema)
  .handler(async ({ data }): Promise<{ ok: boolean; count: number }> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return markAllNotificationsRead(data.accessToken);
  });

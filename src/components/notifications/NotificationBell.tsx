import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthUser } from "@/lib/auth-user";
import { isApiConfigured } from "@/lib/api/client";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationSummary,
} from "@/lib/api/notifications";

export function NotificationBell() {
  const { user, accessToken } = useAuthUser();
  const [items, setItems] = useState<NotificationSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user || !accessToken || !isApiConfigured()) return;
    setLoading(true);
    try {
      const rows = await fetchNotifications(accessToken);
      setItems(rows);
    } catch {
      // optional UI
    } finally {
      setLoading(false);
    }
  }, [accessToken, user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!user) return null;

  const unread = items.filter((item) => !item.readAt).length;

  const handleOpen = (open: boolean) => {
    if (open) void load();
  };

  const markRead = async (id: string) => {
    if (!accessToken) return;
    await markNotificationRead(accessToken, id);
    await load();
  };

  const markAll = async () => {
    if (!accessToken) return;
    await markAllNotificationsRead(accessToken);
    await load();
  };

  return (
    <DropdownMenu onOpenChange={handleOpen}>
      <DropdownMenuTrigger
        className="relative rounded-sm p-2 text-ink/80 transition-colors hover:text-ember"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-bold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em]">Notifications</span>
          {unread > 0 ? (
            <button type="button" onClick={() => void markAll()} className="text-xs text-ember">
              Mark all read
            </button>
          ) : null}
        </div>
        {loading ? (
          <div className="px-3 py-4 text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="px-3 py-4 text-sm text-muted-foreground">No notifications yet.</div>
        ) : (
          items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className={`flex flex-col items-start gap-1 py-3 ${item.readAt ? "opacity-70" : ""}`}
              onClick={() => void markRead(item.id)}
            >
              <span className="font-medium">{item.title}</span>
              <span className="text-xs text-muted-foreground">{item.body}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

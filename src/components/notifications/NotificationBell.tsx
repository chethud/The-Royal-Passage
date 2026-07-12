import { Bell } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

const POLL_MS = 90_000;
const CLIENT_FRESH_MS = 20_000;

export function NotificationBell() {
  const { user, accessToken } = useAuthUser();
  const [items, setItems] = useState<NotificationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const lastLoadedAt = useRef(0);
  const inFlight = useRef<Promise<void> | null>(null);

  const load = useCallback(
    async (options?: { force?: boolean }) => {
      if (!user || !accessToken || !isApiConfigured()) return;
      const now = Date.now();
      if (!options?.force && now - lastLoadedAt.current < CLIENT_FRESH_MS) return;
      if (inFlight.current) return inFlight.current;

      setLoading(true);
      const request = (async () => {
        try {
          const rows = await fetchNotifications(accessToken, 20);
          setItems(rows);
          lastLoadedAt.current = Date.now();
        } catch {
          // optional UI
        } finally {
          setLoading(false);
          inFlight.current = null;
        }
      })();
      inFlight.current = request;
      return request;
    },
    [accessToken, user],
  );

  useEffect(() => {
    void load({ force: true });
    const id = window.setInterval(() => void load({ force: true }), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  if (!user) return null;

  const unread = items.filter((item) => !item.readAt).length;

  const handleOpen = (open: boolean) => {
    if (open) void load();
  };

  const markRead = async (id: string) => {
    if (!accessToken) return;
    const readAt = new Date().toISOString();
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, readAt } : item)));
    try {
      await markNotificationRead(accessToken, id);
      lastLoadedAt.current = 0;
    } catch {
      await load({ force: true });
    }
  };

  const markAll = async () => {
    if (!accessToken) return;
    const readAt = new Date().toISOString();
    setItems((prev) => prev.map((item) => ({ ...item, readAt: item.readAt ?? readAt })));
    try {
      await markAllNotificationsRead(accessToken);
      lastLoadedAt.current = 0;
    } catch {
      await load({ force: true });
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpen}>
      <DropdownMenuTrigger
        className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm text-ink/80 transition-colors hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-bold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(20rem,calc(100vw-1.5rem))] max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em]">Notifications</span>
          {unread > 0 ? (
            <button type="button" onClick={() => void markAll()} className="text-xs text-ember">
              Mark all read
            </button>
          ) : null}
        </div>
        {loading && items.length === 0 ? (
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

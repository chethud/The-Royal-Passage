import { useNavigate } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { skipVipMembershipInterest, shouldPromptVipMembership } from "@/lib/api/vip-membership";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useAuthUser } from "@/lib/auth-user";
import { isGuestAccount } from "@/lib/roles";
import { markVipPromptDismissed } from "@/lib/vip-membership-prompt-storage";

export function VipMembershipPrompt() {
  const navigate = useNavigate();
  const {
    user,
    role,
    accessToken,
    loading,
    vipMembershipStatus,
    guestCreatedAt,
    refreshVipMembershipStatus,
  } = useAuthUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissedLocally, setDismissedLocally] = useState(false);

  const shouldShow =
    !loading &&
    Boolean(user?.id) &&
    isGuestAccount(role) &&
    Boolean(accessToken) &&
    !dismissedLocally &&
    shouldPromptVipMembership(vipMembershipStatus, user?.id, guestCreatedAt);

  const persistDismissal = async () => {
    if (!user?.id) return;
    markVipPromptDismissed(user.id);
    setDismissedLocally(true);
    if (!accessToken || !isApiConfigured()) return;
    await skipVipMembershipInterest(accessToken);
    await refreshVipMembershipStatus();
  };

  const handleSkip = async () => {
    if (!accessToken) return;
    setBusy(true);
    setError(null);
    try {
      await persistDismissal();
    } catch (err) {
      setError(toErrorMessage(err, "Could not save your preference."));
    } finally {
      setBusy(false);
    }
  };

  const handleContinue = async () => {
    if (!accessToken) return;
    setBusy(true);
    setError(null);
    try {
      await persistDismissal();
      void navigate({ to: "/account/vip-apply" });
    } catch (err) {
      setError(toErrorMessage(err, "Could not save your preference."));
    } finally {
      setBusy(false);
    }
  };

  if (!shouldShow) return null;

  return (
    <Dialog open onOpenChange={() => undefined}>
      <DialogContent className="max-w-md border-[rgb(74_0_0/0.2)] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Crown className="h-5 w-5 text-ember" aria-hidden />
            Royal VIP membership
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Would you like to apply for VIP access to curated Mysuru packages? Membership requires
            Aadhaar verification. You can skip this and continue booking experiences as usual.
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="luxury-btn-sm luxury-btn-panel-outline w-full sm:w-auto"
            disabled={busy}
            onClick={() => void handleSkip()}
          >
            Skip for now
          </button>
          <button
            type="button"
            className="luxury-btn-sm luxury-btn-primary w-full sm:w-auto"
            disabled={busy}
            onClick={() => void handleContinue()}
          >
            I&apos;m interested
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

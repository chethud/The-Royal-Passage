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

export function VipMembershipPrompt() {
  const navigate = useNavigate();
  const { user, role, accessToken, loading, vipMembershipStatus, refreshVipMembershipStatus } =
    useAuthUser();
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shouldShow =
    !loading &&
    Boolean(user) &&
    isGuestAccount(role) &&
    Boolean(accessToken) &&
    shouldPromptVipMembership(vipMembershipStatus) &&
    open;

  const handleSkip = async () => {
    if (!accessToken) return;
    setBusy(true);
    setError(null);
    try {
      if (isApiConfigured()) {
        await skipVipMembershipInterest(accessToken);
        await refreshVipMembershipStatus();
      }
      setOpen(false);
    } catch (err) {
      setError(toErrorMessage(err, "Could not save your preference."));
    } finally {
      setBusy(false);
    }
  };

  const handleContinue = () => {
    setOpen(false);
    void navigate({ to: "/account/vip-apply" });
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
            Would you like to apply for VIP access to curated Mysuru packages and bespoke concierge
            itineraries? You can skip this and continue booking experiences as usual.
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
            onClick={handleContinue}
          >
            I&apos;m interested
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

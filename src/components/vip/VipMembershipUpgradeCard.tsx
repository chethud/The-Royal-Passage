import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import {
  canReapplyForVip,
  formatVipReapplyDate,
  isApprovedVipMember,
} from "@/lib/api/vip-membership";

type VipMembershipUpgradeCardProps = {
  status: string;
  rejectedAt?: string | null;
};

export function VipMembershipUpgradeCard({ status, rejectedAt = null }: VipMembershipUpgradeCardProps) {
  if (isApprovedVipMember(status)) {
    return (
      <section className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <Crown className="mt-0.5 h-5 w-5 shrink-0 text-ember" aria-hidden />
          <div className="space-y-3">
            <div>
              <p className="eyebrow text-ember/90">Royal VIP member</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                You have access to curated Mysuru packages and bespoke concierge itineraries.
              </p>
            </div>
            <Link
              to="/member/vip"
              className="inline-flex rounded-sm bg-ember px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] no-underline transition-all hover:brightness-110"
            >
              Open VIP member area
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (status === "pending") {
    return (
      <section className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <Crown className="mt-0.5 h-5 w-5 shrink-0 text-ember" aria-hidden />
          <div>
            <p className="eyebrow text-ember/90">VIP application</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your Royal VIP membership application is under review. Our concierge will notify you
              once approved.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const reapplyAllowed = canReapplyForVip(status, rejectedAt);
  const reapplyDate = formatVipReapplyDate(rejectedAt);

  return (
    <section className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <Crown className="mt-0.5 h-5 w-5 shrink-0 text-ember" aria-hidden />
        <div className="space-y-3">
          <div>
            <p className="eyebrow text-ember/90">Upgrade to Royal VIP</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Apply for VIP membership to unlock curated Mysuru packages, bespoke itineraries, and
              concierge support. Aadhaar verification is required.
            </p>
            {status === "rejected" ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {reapplyAllowed
                  ? "Your previous application was not approved. You may submit a new application with updated details."
                  : `Your previous application was not approved. You may reapply after ${reapplyDate ?? "the waiting period ends"}.`}
              </p>
            ) : null}
          </div>
          {reapplyAllowed ? (
            <Link
              to="/account/vip-apply"
              className="inline-flex rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-4 py-2.5 text-sm font-medium uppercase tracking-[0.12em] text-foreground no-underline transition-colors hover:border-ember/50 hover:text-ember"
            >
              Apply for VIP membership
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

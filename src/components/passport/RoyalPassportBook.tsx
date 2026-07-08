import passportSpreadUrl from "@/assets/passport/royal-passport-parchment-spread.png";
import passportPageBorderUrl from "@/assets/passport/royal-passport-page-border.png";
import passportCrestLogoUrl from "@/assets/passport/royal-passport-crest-logo.png";
import passportProfileHeadingUrl from "@/assets/passport/royal-passport-profile-heading-ref.png";
import passportWaxSealUrl from "@/assets/passport/royal-passport-wax-seal.png";
import passportEndorsementsDividerUrl from "@/assets/passport/royal-passport-endorsements-divider.png";
import { PassportPhotoFrame } from "@/components/passport/PassportPhotoFrame";
import { Link } from "@tanstack/react-router";
import {
  canReapplyForVip,
  formatVipReapplyDate,
  isApprovedVipMember,
} from "@/lib/api/vip-membership";

type VipStepState = "upcoming" | "current" | "done";

function vipNodeClass(state: VipStepState, modifier?: "rejected" | "accepted" | "loading") {
  const classes = ["royal-passport-book__vip-node"];
  if (state === "current") classes.push("royal-passport-book__vip-node--current");
  if (state === "done") classes.push("royal-passport-book__vip-node--done");
  if (modifier === "rejected") classes.push("royal-passport-book__vip-node--rejected");
  if (modifier === "accepted") classes.push("royal-passport-book__vip-node--accepted");
  if (modifier === "loading") classes.push("royal-passport-book__vip-node--loading");
  return classes.join(" ");
}

function vipLineClass(leftState: VipStepState, rightState: VipStepState, loading?: boolean) {
  const classes = ["royal-passport-book__vip-line"];
  if (leftState === "done" && (rightState === "done" || rightState === "current")) {
    classes.push("royal-passport-book__vip-line--done");
  }
  if (loading) classes.push("royal-passport-book__vip-line--loading");
  return classes.join(" ");
}

function vipLabelClass(state: VipStepState, modifier?: "rejected" | "accepted") {
  const classes = ["royal-passport-book__vip-label"];
  if (state === "current") classes.push("royal-passport-book__vip-label--current");
  if (state === "done") classes.push("royal-passport-book__vip-label--done");
  if (modifier === "rejected") classes.push("royal-passport-book__vip-label--rejected");
  if (modifier === "accepted") classes.push("royal-passport-book__vip-label--accepted");
  return classes.join(" ");
}

function PassportVipStatusTrack({
  status,
  rejectedAt,
}: {
  status: string;
  rejectedAt: string | null;
}) {
  const approved = isApprovedVipMember(status);
  const pending = status === "pending";
  const rejected = status === "rejected";
  const reapplyAllowed = canReapplyForVip(status, rejectedAt);
  const canApply = !approved && !pending && (!rejected || reapplyAllowed);

  const applyState: VipStepState = canApply ? "current" : "done";
  const applyLabel = applyState === "done" ? "Applied" : "Apply";
  const reviewingState: VipStepState = pending ? "current" : approved || rejected ? "done" : "upcoming";
  const outcomeState: VipStepState = approved || rejected ? "current" : "upcoming";
  const outcomeLabel = rejected ? "Rejected" : "Accepted";
  const outcomeModifier = rejected ? "rejected" : approved ? "accepted" : undefined;

  const statusMessage = approved
    ? null
    : pending
      ? "Your Royal VIP application is under review."
      : rejected
        ? reapplyAllowed
          ? "Your previous application was not approved. Tap Apply to submit again."
          : `You may reapply after ${formatVipReapplyDate(rejectedAt) ?? "the waiting period ends"}.`
        : canApply
          ? "Tap Apply to begin your Royal VIP application."
          : null;

  const applyLabelNode = canApply ? (
    <Link to="/account/vip-apply" className={vipLabelClass(applyState)}>
      {applyLabel}
    </Link>
  ) : (
    <span className={vipLabelClass(applyState)}>{applyLabel}</span>
  );

  return (
    <div className="royal-passport-book__vip-status" aria-label="Royal VIP application status">
      <div className="royal-passport-book__vip-rail" role="list">
        <span className={vipNodeClass(applyState)} role="listitem" aria-label={applyLabel} />
        <span
          className={vipLineClass(applyState, reviewingState, pending)}
          aria-hidden
        />
        <span
          className={vipNodeClass(reviewingState, pending ? "loading" : undefined)}
          role="listitem"
          aria-current={pending ? "step" : undefined}
          aria-label="Reviewing"
        />
        <span className={vipLineClass(reviewingState, outcomeState)} aria-hidden />
        <span
          className={vipNodeClass(outcomeState, outcomeModifier)}
          role="listitem"
          aria-current={approved || rejected ? "step" : undefined}
          aria-label={outcomeLabel}
        />
      </div>

      <div className="royal-passport-book__vip-labels">
        <div className="royal-passport-book__vip-label-slot">{applyLabelNode}</div>
        <div className="royal-passport-book__vip-label-slot">
          <span className={vipLabelClass(reviewingState)}>Reviewing</span>
        </div>
        <div className="royal-passport-book__vip-label-slot">
          <span className={vipLabelClass(outcomeState, outcomeModifier)}>{outcomeLabel}</span>
        </div>
      </div>

      {statusMessage ? (
        <p className="royal-passport-book__vip-status-message">{statusMessage}</p>
      ) : null}
    </div>
  );
}

export type PassportMobilePage = "identity" | "vip";

type RoyalPassportBookProps = {
  regNo: string;
  fullName: string;
  dateOfBirth: string;
  domicile: string;
  email: string | null;
  phone: string;
  vipMembershipStatus: string;
  vipMembershipRejectedAt: string | null;
  photoUrl: string | null;
  photoProcessing: boolean;
  /** Mobile: show identity or VIP endorsements page full-width. Ignored on desktop. */
  mobilePage?: PassportMobilePage;
  onFullNameChange: (value: string) => void;
  onDateOfBirthChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onPhotoSelected: (file: File) => void;
};

/** Parchment spread + user-provided ornate page borders. */
export function RoyalPassportBook({
  regNo,
  fullName,
  dateOfBirth,
  phone,
  vipMembershipStatus,
  vipMembershipRejectedAt,
  photoUrl,
  photoProcessing,
  mobilePage = "identity",
  onFullNameChange,
  onDateOfBirthChange,
  onPhoneChange,
  onPhotoSelected,
}: RoyalPassportBookProps) {
  return (
    <div className="royal-passport-scene" data-mobile-page={mobilePage}>
      <div
        className="royal-passport-book"
        aria-label={
          mobilePage === "vip"
            ? "Royal passport — VIP endorsements"
            : "Royal identity passport book"
        }
      >
        <img
          src={passportSpreadUrl}
          alt=""
          className="royal-passport-book__spread-art"
          decoding="async"
          draggable={false}
        />

        <div className="royal-passport-book__page-frames" aria-hidden>
          <img
            src={passportPageBorderUrl}
            alt=""
            className="royal-passport-book__page-border royal-passport-book__page-border--left"
            decoding="async"
            draggable={false}
          />
          <img
            src={passportPageBorderUrl}
            alt=""
            className="royal-passport-book__page-border royal-passport-book__page-border--right"
            decoding="async"
            draggable={false}
          />
        </div>

        <img
          src={passportCrestLogoUrl}
          alt="The Royal Passage Mysuru"
          className="royal-passport-book__left-crest"
          decoding="async"
          draggable={false}
        />
        <div className="royal-passport-book__left-title" role="heading" aria-level={2}>
          <span className="sr-only">Profile</span>
          <img
            src={passportProfileHeadingUrl}
            alt=""
            className="royal-passport-book__left-title-art"
            decoding="async"
            draggable={false}
          />
        </div>

        <div className="royal-passport-book__left-overlay">
          <div className="royal-passport-book__cert-heading" role="heading" aria-level={3}>
            <span className="royal-passport-book__cert-rule" aria-hidden />
            <span className="royal-passport-book__cert-title">Identity Certificate</span>
            <span className="royal-passport-book__cert-rule" aria-hidden />
          </div>

          <div className="royal-passport-book__portrait-slot">
            <PassportPhotoFrame
              photoUrl={photoUrl}
              processing={photoProcessing}
              onFileSelected={onPhotoSelected}
            />
          </div>

          <div className="royal-passport-book__fields">
            <div className="royal-passport-book__field royal-passport-book__field--name">
              <label htmlFor="passport-full-name" className="royal-passport-book__label">
                Full name
              </label>
              <input
                id="passport-full-name"
                value={fullName}
                onChange={(event) => onFullNameChange(event.target.value)}
                className="royal-passport-book__input"
                placeholder="Your full name"
                autoComplete="name"
              />
            </div>

            <div className="royal-passport-book__field royal-passport-book__field--dob">
              <label htmlFor="passport-date-of-birth" className="royal-passport-book__label">
                Date of birth
              </label>
              <input
                id="passport-date-of-birth"
                type="date"
                value={dateOfBirth}
                onChange={(event) => onDateOfBirthChange(event.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="royal-passport-book__input royal-passport-book__input--date"
              />
            </div>

            <div className="royal-passport-book__field royal-passport-book__field--phone">
              <label htmlFor="passport-phone" className="royal-passport-book__label">
                Phone number
              </label>
              <input
                id="passport-phone"
                value={phone}
                onChange={(event) => onPhoneChange(event.target.value)}
                className="royal-passport-book__input"
                placeholder="Phone number"
                autoComplete="tel"
              />
            </div>
          </div>
        </div>

        <img
          src={passportWaxSealUrl}
          alt="Royal wax seal"
          className="royal-passport-book__right-seal"
          decoding="async"
          draggable={false}
        />

        <p className="royal-passport-book__reg" aria-label={`Registration number ${regNo}`}>
          {regNo}
        </p>

        <div className="royal-passport-book__endorsements-heading" role="heading" aria-level={3}>
          <span className="royal-passport-book__endorsements-title">Official Endorsements</span>
          <img
            src={passportEndorsementsDividerUrl}
            alt=""
            className="royal-passport-book__endorsements-flourish"
            decoding="async"
            draggable={false}
          />
        </div>

        <div className="royal-passport-book__right-panel" aria-label="Royal privileges and VIP endorsement">
          <p className="royal-passport-book__privileges-kicker">Royal Privileges</p>
          <div className="royal-passport-book__privileges-rule" aria-hidden />

          <p className="royal-passport-book__privileges-lead">
            {isApprovedVipMember(vipMembershipStatus) ? "Royal VIP member" : "Become a Royal VIP"}
          </p>
          <p className="royal-passport-book__privileges-copy">
            {isApprovedVipMember(vipMembershipStatus)
              ? "Curated Mysuru packages and bespoke concierge itineraries are active on this passport."
              : "Unlock exclusive palace experiences, private heritage tours, priority reservations, and personalized concierge services."}
          </p>

          <PassportVipStatusTrack
            status={vipMembershipStatus}
            rejectedAt={vipMembershipRejectedAt}
          />

          {isApprovedVipMember(vipMembershipStatus) ? (
            <Link to="/member/vip" className="royal-passport-book__vip-cta">
              Open VIP member area
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

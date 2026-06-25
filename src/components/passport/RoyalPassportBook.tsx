import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import logoUrl from "@/assets/logo/logo.png";
import { PassportPhotoFrame } from "@/components/passport/PassportPhotoFrame";
import { isApprovedVipMember } from "@/lib/api/vip-membership";

type RoyalPassportBookProps = {
  regNo: string;
  fullName: string;
  dateOfBirth: string;
  domicile: string;
  email: string | null;
  phone: string;
  vipMembershipStatus: string;
  photoUrl: string | null;
  photoProcessing: boolean;
  onFullNameChange: (value: string) => void;
  onDateOfBirthChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onPhotoSelected: (file: File) => void;
};

function todayStamp(): string {
  return new Date()
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

export function RoyalPassportBook({
  regNo,
  fullName,
  dateOfBirth,
  domicile,
  email,
  phone,
  vipMembershipStatus,
  photoUrl,
  photoProcessing,
  onFullNameChange,
  onDateOfBirthChange,
  onPhoneChange,
  onPhotoSelected,
}: RoyalPassportBookProps) {
  const displayName = fullName.trim() || "—";

  return (
    <div className="royal-passport-scene">
      <div className="royal-passport-book" aria-label="Royal identity passport book">
        <div className="royal-passport-book__binding" aria-hidden />
        <div className="royal-passport-book__spread">
          <section className="royal-passport-book__page royal-passport-book__page--left" aria-label="Identity certificate">
            <p className="royal-passport-book__reg">REG. NO: {regNo}</p>

            <div className="royal-passport-book__crest">
              <img src={logoUrl} alt="" className="royal-passport-book__crest-logo" decoding="async" />
            </div>

            <h2 className="royal-passport-book__title">Identity Certificate</h2>

            <div className="royal-passport-book__identity-grid">
              <PassportPhotoFrame
                photoUrl={photoUrl}
                processing={photoProcessing}
                onFileSelected={onPhotoSelected}
              />

              <div className="royal-passport-book__fields">
                <div className="royal-passport-book__field">
                  <span className="royal-passport-book__label">Full name</span>
                  <input
                    id="passport-full-name"
                    value={fullName}
                    onChange={(event) => onFullNameChange(event.target.value)}
                    className="royal-passport-book__value royal-passport-book__input"
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </div>
                <div className="royal-passport-book__field">
                  <span className="royal-passport-book__label">Date of nativity</span>
                  <input
                    id="passport-date-of-birth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(event) => onDateOfBirthChange(event.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                    className="royal-passport-book__value royal-passport-book__input royal-passport-book__input--date"
                  />
                </div>
                <div className="royal-passport-book__field">
                  <span className="royal-passport-book__label">Domicile</span>
                  <span className="royal-passport-book__value">{domicile}</span>
                </div>
                {email ? (
                  <div className="royal-passport-book__field royal-passport-book__field--email">
                    <span className="royal-passport-book__label">Registry email</span>
                    <span className="royal-passport-book__value royal-passport-book__value--small">{email}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="royal-passport-book__palace" aria-hidden>
              <svg viewBox="0 0 360 72" className="royal-passport-book__palace-art" role="presentation">
                <path
                  d="M12 58 L28 42 L44 52 L60 36 L76 48 L92 30 L108 44 L124 28 L140 40 L156 24 L172 38 L188 22 L204 36 L220 26 L236 40 L252 30 L268 44 L284 34 L300 48 L316 38 L332 52 L348 46"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <rect x="118" y="34" width="124" height="24" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M124 34 L142 18 L160 34 M196 34 L214 16 L232 34" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="180" cy="12" r="5" fill="currentColor" opacity="0.5" />
              </svg>
            </div>

            <div className="royal-passport-book__approved-stamp" aria-hidden>
              <span>Approved</span>
              <span>by The Royal Passage</span>
            </div>

            <div className="royal-passport-book__peacock royal-passport-book__peacock--left" aria-hidden />
            <div className="royal-passport-book__peacock royal-passport-book__peacock--right" aria-hidden />
          </section>

          <section
            className="royal-passport-book__page royal-passport-book__page--right"
            aria-label="Endorsements and privileges"
          >
            <h2 className="royal-passport-book__title royal-passport-book__title--right">Endorsements &amp; Privileges</h2>

            <div className="royal-passport-book__endorsements">
              <VipEndorsement status={vipMembershipStatus} />
            </div>

            <div className="royal-passport-book__field royal-passport-book__field--phone">
              <span className="royal-passport-book__label">Contact line</span>
              <input
                id="passport-phone"
                value={phone}
                onChange={(event) => onPhoneChange(event.target.value)}
                className="royal-passport-book__value royal-passport-book__input"
                placeholder="Phone number"
                autoComplete="tel"
              />
            </div>

            <div className="royal-passport-book__registry-footer">
              <div>
                <span className="royal-passport-book__label">Date stamp</span>
                <span className="royal-passport-book__value">{todayStamp()}</span>
              </div>
              <div>
                <span className="royal-passport-book__label">Registrar&apos;s signature</span>
                <span className="royal-passport-book__signature">Raghavendra Wadiyar</span>
              </div>
              <div className="royal-passport-book__seal" aria-hidden>
                <span>Registry</span>
                <span>Seal</span>
              </div>
            </div>

            <p className="royal-passport-book__disclaimer">
              This passport is the property of The Royal Passage Imperial Registry, Mysuru, Bharata.
            </p>
          </section>
        </div>
      </div>

      <p className="royal-passport-scene__caption">
        Identity of <strong>{displayName}</strong> — portrait auto-cropped for heritage certificate display.
      </p>
    </div>
  );
}

function VipEndorsement({ status }: { status: string }) {
  if (isApprovedVipMember(status)) {
    return (
      <div className="royal-passport-book__vip">
        <div className="royal-passport-book__vip-heading">
          <Crown className="royal-passport-book__vip-icon" aria-hidden />
          <span>Royal VIP member</span>
        </div>
        <p className="royal-passport-book__vip-copy">
          Curated Mysuru packages and bespoke concierge itineraries are active on this passport.
        </p>
        <Link to="/member/vip" className="royal-passport-book__vip-cta">
          Open VIP member area
        </Link>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="royal-passport-book__vip">
        <div className="royal-passport-book__vip-heading">
          <Crown className="royal-passport-book__vip-icon" aria-hidden />
          <span>VIP application</span>
        </div>
        <p className="royal-passport-book__vip-copy">
          Your Royal VIP membership application is under review. Our concierge will notify you once approved.
        </p>
      </div>
    );
  }

  return (
    <div className="royal-passport-book__vip">
      <div className="royal-passport-book__vip-heading">
        <Crown className="royal-passport-book__vip-icon" aria-hidden />
        <span>Upgrade to Royal VIP</span>
      </div>
      <p className="royal-passport-book__vip-copy">
        Apply for VIP membership to unlock curated Mysuru packages, bespoke itineraries, and concierge support.
        Aadhaar verification is required.
      </p>
      {status === "rejected" ? (
        <p className="royal-passport-book__vip-note">
          Your previous application was not approved. You may submit a new application with updated details.
        </p>
      ) : null}
      <Link to="/account/vip-apply" className="royal-passport-book__vip-cta royal-passport-book__vip-cta--apply">
        Apply for VIP membership
      </Link>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import passportSpreadUrl from "@/assets/passport/royal-passport-profile-spread.png";
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
        <img
          src={passportSpreadUrl}
          alt=""
          className="royal-passport-book__spread-art"
          decoding="async"
          draggable={false}
        />

        <div className="royal-passport-book__overlay">
          <p className="royal-passport-book__reg">REG. NO: {regNo}</p>

          <div className="royal-passport-book__portrait-slot">
            <PassportPhotoFrame
              photoUrl={photoUrl}
              processing={photoProcessing}
              onFileSelected={onPhotoSelected}
            />
          </div>

          <div className="royal-passport-book__field royal-passport-book__field--name">
            <label htmlFor="passport-full-name" className="sr-only">
              Full name
            </label>
            <input
              id="passport-full-name"
              value={fullName}
              onChange={(event) => onFullNameChange(event.target.value)}
              className="royal-passport-book__value royal-passport-book__input"
              placeholder="Your full name"
              autoComplete="name"
            />
          </div>

          <div className="royal-passport-book__field royal-passport-book__field--dob">
            <label htmlFor="passport-date-of-birth" className="sr-only">
              Date of birth
            </label>
            <input
              id="passport-date-of-birth"
              type="date"
              value={dateOfBirth}
              onChange={(event) => onDateOfBirthChange(event.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="royal-passport-book__value royal-passport-book__input royal-passport-book__input--date"
            />
          </div>

          <div className="royal-passport-book__field royal-passport-book__field--phone">
            <label htmlFor="passport-phone" className="sr-only">
              Phone number
            </label>
            <input
              id="passport-phone"
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
              className="royal-passport-book__value royal-passport-book__input"
              placeholder="Phone number"
              autoComplete="tel"
            />
          </div>

          <div className="royal-passport-book__right-panel" aria-label="Endorsements and privileges">
            <VipEndorsement status={vipMembershipStatus} />

            {email ? (
              <div className="royal-passport-book__meta">
                <span className="royal-passport-book__label">Registry email</span>
                <span className="royal-passport-book__value royal-passport-book__value--small">{email}</span>
              </div>
            ) : null}

            <div className="royal-passport-book__meta">
              <span className="royal-passport-book__label">Domicile</span>
              <span className="royal-passport-book__value">{domicile}</span>
            </div>
          </div>
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

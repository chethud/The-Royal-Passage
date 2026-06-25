import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import leftPageArt from "@/assets/passport/royal-passport-page-left-blank.png";
import rightPageArt from "@/assets/passport/royal-passport-page-right.png";
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

function formatNativityDisplay(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}-${month}-${year}`;
}

export function RoyalPassportBook({
  regNo,
  fullName,
  dateOfBirth,
  domicile,
  phone,
  vipMembershipStatus,
  photoUrl,
  photoProcessing,
  onFullNameChange,
  onDateOfBirthChange,
  onPhoneChange,
  onPhotoSelected,
}: RoyalPassportBookProps) {
  return (
    <div className="royal-passport-scene">
      <div className="royal-passport-book" aria-label="Royal identity passport book">
        <div className="royal-passport-book__binding" aria-hidden />

        <div className="royal-passport-book__spread">
          <section className="royal-passport-book__page royal-passport-book__page--left" aria-label="Identity certificate">
            <img
              src={leftPageArt}
              alt=""
              className="royal-passport-book__page-art"
              decoding="async"
              draggable={false}
            />

            <div className="royal-passport-book__page-layer">
              <p className="royal-passport-book__reg">REG. NO: {regNo}</p>

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
                    <div className="royal-passport-book__date-wrap">
                      <input
                        id="passport-date-of-birth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(event) => onDateOfBirthChange(event.target.value)}
                        max={new Date().toISOString().slice(0, 10)}
                        className="royal-passport-book__value royal-passport-book__input royal-passport-book__input--date"
                        aria-label="Date of nativity"
                      />
                      {dateOfBirth ? (
                        <span className="royal-passport-book__date-display" aria-hidden>
                          {formatNativityDisplay(dateOfBirth)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="royal-passport-book__field">
                    <span className="royal-passport-book__label">Domicile</span>
                    <span className="royal-passport-book__value royal-passport-book__value--static">{domicile}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="royal-passport-book__page royal-passport-book__page--right"
            aria-label="Endorsements and privileges"
          >
            <img
              src={rightPageArt}
              alt=""
              className="royal-passport-book__page-art"
              decoding="async"
              draggable={false}
            />

            <div className="royal-passport-book__page-layer">
              <VipEndorsement status={vipMembershipStatus} />

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
                <div className="royal-passport-book__registry-col">
                  <span className="royal-passport-book__label">Date stamp</span>
                  <span className="royal-passport-book__value royal-passport-book__value--stamp">{todayStamp()}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function VipEndorsement({ status }: { status: string }) {
  if (isApprovedVipMember(status)) {
    return (
      <div className="royal-passport-book__vip royal-passport-book__vip--overlay">
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
      <div className="royal-passport-book__vip royal-passport-book__vip--overlay">
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
    <div className="royal-passport-book__vip royal-passport-book__vip--apply">
      <Link to="/account/vip-apply" className="royal-passport-book__vip-hit" aria-label="Apply for VIP membership">
        <span className="sr-only">Apply for VIP membership</span>
      </Link>
      {status === "rejected" ? (
        <p className="royal-passport-book__vip-note royal-passport-book__vip-note--overlay">
          Your previous application was not approved. Tap the button above to apply again with updated details.
        </p>
      ) : null}
    </div>
  );
}

import passportSpreadUrl from "@/assets/passport/royal-passport-parchment-spread.png";
import passportPageBorderUrl from "@/assets/passport/royal-passport-page-border.png";
import passportCrestLogoUrl from "@/assets/passport/royal-passport-crest-logo.png";
import passportProfileHeadingUrl from "@/assets/passport/royal-passport-profile-heading-ref.png";
import passportWaxSealUrl from "@/assets/passport/royal-passport-wax-seal.png";
import passportEndorsementsDividerUrl from "@/assets/passport/royal-passport-endorsements-divider.png";
import { PassportPhotoFrame } from "@/components/passport/PassportPhotoFrame";

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

/** Parchment spread + user-provided ornate page borders. */
export function RoyalPassportBook({
  regNo,
  fullName,
  dateOfBirth,
  phone,
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
          <p className="royal-passport-book__reg" aria-label={`Registration number ${regNo}`}>
            {regNo}
          </p>

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

        <p
          className="royal-passport-book__reg royal-passport-book__reg--right"
          aria-label={`Registration number ${regNo}`}
        >
          {regNo}
        </p>

        <div className="royal-passport-book__endorsements-heading" role="heading" aria-level={3}>
          <span className="royal-passport-book__endorsements-title">Endorsements & Privileges</span>
          <img
            src={passportEndorsementsDividerUrl}
            alt=""
            className="royal-passport-book__endorsements-flourish"
            decoding="async"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

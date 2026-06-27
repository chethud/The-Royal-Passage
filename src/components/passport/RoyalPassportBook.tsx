import passportSpreadUrl from "@/assets/passport/royal-passport-parchment-spread.png";
import passportPageBorderUrl from "@/assets/passport/royal-passport-page-border.png";
import passportCrestLogoUrl from "@/assets/passport/royal-passport-crest-logo.png";
import passportProfileHeadingUrl from "@/assets/passport/royal-passport-profile-heading-ref.png";
import passportWaxSealUrl from "@/assets/passport/royal-passport-wax-seal.png";

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
export function RoyalPassportBook(_props: RoyalPassportBookProps) {
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

        <img
          src={passportWaxSealUrl}
          alt="Royal wax seal"
          className="royal-passport-book__right-seal"
          decoding="async"
          draggable={false}
        />
      </div>
    </div>
  );
}

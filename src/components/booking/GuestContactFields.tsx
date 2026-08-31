import {
  BookingFieldGrid,
  BookingFieldLabel,
  BookingIntro,
  bookingPanelFieldClass,
} from "@/components/booking/BookingPanelPrimitives";
import type { GuestContactDetails } from "@/lib/guest-contact";
import { TEN_DIGIT_PHONE_INPUT_PROPS, sanitizeTenDigitPhoneInput } from "@/lib/phone";

type GuestContactFieldsProps = {
  value: GuestContactDetails;
  onChange: (next: GuestContactDetails) => void;
  showErrors?: boolean;
  surface?: "light" | "dark";
  heading?: string;
  description?: string;
};

function fieldError(showErrors: boolean, value: string, valid: boolean) {
  return showErrors && !valid;
}

export function GuestContactFields({
  value,
  onChange,
  showErrors = false,
  surface = "light",
  heading = "Your contact details",
  description = "We'll share these with your host so they can confirm your booking and reach you if plans change.",
}: GuestContactFieldsProps) {
  const nameValid = value.fullName.trim().length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim());
  const phoneValid = sanitizeTenDigitPhoneInput(value.phone).length === 10;

  const fieldClass =
    surface === "light"
      ? bookingPanelFieldClass
      : "w-full rounded-sm border border-[rgb(200_162_90/0.35)] bg-[rgb(0_0_0/0.25)] px-2.5 py-2 text-[0.74rem] text-[#F7F1E8] placeholder:text-[#D6C8B5]/55 focus:border-[#D4AF37]/55 focus:outline-none sm:px-4 sm:py-3 sm:text-sm";
  const errorClass = "mt-1 text-[0.68rem] text-destructive sm:text-xs";

  return (
    <div className="space-y-4 sm:space-y-5">
      <BookingIntro label={heading} surface={surface}>
        {description}
      </BookingIntro>

      <BookingFieldGrid>
        <div className="sm:col-span-2">
          <BookingFieldLabel>Full name</BookingFieldLabel>
          <input
            type="text"
            name="guestFullName"
            autoComplete="name"
            required
            value={value.fullName}
            onChange={(event) => onChange({ ...value, fullName: event.target.value })}
            className={fieldClass}
            aria-invalid={fieldError(showErrors, value.fullName, nameValid)}
          />
          {fieldError(showErrors, value.fullName, nameValid) ? (
            <p className={errorClass}>Enter your full name.</p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <BookingFieldLabel>Email</BookingFieldLabel>
          <input
            type="email"
            name="guestEmail"
            autoComplete="email"
            required
            value={value.email}
            onChange={(event) => onChange({ ...value, email: event.target.value })}
            className={fieldClass}
            aria-invalid={fieldError(showErrors, value.email, emailValid)}
          />
          {fieldError(showErrors, value.email, emailValid) ? (
            <p className={errorClass}>Enter a valid email address.</p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <BookingFieldLabel>Mobile number</BookingFieldLabel>
          <input
            {...TEN_DIGIT_PHONE_INPUT_PROPS}
            name="guestPhone"
            required
            value={value.phone}
            onChange={(event) =>
              onChange({ ...value, phone: sanitizeTenDigitPhoneInput(event.target.value) })
            }
            className={fieldClass}
            aria-invalid={fieldError(showErrors, value.phone, phoneValid)}
          />
          {fieldError(showErrors, value.phone, phoneValid) ? (
            <p className={errorClass}>Enter a valid 10-digit mobile number.</p>
          ) : null}
        </div>
      </BookingFieldGrid>
    </div>
  );
}

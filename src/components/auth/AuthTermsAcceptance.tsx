import { Link } from "@tanstack/react-router";
import { Checkbox } from "@/components/ui/checkbox";
import { EXPERIENCE_TERMS_PATH } from "@/lib/legal/experience-terms-path";

type AuthTermsAcceptanceProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function AuthTermsAcceptance({ id, checked, onCheckedChange }: AuthTermsAcceptanceProps) {
  return (
    <div className="rounded-sm border border-[oklch(0.88_0.08_86_/_0.25)] bg-background/30 px-4 py-3">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-ink/90">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          className="mt-0.5 border-ember/40 data-[state=checked]:bg-ember data-[state=checked]:text-primary-foreground"
        />
        <span>
          I agree to the{" "}
          <Link
            to={EXPERIENCE_TERMS_PATH}
            search={{ from: "sign-in" }}
            target="_blank"
            rel="noreferrer"
            className="text-ember underline-offset-4 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Terms & Conditions
          </Link>
        </span>
      </label>
    </div>
  );
}

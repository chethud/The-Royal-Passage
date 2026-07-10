import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AuthTermsAcceptanceProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

/** Placeholder terms copy — replace with full legal text later. */
export const AUTH_TERMS_TEXT = "hi chintu";

export function AuthTermsAcceptance({ id, checked, onCheckedChange }: AuthTermsAcceptanceProps) {
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <>
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
            <button
              type="button"
              className="text-ember underline-offset-4 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTermsOpen(true);
              }}
            >
              terms and conditions
            </button>
          </span>
        </label>
      </div>

      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="border-[oklch(0.88_0.08_86_/_0.35)] bg-background text-ink sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide text-ink">
              Terms and Conditions
            </DialogTitle>
            <DialogDescription className="sr-only">
              Read the terms and conditions for using The Royal Passage.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-ink/80">
            {AUTH_TERMS_TEXT}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

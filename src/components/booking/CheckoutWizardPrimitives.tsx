import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";

export type CheckoutWizardStep = {
  id: number;
  label: string;
};

export function CheckoutWizardStepper({
  steps,
  currentStep,
  ariaLabel = "Booking progress",
}: {
  steps: readonly CheckoutWizardStep[];
  currentStep: number;
  ariaLabel?: string;
}) {
  return (
    <LuxuryCheckoutPanel className="py-5 sm:py-6">
      <nav aria-label={ariaLabel}>
        <ol className="checkout-wizard-steps">
          {steps.map((item, index) => {
            const active = currentStep === item.id;
            const done = currentStep > item.id;

            return (
              <li key={item.id} className="checkout-wizard-step">
                <span
                  className={`checkout-wizard-step__label ${
                    active
                      ? "luxury-panel-heading font-semibold"
                      : done
                        ? "luxury-panel-heading"
                        : "luxury-panel-step-text-idle"
                  }`}
                >
                  <span
                    className={`checkout-wizard-step__badge ${
                      active
                        ? "luxury-panel-step-active"
                        : done
                          ? "luxury-panel-step-done"
                          : "luxury-panel-step-idle"
                    }`}
                    aria-current={active ? "step" : undefined}
                  >
                    {String(item.id).padStart(2, "0")}
                  </span>
                  <span className="checkout-wizard-step__text">{item.label}</span>
                </span>
                {index < steps.length - 1 ? (
                  <span className="checkout-wizard-step__connector luxury-panel-step-connector" aria-hidden />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>
    </LuxuryCheckoutPanel>
  );
}

export function CheckoutWizardStepHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header>
      <h2 className="luxury-panel-heading font-display text-2xl tracking-[0.02em] md:text-3xl">{title}</h2>
      {description ? (
        <p className="luxury-panel-body mt-2 max-w-xl text-sm leading-relaxed">{description}</p>
      ) : null}
    </header>
  );
}

export function CheckoutWizardStepBody({ children }: { children: ReactNode }) {
  return <div className="luxury-panel-divider mt-8 border-t pt-8">{children}</div>;
}

type CheckoutWizardBackLink = {
  label: string;
  onClick?: () => void;
  to?: ComponentProps<typeof Link>["to"];
  params?: ComponentProps<typeof Link>["params"];
  hash?: string;
};

export function CheckoutWizardStepFooter({
  back,
  primary,
}: {
  back?: CheckoutWizardBackLink;
  primary?: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    showArrow?: boolean;
  };
}) {
  if (!back && !primary) return null;

  return (
    <div className="luxury-panel-divider mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
      {back ? (
        back.onClick ? (
          <button
            type="button"
            onClick={back.onClick}
            className="checkout-wizard-back-link"
          >
            {back.label}
          </button>
        ) : back.to ? (
          <Link
            to={back.to}
            params={back.params}
            hash={back.hash}
            className="checkout-wizard-back-link"
          >
            {back.label}
          </Link>
        ) : null
      ) : (
        <span />
      )}
      {primary ? (
        <button
          type="button"
          disabled={primary.disabled}
          onClick={primary.onClick}
          className="luxury-btn-sm luxury-btn-primary inline-flex items-center gap-2 disabled:opacity-50"
        >
          {primary.label}
          {primary.showArrow !== false ? <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} /> : null}
        </button>
      ) : null}
    </div>
  );
}

export function CheckoutWizardConfirmRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 border-b luxury-panel-divider pb-3">
      <dt className="luxury-panel-body">{label}</dt>
      <dd
        className={`luxury-panel-body text-right ${emphasis ? "font-display text-xl text-[#4A0000]" : "font-medium"}`}
      >
        {value}
      </dd>
    </div>
  );
}

export function CheckoutWizardSummaryRow({
  label,
  value,
  align = "right",
}: {
  label: string;
  value: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="luxury-panel-label shrink-0 normal-case tracking-normal">{label}</dt>
      <dd className={`luxury-panel-heading min-w-0 ${align === "right" ? "text-right" : ""}`}>{value}</dd>
    </div>
  );
}

export function CheckoutWizardSummaryPanel({
  title = "Booking summary",
  heading,
  subheading,
  totalLabel = "Total",
  total,
  rows,
  footnote,
}: {
  title?: string;
  heading: string;
  subheading?: ReactNode;
  totalLabel?: string;
  total: ReactNode;
  rows: ReactNode;
  footnote?: ReactNode;
}) {
  return (
    <LuxuryCheckoutPanel>
      <div className="flex gap-4 sm:gap-5">
        <div className="min-w-0 flex-1">
          <h2 className="luxury-panel-heading font-display text-lg tracking-[0.04em] sm:text-xl">{title}</h2>
          <p className="luxury-panel-body mt-1 truncate text-sm">{heading}</p>
          {subheading ? <p className="luxury-panel-body text-xs">{subheading}</p> : null}
        </div>
        <div className="shrink-0 text-right">
          <div className="eyebrow luxury-panel-label">{totalLabel}</div>
          <div className="luxury-panel-heading font-display text-2xl tracking-[0.02em]">{total}</div>
        </div>
      </div>

      <div className="luxury-panel-divider-bg my-5 h-px" />

      <dl className="grid gap-3 text-sm sm:grid-cols-2">{rows}</dl>

      {footnote ? <p className="luxury-panel-body mt-5 text-xs leading-relaxed">{footnote}</p> : null}
    </LuxuryCheckoutPanel>
  );
}

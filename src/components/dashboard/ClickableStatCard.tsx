import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type ClickableStatCardProps = {
  label: string;
  value: string;
  hint?: string;
  to?: string;
  search?: Record<string, string | undefined>;
};

export function ClickableStatCard({ label, value, hint, to, search }: ClickableStatCardProps) {
  const body = (
    <>
      <div className="eyebrow text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl text-ember">{value}</div>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
      {to ? (
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-ember/80">
          View details →
        </p>
      ) : null}
    </>
  );

  const className =
    "glass-strong block rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5 transition-colors hover:border-ember/40 hover:bg-[oklch(0.88_0.08_86_/_0.04)]";

  if (to) {
    return (
      <Link to={to} search={search} className={className}>
        {body}
      </Link>
    );
  }

  return <article className={className}>{body}</article>;
}

export function StatCardSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

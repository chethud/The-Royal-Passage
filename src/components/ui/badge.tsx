import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-sm)] border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[color:rgba(198,161,91,0.35)] bg-[color:rgba(198,161,91,0.12)] text-[color:var(--old-gold)]",
        secondary:
          "border-[color:rgba(58,8,15,0.1)] bg-[color:rgba(245,239,227,0.72)] text-[color:var(--royal-charcoal)]",
        destructive:
          "border-[color:rgba(140,48,48,0.35)] bg-[color:rgba(140,48,48,0.1)] text-[color:var(--error-red)]",
        outline: "border-[color:rgba(198,161,91,0.35)] bg-transparent text-[color:var(--antique-gold)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

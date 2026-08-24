import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border text-sm font-medium font-sans transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-[color:var(--antique-gold)] bg-primary text-primary-foreground shadow-[var(--shadow-soft)] hover:bg-accent hover:text-accent-foreground hover:shadow-[var(--shadow-lift)]",
        destructive:
          "border-[color:var(--error-red)] bg-destructive text-destructive-foreground shadow-[var(--shadow-soft)] hover:bg-[#a53a3a]",
        outline:
          "border-[color:rgba(198,161,91,0.42)] bg-transparent text-[color:var(--antique-gold)] hover:bg-accent hover:text-accent-foreground hover:shadow-[var(--shadow-soft)]",
        secondary:
          "border-[color:rgba(198,161,91,0.18)] bg-secondary text-secondary-foreground shadow-[var(--shadow-soft)] hover:border-[color:rgba(198,161,91,0.4)] hover:bg-[color:var(--royal-burgundy)]",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-[color:rgba(198,161,91,0.08)] hover:text-[color:var(--royal-plum)]",
        link: "border-transparent bg-transparent px-0 text-[color:var(--antique-gold)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs tracking-[0.08em]",
        lg: "h-11 px-8 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

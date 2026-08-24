import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-[var(--radius-lg)] group-[.toaster]:border group-[.toaster]:border-[color:rgba(198,161,91,0.25)] group-[.toaster]:bg-[color:var(--pearl-white)] group-[.toaster]:text-[color:var(--royal-charcoal)] group-[.toaster]:shadow-[var(--shadow-lift)]",
          title: "group-[.toast]:font-semibold group-[.toast]:text-[color:var(--royal-burgundy)]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-[color:var(--royal-burgundy)] group-[.toast]:text-[color:var(--royal-ivory)]",
          cancelButton:
            "group-[.toast]:bg-[color:rgba(245,239,227,0.9)] group-[.toast]:text-[color:var(--royal-charcoal)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

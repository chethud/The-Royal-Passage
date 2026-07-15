import { Link } from "@tanstack/react-router";

type LivePreviewLinkProps = {
  to: string;
  hash?: string;
  label?: string;
};

/** Opens the public page/section that this editor panel controls. */
export function LivePreviewLink({ to, hash, label = "Live preview →" }: LivePreviewLinkProps) {
  return (
    <Link
      to={to}
      hash={hash}
      className="luxury-panel-link whitespace-nowrap text-sm font-semibold underline-offset-4 hover:underline"
    >
      {label}
    </Link>
  );
}

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfficialLink({
  href,
  children,
  className,
  variant = "primary",
}: {
  href: string;
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "text";
}) {
  const styles = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    text: "inline-flex items-center gap-1 text-sm text-accent-soft hover:underline",
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(styles[variant], className)}
      title="Official website — opens in a new tab"
    >
      {children ?? "Visit Official Website"}
      <ExternalLink className="h-3.5 w-3.5 opacity-80" />
      <span className="sr-only">(Official website, opens in new tab)</span>
    </a>
  );
}

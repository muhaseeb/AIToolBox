import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "accent" | "success" | "warning" | "free" | "os";
  className?: string;
}) {
  const tones = {
    default: "border-zinc-700 bg-zinc-800/80 text-zinc-300",
    accent: "border-violet-500/40 bg-violet-500/15 text-violet-300",
    success: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
    warning: "border-amber-500/40 bg-amber-500/15 text-amber-300",
    free: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
    os: "border-sky-500/40 bg-sky-500/15 text-sky-300",
  };
  return <span className={cn("badge", tones[tone], className)}>{children}</span>;
}

export function PricingBadge({
  pricingType,
  startingPrice,
}: {
  pricingType: string;
  startingPrice: number | null;
}) {
  if (pricingType === "FREE") return <Badge tone="free">Free</Badge>;
  if (startingPrice == null) return <Badge tone="warning">Check official site</Badge>;
  if (pricingType === "FREEMIUM") return <Badge tone="accent">From ${startingPrice}/mo</Badge>;
  return <Badge>From ${startingPrice}/mo</Badge>;
}

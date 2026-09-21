import { Inbox } from "lucide-react";
import Link from "next/link";

export function EmptyState({
  title = "Nothing here yet",
  description = "Try adjusting your filters or search query.",
  actionHref,
  actionLabel,
}: {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-16 text-center animate-fade-in">
      <Inbox className="mb-4 h-10 w-10 text-zinc-600" />
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-zinc-400">{description}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-secondary mt-6">{actionLabel}</Link>
      )}
    </div>
  );
}

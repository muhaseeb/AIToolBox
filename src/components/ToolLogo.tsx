export function ToolLogo({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initial = name.trim().charAt(0).toUpperCase();
  const sizes = { sm: "h-8 w-8 text-sm", md: "h-11 w-11 text-base", lg: "h-16 w-16 text-2xl" };
  const hue = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-xl font-semibold text-white`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 55% 42%), hsl(${(hue + 40) % 360} 60% 28%))`,
      }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

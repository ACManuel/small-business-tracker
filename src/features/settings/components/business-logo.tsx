export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "MN";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function BusinessLogo({
  name,
  logoUrl,
  bgColor,
  size = "md",
}: {
  name: string;
  logoUrl?: string | null;
  bgColor?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-20 h-20 text-2xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold select-none`}
      style={{ backgroundColor: bgColor || "#000000" }}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-contain p-1"
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}

import React from "react";

export default function ShieldLogo({
  className = "h-32 w-32",
}: {
  className?: string;
}) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer Glow */}
      <div className="absolute inset-0 animate-pulse rounded-full bg-[#077c8a]/20 blur-xl" />

      <div className="relative h-full w-full overflow-visible">
        <svg
          viewBox="0 0 24 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-[0_0_15px_rgba(7,124,138,0.5)]"
        >
          <path
            d="M12 2L3 7V12C3 17.52 6.84 22.74 12 24C17.16 22.74 21 17.52 21 12V7L12 2Z"
            className="fill-black/40 stroke-[#077c8a] stroke-2"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pt-2">
          <svg viewBox="0 0 80 60" className="h-20 w-20">
            <line x1="20" y1="8" x2="20" y2="56" stroke="#4ff" strokeWidth="3" />
            <rect
              x="20"
              y="10"
              width="40"
              height="26"
              rx="2"
              fill="#4ff"
              className="animate-flag-wave"
              style={{ transformOrigin: "left center" }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

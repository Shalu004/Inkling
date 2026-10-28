import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  monochrome?: boolean;
  href?: string;
}

export function FeatherIcon({
  className = "",
  size = 28,
  monochrome = false,
}: {
  className?: string;
  size?: number;
  monochrome?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Inkling Feather Emblem"
    >
      {/* Central quill spine / ink stroke */}
      <path
        d="M6 31C11.5 25 18 17 29 5C26 14 20 22 13 28L6 31Z"
        fill={monochrome ? "currentColor" : "#222220"}
      />
      {/* Upper feather vane with organic slit */}
      <path
        d="M29 5C27 9.5 22.5 13.5 17 15C18.5 12 21 8.5 25 6L29 5Z"
        fill={monochrome ? "currentColor" : "#2D5D7B"}
        fillOpacity="0.85"
      />
      {/* Lower subtle accent vane */}
      <path
        d="M19 19C15 22 10.5 24 7 25C9 22.5 12.5 20 16 18L19 19Z"
        fill={monochrome ? "currentColor" : "#B88219"}
        fillOpacity="0.85"
      />
      {/* Ink-nib tip touch */}
      <circle
        cx="5.5"
        cy="31.5"
        r="1.5"
        fill={monochrome ? "currentColor" : "#222220"}
      />
    </svg>
  );
}

export function Logo({
  className = "",
  size = "md",
  showWordmark = true,
  monochrome = false,
  href = "/",
}: LogoProps) {
  const sizeMap = {
    sm: { icon: 20, text: "text-lg", tagline: "text-[9px]" },
    md: { icon: 28, text: "text-2xl", tagline: "text-[10px]" },
    lg: { icon: 34, text: "text-3xl", tagline: "text-xs" },
    xl: { icon: 44, text: "text-4xl", tagline: "text-sm" },
  };

  const current = sizeMap[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <div className="relative flex items-center justify-center p-1 rounded-lg transition-transform duration-200 group-hover:scale-105">
        <FeatherIcon size={current.icon} monochrome={monochrome} />
      </div>
      {showWordmark && (
        <div className="flex flex-col">
          <span
            className={`font-editorial font-semibold tracking-tight text-ink-primary transition-colors group-hover:text-coach-ink ${current.text}`}
          >
            Inkling
          </span>
          <span
            className={`font-annotation tracking-wide text-ink-secondary italic -mt-1 ${current.tagline}`}
          >
            thoughts becoming words
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-1 focus-visible:ring-coach-ink rounded">
        {content}
      </Link>
    );
  }

  return content;
}

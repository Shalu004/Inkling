import React from "react";

export type FeatureColorType = "creative" | "spark" | "reading" | "vocab" | "coach" | "paper";

interface SemanticCardProps {
  color?: FeatureColorType;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}

const colorStyles: Record<
  FeatureColorType,
  { bg: string; border: string; accent: string; badgeBg: string }
> = {
  creative: {
    bg: "bg-[#FEF8E7]",
    border: "border-[#B88219]/20",
    accent: "text-[#B88219]",
    badgeBg: "bg-[#FEF8E7] text-[#B88219] border-[#B88219]/30",
  },
  spark: {
    bg: "bg-[#FDF0EC]",
    border: "border-[#D25D43]/20",
    accent: "text-[#D25D43]",
    badgeBg: "bg-[#FDF0EC] text-[#D25D43] border-[#D25D43]/30",
  },
  reading: {
    bg: "bg-[#EEF5EE]",
    border: "border-[#3D724D]/20",
    accent: "text-[#3D724D]",
    badgeBg: "bg-[#EEF5EE] text-[#3D724D] border-[#3D724D]/30",
  },
  vocab: {
    bg: "bg-[#F4EFFB]",
    border: "border-[#6A4BB2]/20",
    accent: "text-[#6A4BB2]",
    badgeBg: "bg-[#F4EFFB] text-[#6A4BB2] border-[#6A4BB2]/30",
  },
  coach: {
    bg: "bg-[#EEF4F8]",
    border: "border-[#2D5D7B]/20",
    accent: "text-[#2D5D7B]",
    badgeBg: "bg-[#EEF4F8] text-[#2D5D7B] border-[#2D5D7B]/30",
  },
  paper: {
    bg: "bg-paper",
    border: "border-warm-border",
    accent: "text-ink-primary",
    badgeBg: "bg-warm-muted text-ink-secondary border-warm-border",
  },
};

export function SemanticCard({
  color = "paper",
  className = "",
  children,
  onClick,
  hoverable = true,
}: SemanticCardProps) {
  const styles = colorStyles[color];

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-5 sm:p-6 transition-all duration-200 ${styles.bg} ${styles.border} ${
        hoverable ? "hover:shadow-md hover:-translate-y-0.5" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function SemanticBadge({
  color = "paper",
  children,
  className = "",
}: {
  color?: FeatureColorType;
  children: React.ReactNode;
  className?: string;
}) {
  const styles = colorStyles[color];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles.badgeBg} ${className}`}
    >
      {children}
    </span>
  );
}

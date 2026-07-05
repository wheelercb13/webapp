import type { DomainColor } from "@/lib/types";

// Full class strings so Tailwind's static analyzer can see them.
export const DOMAIN_COLOR_CLASSES: Record<DomainColor, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  amber: "bg-amber-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  teal: "bg-teal-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  gray: "bg-gray-500",
};

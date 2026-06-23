// ═══ Brand Colors ═══
export const BRAND = {
  orange: "#E8632B",
  green: "#A8D841",
  blue: "#3B5DAA",
  black: "#0A0A0A",
  white: "#FAFAFA",
  warmGray: "#1A1A1A",
  midGray: "#2A2A2A",
} as const;

// ═══ Site Metadata ═══
export const SITE = {
  name: "Abi Photo Studio",
  tagline: "The instrument is not the camera but the photographer.",
  description:
    "Professional photography portfolio by Abishek.S — capturing moments with passion, precision, and a cinematic eye.",
  url: "https://abiphotostudio.com",
  instagram: "https://www.instagram.com/abishek__.004",
} as const;

// ═══ Navigation ═══
export const NAV_ITEMS = [
  { label: "Portfolio", href: "/portfolio", mode: "brand" as const },
  { label: "About", href: "/about", mode: "brand" as const },
  { label: "Blog", href: "/blog", mode: "brand" as const },
  { label: "Booking", href: "/booking", mode: "brand" as const },
  { label: "Contact", href: "/contact", mode: "brand" as const },
] as const;

// ═══ Portfolio Categories ═══
export const CATEGORIES = [
  { name: "All", slug: "all" },
  { name: "Portraits", slug: "portraits" },
  { name: "Events", slug: "events" },
  { name: "Street", slug: "street" },
  { name: "Cinematic", slug: "cinematic" },
  { name: "Nature", slug: "nature" },
] as const;

// ═══ Theme Modes ═══
export type ThemeMode = "gallery" | "brand";

export const ROUTE_THEME_MAP: Record<string, ThemeMode> = {
  "/": "brand",
  "/about": "brand",
  "/contact": "brand",
  "/booking": "brand",
  "/portfolio": "brand",
  "/photo": "brand",
  "/gallery": "brand",
  "/blog": "brand",
  "/admin": "brand",
};

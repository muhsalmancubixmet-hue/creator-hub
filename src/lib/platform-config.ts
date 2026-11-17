// Global platform configuration. In production these lists come from the SaaS Manager via the shared API.
// Nothing here is region-specific; regional content lives only in demo data.

export type CurrencyCode =
  "USD" | "EUR" | "GBP" | "AED" | "INR" | "CAD" | "AUD" | "SAR" | "SGD" | (string & {});
export interface Currency {
  code: CurrencyCode;
  name: string;
  locale: string;
}
export const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", locale: "en-US" },
  { code: "EUR", name: "Euro", locale: "de-DE" },
  { code: "GBP", name: "British Pound", locale: "en-GB" },
  { code: "AED", name: "UAE Dirham", locale: "en-AE" },
  { code: "INR", name: "Indian Rupee", locale: "en-IN" },
  { code: "CAD", name: "Canadian Dollar", locale: "en-CA" },
  { code: "AUD", name: "Australian Dollar", locale: "en-AU" },
  { code: "SAR", name: "Saudi Riyal", locale: "en-SA" },
  { code: "SGD", name: "Singapore Dollar", locale: "en-SG" },
];

export interface Money {
  amount: number;
  currency: CurrencyCode;
}
export interface MoneyRange {
  min: number;
  max: number;
  currency: CurrencyCode;
}

export function formatMoney(m: Money | null | undefined, opts: { compact?: boolean } = {}): string {
  if (!m) return "Contact for price";
  // Fixed "en-US" locale + hand-rolled compact notation keeps server and browser output identical.
  const compact = opts.compact && m.amount >= 1000;
  const value = compact ? (m.amount >= 1e6 ? m.amount / 1e6 : m.amount / 1e3) : m.amount;
  const out = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: m.currency,
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);
  return compact ? out.replace(/\.0(?=\D*$)/, "") + (m.amount >= 1e6 ? "M" : "K") : out;
}
export function formatRange(r: MoneyRange): string {
  return `${formatMoney({ amount: r.min, currency: r.currency }, { compact: true })}–${formatMoney({ amount: r.max, currency: r.currency }, { compact: true })}`;
}

export interface Language {
  code: string;
  name: string;
  dir?: "rtl";
}
export const languages: Language[] = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "ml", name: "Malayalam" },
  { code: "ar", name: "Arabic", dir: "rtl" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
];

export const timezones = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Toronto",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
];

export const categories = [
  "Fashion",
  "Beauty",
  "Food",
  "Travel",
  "Technology",
  "Gaming",
  "Fitness",
  "Finance",
  "Education",
  "Lifestyle",
  "Automotive",
  "Entertainment",
  "Business",
  "Photography",
  "Parenting",
  "Sports",
  "Sustainability",
];

export const socialPlatforms = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Facebook",
  "X",
  "LinkedIn",
  "Snapchat",
  "Threads",
  "Pinterest",
  "Twitch",
  "Website",
  "Other",
];

// Hierarchical location. Levels are optional: countries differ in administrative structure.
export type LocationLevel = "country" | "region" | "district" | "city" | "area";
export interface Place {
  id: string;
  name: string;
  level: LocationLevel;
  country: string;
  countryCode: string;
  region?: string;
  district?: string;
  city?: string;
  postalCode?: string;
  lat: number;
  lng: number;
}
export const levelLabel: Record<LocationLevel, string> = {
  country: "Country",
  region: "State / Province / Region",
  district: "District / County",
  city: "City",
  area: "Area",
};

export function placeLabel(
  p: Pick<Place, "name" | "level" | "region" | "country" | "city">,
): string {
  if (p.level === "country") return p.name;
  const parts = [
    p.name,
    p.level === "area" ? p.city : undefined,
    p.level !== "region" ? p.region : undefined,
    p.country,
  ].filter(Boolean);
  return [...new Set(parts)].join(", ");
}

// Sample place index — demo substitute for a geocoding/location API.
export const places: Place[] = [
  {
    id: "ae",
    name: "United Arab Emirates",
    level: "country",
    country: "United Arab Emirates",
    countryCode: "AE",
    lat: 24.3,
    lng: 54.3,
  },
  {
    id: "ae-dxb",
    name: "Dubai",
    level: "city",
    country: "United Arab Emirates",
    countryCode: "AE",
    region: "Dubai",
    lat: 25.2048,
    lng: 55.2708,
  },
  {
    id: "ae-auh",
    name: "Abu Dhabi",
    level: "city",
    country: "United Arab Emirates",
    countryCode: "AE",
    region: "Abu Dhabi",
    lat: 24.4539,
    lng: 54.3773,
  },
  {
    id: "ae-shj",
    name: "Sharjah",
    level: "city",
    country: "United Arab Emirates",
    countryCode: "AE",
    region: "Sharjah",
    lat: 25.3463,
    lng: 55.4209,
  },
  {
    id: "gb-lon",
    name: "London",
    level: "city",
    country: "United Kingdom",
    countryCode: "GB",
    region: "England",
    district: "Greater London",
    lat: 51.5072,
    lng: -0.1276,
  },
  {
    id: "gb-shoreditch",
    name: "Shoreditch",
    level: "area",
    country: "United Kingdom",
    countryCode: "GB",
    region: "England",
    city: "London",
    postalCode: "E1 6",
    lat: 51.5245,
    lng: -0.0781,
  },
  {
    id: "us-nyc",
    name: "New York",
    level: "city",
    country: "United States",
    countryCode: "US",
    region: "New York",
    lat: 40.7128,
    lng: -74.006,
  },
  {
    id: "us-la",
    name: "Los Angeles",
    level: "city",
    country: "United States",
    countryCode: "US",
    region: "California",
    district: "Los Angeles County",
    lat: 34.0522,
    lng: -118.2437,
  },
  {
    id: "ca-tor",
    name: "Toronto",
    level: "city",
    country: "Canada",
    countryCode: "CA",
    region: "Ontario",
    lat: 43.6532,
    lng: -79.3832,
  },
  {
    id: "fr-par",
    name: "Paris",
    level: "city",
    country: "France",
    countryCode: "FR",
    region: "Île-de-France",
    lat: 48.8566,
    lng: 2.3522,
  },
  {
    id: "sg",
    name: "Singapore",
    level: "city",
    country: "Singapore",
    countryCode: "SG",
    lat: 1.3521,
    lng: 103.8198,
  },
  {
    id: "au-syd",
    name: "Sydney",
    level: "city",
    country: "Australia",
    countryCode: "AU",
    region: "New South Wales",
    lat: -33.8688,
    lng: 151.2093,
  },
  {
    id: "in",
    name: "India",
    level: "country",
    country: "India",
    countryCode: "IN",
    lat: 22.5,
    lng: 79,
  },
  {
    id: "in-mh",
    name: "Maharashtra",
    level: "region",
    country: "India",
    countryCode: "IN",
    region: "Maharashtra",
    lat: 19.6,
    lng: 75.5,
  },
  {
    id: "in-mum",
    name: "Mumbai",
    level: "city",
    country: "India",
    countryCode: "IN",
    region: "Maharashtra",
    district: "Mumbai Suburban",
    lat: 19.076,
    lng: 72.8777,
  },
  {
    id: "in-bandra",
    name: "Bandra West",
    level: "area",
    country: "India",
    countryCode: "IN",
    region: "Maharashtra",
    city: "Mumbai",
    postalCode: "400050",
    lat: 19.0596,
    lng: 72.8295,
  },
  {
    id: "in-kl",
    name: "Kerala",
    level: "region",
    country: "India",
    countryCode: "IN",
    region: "Kerala",
    lat: 10.5,
    lng: 76.3,
  },
  {
    id: "in-kochi",
    name: "Kochi",
    level: "city",
    country: "India",
    countryCode: "IN",
    region: "Kerala",
    district: "Ernakulam",
    lat: 9.9312,
    lng: 76.2673,
  },
  {
    id: "in-wayanad",
    name: "Wayanad",
    level: "district",
    country: "India",
    countryCode: "IN",
    region: "Kerala",
    lat: 11.6854,
    lng: 76.132,
  },
  {
    id: "in-goa",
    name: "Goa",
    level: "region",
    country: "India",
    countryCode: "IN",
    region: "Goa",
    lat: 15.2993,
    lng: 74.124,
  },
  {
    id: "in-jaipur",
    name: "Jaipur",
    level: "city",
    country: "India",
    countryCode: "IN",
    region: "Rajasthan",
    lat: 26.9124,
    lng: 75.7873,
  },
  {
    id: "sa-riy",
    name: "Riyadh",
    level: "city",
    country: "Saudi Arabia",
    countryCode: "SA",
    region: "Riyadh Province",
    lat: 24.7136,
    lng: 46.6753,
  },
  {
    id: "de-ber",
    name: "Berlin",
    level: "city",
    country: "Germany",
    countryCode: "DE",
    region: "Berlin",
    lat: 52.52,
    lng: 13.405,
  },
  {
    id: "jp-tyo",
    name: "Tokyo",
    level: "city",
    country: "Japan",
    countryCode: "JP",
    region: "Tokyo",
    lat: 35.6762,
    lng: 139.6503,
  },
];

export function searchPlaces(q: string, limit = 8): Place[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return places
    .filter((p) =>
      [p.name, p.region, p.country, p.city, p.postalCode].some((v) => v?.toLowerCase().includes(s)),
    )
    .slice(0, limit);
}

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371,
    toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat),
    dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

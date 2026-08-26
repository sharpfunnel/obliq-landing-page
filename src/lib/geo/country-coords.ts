/** ISO 3166-1 alpha-2 → { name, lat, lng } (country centroids, for the Overview world map dots). */
export const COUNTRY_COORDS: Record<string, { name: string; lat: number; lng: number }> = {
  IN: { name: "India", lat: 20.6, lng: 79.0 },
  US: { name: "United States", lat: 39.8, lng: -98.6 },
  GB: { name: "United Kingdom", lat: 55.4, lng: -3.4 },
  CA: { name: "Canada", lat: 56.1, lng: -106.3 },
  AU: { name: "Australia", lat: -25.3, lng: 133.8 },
  DE: { name: "Germany", lat: 51.2, lng: 10.5 },
  FR: { name: "France", lat: 46.6, lng: 2.2 },
  SE: { name: "Sweden", lat: 60.1, lng: 18.6 },
  AT: { name: "Austria", lat: 47.5, lng: 14.6 },
  NL: { name: "Netherlands", lat: 52.1, lng: 5.3 },
  IE: { name: "Ireland", lat: 53.4, lng: -8.2 },
  AE: { name: "United Arab Emirates", lat: 23.4, lng: 53.8 },
  SA: { name: "Saudi Arabia", lat: 23.9, lng: 45.1 },
  SG: { name: "Singapore", lat: 1.35, lng: 103.8 },
  MY: { name: "Malaysia", lat: 4.2, lng: 101.9 },
  ID: { name: "Indonesia", lat: -0.8, lng: 113.9 },
  PH: { name: "Philippines", lat: 12.9, lng: 121.8 },
  TH: { name: "Thailand", lat: 15.9, lng: 100.9 },
  VN: { name: "Vietnam", lat: 14.1, lng: 108.3 },
  CN: { name: "China", lat: 35.9, lng: 104.2 },
  JP: { name: "Japan", lat: 36.2, lng: 138.3 },
  KR: { name: "South Korea", lat: 35.9, lng: 127.8 },
  PK: { name: "Pakistan", lat: 30.4, lng: 69.3 },
  BD: { name: "Bangladesh", lat: 23.7, lng: 90.4 },
  LK: { name: "Sri Lanka", lat: 7.9, lng: 80.8 },
  NP: { name: "Nepal", lat: 28.4, lng: 84.1 },
  NZ: { name: "New Zealand", lat: -41.0, lng: 174.9 },
  ZA: { name: "South Africa", lat: -30.6, lng: 22.9 },
  NG: { name: "Nigeria", lat: 9.1, lng: 8.7 },
  KE: { name: "Kenya", lat: -0.02, lng: 37.9 },
  EG: { name: "Egypt", lat: 26.8, lng: 30.8 },
  BR: { name: "Brazil", lat: -14.2, lng: -51.9 },
  MX: { name: "Mexico", lat: 23.6, lng: -102.5 },
  AR: { name: "Argentina", lat: -38.4, lng: -63.6 },
  IT: { name: "Italy", lat: 41.9, lng: 12.6 },
  ES: { name: "Spain", lat: 40.5, lng: -3.7 },
  PT: { name: "Portugal", lat: 39.4, lng: -8.2 },
  BE: { name: "Belgium", lat: 50.5, lng: 4.5 },
  CH: { name: "Switzerland", lat: 46.8, lng: 8.2 },
  NO: { name: "Norway", lat: 60.5, lng: 8.5 },
  DK: { name: "Denmark", lat: 56.3, lng: 9.5 },
  FI: { name: "Finland", lat: 61.9, lng: 25.7 },
  PL: { name: "Poland", lat: 51.9, lng: 19.1 },
  RU: { name: "Russia", lat: 61.5, lng: 105.3 },
  TR: { name: "Turkey", lat: 38.9, lng: 35.2 },
  IL: { name: "Israel", lat: 31.0, lng: 34.9 },
  QA: { name: "Qatar", lat: 25.3, lng: 51.2 },
  KW: { name: "Kuwait", lat: 29.3, lng: 47.5 },
  OM: { name: "Oman", lat: 21.5, lng: 55.9 },
  BH: { name: "Bahrain", lat: 26.0, lng: 50.5 },
  HK: { name: "Hong Kong", lat: 22.3, lng: 114.2 },
  TW: { name: "Taiwan", lat: 23.7, lng: 121.0 },
  UA: { name: "Ukraine", lat: 48.4, lng: 31.2 },
  GR: { name: "Greece", lat: 39.1, lng: 21.8 },
  RO: { name: "Romania", lat: 45.9, lng: 24.9 },
  CZ: { name: "Czechia", lat: 49.8, lng: 15.5 },
  HU: { name: "Hungary", lat: 47.2, lng: 19.5 },
};

export function countryName(code: string | null | undefined): string | null {
  if (!code) return null;
  if (code === "UNKNOWN") return "Unknown";
  return COUNTRY_COORDS[code.toUpperCase()]?.name ?? code;
}

export function countryCoords(code: string): { name: string; lat: number; lng: number } | null {
  return COUNTRY_COORDS[code.toUpperCase()] ?? null;
}

/** Equirectangular projection onto a 0-100% x 0-100% container. */
export function projectLatLng(lat: number, lng: number): { xPct: number; yPct: number } {
  const xPct = ((lng + 180) / 360) * 100;
  const yPct = ((90 - lat) / 180) * 100;
  return { xPct, yPct };
}

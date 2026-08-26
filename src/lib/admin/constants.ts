export const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export function rangeToDays(range: string | undefined): number {
  switch (range) {
    case "7d":
      return 7;
    case "14d":
      return 14;
    case "90d":
      return 90;
    default:
      return 30;
  }
}

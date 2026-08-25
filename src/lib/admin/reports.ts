import "server-only";

import { getOverviewStats } from "./queries";

export type ReportRange = { from: Date; to: Date; label: string };

/** Parses `?range=7d|30d|90d|custom&from=...&to=...` into concrete dates. */
export function resolveReportRange(searchParams: URLSearchParams): ReportRange {
  const range = searchParams.get("range") ?? "30d";
  const to = new Date();

  if (range === "custom") {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const from = fromParam ? new Date(fromParam) : new Date(to.getTime() - 30 * 86400_000);
    const parsedTo = toParam ? new Date(toParam) : to;
    return { from, to: parsedTo, label: `${from.toISOString().slice(0, 10)}_to_${parsedTo.toISOString().slice(0, 10)}` };
  }

  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const from = new Date(to.getTime() - days * 86400_000);
  return { from, to, label: `last_${days}_days` };
}

export async function getReportOverview(range: ReportRange) {
  const days = Math.max(1, Math.round((range.to.getTime() - range.from.getTime()) / 86400_000));
  return getOverviewStats(days);
}

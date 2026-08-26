import type Anthropic from "@anthropic-ai/sdk";
import * as queries from "@/lib/admin/queries";

export const ASSISTANT_TOOLS: Anthropic.Tool[] = [
  {
    name: "getOverviewStats",
    description:
      "Traffic/conversion overview for the last N days (visitors, sessions, leads, conversion rate, avg session duration), each with percent change vs the prior equal period. Use for general 'how are we doing' questions.",
    input_schema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Lookback window in days. Default 30." },
      },
    },
  },
  {
    name: "getOverviewBreakdowns",
    description: "Top device types, browsers, and pages visited over the last N days.",
    input_schema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Lookback window in days. Default 30." },
      },
    },
  },
  {
    name: "getDailyTimeSeries",
    description: "Day-by-day visitor/session/lead counts for the last N days, for spotting trends.",
    input_schema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Lookback window in days. Default 30." },
      },
    },
  },
  {
    name: "getTrafficSources",
    description: "Sessions and leads grouped by traffic source/medium/campaign for the last N days — which channels drive traffic and which actually convert.",
    input_schema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Lookback window in days. Default 30." },
      },
    },
  },
  {
    name: "getVisitorsByCountry",
    description: "Visitor and lead counts grouped by country for the last N days.",
    input_schema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Lookback window in days. Default 30." },
      },
    },
  },
  {
    name: "getRecentLeads",
    description: "The most recently submitted leads (name, phone, status, source, submitted-at). Use for 'show me the latest leads' type questions.",
    input_schema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "How many leads to return. Default 5." },
      },
    },
  },
  {
    name: "getLeads",
    description:
      "Search/filter leads by status, free-text (name/phone/email), source, country, or device. Omit a filter to not constrain by it. Use for questions about specific leads or lead segments, not for a full dump — prefer a narrow filter.",
    input_schema: {
      type: "object",
      properties: {
        status: { type: "string", description: "new | contacted | qualified | won | lost" },
        search: { type: "string", description: "Matches against name, phone, or email." },
        source: { type: "string" },
        country: { type: "string" },
        device: { type: "string" },
      },
    },
  },
  {
    name: "getSessionStats",
    description: "Session totals for the last N days: total, converted (produced a lead), bounced, and average duration.",
    input_schema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Lookback window in days. Default 30." },
      },
    },
  },
  {
    name: "getFunnelStats",
    description:
      "The ad-click-to-lead conversion funnel (page views → scroll → CTA click → form start → lead submit) for the last N days, optionally scoped to Meta-ads traffic only.",
    input_schema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Lookback window in days. Default 30." },
        source: { type: "string", description: "'all' or 'meta'. Default 'all'." },
      },
    },
  },
  {
    name: "getCtaStats",
    description: "Per-CTA view/hover/click counts and click-through-rate for the last N days.",
    input_schema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Lookback window in days. Default 30." },
      },
    },
  },
  {
    name: "getFormStats",
    description: "Per-form view/start/submit/abandon/validation-error counts and completion rate for the last N days.",
    input_schema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Lookback window in days. Default 30." },
      },
    },
  },
  {
    name: "getPerformanceStats",
    description: "Core Web Vitals (LCP, INP, CLS, FCP, TTFB) averages and good/needs-improvement/poor breakdown for the last N days.",
    input_schema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Lookback window in days. Default 30." },
      },
    },
  },
  {
    name: "getTechStackStats",
    description: "Visitor breakdown by device, browser, and OS for the last N days, including conversion-rate cohorts by each.",
    input_schema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Lookback window in days. Default 30." },
      },
    },
  },
  {
    name: "getErrors",
    description: "Most recent client-side errors (JS errors, unhandled rejections, failed image loads, lead-submit failures).",
    input_schema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "How many errors to return. Default 100." },
      },
    },
  },
];

type ToolInput = Record<string, unknown>;

const TOOL_HANDLERS: Record<string, (input: ToolInput) => Promise<unknown>> = {
  getOverviewStats: (input) => queries.getOverviewStats(input.days as number | undefined),
  getOverviewBreakdowns: (input) => queries.getOverviewBreakdowns(input.days as number | undefined),
  getDailyTimeSeries: (input) => queries.getDailyTimeSeries(input.days as number | undefined),
  getTrafficSources: (input) => queries.getTrafficSources(input.days as number | undefined),
  getVisitorsByCountry: (input) => queries.getVisitorsByCountry(input.days as number | undefined),
  getRecentLeads: (input) => queries.getRecentLeads(input.limit as number | undefined),
  getLeads: (input) =>
    queries.getLeads({
      status: input.status as string | undefined,
      search: input.search as string | undefined,
      source: input.source as string | undefined,
      country: input.country as string | undefined,
      device: input.device as string | undefined,
    }),
  getSessionStats: (input) => queries.getSessionStats(input.days as number | undefined),
  getFunnelStats: (input) =>
    queries.getFunnelStats(input.days as number | undefined, input.source as "all" | "meta" | undefined),
  getCtaStats: (input) => queries.getCtaStats(input.days as number | undefined),
  getFormStats: (input) => queries.getFormStats(input.days as number | undefined),
  getPerformanceStats: (input) => queries.getPerformanceStats(input.days as number | undefined),
  getTechStackStats: (input) => queries.getTechStackStats(input.days as number | undefined),
  getErrors: (input) => queries.getErrors(input.limit as number | undefined),
};

export async function runTool(name: string, input: ToolInput): Promise<unknown> {
  const handler = TOOL_HANDLERS[name];
  if (!handler) throw new Error(`Unknown assistant tool: ${name}`);
  return handler(input);
}

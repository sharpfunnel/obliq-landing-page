export type SessionEntryMeta = {
  entryPath: string;
  referrer: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  gclid: string | null;
  fbclid: string | null;
  msclkid: string | null;
  placement: string | null;
  metaCampaignId: string | null;
  metaAdsetId: string | null;
  metaAdId: string | null;
  /** Every query param present on the landing URL, verbatim — a catch-all so no
   *  acquisition signal is lost even if it isn't one of the named fields above. */
  rawParams: Record<string, string>;
};

export type DeviceInfo = {
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  deviceType: "mobile" | "tablet" | "desktop" | null;
  screenWidth: number;
  screenHeight: number;
  language: string | null;
  timezone: string | null;
};

export type TrackInitPayload = {
  visitorId: string;
  isNewVisitor: boolean;
  sessionId: string;
  isNewSession: boolean;
  device: DeviceInfo;
  entryMeta: SessionEntryMeta;
  viewportWidth: number;
  viewportHeight: number;
};

export type PageViewEventPayload = {
  path: string;
  title: string | null;
  enteredAt: number;
  timeOnPage: number | null;
};

export type ScrollEventPayload = { path: string; depth: number; timeToReach: number | null };

export type CtaEventPayload = {
  ctaId: string;
  action: "viewed" | "hovered" | "clicked";
  timeBeforeClick: number | null;
};

export type FormEventPayload = {
  formId: string;
  action: "viewed" | "started" | "field_focus" | "field_complete" | "validation_error" | "abandoned" | "submitted";
  fieldName?: string | null;
  errorMessage?: string | null;
};

export type PerfEventPayload = {
  path: string;
  metric: "LCP" | "INP" | "CLS" | "FCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
};

export type ErrorEventPayload = {
  type: "js" | "unhandled_rejection" | "image_load" | "lead_submit";
  message: string;
  stack?: string | null;
  path: string;
};

export type MouseEventPayload = {
  path: string;
  type: "rage_click" | "dead_click" | "double_click";
  x: number;
  y: number;
  targetSelector: string | null;
  hoverDuration: number | null;
};

export type GenericEventPayload = { name: string; metadata?: Record<string, unknown> };

export type TrackBatchPayload = {
  init: TrackInitPayload;
  pageViews?: PageViewEventPayload[];
  scrollEvents?: ScrollEventPayload[];
  ctaEvents?: CtaEventPayload[];
  formEvents?: FormEventPayload[];
  perfMetrics?: PerfEventPayload[];
  errors?: ErrorEventPayload[];
  mouseEvents?: MouseEventPayload[];
  events?: GenericEventPayload[];
  exitPath?: string;
  isFinal?: boolean;
};

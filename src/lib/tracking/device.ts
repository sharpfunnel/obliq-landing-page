import type { DeviceInfo } from "./types";

/** Lightweight UA parsing — good enough for analytics buckets, not a fingerprinting library. */
export function detectDevice(): DeviceInfo {
  const ua = navigator.userAgent;

  let browser: string | null = null;
  let browserVersion: string | null = null;
  const browserMatchers: Array<[RegExp, string]> = [
    [/Edg\/([\d.]+)/, "Edge"],
    [/OPR\/([\d.]+)/, "Opera"],
    [/Chrome\/([\d.]+)/, "Chrome"],
    [/Firefox\/([\d.]+)/, "Firefox"],
    [/Version\/([\d.]+).*Safari/, "Safari"],
  ];
  for (const [re, name] of browserMatchers) {
    const match = ua.match(re);
    if (match) {
      browser = name;
      browserVersion = match[1];
      break;
    }
  }

  let os: string | null = null;
  let osVersion: string | null = null;
  const winMatch = ua.match(/Windows NT ([\d.]+)/);
  const macMatch = ua.match(/Mac OS X ([\d_]+)/);
  const androidMatch = ua.match(/Android ([\d.]+)/);
  const iosMatch = ua.match(/OS ([\d_]+) like Mac OS X/);
  if (winMatch) {
    os = "Windows";
    osVersion = { "10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7" }[winMatch[1]] ?? winMatch[1];
  } else if (macMatch) {
    os = "macOS";
    osVersion = macMatch[1].replace(/_/g, ".");
  } else if (androidMatch) {
    os = "Android";
    osVersion = androidMatch[1];
  } else if (iosMatch) {
    os = "iOS";
    osVersion = iosMatch[1].replace(/_/g, ".");
  } else if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let deviceType: DeviceInfo["deviceType"] = "desktop";
  if (/iPad|Tablet/.test(ua)) deviceType = "tablet";
  else if (/Mobi|Android.*Mobile|iPhone/.test(ua)) deviceType = "mobile";

  // Network Information API — Chromium-only, undefined on Safari/Firefox.
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number } })
    .connection;

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    deviceType,
    screenWidth: window.screen?.width ?? 0,
    screenHeight: window.screen?.height ?? 0,
    language: navigator.language ?? null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
    connectionType: connection?.effectiveType ?? null,
    connectionDownlink: connection?.downlink ?? null,
  };
}

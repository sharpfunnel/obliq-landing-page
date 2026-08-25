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
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let deviceType: DeviceInfo["deviceType"] = "desktop";
  if (/iPad|Tablet/.test(ua)) deviceType = "tablet";
  else if (/Mobi|Android.*Mobile|iPhone/.test(ua)) deviceType = "mobile";

  return {
    browser,
    browserVersion,
    os,
    deviceType,
    screenWidth: window.screen?.width ?? 0,
    screenHeight: window.screen?.height ?? 0,
    language: navigator.language ?? null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
  };
}

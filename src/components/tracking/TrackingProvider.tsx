"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  flush,
  initTrackingQueue,
  setExitPath,
  trackError,
  trackGenericEvent,
  trackMouse,
  trackMouseClickCount,
  trackMouseMoveCount,
  trackPageView,
  trackPerf,
  trackScroll,
} from "@/lib/tracking/track";
import { startSessionReplay } from "@/lib/tracking/replay";

const SCROLL_MILESTONES = [25, 50, 75, 90, 100];
const RAGE_CLICK_WINDOW_MS = 800;
const RAGE_CLICK_RADIUS_PX = 24;
const RAGE_CLICK_THRESHOLD = 3;

function isInteractive(el: Element | null): boolean {
  if (!el) return false;
  const interactive = el.closest('a[href], button, input, select, textarea, [role="button"], [onclick], label');
  if (interactive) return true;
  const style = window.getComputedStyle(el as Element);
  return style.cursor === "pointer";
}

function cssPath(el: Element): string {
  if (el.id) return `#${el.id}`;
  const tag = el.tagName.toLowerCase();
  const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
  return cls ? `${tag}.${cls}` : tag;
}

export default function TrackingProvider() {
  const pathname = usePathname();
  const milestonesReached = useRef<Set<number>>(new Set());
  const recentClicks = useRef<Array<{ t: number; x: number; y: number }>>([]);

  const isAdmin = pathname?.startsWith("/admin") ?? false;

  // Page view + scroll milestones per path
  useEffect(() => {
    if (isAdmin) return;

    initTrackingQueue();
    startSessionReplay();

    const enteredAt = Date.now();
    milestonesReached.current = new Set();

    trackPageView({ path: pathname ?? "/", title: document.title, enteredAt, timeOnPage: null });

    function onScroll() {
      const doc = document.documentElement;
      const scrolled = window.scrollY + window.innerHeight;
      const total = doc.scrollHeight;
      if (total <= 0) return;
      const pct = Math.min(100, Math.round((scrolled / total) * 100));

      for (const milestone of SCROLL_MILESTONES) {
        if (pct >= milestone && !milestonesReached.current.has(milestone)) {
          milestonesReached.current.add(milestone);
          trackScroll({ path: pathname ?? "/", depth: milestone, timeToReach: Date.now() - enteredAt });
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      setExitPath(pathname ?? "/");
      flush();
    };
  }, [pathname, isAdmin]);

  // JS errors, resource load errors, unhandled rejections
  useEffect(() => {
    if (isAdmin) return;

    function onError(event: ErrorEvent | Event) {
      const target = event.target as HTMLElement | null;
      if (target && target !== (window as unknown as HTMLElement) && target.tagName === "IMG") {
        const src = (target as HTMLImageElement).src;
        trackError({ type: "image_load", message: `Failed to load image: ${src}`, path: location.pathname });
        return;
      }
      if (event instanceof ErrorEvent) {
        trackError({
          type: "js",
          message: event.message,
          stack: event.error?.stack ?? null,
          path: location.pathname,
        });
      }
    }

    function onRejection(event: PromiseRejectionEvent) {
      const reason = event.reason as { message?: string; stack?: string } | undefined;
      trackError({
        type: "unhandled_rejection",
        message: reason?.message ?? String(event.reason),
        stack: reason?.stack ?? null,
        path: location.pathname,
      });
    }

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [isAdmin]);

  // Rage clicks / dead clicks / double clicks
  useEffect(() => {
    if (isAdmin) return;

    function onClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const now = Date.now();

      trackMouseClickCount();

      recentClicks.current.push({ t: now, x: event.clientX, y: event.clientY });
      recentClicks.current = recentClicks.current.filter((c) => now - c.t < RAGE_CLICK_WINDOW_MS);
      const clustered = recentClicks.current.filter(
        (c) => Math.hypot(c.x - event.clientX, c.y - event.clientY) < RAGE_CLICK_RADIUS_PX
      );
      if (clustered.length >= RAGE_CLICK_THRESHOLD) {
        recentClicks.current = [];
        trackMouse({
          path: location.pathname,
          type: "rage_click",
          x: event.clientX,
          y: event.clientY,
          targetSelector: target ? cssPath(target) : null,
          hoverDuration: null,
        });
        return;
      }

      if (!isInteractive(target)) {
        const mutationCountBefore = document.body.getElementsByTagName("*").length;
        setTimeout(() => {
          const mutationCountAfter = document.body.getElementsByTagName("*").length;
          if (mutationCountAfter === mutationCountBefore) {
            trackMouse({
              path: location.pathname,
              type: "dead_click",
              x: event.clientX,
              y: event.clientY,
              targetSelector: target ? cssPath(target) : null,
              hoverDuration: null,
            });
          }
        }, 500);
      }
    }

    function onDblClick(event: MouseEvent) {
      const target = event.target as Element | null;
      trackMouse({
        path: location.pathname,
        type: "double_click",
        x: event.clientX,
        y: event.clientY,
        targetSelector: target ? cssPath(target) : null,
        hoverDuration: null,
      });
    }

    let lastMoveAt = 0;
    function onMouseMove() {
      const now = Date.now();
      if (now - lastMoveAt < 150) return; // sample movement, don't count every pixel
      lastMoveAt = now;
      trackMouseMoveCount();
    }

    document.addEventListener("click", onClick, true);
    document.addEventListener("dblclick", onDblClick, true);
    document.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("dblclick", onDblClick, true);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [isAdmin]);

  // Core Web Vitals
  useEffect(() => {
    if (isAdmin) return;
    let cancelled = false;

    import("web-vitals").then(({ onLCP, onINP, onCLS, onFCP, onTTFB }) => {
      if (cancelled) return;
      const report = (metric: { name: string; value: number; rating: string }) => {
        trackPerf({
          path: location.pathname,
          metric: metric.name as never,
          value: metric.value,
          rating: metric.rating as never,
        });
      };
      onLCP(report);
      onINP(report);
      onCLS(report);
      onFCP(report);
      onTTFB(report);
    });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  // Heatmap click/hover coordinate capture — normalized against the FULL page
  // (scrollWidth/scrollHeight), not just the current viewport. A click's position on the
  // page doesn't change as the visitor scrolls, so the stored % must be scroll-independent —
  // otherwise the same physical spot on the page gets a different xPct/yPct depending on how
  // far down the visitor had scrolled when they clicked.
  useEffect(() => {
    if (isAdmin) return;

    function onClick(event: MouseEvent) {
      const doc = document.documentElement;
      const pageWidth = doc.scrollWidth || window.innerWidth;
      const pageHeight = doc.scrollHeight || window.innerHeight;

      trackGenericEvent({
        name: "heatmap_click",
        metadata: {
          path: location.pathname,
          xPct: ((window.scrollX + event.clientX) / pageWidth) * 100,
          yPct: ((window.scrollY + event.clientY) / pageHeight) * 100,
          viewportWidth: window.innerWidth,
        },
      });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [isAdmin]);

  return null;
}

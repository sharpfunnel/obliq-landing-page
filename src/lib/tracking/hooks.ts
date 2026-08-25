"use client";

import { useEffect, useRef } from "react";
import { trackCta, trackForm } from "./track";

/** Fires `viewed` once when the element enters the viewport, `hovered` once on
 *  first hover, and `clicked` (with time-since-first-hover) on click. */
export function useCtaTracking(ctaId: string) {
  const ref = useRef<HTMLElement | null>(null);
  const hoveredAt = useRef<number | null>(null);
  const viewedFired = useRef(false);
  const hoveredFired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || viewedFired.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !viewedFired.current) {
          viewedFired.current = true;
          trackCta({ ctaId, action: "viewed", timeBeforeClick: null });
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ctaId]);

  function onMouseEnter() {
    if (!hoveredFired.current) {
      hoveredFired.current = true;
      hoveredAt.current = Date.now();
      trackCta({ ctaId, action: "hovered", timeBeforeClick: null });
    }
  }

  function onClick() {
    const timeBeforeClick = hoveredAt.current ? Date.now() - hoveredAt.current : null;
    trackCta({ ctaId, action: "clicked", timeBeforeClick });
  }

  return { ref, onMouseEnter, onClick };
}

/** Wires the viewed/started/field_focus/field_complete/validation_error/abandoned/submitted
 *  funnel for a form. `abandoned` fires once, on unmount or tab-close, only if the visitor
 *  started filling the form and never actually submitted it. */
export function useFormTracking(formId: string) {
  const ref = useRef<HTMLElement | null>(null);
  const started = useRef(false);
  const submitted = useRef(false);
  const viewedFired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || viewedFired.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !viewedFired.current) {
          viewedFired.current = true;
          trackForm({ formId, action: "viewed" });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [formId]);

  useEffect(() => {
    const maybeReportAbandoned = () => {
      if (started.current && !submitted.current) {
        trackForm({ formId, action: "abandoned" });
      }
    };
    window.addEventListener("pagehide", maybeReportAbandoned);
    return () => {
      maybeReportAbandoned();
      window.removeEventListener("pagehide", maybeReportAbandoned);
    };
  }, [formId]);

  function onFieldFocus(fieldName: string) {
    if (!started.current) {
      started.current = true;
      trackForm({ formId, action: "started" });
    }
    trackForm({ formId, action: "field_focus", fieldName });
  }

  function onFieldComplete(fieldName: string) {
    trackForm({ formId, action: "field_complete", fieldName });
  }

  function onValidationError(fieldName: string, errorMessage: string) {
    trackForm({ formId, action: "validation_error", fieldName, errorMessage });
  }

  function onSubmitted() {
    submitted.current = true;
    trackForm({ formId, action: "submitted" });
  }

  return { ref, onFieldFocus, onFieldComplete, onValidationError, onSubmitted };
}

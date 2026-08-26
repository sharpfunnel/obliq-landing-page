"use client";

import type { ReactNode } from "react";
import { useCtaTracking } from "@/lib/tracking/hooks";

export default function CtaLink({
  ctaId,
  href,
  className,
  children,
}: {
  ctaId: string;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const { ref, onMouseEnter, onClick } = useCtaTracking(ctaId);

  return (
    <a
      ref={ref as React.RefObject<HTMLAnchorElement>}
      href={href}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={className}
    >
      {children}
    </a>
  );
}

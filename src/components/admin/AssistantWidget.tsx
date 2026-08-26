"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import AssistantChat from "./AssistantChat";

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="flex h-144 max-h-[calc(100vh-3rem)] w-96 max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-navy-200 bg-white shadow-2xl ring-1 ring-black/5 sm:w-104">
          <div className="flex items-center justify-between bg-navy-950 px-4 py-3.5">
            <span className="flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles size={16} className="text-gold-400" /> Assistant
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="rounded-md p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <AssistantChat />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open assistant"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-800 text-gold-400 shadow-lg transition hover:scale-105 hover:bg-navy-900"
        >
          <Sparkles size={22} />
        </button>
      )}
    </div>
  );
}

"use client";

import type { PendingChange } from "@codesync/socket-types";

interface PendingChangesBannerProps {
  changes: PendingChange[];
  onAccept: (change: PendingChange) => void;
  onReject: (change: PendingChange) => void;
}

export default function PendingChangesBanner({
  changes,
  onAccept,
  onReject,
}: PendingChangesBannerProps) {
  if (changes.length === 0) return null;

  return (
    <div
      className="border-b border-red-900/50 px-4 py-2 flex items-center gap-3 flex-shrink-0 animate-slide-up"
      style={{ background: "rgba(127,29,29,0.25)" }}
    >
      <div className="flex items-center gap-2 flex-1">
        <span className="w-2 h-2 rounded-full bg-red-500 notification-pulse" />
        <span className="text-sm font-mono text-red-300">
          <strong>{changes[0]?.fromName}</strong> wants to make changes to the code
        </span>
        {changes.length > 1 && (
          <span className="text-xs font-mono text-red-500 bg-red-950 border border-red-800 px-2 py-0.5 rounded-full">
            +{changes.length - 1} more
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Preview diff size */}
        <span className="text-xs font-mono text-slate-500">
          {changes[0]?.code?.length} chars
        </span>

        {/* Accept */}
        <button
          onClick={() => onAccept(changes[0]!)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/50 border border-emerald-700 text-emerald-400 text-xs font-mono hover:bg-emerald-800/50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Accept → Apply to VS Code
        </button>

        {/* Reject */}
        <button
          onClick={() => onReject(changes[0]!)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/50 border border-red-800 text-red-400 text-xs font-mono hover:bg-red-900/50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Reject
        </button>

        {/* Accept All */}
        {changes.length > 1 && (
          <button
            onClick={() => changes.forEach(onAccept)}
            className="text-xs font-mono text-slate-500 hover:text-white transition-colors px-2"
          >
            Accept All
          </button>
        )}
      </div>
    </div>
  );
}

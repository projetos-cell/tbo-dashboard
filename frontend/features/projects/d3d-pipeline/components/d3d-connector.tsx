"use client";

/** Arrow connector between phase cards */
export function D3DConnector() {
  return (
    <div className="relative flex w-6 flex-shrink-0 items-center">
      <div className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-200" />
      <div
        className="absolute -right-px top-1/2 h-0 w-0 -translate-y-1/2"
        style={{
          borderTop: "4px solid transparent",
          borderBottom: "4px solid transparent",
          borderLeft: "6px solid #d4d4d8",
        }}
      />
    </div>
  );
}

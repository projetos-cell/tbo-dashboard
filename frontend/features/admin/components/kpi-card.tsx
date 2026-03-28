import React from "react";

interface KpiCardProps {
  label: string;
  value: number | string;
  color?: string;
  isText?: boolean;
  icon?: React.ReactNode;
}

export function KpiCard({ label, value, color, isText, icon }: KpiCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <p
        className={`mt-1 font-bold ${isText ? "text-base" : "text-2xl"}`}
        style={color ? { color } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

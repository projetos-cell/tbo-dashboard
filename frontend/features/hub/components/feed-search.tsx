"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";

const T = {
  text: "#0f0f0f",
  muted: "#4a4a4a",
  orange: "#c45a1a",
  glass: "rgba(255,255,255,0.65)",
  glassBorder: "rgba(255,255,255,0.45)",
  glassBlur: "blur(16px) saturate(180%)",
  r: "10px",
};

interface FeedSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function FeedSearch({ value, onChange }: FeedSearchProps) {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const debounce = useCallback(
    (val: string) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => onChange(val), 300);
    },
    [onChange]
  );

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  function handleChange(val: string) {
    setLocal(val);
    debounce(val);
  }

  function handleClear() {
    setLocal("");
    onChange("");
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2"
      style={{
        background: T.glass,
        backdropFilter: T.glassBlur,
        WebkitBackdropFilter: T.glassBlur,
        border: `1px solid ${T.glassBorder}`,
        borderRadius: T.r,
      }}
    >
      <IconSearch className="size-4 shrink-0" style={{ color: T.muted }} />
      <input
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Buscar no feed..."
        className="flex-1 text-xs bg-transparent outline-none placeholder:text-gray-400"
        style={{ color: T.text }}
      />
      {local && (
        <button onClick={handleClear} className="shrink-0">
          <IconX className="size-3.5" style={{ color: T.muted }} />
        </button>
      )}
    </div>
  );
}

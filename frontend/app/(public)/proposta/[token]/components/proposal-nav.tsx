"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface NavItem {
  id: string;
  label: string;
}

interface ProposalNavProps {
  items: NavItem[];
}

export function ProposalNav({ items }: ProposalNavProps) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 },
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b"
    >
      <div className="max-w-3xl mx-auto px-4 overflow-x-auto scrollbar-none">
        <div className="flex gap-1 py-2 min-w-max">
          {items.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                active === id
                  ? "bg-[#18181B] text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}

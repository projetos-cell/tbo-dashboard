"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PROJETOS_NAV_ITEMS } from "@/lib/constants";
import { TabErrorBoundary } from "@/components/shared";

export default function ProjetosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDetailPage = /^\/projetos\/[0-9a-f]{8}-/.test(pathname);

  return (
    <TabErrorBoundary fallbackLabel="Projetos">
      {!isDetailPage && (
        <div
          className="sticky top-0 z-20 mb-4 -mt-4 -mx-4 md:-mt-6 md:-mx-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #c45a1a 100%)",
            boxShadow: "0 4px 20px rgba(196,90,26,0.12)",
          }}
        >
          {/* Decorative */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
            <div className="absolute -top-6 -right-6 size-24 border-[2px] border-white rounded-full" />
            <div className="absolute bottom-0 left-8 size-12 border-[2px] border-white rounded-full" />
          </div>
          <nav className="relative z-10 overflow-x-auto px-4 md:px-6">
            <div className="flex items-center gap-1 min-w-max">
              {PROJETOS_NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/projetos"
                    ? pathname === "/projetos"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-3 py-3 text-[11px] font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "text-white"
                        : "text-white/50 hover:text-white/80",
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-white" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
      {children}
    </TabErrorBoundary>
  );
}

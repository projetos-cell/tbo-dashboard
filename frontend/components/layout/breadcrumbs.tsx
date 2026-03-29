"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NAV_ITEMS } from "@/lib/constants";
import { useBreadcrumbLabel } from "@/hooks/use-breadcrumb-label";
import React from "react";

const LABEL_MAP: Record<string, string> = {};
NAV_ITEMS.forEach((item) => {
  const slug = item.href.replace("/", "");
  LABEL_MAP[slug] = item.label;
});

// Extra labels for sub-pages
const EXTRA_LABELS: Record<string, string> = {
  pilares: "Pilares",
  rituais: "Rituais",
  politicas: "Politicas",
  reconhecimentos: "Reconhecimentos",
  manual: "Manual",
  analytics: "Analytics",
  novo: "Novo",
  editar: "Editar",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const isUuid = UUID_RE.test(seg);
    const label = isUuid ? seg : (LABEL_MAP[seg] || EXTRA_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "));
    const isLast = i === segments.length - 1;
    return { href, label, isLast, isUuid, segment: seg };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.isUuid ? (
                <UuidBreadcrumb crumb={crumb} parentSegment={i > 0 ? crumbs[i - 1].segment : undefined} />
              ) : crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function UuidBreadcrumb({ crumb, parentSegment }: {
  crumb: { href: string; label: string; isLast: boolean; segment: string };
  parentSegment?: string;
}) {
  const resolvedLabel = useBreadcrumbLabel(crumb.segment, parentSegment);
  const displayLabel = resolvedLabel ?? crumb.segment.slice(0, 8) + "...";

  if (crumb.isLast) {
    return <BreadcrumbPage className="max-w-[200px] truncate">{displayLabel}</BreadcrumbPage>;
  }
  return (
    <BreadcrumbLink asChild>
      <Link href={crumb.href} className="max-w-[200px] truncate">{displayLabel}</Link>
    </BreadcrumbLink>
  );
}

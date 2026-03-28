"use client";

import Image from "next/image";
import { IconBuildingSkyscraper } from "@tabler/icons-react";

interface PortalBrandingProps {
  /** URL of the client/project logo */
  portalLogoUrl?: string | null;
  /** Primary accent color (hex, e.g. "#1a73e8") */
  portalPrimaryColor?: string | null;
  /** Company name to display */
  portalCompanyName?: string | null;
  /** Optional subtitle / project name */
  subtitle?: string | null;
}

/**
 * Portal branding header.
 * Applies custom logo, company name, and themed accent color from project settings.
 * Used in both the internal project portal tab and the public client portal view.
 */
export function PortalBranding({
  portalLogoUrl,
  portalPrimaryColor,
  portalCompanyName,
  subtitle,
}: PortalBrandingProps) {
  const accentColor = portalPrimaryColor ?? "#6366f1";
  const displayName = portalCompanyName ?? "Portal do Cliente";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border/50"
      style={{ background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 100%)` }}
    >
      {/* Accent bar at top */}
      <div
        className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-center gap-4 px-6 py-5">
        {/* Logo or fallback icon */}
        {portalLogoUrl ? (
          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border/40 bg-white shadow-sm">
            <Image
              src={portalLogoUrl}
              alt={`${displayName} logo`}
              fill
              className="object-contain p-1"
              unoptimized
            />
          </div>
        ) : (
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm"
            style={{ backgroundColor: `${accentColor}20`, border: `1px solid ${accentColor}30` }}
          >
            <IconBuildingSkyscraper
              className="size-6"
              style={{ color: accentColor }}
            />
          </div>
        )}

        {/* Text */}
        <div className="min-w-0">
          <h2 className="text-base font-bold leading-tight truncate" style={{ color: accentColor }}>
            {displayName}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>

        {/* Decorative accent dot */}
        <div
          className="ml-auto size-2.5 shrink-0 rounded-full opacity-40"
          style={{ backgroundColor: accentColor }}
        />
      </div>
    </div>
  );
}

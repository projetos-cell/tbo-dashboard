"use client";

import { IconWorld, IconBrandLinkedin, IconBrandInstagram } from "@tabler/icons-react";

const LINKS = [
  {
    label: "Site TBO",
    icon: IconWorld,
    href: "https://wearetbo.com.br/",
  },
  {
    label: "LinkedIn",
    icon: IconBrandLinkedin,
    href: "https://www.linkedin.com/company/agenciatbo",
  },
  {
    label: "Instagram",
    icon: IconBrandInstagram,
    href: "https://instagram.com/agenciatbo",
  },
];

export function SocialLinks() {
  return (
    <div className="col-span-full flex flex-wrap gap-3">
      {LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-2xl bg-secondary/20 p-3 px-4 backdrop-blur-sm transition-colors hover:bg-secondary/40"
          aria-label={link.label}
        >
          <link.icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{link.label}</span>
        </a>
      ))}
    </div>
  );
}

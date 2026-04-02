"use client";

import { useState } from "react";
import {
  IconHome,
  IconListDetails,
  IconChartBar,
  IconFolder,
  IconChevronLeft,
  IconChevronDown,
  IconChevronRight,
  IconFile,
  IconPresentation,
  IconFileText,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { key: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

interface PortalSidebarProps {
  projectName: string;
  clientCompany: string | null;
  activeItem: string;
  onItemChange: (key: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  documents?: { id: string; name: string; type: string }[];
}

const MAIN_ITEMS: SidebarItem[] = [
  { key: "home", label: "Home page", icon: IconHome },
  { key: "tasks", label: "Tasks", icon: IconListDetails },
  { key: "analytics", label: "Analytics", icon: IconChartBar },
  { key: "documents", label: "Documents", icon: IconFolder },
];

function getDocIcon(type: string) {
  if (type.includes("presentation") || type.includes("pptx")) return IconPresentation;
  if (type.includes("pdf") || type.includes("document")) return IconFileText;
  return IconFile;
}

export function PortalSidebar({
  projectName,
  clientCompany,
  activeItem,
  onItemChange,
  collapsed = false,
  onToggleCollapse,
  documents = [],
}: PortalSidebarProps) {
  const [expandedProject, setExpandedProject] = useState(true);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse toggle */}
      <div className="flex items-center justify-end p-3">
        <button
          onClick={onToggleCollapse}
          className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        >
          {collapsed ? (
            <IconChevronRight className="h-4 w-4" />
          ) : (
            <IconChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {MAIN_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onItemChange(item.key)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {item.key === "analytics" && !collapsed && (
                <IconChevronRight className="ml-auto h-4 w-4 text-zinc-300" />
              )}
            </button>
          );
        })}

        {/* Separator */}
        {!collapsed && (
          <div className="my-4 border-t border-zinc-100" />
        )}

        {/* Project tree */}
        {!collapsed && (
          <div>
            <button
              onClick={() => setExpandedProject(!expandedProject)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              <IconChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  !expandedProject && "-rotate-90"
                )}
              />
              <span className="truncate">{clientCompany ?? projectName}</span>
            </button>

            {expandedProject && documents.length > 0 && (
              <div className="ml-4 space-y-0.5 pl-3 border-l border-zinc-100">
                {documents.map((doc) => {
                  const DocIcon = getDocIcon(doc.type);
                  return (
                    <button
                      key={doc.id}
                      onClick={() => onItemChange(`doc:${doc.id}`)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                        activeItem === `doc:${doc.id}`
                          ? "bg-zinc-100 text-zinc-900"
                          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                      )}
                    >
                      <DocIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{doc.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}

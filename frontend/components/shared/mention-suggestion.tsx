"use client";

import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import type { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
} from "react";
import { IconUser, IconFolderOpen, IconSquareCheck, IconMessage } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────

export interface MentionItem {
  id: string;
  label: string;
  type: "person" | "project" | "task" | "message";
}

export interface MentionDataProvider {
  search: (query: string) => Promise<MentionItem[]> | MentionItem[];
}

// ─── Suggestion Config ───────────────────────────────────────

export function createMentionSuggestion(
  provider: MentionDataProvider
): Omit<SuggestionOptions<MentionItem>, "editor"> {
  return {
    items: async ({ query }: { query: string }) => {
      return provider.search(query);
    },
    render: () => {
      let component: ReactRenderer<MentionListRef> | null = null;
      let popup: TippyInstance[] | null = null;

      return {
        onStart: (props: SuggestionProps<MentionItem>) => {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) return;

          popup = tippy("body", {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
          });
        },
        onUpdate: (props: SuggestionProps<MentionItem>) => {
          component?.updateProps(props);
          if (popup && props.clientRect) {
            popup[0]?.setProps({
              getReferenceClientRect: props.clientRect as () => DOMRect,
            });
          }
        },
        onKeyDown: (props: { event: KeyboardEvent }) => {
          if (props.event.key === "Escape") {
            popup?.[0]?.hide();
            return true;
          }
          return (component?.ref as MentionListRef | null)?.onKeyDown(props) ?? false;
        },
        onExit: () => {
          popup?.[0]?.destroy();
          component?.destroy();
        },
      };
    },
  };
}

// ─── Mention List (dropdown) ─────────────────────────────────

interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListRef, SuggestionProps<MentionItem>>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = useCallback(
      (index: number) => {
        const item = props.items[index];
        if (item) {
          props.command({ id: item.id, label: item.label });
        }
      },
      [props]
    );

    useEffect(() => {
      setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((i) =>
            (i + props.items.length - 1) % props.items.length
          );
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i + 1) % props.items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (!props.items.length) {
      return (
        <div className="rounded-lg border bg-popover p-2 shadow-md">
          <p className="text-xs text-muted-foreground px-2 py-1">
            Nenhum resultado
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border bg-popover shadow-md overflow-hidden max-h-[200px] overflow-y-auto min-w-[200px]">
        {props.items.map((item, idx) => (
          <button
            type="button"
            key={item.id}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors",
              idx === selectedIndex
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted"
            )}
            onClick={() => selectItem(idx)}
          >
            <MentionIcon type={item.type} />
            <span className="truncate">{item.label}</span>
            <span className="ml-auto text-[10px] text-muted-foreground capitalize">
              {MENTION_TYPE_LABELS[item.type]}
            </span>
          </button>
        ))}
      </div>
    );
  }
);

MentionList.displayName = "MentionList";

// ─── Helpers ─────────────────────────────────────────────────

const MENTION_TYPE_LABELS: Record<MentionItem["type"], string> = {
  person: "pessoa",
  project: "projeto",
  task: "tarefa",
  message: "mensagem",
};

function MentionIcon({ type }: { type: MentionItem["type"] }) {
  const cls = "h-3.5 w-3.5 shrink-0 text-muted-foreground";
  switch (type) {
    case "person":
      return <IconUser className={cls} />;
    case "project":
      return <IconFolderOpen className={cls} />;
    case "task":
      return <IconSquareCheck className={cls} />;
    case "message":
      return <IconMessage className={cls} />;
  }
}

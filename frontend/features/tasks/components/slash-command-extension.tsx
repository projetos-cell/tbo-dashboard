"use client";

import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { SuggestionProps } from "@tiptap/suggestion";
import type { Editor } from "@tiptap/core";
import { cn } from "@/lib/utils";

// ─── Commands ─────────────────────────────────────────

interface SlashCommand {
  id: string;
  label: string;
  shortcut: string;
  execute: (editor: Editor) => void;
}

const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "h1",
    label: "Título 1",
    shortcut: "/h1",
    execute: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: "h2",
    label: "Título 2",
    shortcut: "/h2",
    execute: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: "h3",
    label: "Título 3",
    shortcut: "/h3",
    execute: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: "bullet",
    label: "Lista",
    shortcut: "/list",
    execute: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    id: "ordered",
    label: "Lista numerada",
    shortcut: "/ol",
    execute: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    id: "code",
    label: "Bloco de código",
    shortcut: "/code",
    execute: (e) => e.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: "divider",
    label: "Divisor",
    shortcut: "/---",
    execute: (e) => e.chain().focus().setHorizontalRule().run(),
  },
];

// ─── List Component ────────────────────────────────────

interface SlashListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const SlashCommandList = forwardRef<SlashListRef, SuggestionProps<SlashCommand>>(
  (props, ref) => {
    const [selected, setSelected] = useState(0);

    useEffect(() => setSelected(0), [props.items]);

    const execute = useCallback(
      (index: number) => {
        const item = props.items[index];
        if (item) props.command(item);
      },
      [props]
    );

    useImperativeHandle(ref, () => ({
      onKeyDown({ event }) {
        if (event.key === "ArrowUp") {
          setSelected((i) => (i + props.items.length - 1) % props.items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelected((i) => (i + 1) % props.items.length);
          return true;
        }
        if (event.key === "Enter") {
          execute(selected);
          return true;
        }
        return false;
      },
    }));

    if (!props.items.length) return null;

    return (
      <div className="rounded-lg border bg-popover shadow-lg overflow-hidden min-w-[200px] max-h-[280px] overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] text-muted-foreground border-b font-medium tracking-wide uppercase">
          Inserir bloco
        </div>
        {props.items.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-sm transition-colors",
              idx === selected
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-foreground"
            )}
            onClick={() => execute(idx)}
          >
            <span>{item.label}</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {item.shortcut}
            </span>
          </button>
        ))}
      </div>
    );
  }
);

SlashCommandList.displayName = "SlashCommandList";

// ─── Extension ────────────────────────────────────────

export function createSlashCommandExtension() {
  return Extension.create({
    name: "slashCommand",

    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          char: "/",
          startOfLine: false,

          items: ({ query }: { query: string }) => {
            if (!query) return SLASH_COMMANDS;
            const lower = query.toLowerCase();
            return SLASH_COMMANDS.filter(
              (cmd) =>
                cmd.label.toLowerCase().includes(lower) ||
                cmd.id.toLowerCase().includes(lower)
            );
          },

          command: ({
            editor,
            range,
            props,
          }: {
            editor: Editor;
            range: { from: number; to: number };
            props: SlashCommand;
          }) => {
            editor.chain().focus().deleteRange(range).run();
            props.execute(editor);
          },

          render: () => {
            let component: ReactRenderer<SlashListRef> | null = null;
            let popup: TippyInstance[] | null = null;

            return {
              onStart(props: SuggestionProps<SlashCommand>) {
                component = new ReactRenderer(SlashCommandList, {
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
              onUpdate(props: SuggestionProps<SlashCommand>) {
                component?.updateProps(props);
                if (popup && props.clientRect) {
                  popup[0]?.setProps({
                    getReferenceClientRect: props.clientRect as () => DOMRect,
                  });
                }
              },
              onKeyDown({ event }: { event: KeyboardEvent }) {
                if (event.key === "Escape") {
                  popup?.[0]?.hide();
                  return true;
                }
                return (
                  (component?.ref as SlashListRef | null)?.onKeyDown({
                    event,
                  }) ?? false
                );
              },
              onExit() {
                popup?.[0]?.destroy();
                component?.destroy();
              },
            };
          },
        }),
      ];
    },
  });
}

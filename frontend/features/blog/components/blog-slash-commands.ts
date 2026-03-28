import { Extension } from "@tiptap/core";
import Suggestion, { type SuggestionOptions, type SuggestionProps } from "@tiptap/suggestion";
import type { Editor } from "@tiptap/react";

export interface SlashCommand {
  title: string;
  description: string;
  icon: string;
  command: (editor: Editor) => void;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    title: "Titulo 1",
    description: "Heading grande",
    icon: "H1",
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: "Titulo 2",
    description: "Heading medio",
    icon: "H2",
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: "Titulo 3",
    description: "Heading pequeno",
    icon: "H3",
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: "Lista",
    description: "Lista com marcadores",
    icon: "•",
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: "Lista numerada",
    description: "Lista ordenada",
    icon: "1.",
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "Citacao",
    description: "Bloco de citacao",
    icon: '"',
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: "Divisor",
    description: "Linha horizontal",
    icon: "—",
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    title: "Bloco de codigo",
    description: "Bloco de codigo com syntax",
    icon: "</>",
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: "Tabela",
    description: "Inserir tabela 3x3",
    icon: "⊞",
    command: (editor) =>
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
];

export function buildSlashSuggestion(
  onOpen: (items: SlashCommand[], props: { clientRect: (() => DOMRect | null) | null; command: (item: SlashCommand) => void }) => void,
  onClose: () => void,
): Partial<SuggestionOptions<SlashCommand>> {
  return {
    char: "/",
    allowSpaces: false,
    startOfLine: false,
    items: ({ query }: { query: string }) => {
      const q = query.toLowerCase();
      return SLASH_COMMANDS.filter(
        (cmd) =>
          cmd.title.toLowerCase().includes(q) ||
          cmd.description.toLowerCase().includes(q),
      );
    },
    render: () => {
      return {
        onStart: (props: SuggestionProps<SlashCommand>) => {
          onOpen(props.items, { clientRect: props.clientRect ?? null, command: props.command });
        },
        onUpdate: (props: SuggestionProps<SlashCommand>) => {
          onOpen(props.items, { clientRect: props.clientRect ?? null, command: props.command });
        },
        onKeyDown: () => false,
        onExit: () => {
          onClose();
        },
      };
    },
  };
}

export const SlashCommandExtension = Extension.create({
  name: "slashCommands",
  addOptions() {
    return {
      suggestion: {} as Partial<SuggestionOptions>,
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

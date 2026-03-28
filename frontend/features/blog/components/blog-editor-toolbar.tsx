"use client";

import { useState, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import {
  IconBold, IconItalic, IconStrikethrough, IconLink, IconCode,
  IconH1, IconH2, IconH3, IconList, IconListNumbers, IconBlockquote,
  IconPhoto, IconArrowBackUp, IconArrowForwardUp, IconLineDashed,
  IconAlignLeft, IconAlignCenter, IconAlignRight, IconHighlight,
  IconSuperscript, IconSubscript, IconTable, IconLoader2, IconBraces,
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const BTN =
  "p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground data-[active=true]:text-foreground data-[active=true]:bg-muted disabled:opacity-40";

function Btn({
  tooltip,
  active,
  disabled,
  onClick,
  children,
}: {
  tooltip: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className={BTN} data-active={active} disabled={disabled} onClick={onClick}>
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

interface BlogEditorToolbarProps {
  editor: Editor;
  onImageUpload: (file: File) => Promise<string>;
}

export function BlogEditorToolbar({ editor, onImageUpload }: BlogEditorToolbarProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleLinkSubmit = useCallback(() => {
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
    }
    setLinkUrl("");
    setLinkOpen(false);
  }, [editor, linkUrl]);

  const handleImageUrl = useCallback(() => {
    if (!imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl.trim(), alt: imageAlt.trim() || undefined }).run();
    setImageUrl("");
    setImageAlt("");
    setImageOpen(false);
  }, [editor, imageUrl, imageAlt]);

  const handleImageFile = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
        setImageOpen(false);
      } finally {
        setUploading(false);
      }
    },
    [editor, onImageUpload],
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5 border rounded-lg px-2 py-1 bg-muted/30 flex-wrap">
        {/* Headings */}
        <Btn tooltip="Titulo 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <IconH1 className="h-4 w-4" />
        </Btn>
        <Btn tooltip="Titulo 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <IconH2 className="h-4 w-4" />
        </Btn>
        <Btn tooltip="Titulo 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <IconH3 className="h-4 w-4" />
        </Btn>
        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Inline */}
        <Btn tooltip="Negrito (Ctrl+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <IconBold className="h-4 w-4" />
        </Btn>
        <Btn tooltip="Italico (Ctrl+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <IconItalic className="h-4 w-4" />
        </Btn>
        <Btn tooltip="Tachado" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <IconStrikethrough className="h-4 w-4" />
        </Btn>
        <Btn tooltip="Codigo inline" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <IconCode className="h-4 w-4" />
        </Btn>
        <Btn tooltip="Destaque" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}>
          <IconHighlight className="h-4 w-4" />
        </Btn>
        <Btn tooltip="Sobrescrito" active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
          <IconSuperscript className="h-4 w-4" />
        </Btn>
        <Btn tooltip="Subscrito" active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()}>
          <IconSubscript className="h-4 w-4" />
        </Btn>
        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Alignment */}
        <Btn tooltip="Alinhar esquerda" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <IconAlignLeft className="h-4 w-4" />
        </Btn>
        <Btn tooltip="Centralizar" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <IconAlignCenter className="h-4 w-4" />
        </Btn>
        <Btn tooltip="Alinhar direita" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <IconAlignRight className="h-4 w-4" />
        </Btn>
        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Lists & blocks */}
        <Btn tooltip="Lista" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <IconList className="h-4 w-4" />
        </Btn>
        <Btn tooltip="Lista numerada" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <IconListNumbers className="h-4 w-4" />
        </Btn>
        <Btn tooltip="Citacao" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <IconBlockquote className="h-4 w-4" />
        </Btn>
        <Btn tooltip="Bloco de codigo" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <IconBraces className="h-4 w-4" />
        </Btn>
        <Btn tooltip="Linha horizontal" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <IconLineDashed className="h-4 w-4" />
        </Btn>
        <Btn tooltip="Tabela" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          <IconTable className="h-4 w-4" />
        </Btn>
        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Link popover */}
        <Popover open={linkOpen} onOpenChange={(o) => {
          setLinkOpen(o);
          if (o) setLinkUrl((editor.getAttributes("link").href as string) ?? "");
        }}>
          <PopoverTrigger asChild>
            <button type="button" className={BTN} data-active={editor.isActive("link")}>
              <IconLink className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="space-y-2">
              <Label className="text-xs font-medium">URL do link</Label>
              <div className="flex gap-2">
                <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className="h-8 text-sm" onKeyDown={(e) => { if (e.key === "Enter") handleLinkSubmit(); }} autoFocus />
                <Button size="sm" className="h-8 px-3" onClick={handleLinkSubmit}>{linkUrl.trim() ? "Aplicar" : "Remover"}</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Image popover with URL + Upload tabs */}
        <Popover open={imageOpen} onOpenChange={setImageOpen}>
          <PopoverTrigger asChild>
            <button type="button" className={BTN}>
              <IconPhoto className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <Tabs defaultValue="url">
              <TabsList className="w-full h-8 mb-3">
                <TabsTrigger value="url" className="flex-1 text-xs">URL</TabsTrigger>
                <TabsTrigger value="upload" className="flex-1 text-xs">Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="space-y-2 mt-0">
                <div>
                  <Label className="text-xs font-medium">URL da imagem</Label>
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="h-8 text-sm mt-1" autoFocus />
                </div>
                <div>
                  <Label className="text-xs font-medium">Alt text</Label>
                  <Input value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Descricao da imagem" className="h-8 text-sm mt-1" />
                </div>
                <Button size="sm" className="w-full h-8" onClick={handleImageUrl} disabled={!imageUrl.trim()}>Inserir</Button>
              </TabsContent>
              <TabsContent value="upload" className="mt-0">
                <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer hover:bg-muted/30 transition-colors">
                  {uploading ? (
                    <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <IconPhoto className="h-6 w-6 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {uploading ? "Enviando..." : "Clique para selecionar"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFile(file);
                    }}
                  />
                </label>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        {/* Undo / Redo */}
        <div className="ml-auto flex items-center gap-0.5">
          <Btn tooltip="Desfazer (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <IconArrowBackUp className="h-4 w-4" />
          </Btn>
          <Btn tooltip="Refazer (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <IconArrowForwardUp className="h-4 w-4" />
          </Btn>
        </div>
      </div>
    </TooltipProvider>
  );
}

"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import {
  IconSend,
  IconPaperclip,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { isImageFile } from "@/features/chat/services/chat-attachments";
import { MentionPopup, type MentionOption } from "./mention-popup";
import { EmojiPicker } from "./emoji-picker";
import { DragOverlay, PendingFilesList, useDragDrop } from "./message-input-parts";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export interface PendingFile {
  file: File;
  previewUrl?: string;
}

interface MessageInputProps {
  onSend: (content: string, files?: File[]) => void;
  disabled?: boolean;
  onTyping?: () => void;
  /** Members available for @mention autocomplete */
  mentionOptions?: MentionOption[];
}

export function MessageInput({
  onSend,
  disabled,
  onTyping,
  mentionOptions = [],
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addFiles(files: File[]) {
    const valid = files.filter((f) => f.size <= MAX_FILE_SIZE);
    if (valid.length === 0) return;
    const newPending: PendingFile[] = valid.map((file) => ({
      file,
      previewUrl: isImageFile(file.type)
        ? URL.createObjectURL(file)
        : undefined,
    }));
    setPendingFiles((prev) => [...prev, ...newPending]);
  }

  function clearFiles() {
    pendingFiles.forEach((pf) => {
      if (pf.previewUrl) URL.revokeObjectURL(pf.previewUrl);
    });
    setPendingFiles([]);
  }

  function removeFile(index: number) {
    setPendingFiles((prev) => {
      const pf = prev[index];
      if (pf?.previewUrl) URL.revokeObjectURL(pf.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  const { isDragOver, dragHandlers } = useDragDrop(addFiles);

  function handleSend() {
    const trimmed = content.trim();
    const hasFiles = pendingFiles.length > 0;
    if (!trimmed && !hasFiles) return;
    onSend(trimmed || (hasFiles ? " " : ""), hasFiles ? pendingFiles.map((pf) => pf.file) : undefined);
    setContent("");
    setMentionQuery(null);
    clearFiles();
    textareaRef.current?.focus();
  }

  /** Detect @mention query from cursor position */
  const detectMention = useCallback((text: string, cursorPos: number) => {
    const before = text.slice(0, cursorPos);
    const atIndex = before.lastIndexOf("@");
    if (atIndex === -1) {
      setMentionQuery(null);
      return;
    }
    if (atIndex > 0 && !/\s/.test(before[atIndex - 1])) {
      setMentionQuery(null);
      return;
    }
    const query = before.slice(atIndex + 1);
    if (/\s/.test(query)) {
      setMentionQuery(null);
      return;
    }
    setMentionStart(atIndex);
    setMentionQuery(query);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newContent = e.target.value;
    setContent(newContent);
    onTyping?.();
    detectMention(newContent, e.target.selectionStart);
  }

  function handleMentionSelect(option: MentionOption) {
    const before = content.slice(0, mentionStart);
    const after = content.slice(
      mentionStart + 1 + (mentionQuery?.length ?? 0),
    );
    const newContent = `${before}<@${option.id}> ${after}`;
    setContent(newContent);
    setMentionQuery(null);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery !== null && mentionOptions.length > 0) {
      if (["ArrowDown", "ArrowUp", "Tab"].includes(e.key)) return;
      if (e.key === "Enter") {
        e.preventDefault();
        const filtered = mentionOptions.filter((o) =>
          o.name.toLowerCase().includes((mentionQuery ?? "").toLowerCase()),
        );
        if (filtered.length > 0) {
          handleMentionSelect(filtered[0]);
          return;
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files ?? []));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div
      className="relative border-t p-3"
      {...dragHandlers}
    >
      {isDragOver && <DragOverlay />}

      <PendingFilesList files={pendingFiles} onRemove={removeFile} />

      <div className="relative flex items-end gap-2 rounded-xl border bg-background px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
        {mentionQuery !== null && mentionOptions.length > 0 && (
          <MentionPopup
            options={mentionOptions}
            query={mentionQuery}
            onSelect={handleMentionSelect}
            onClose={() => setMentionQuery(null)}
          />
        )}

        <EmojiPicker
          disabled={disabled}
          onSelect={(emoji) => {
            setContent((prev) => prev + emoji);
            textareaRef.current?.focus();
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          disabled={disabled}
          aria-label="Anexar arquivo"
          onClick={() => fileInputRef.current?.click()}
        >
          <IconPaperclip size={18} />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.csv"
        />
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onClick={(e) => {
            const target = e.target as HTMLTextAreaElement;
            detectMention(target.value, target.selectionStart);
          }}
          placeholder="Digite uma mensagem... (@mencionar)"
          disabled={disabled}
          className="min-h-[36px] max-h-32 flex-1 resize-none border-0 bg-transparent p-1 text-sm shadow-none focus-visible:ring-0"
          rows={1}
        />
        <Button
          type="button"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-lg"
          onClick={handleSend}
          disabled={disabled || (!content.trim() && pendingFiles.length === 0)}
          aria-label="Enviar mensagem"
        >
          <IconSend size={16} />
        </Button>
      </div>
    </div>
  );
}

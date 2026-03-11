"use client";

import { useState, useRef, useCallback, type KeyboardEvent, type DragEvent } from "react";
import {
  IconSend,
  IconPaperclip,
  IconX,
  IconFile,
  IconUpload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { isImageFile } from "@/features/chat/services/chat-attachments";
import { MentionPopup, type MentionOption } from "./mention-popup";
import { EmojiPicker } from "./emoji-picker";

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
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

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
    // Look backwards from cursor for @
    const before = text.slice(0, cursorPos);
    const atIndex = before.lastIndexOf("@");
    if (atIndex === -1) {
      setMentionQuery(null);
      return;
    }
    // Make sure @ is at start or preceded by whitespace
    if (atIndex > 0 && !/\s/.test(before[atIndex - 1])) {
      setMentionQuery(null);
      return;
    }
    const query = before.slice(atIndex + 1);
    // No spaces in mention query (means they moved past the mention)
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
    // Replace @query with <@uuid> and display name
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
    // If mention popup is open, let it handle navigation keys
    if (mentionQuery !== null && mentionOptions.length > 0) {
      if (["ArrowDown", "ArrowUp", "Tab"].includes(e.key)) {
        // Forward to popup via synthetic event — handled by capturing in popup
        return;
      }
      if (e.key === "Enter") {
        // Let popup handle enter if it's open
        e.preventDefault();
        // Select first filtered option
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

  function addFiles(files: File[]) {
    const valid = files.filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        // TODO: toast feedback could be added here
        return false;
      }
      return true;
    });
    if (valid.length === 0) return;
    const newPending: PendingFile[] = valid.map((file) => ({
      file,
      previewUrl: isImageFile(file.type)
        ? URL.createObjectURL(file)
        : undefined,
    }));
    setPendingFiles((prev) => [...prev, ...newPending]);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files ?? []));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Drag & drop handlers ──
  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) addFiles(files);
  }

  function removeFile(index: number) {
    setPendingFiles((prev) => {
      const pf = prev[index];
      if (pf?.previewUrl) URL.revokeObjectURL(pf.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function clearFiles() {
    pendingFiles.forEach((pf) => {
      if (pf.previewUrl) URL.revokeObjectURL(pf.previewUrl);
    });
    setPendingFiles([]);
  }

  return (
    <div
      className="relative border-t p-3"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <IconUpload size={20} />
            Solte arquivos aqui
          </div>
        </div>
      )}

      {/* Pending files preview */}
      {pendingFiles.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap px-1">
          {pendingFiles.map((pf, i) => (
            <div
              key={`${pf.file.name}-${i}`}
              className="relative group/file rounded-lg border bg-muted/50 overflow-hidden"
            >
              {pf.previewUrl ? (
                <img
                  src={pf.previewUrl}
                  alt={pf.file.name}
                  className="h-16 w-16 object-cover"
                />
              ) : (
                <div className="h-16 w-16 flex flex-col items-center justify-center gap-1 px-1">
                  <IconFile size={20} className="text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                    {pf.file.name.length > 10
                      ? `${pf.file.name.slice(0, 8)}...`
                      : pf.file.name}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-0.5 right-0.5 rounded-full bg-background/80 p-0.5 opacity-0 group-hover/file:opacity-100 transition-opacity"
              >
                <IconX size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative flex items-end gap-2 rounded-xl border bg-background px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
        {/* Mention popup */}
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

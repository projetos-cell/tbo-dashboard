"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import {
  IconSend,
  IconPaperclip,
  IconTypography,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((m) => ({ default: m.RichTextEditor })),
  { ssr: false, loading: () => <div className="h-[80px] animate-pulse rounded-md bg-muted" /> }
);
import { isImageFile } from "@/features/chat/services/chat-attachments";
import { MentionPopup, type MentionOption } from "./mention-popup";
import { EmojiPicker } from "./emoji-picker";
import { DragOverlay, PendingFilesList, useDragDrop } from "./message-input-parts";
import { VoiceRecorder } from "./voice-recorder";
import { ScheduledMessagePicker } from "./scheduled-message-picker";
import { SlashCommandPopup, SLASH_COMMANDS, type SlashCommand } from "./slash-command-popup";
import { TaskFromMessageDialog, ReminderDialog, PollDialog } from "./slash-command-dialog";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export interface PendingFile {
  file: File;
  previewUrl?: string;
}

interface MessageInputProps {
  onSend: (content: string, files?: File[], messageType?: string, scheduledAt?: Date) => void;
  disabled?: boolean;
  onTyping?: () => void;
  /** Members available for @mention autocomplete */
  mentionOptions?: MentionOption[];
  /** Count of scheduled messages (shows badge indicator) */
  scheduledCount?: number;
  /** Open scheduled messages panel */
  onShowScheduled?: () => void;
  /** #23 — Last message sent by current user (for ↑ to edit) */
  lastOwnMessage?: { id: string; content: string | null };
  /** #23 — Callback to trigger edit on last own message */
  onEditLastMessage?: (messageId: string, content: string) => void;
}

export function MessageInput({
  onSend,
  disabled,
  onTyping,
  mentionOptions = [],
  scheduledCount = 0,
  onShowScheduled,
  lastOwnMessage,
  onEditLastMessage,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [richContent, setRichContent] = useState("");
  const [isRichMode, setIsRichMode] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [pendingVoiceFile, setPendingVoiceFile] = useState<File | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState(-1);
  const [mentionActiveIndex, setMentionActiveIndex] = useState(0);

  // #25 — Slash commands
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [slashActiveIndex, setSlashActiveIndex] = useState(0);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [pollDialogOpen, setPollDialogOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map display names back to UUIDs for sending
  const mentionMapRef = useRef<Map<string, string>>(new Map());

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

  function toggleRichMode() {
    if (isRichMode) {
      const div = document.createElement("div");
      div.innerHTML = richContent;
      setContent(div.textContent ?? "");
      setRichContent("");
    } else {
      setRichContent(content ? `<p>${content}</p>` : "");
      setContent("");
    }
    setIsRichMode(!isRichMode);
  }

  function handleVoiceRecordingComplete(file: File) {
    setPendingVoiceFile(file);
  }

  /** Replace @DisplayName with <@uuid> before sending */
  function resolveMentions(text: string): string {
    let resolved = text;
    // Sort by name length descending to avoid partial matches
    const entries = Array.from(mentionMapRef.current.entries()).sort(
      (a, b) => b[0].length - a[0].length,
    );
    for (const [name, id] of entries) {
      resolved = resolved.replaceAll(`@${name}`, `<@${id}>`);
    }
    return resolved;
  }

  function handleSend() {
    // Voice message takes priority
    if (pendingVoiceFile) {
      onSend("", [pendingVoiceFile], "voice");
      setPendingVoiceFile(null);
      return;
    }
    const currentContent = isRichMode ? richContent : content;
    const trimmed = currentContent.trim();
    const hasFiles = pendingFiles.length > 0;
    if (!trimmed && !hasFiles) return;
    const finalContent = isRichMode ? trimmed : resolveMentions(trimmed);
    onSend(finalContent || (hasFiles ? " " : ""), hasFiles ? pendingFiles.map((pf) => pf.file) : undefined);
    if (isRichMode) {
      setRichContent("");
    } else {
      setContent("");
    }
    mentionMapRef.current.clear();
    setMentionQuery(null);
    clearFiles();
    textareaRef.current?.focus();
  }

  // #25 — Detect /slash command from start of text
  const detectSlashCommand = useCallback((text: string) => {
    if (!text.startsWith("/") || text.includes(" ")) {
      setSlashQuery(null);
      return;
    }
    setSlashQuery(text.slice(1)); // query is what follows "/"
    setSlashActiveIndex(0);
  }, []);

  function handleSlashSelect(cmd: SlashCommand) {
    setContent("");
    setSlashQuery(null);
    if (cmd.name === "/tarefa") setTaskDialogOpen(true);
    else if (cmd.name === "/lembrete") setReminderDialogOpen(true);
    else if (cmd.name === "/poll") setPollDialogOpen(true);
    textareaRef.current?.focus();
  }

  function handlePollSubmit(question: string, options: string[]) {
    // Send poll as a structured message
    const pollContent = `📊 **${question}**\n${options.map((o, i) => `${i + 1}. ${o}`).join("\n")}`;
    onSend(pollContent);
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
    setMentionActiveIndex(0);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newContent = e.target.value;
    setContent(newContent);
    onTyping?.();
    detectMention(newContent, e.target.selectionStart);
    detectSlashCommand(newContent);
  }

  function handleMentionSelect(option: MentionOption) {
    const before = content.slice(0, mentionStart);
    const after = content.slice(
      mentionStart + 1 + (mentionQuery?.length ?? 0),
    );
    // Show display name in textarea, store mapping for send
    mentionMapRef.current.set(option.name, option.id);
    const newContent = `${before}@${option.name} ${after}`;
    setContent(newContent);
    setMentionQuery(null);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // #25 — Slash command navigation
    if (slashQuery !== null) {
      const filteredCmds = SLASH_COMMANDS.filter(
        (cmd) =>
          cmd.name.toLowerCase().includes(slashQuery.toLowerCase()) ||
          cmd.description.toLowerCase().includes(slashQuery.toLowerCase()),
      );
      if (filteredCmds.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSlashActiveIndex((i) => Math.min(i + 1, filteredCmds.length - 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSlashActiveIndex((i) => Math.max(i - 1, 0));
          return;
        }
        if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) {
          e.preventDefault();
          const cmd = filteredCmds[slashActiveIndex];
          if (cmd) handleSlashSelect(cmd);
          return;
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setSlashQuery(null);
        return;
      }
    }

    if (mentionQuery !== null && mentionOptions.length > 0) {
      const filteredMentions = mentionOptions.filter((o) =>
        o.name.toLowerCase().includes((mentionQuery ?? "").toLowerCase()),
      );
      if (filteredMentions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setMentionActiveIndex((i) => Math.min(i + 1, filteredMentions.length - 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setMentionActiveIndex((i) => Math.max(i - 1, 0));
          return;
        }
        if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) {
          e.preventDefault();
          handleMentionSelect(filteredMentions[mentionActiveIndex] ?? filteredMentions[0]);
          return;
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    // #23 — ↑ when input is empty → edit last own message
    if (e.key === "ArrowUp" && !content.trim() && !isRichMode && lastOwnMessage && onEditLastMessage) {
      e.preventDefault();
      onEditLastMessage(lastOwnMessage.id, lastOwnMessage.content ?? "");
      return;
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

  function handlePaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter((item) => item.type.startsWith("image/"));
    if (imageItems.length === 0) return;
    e.preventDefault();
    const files = imageItems
      .map((item) => item.getAsFile())
      .filter((f): f is File => f !== null);
    addFiles(files);
  }

  return (
    <div
      className="relative border-t p-3"
      onPaste={handlePaste}
      {...dragHandlers}
    >
      {isDragOver && <DragOverlay />}

      <PendingFilesList files={pendingFiles} onRemove={removeFile} />

      {/* Voice file pending preview */}
      {pendingVoiceFile && (
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5 mb-1">
          <span className="text-xs text-muted-foreground">🎤 Mensagem de voz pronta para enviar</span>
          <button
            type="button"
            onClick={() => setPendingVoiceFile(null)}
            className="text-muted-foreground hover:text-foreground ml-auto text-xs"
          >
            ✕
          </button>
        </div>
      )}

      <div className="relative flex items-end gap-2 rounded-xl border bg-background px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
        {/* #25 — Slash command popup */}
        {slashQuery !== null && (
          <SlashCommandPopup
            query={slashQuery}
            activeIndex={slashActiveIndex}
            onSelect={handleSlashSelect}
            onClose={() => setSlashQuery(null)}
            onChangeActive={setSlashActiveIndex}
          />
        )}

        {mentionQuery !== null && mentionOptions.length > 0 && (
          <MentionPopup
            options={mentionOptions}
            query={mentionQuery}
            onSelect={handleMentionSelect}
            onClose={() => setMentionQuery(null)}
            externalActiveIndex={mentionActiveIndex}
            onChangeActive={setMentionActiveIndex}
          />
        )}

        <EmojiPicker
          disabled={disabled}
          onSelect={(emoji) => {
            if (isRichMode) {
              setRichContent((prev) => prev.replace(/<\/p>$/, `${emoji}</p>`) || `<p>${emoji}</p>`);
            } else {
              setContent((prev) => prev + emoji);
              textareaRef.current?.focus();
            }
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
        <VoiceRecorder
          disabled={disabled}
          onRecordingComplete={handleVoiceRecordingComplete}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.csv"
        />
        {isRichMode ? (
          // Rich text mode: Tiptap editor with Ctrl+Enter to send
          <div
            className="flex-1 min-w-0"
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
          >
            <RichTextEditor
              value={richContent}
              onChange={setRichContent}
              placeholder="Digite uma mensagem... (Ctrl+Enter para enviar)"
              showToolbar
              minHeight={36}
              className="border-0 bg-transparent shadow-none"
            />
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onClick={(e) => {
              const target = e.target as HTMLTextAreaElement;
              detectMention(target.value, target.selectionStart);
            }}
            placeholder="Digite uma mensagem... (@mencionar, /comandos)"
            disabled={disabled}
            className="min-h-[36px] max-h-32 flex-1 resize-none border-0 bg-transparent p-1 text-sm shadow-none focus-visible:ring-0"
            rows={1}
          />
        )}
        <div className="flex items-end gap-1 pb-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-8 w-8 shrink-0 ${isRichMode ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            disabled={disabled}
            aria-label={isRichMode ? "Modo simples" : "Modo rich text"}
            onClick={toggleRichMode}
            title={isRichMode ? "Voltar para texto simples" : "Ativar formatação rich text"}
          >
            <IconTypography size={16} />
          </Button>
          {/* #14 — Schedule message button */}
          <div className="relative">
            <ScheduledMessagePicker
              disabled={disabled}
              onSchedule={(scheduledAt) => {
                const currentContent = isRichMode ? richContent : content;
                const trimmed = currentContent.trim();
                if (!trimmed) return;
                onSend(trimmed, undefined, "text", scheduledAt);
                if (isRichMode) setRichContent("");
                else setContent("");
              }}
            />
            {scheduledCount > 0 && onShowScheduled && (
              <button
                type="button"
                onClick={onShowScheduled}
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground font-bold leading-none"
                title={`${scheduledCount} mensagem(s) agendada(s)`}
              >
                {scheduledCount > 9 ? "9+" : scheduledCount}
              </button>
            )}
          </div>
          <Button
            type="button"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg"
            onClick={handleSend}
            disabled={disabled || (pendingVoiceFile ? false : (isRichMode ? !richContent.trim() : (!content.trim() && pendingFiles.length === 0)))}
            aria-label="Enviar mensagem"
          >
            <IconSend size={16} />
          </Button>
        </div>
      </div>

      {/* #25 — Slash command dialogs */}
      <TaskFromMessageDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
      />
      <ReminderDialog
        open={reminderDialogOpen}
        onOpenChange={setReminderDialogOpen}
      />
      <PollDialog
        open={pollDialogOpen}
        onOpenChange={setPollDialogOpen}
        onSubmit={handlePollSubmit}
      />
    </div>
  );
}

import { generateHTML } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import MentionExt from "@tiptap/extension-mention";

export const TIPTAP_RENDER_EXTENSIONS = [StarterKit, LinkExt, MentionExt];

export function isJsonDoc(raw: string | null): boolean {
  if (!raw) return false;
  try {
    const p = JSON.parse(raw);
    return p?.type === "doc";
  } catch {
    return false;
  }
}

export function getInitialContent(description: string | null): object | string {
  if (!description) return "";
  if (isJsonDoc(description)) {
    try {
      return JSON.parse(description) as object;
    } catch {
      return description;
    }
  }
  return description;
}

export function renderToHTML(description: string | null): string {
  if (!description) return "";
  if (isJsonDoc(description)) {
    try {
      return generateHTML(
        JSON.parse(description) as Parameters<typeof generateHTML>[0],
        TIPTAP_RENDER_EXTENSIONS
      );
    } catch {
      return "";
    }
  }
  return description;
}

export function isEmptyDescription(description: string | null): boolean {
  if (!description) return true;
  if (description === "{}") return true;
  try {
    const p = JSON.parse(description);
    if (p?.type === "doc" && (!p.content || p.content.length === 0)) return true;
    if (
      p?.type === "doc" &&
      p.content?.length === 1 &&
      p.content[0]?.type === "paragraph" &&
      !p.content[0]?.content
    )
      return true;
  } catch {
    return description.trim() === "" || description === "<p></p>";
  }
  return false;
}

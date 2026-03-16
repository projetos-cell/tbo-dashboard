"use client";

import { useChatUnreadGlobal } from "@/hooks/use-chat-unread-global";

/** Invisible client component that keeps chat unread counts fresh globally */
export function ChatUnreadProvider() {
  useChatUnreadGlobal();
  return null;
}

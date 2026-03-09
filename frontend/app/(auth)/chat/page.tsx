"use client";

import { RequireRole } from "@/features/auth/components/require-role";
import { ChatLayout } from "@/features/chat/components/chat-layout";

function ChatContent() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
        <p className="text-gray-500 text-sm">
          Comunicação em tempo real do time
        </p>
      </div>
      <ChatLayout />
    </div>
  );
}

export default function ChatPage() {
  return (
    <RequireRole minRole="colaborador">
      <ChatContent />
    </RequireRole>
  );
}

import { useMutation } from "@tanstack/react-query";
import type { AIChatRequest, AIChatResponse } from "../schemas/ai-chat.schema";

async function sendAIChatMessage(
  request: AIChatRequest
): Promise<AIChatResponse> {
  // TODO: Replace with actual Supabase Edge Function call
  // const supabase = createBrowserClient();
  // const { data } = await supabase.functions.invoke("academy-chat", { body: request });

  // Placeholder response for now
  return {
    id: crypto.randomUUID(),
    message: {
      role: "assistant",
      content: `Recebi sua mensagem: "${request.message}". Em breve terei respostas reais!`,
      timestamp: new Date().toISOString(),
    },
    suggestions: [
      "Me conte mais sobre isso",
      "Quero aprender sobre edição",
      "Como melhorar meu PDI?",
    ],
  };
}

export function useAIChat() {
  return useMutation({
    mutationFn: sendAIChatMessage,
  });
}

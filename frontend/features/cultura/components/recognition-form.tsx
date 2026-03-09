"use client";

import { useState } from "react";
import { Send, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TBO_VALUES } from "@/lib/constants";

interface RecognitionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    to_user: string;
    value_id: string;
    value_name: string;
    value_emoji: string;
    message: string;
  }) => void;
  users: { id: string; name: string }[];
  currentUserId: string;
  rateLimitInfo?: { allowed: boolean; count: number };
  isSubmitting?: boolean;
}

export function RecognitionForm({
  open,
  onOpenChange,
  onSubmit,
  users,
  currentUserId,
  rateLimitInfo,
  isSubmitting,
}: RecognitionFormProps) {
  const [toUser, setToUser] = useState("");
  const [valueId, setValueId] = useState("");
  const [message, setMessage] = useState("");

  const selectedValue = TBO_VALUES.find((v) => v.id === valueId);
  const availableUsers = users.filter((u) => u.id !== currentUserId);

  const handleSubmit = () => {
    if (!toUser || !valueId || !message.trim()) return;
    const val = TBO_VALUES.find((v) => v.id === valueId)!;
    onSubmit({
      to_user: toUser,
      value_id: val.id,
      value_name: val.name,
      value_emoji: val.emoji,
      message: message.trim(),
    });
    setToUser("");
    setValueId("");
    setMessage("");
  };

  const canSubmit =
    !!toUser && !!valueId && message.trim().length > 0 && rateLimitInfo?.allowed !== false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Reconhecimento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Rate limit warning */}
          {rateLimitInfo && !rateLimitInfo.allowed && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <AlertTriangle className="size-4 shrink-0" />
              Limite diario atingido ({rateLimitInfo.count}/5). Tente novamente amanha.
            </div>
          )}

          {/* To user */}
          <div className="space-y-1.5">
            <Label>Reconhecer</Label>
            <Select value={toUser} onValueChange={setToUser}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a pessoa..." />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Value selector */}
          <div className="space-y-1.5">
            <Label>Valor</Label>
            <div className="flex flex-wrap gap-2">
              {TBO_VALUES.map((val) => (
                <Badge
                  key={val.id}
                  variant={valueId === val.id ? "default" : "outline"}
                  className="cursor-pointer text-xs py-1 px-2"
                  style={
                    valueId === val.id
                      ? { backgroundColor: val.color, color: "#fff" }
                      : {}
                  }
                  onClick={() => setValueId(val.id)}
                >
                  {val.emoji} {val.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label>Mensagem</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Por que voce esta reconhecendo essa pessoa?"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right">
              {message.length}/500
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
              <Send className="size-4 mr-1.5" />
              {isSubmitting ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

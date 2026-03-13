"use client";

import { useState } from "react";
import { z } from "zod";
import { IconSend, IconAlertTriangle } from "@tabler/icons-react";
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

const recognitionSchema = z.object({
  to_user: z.string().min(1, "Selecione a pessoa"),
  value_id: z.string().min(1, "Selecione um valor"),
  message: z.string().min(1, "Escreva uma mensagem").max(500, "Maximo 500 caracteres"),
});

type RecognitionFormErrors = Partial<Record<"to_user" | "value_id" | "message", string>>;

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
  const [errors, setErrors] = useState<RecognitionFormErrors>({});

  const availableUsers = users.filter((u) => u.id !== currentUserId);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setToUser("");
      setValueId("");
      setMessage("");
      setErrors({});
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = () => {
    const result = recognitionSchema.safeParse({
      to_user: toUser,
      value_id: valueId,
      message: message.trim(),
    });

    if (!result.success) {
      const fieldErrors: RecognitionFormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof RecognitionFormErrors;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
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

  const isRateLimited = rateLimitInfo?.allowed === false;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Reconhecimento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Rate limit warning */}
          {isRateLimited && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <IconAlertTriangle className="size-4 shrink-0" />
              Limite diario atingido ({rateLimitInfo?.count ?? 0}/5). Tente novamente amanha.
            </div>
          )}

          {/* To user */}
          <div className="space-y-1.5">
            <Label>Reconhecer</Label>
            <Select
              value={toUser}
              onValueChange={(v) => {
                setToUser(v);
                setErrors((p) => ({ ...p, to_user: undefined }));
              }}
            >
              <SelectTrigger className={errors.to_user ? "border-red-500" : ""}>
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
            {errors.to_user && (
              <p className="text-xs text-red-500">{errors.to_user}</p>
            )}
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
                  onClick={() => {
                    setValueId(val.id);
                    setErrors((p) => ({ ...p, value_id: undefined }));
                  }}
                >
                  {val.emoji} {val.name}
                </Badge>
              ))}
            </div>
            {errors.value_id && (
              <p className="text-xs text-red-500">{errors.value_id}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label>Mensagem</Label>
            <Textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setErrors((p) => ({ ...p, message: undefined }));
              }}
              placeholder="Por que voce esta reconhecendo essa pessoa?"
              rows={3}
              maxLength={500}
              className={errors.message ? "border-red-500" : ""}
            />
            <div className="flex items-center justify-between">
              {errors.message ? (
                <p className="text-xs text-red-500">{errors.message}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-gray-500 text-right">
                {message.length}/500
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isRateLimited || isSubmitting}
            >
              <IconSend className="size-4 mr-1.5" />
              {isSubmitting ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

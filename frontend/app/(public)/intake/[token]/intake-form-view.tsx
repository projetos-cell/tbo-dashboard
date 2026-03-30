"use client";

import { useState } from "react";
import { IconSend, IconCheck, IconClipboardText } from "@tabler/icons-react";
import type { IntakeFormRow } from "@/features/projects/services/intake-forms";

interface IntakeField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "email" | "url";
  required: boolean;
  options?: string[];
}

interface IntakeFormViewProps {
  form: IntakeFormRow;
  projectName: string;
  token: string;
}

export function IntakeFormView({ form, projectName, token }: IntakeFormViewProps) {
  const fields = (form.fields_json ?? []) as IntakeField[];
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/portal/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, fields: values }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <IconCheck className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Solicitação enviada!</h1>
          <p className="text-muted-foreground">
            Sua solicitação foi recebida e será analisada pela equipe do projeto.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setValues({});
            }}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Enviar outra solicitação
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center p-4 pt-12 md:pt-20">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <IconClipboardText className="h-4 w-4" />
            <span>{projectName}</span>
          </div>
          <h1 className="text-2xl font-bold">{form.title}</h1>
          {form.description && (
            <p className="text-muted-foreground">{form.description}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor={field.key}>
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  id={field.key}
                  value={values[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                  placeholder={`Digite ${field.label.toLowerCase()}...`}
                />
              ) : field.type === "select" && field.options ? (
                <select
                  id={field.key}
                  value={values[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Selecione...</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.key}
                  type={field.type === "date" ? "date" : field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
                  value={values[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={field.type === "email" ? "email@exemplo.com" : field.type === "url" ? "https://..." : `Digite ${field.label.toLowerCase()}...`}
                />
              )}
            </div>
          ))}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>Enviando...</>
            ) : (
              <>
                <IconSend className="h-4 w-4" />
                Enviar solicitação
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Powered by TBO OS
        </p>
      </div>
    </div>
  );
}

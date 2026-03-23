"use client";

import {
  SURVEY_SECTIONS,
  SURVEY_QUESTIONS,
  SURVEY_INTRO,
  type SurveyQuestion,
} from "@/features/pesquisa-clima/constants";

// ── Type badge colors ──
function typeBadge(type: SurveyQuestion["type"]) {
  const map: Record<string, { bg: string; label: string }> = {
    scale: { bg: "bg-blue-100 text-blue-700", label: "Likert 1-5" },
    nps: { bg: "bg-purple-100 text-purple-700", label: "NPS 0-10" },
    select: { bg: "bg-amber-100 text-amber-700", label: "Seleção única" },
    multi_select: { bg: "bg-teal-100 text-teal-700", label: "Multi-seleção" },
    text: { bg: "bg-zinc-100 text-zinc-700", label: "Texto curto" },
    textarea: { bg: "bg-zinc-100 text-zinc-700", label: "Texto longo" },
  };
  const t = map[type] ?? { bg: "bg-zinc-100 text-zinc-600", label: type };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${t.bg}`}>
      {t.label}
    </span>
  );
}

function QuestionPreview({ q, index }: { q: SurveyQuestion; index: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <span className="flex-shrink-0 text-xs font-mono text-zinc-400 mt-0.5">
            {q.id}
          </span>
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 leading-snug">
              {q.label}
              {q.required && <span className="text-red-500 ml-1">*</span>}
            </p>
            {q.helperText && (
              <p className="text-xs text-zinc-400">{q.helperText}</p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          {typeBadge(q.type)}
          {!q.required && (
            <span className="text-[10px] text-zinc-400">Opcional</span>
          )}
        </div>
      </div>

      {/* Scale preview */}
      {q.type === "scale" && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400">{q.scaleMin}</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs text-zinc-400"
              >
                {n}
              </div>
            ))}
          </div>
          <span className="text-[10px] text-zinc-400">{q.scaleMax}</span>
        </div>
      )}

      {/* NPS preview */}
      {q.type === "nps" && (
        <div className="space-y-1.5">
          <div className="flex gap-1">
            {Array.from({ length: 11 }, (_, i) => i).map((n) => (
              <div
                key={n}
                className={`h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-medium ${
                  n <= 6 ? "bg-red-50 text-red-400" : n <= 8 ? "bg-amber-50 text-amber-400" : "bg-emerald-50 text-emerald-400"
                }`}
              >
                {n}
              </div>
            ))}
          </div>
          <div className="flex gap-3 text-[9px] text-zinc-400">
            <span>Detratores (0-6)</span>
            <span>Neutros (7-8)</span>
            <span>Promotores (9-10)</span>
          </div>
        </div>
      )}

      {/* Select preview */}
      {q.type === "select" && q.options && (
        <div className="flex flex-wrap gap-1.5">
          {q.options.map((opt) => (
            <span key={opt} className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs text-zinc-500">
              {opt}
            </span>
          ))}
        </div>
      )}

      {/* Multi-select preview */}
      {q.type === "multi_select" && q.options && (
        <div className="space-y-1">
          {q.options.map((opt) => (
            <div key={opt} className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded border border-zinc-300" />
              <span className="text-xs text-zinc-500">{opt}</span>
            </div>
          ))}
        </div>
      )}

      {/* Text preview */}
      {(q.type === "text" || q.type === "textarea") && (
        <div className={`rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 ${q.type === "textarea" ? "py-6" : "py-2"}`}>
          <span className="text-xs text-zinc-300">Resposta livre...</span>
        </div>
      )}

      {/* Conditional indicator */}
      {q.conditionalOn && (
        <div className="flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 rounded-md px-2 py-1">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Condicional: só aparece se {q.conditionalOn.questionId} = {q.conditionalOn.values.join(" ou ")}
        </div>
      )}
    </div>
  );
}

export default function SurveyPreviewPage() {
  const totalRequired = SURVEY_QUESTIONS.filter((q) => q.required).length;
  const totalOptional = SURVEY_QUESTIONS.filter((q) => !q.required).length;
  const totalConditional = SURVEY_QUESTIONS.filter((q) => q.conditionalOn).length;

  const typeBreakdown = SURVEY_QUESTIONS.reduce<Record<string, number>>((acc, q) => {
    acc[q.type] = (acc[q.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <a
            href="/cultura/pesquisa-clima"
            className="text-sm text-zinc-400 hover:text-zinc-600 transition"
          >
            Pesquisa de Clima
          </a>
          <span className="text-zinc-300">/</span>
          <span className="text-sm font-medium text-zinc-900">Preview do Formulário</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">{SURVEY_INTRO.title}</h1>
        <p className="text-sm text-zinc-500">
          Visualização completa de todas as perguntas — sem precisar responder.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-3 space-y-0.5">
          <div className="text-[11px] text-zinc-400">Total</div>
          <div className="text-lg font-bold">{SURVEY_QUESTIONS.length} perguntas</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 space-y-0.5">
          <div className="text-[11px] text-zinc-400">Seções</div>
          <div className="text-lg font-bold">{SURVEY_SECTIONS.length}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 space-y-0.5">
          <div className="text-[11px] text-zinc-400">Obrigatórias</div>
          <div className="text-lg font-bold">{totalRequired}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 space-y-0.5">
          <div className="text-[11px] text-zinc-400">Opcionais</div>
          <div className="text-lg font-bold">{totalOptional}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 space-y-0.5">
          <div className="text-[11px] text-zinc-400">Condicionais</div>
          <div className="text-lg font-bold">{totalConditional}</div>
        </div>
      </div>

      {/* Type breakdown */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(typeBreakdown).map(([type, count]) => (
          <div key={type} className="flex items-center gap-1.5">
            {typeBadge(type as SurveyQuestion["type"])}
            <span className="text-xs text-zinc-500">{count}x</span>
          </div>
        ))}
      </div>

      {/* Sections */}
      {SURVEY_SECTIONS.map((section, sIndex) => {
        const sectionQuestions = SURVEY_QUESTIONS.filter(
          (q) => q.sectionId === section.id
        );

        return (
          <div key={section.id} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center text-white text-xs font-bold">
                  {sIndex + 1}
                </span>
                <h2 className="text-lg font-bold text-zinc-900">{section.title}</h2>
                <span className="text-xs text-zinc-400">
                  ({sectionQuestions.length} perguntas)
                </span>
              </div>
              {section.description && (
                <p className="text-sm text-zinc-500 ml-9">{section.description}</p>
              )}
            </div>

            <div className="space-y-3 ml-9">
              {sectionQuestions.map((q, qIndex) => (
                <QuestionPreview key={q.id} q={q} index={qIndex} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center space-y-2">
        <p className="text-sm text-zinc-500">Fim do formulário</p>
        <p className="text-xs text-zinc-400">
          {SURVEY_QUESTIONS.length} perguntas · {SURVEY_SECTIONS.length} seções · ~8 min estimado
        </p>
      </div>
    </div>
  );
}

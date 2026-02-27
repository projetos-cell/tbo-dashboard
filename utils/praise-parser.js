// ============================================================================
// TBO OS — Praise Parser (Deteccao de Elogios)
// Sprint 2.3.2 — Detecta padroes de elogio em texto de transcricoes
//
// Uso:
//   const results = TBO_PRAISE_PARSER.detect(text, participants);
//   // -> [{ pattern, context, speakerHint, targetHint, confidence }]
// ============================================================================

const TBO_PRAISE_PARSER = (() => {

  // ── Padroes de elogio em portugues ────────────────────────
  const PATTERNS = [
    // Alta confianca
    { regex: /\bparab[eé]ns\b/gi, label: 'parabens', confidence: 0.9 },
    { regex: /\bexcelente\s+trabalho\b/gi, label: 'excelente trabalho', confidence: 0.95 },
    { regex: /\bmandou\s+(muito\s+)?bem\b/gi, label: 'mandou bem', confidence: 0.9 },
    { regex: /\barrasou\b/gi, label: 'arrasou', confidence: 0.85 },
    { regex: /\bmuito\s+orgulho/gi, label: 'orgulho', confidence: 0.85 },
    { regex: /\bmerece\s+reconhecimento/gi, label: 'merece reconhecimento', confidence: 0.95 },
    { regex: /\btrabalho\s+incr[ií]vel/gi, label: 'trabalho incrivel', confidence: 0.9 },
    { regex: /\bfez\s+um\s+[oó]timo\s+trabalho/gi, label: 'otimo trabalho', confidence: 0.95 },
    { regex: /\bficou\s+(?:muito\s+)?(?:bom|incrivel|incr[ií]vel|perfeito|top|massa)/gi, label: 'ficou otimo', confidence: 0.8 },

    // Media confianca
    { regex: /\b(?:[oó]timo|otimo|excelente|sensacional|espetacular)\s+(?:resultado|entrega|desempenho|performance)/gi, label: 'otimo resultado', confidence: 0.85 },
    { regex: /\bmuito\s+(?:bom|bem|legal)\b/gi, label: 'muito bom', confidence: 0.5 },
    { regex: /\bde\s+parab[eé]ns\b/gi, label: 'de parabens', confidence: 0.9 },
    { regex: /\bdestaque\s+(?:para|pro|pra|do|da|de)\b/gi, label: 'destaque para', confidence: 0.85 },
    { regex: /\bsucesso\s+(?:do|da|no|na|de|total)/gi, label: 'sucesso', confidence: 0.6 },
    { regex: /\bbrilhante\b/gi, label: 'brilhante', confidence: 0.7 },
    { regex: /\bdemais\s+(?:o|a|esse|essa|este|esta)\s+(?:trabalho|entrega|resultado)/gi, label: 'demais', confidence: 0.75 },
    { regex: /\bparab[eé]ns\s+(?:para|pro|pra|ao|à|a)\b/gi, label: 'parabens para', confidence: 0.95 },

    // Patterns em ingles (equipes mistas)
    { regex: /\bgreat\s+(?:job|work)\b/gi, label: 'great job', confidence: 0.85 },
    { regex: /\bwell\s+done\b/gi, label: 'well done', confidence: 0.85 },
    { regex: /\bamazing\s+(?:work|job|result)/gi, label: 'amazing work', confidence: 0.85 },
    { regex: /\boutstanding\b/gi, label: 'outstanding', confidence: 0.7 },
    { regex: /\bkudos\b/gi, label: 'kudos', confidence: 0.9 }
  ];

  // ── Contexto de extracao ──────────────────────────────────
  // Pega N caracteres ao redor do match para contexto
  const CONTEXT_WINDOW = 120;

  function _extractContext(text, matchIndex, matchLength) {
    const start = Math.max(0, matchIndex - CONTEXT_WINDOW);
    const end = Math.min(text.length, matchIndex + matchLength + CONTEXT_WINDOW);
    let ctx = text.substring(start, end).trim();
    if (start > 0) ctx = '...' + ctx;
    if (end < text.length) ctx = ctx + '...';
    return ctx;
  }

  // ── Detectar nomes de pessoas no contexto ─────────────────
  function _findPersonMentions(context, participants) {
    if (!participants || !participants.length) return { speaker: null, target: null };

    const mentions = [];
    for (const p of participants) {
      const name = p.displayName || p.name || p.display_name || '';
      if (!name || name.length < 3) continue;

      // Tentar nome completo e primeiro nome
      const firstName = name.split(/\s+/)[0];
      const lowerCtx = context.toLowerCase();

      if (lowerCtx.includes(name.toLowerCase())) {
        mentions.push({ name, email: p.email, full: true });
      } else if (firstName.length >= 3 && lowerCtx.includes(firstName.toLowerCase())) {
        mentions.push({ name: firstName, email: p.email, full: false });
      }
    }

    // Heuristica: se 2+ mencionados, o primeiro e quem elogia, o segundo e quem recebe
    if (mentions.length >= 2) {
      return { speaker: mentions[0], target: mentions[1] };
    }
    // Se 1 mencionado, provavelmente e quem recebe o elogio
    if (mentions.length === 1) {
      return { speaker: null, target: mentions[0] };
    }
    return { speaker: null, target: null };
  }

  // ── API publica ───────────────────────────────────────────

  return {

    /**
     * Detecta padroes de elogio em um texto.
     * @param {string} text - Texto da transcricao ou resumo
     * @param {Array} participants - [{displayName, email}] participantes da reuniao
     * @param {Object} opts - { minConfidence: 0.7 }
     * @returns {Array} detections - [{ pattern, context, speakerHint, targetHint, confidence }]
     */
    detect(text, participants = [], opts = {}) {
      if (!text || typeof text !== 'string') return [];

      const minConfidence = opts.minConfidence || 0.7;
      const detections = [];
      const seen = new Set(); // Evitar duplicatas do mesmo trecho

      for (const pat of PATTERNS) {
        if (pat.confidence < minConfidence) continue;

        let match;
        const regex = new RegExp(pat.regex.source, pat.regex.flags);
        while ((match = regex.exec(text)) !== null) {
          const ctx = _extractContext(text, match.index, match[0].length);
          const ctxKey = ctx.substring(0, 60);

          if (seen.has(ctxKey)) continue;
          seen.add(ctxKey);

          const { speaker, target } = _findPersonMentions(ctx, participants);

          detections.push({
            pattern: pat.label,
            matchedText: match[0],
            context: ctx,
            speakerHint: speaker?.name || null,
            speakerEmail: speaker?.email || null,
            targetHint: target?.name || null,
            targetEmail: target?.email || null,
            confidence: pat.confidence,
            index: match.index
          });
        }
      }

      // Ordenar por posicao no texto
      detections.sort((a, b) => a.index - b.index);

      // Deduplicar deteccoes sobrepostas (manter a de maior confianca)
      const deduped = [];
      for (const d of detections) {
        const overlap = deduped.find(prev =>
          Math.abs(prev.index - d.index) < 50
        );
        if (!overlap) {
          deduped.push(d);
        } else if (d.confidence > overlap.confidence) {
          const idx = deduped.indexOf(overlap);
          deduped[idx] = d;
        }
      }

      return deduped;
    },

    /**
     * Versao simplificada: retorna true/false se texto contem elogio
     */
    hasPraise(text, minConfidence = 0.7) {
      return this.detect(text, [], { minConfidence }).length > 0;
    },

    /**
     * Lista de padroes configurados (para admin UI)
     */
    getPatterns() {
      return PATTERNS.map(p => ({
        label: p.label,
        confidence: p.confidence,
        regex: p.regex.source
      }));
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_PRAISE_PARSER = TBO_PRAISE_PARSER;
}

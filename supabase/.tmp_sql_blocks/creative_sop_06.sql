DO $$
DECLARE
  v_tenant_id UUID;
  v_sop_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE NOTICE 'No tenant found.';
    RETURN;
  END IF;
  -- SOP DC-006: Aprovação Criativa (QA de Marca)
  -- ══════════════════════════════════════════════════════════════════
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Aprovação Criativa (QA de Marca)',
    'tbo-dc-006-aprovacao-criativa',
    'geral',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Aprovação Criativa (QA de Marca)

Código: TBO-DC-006 | Versão: 1.0 | Data: 2026-03-22

  1. Objetivo

Definir o processo de Quality Assurance criativo para garantir que TODA peça produzida pela TBO esteja alinhada ao briefing criativo, identidade visual e padrão de qualidade do empreendimento. Nenhuma peça sai para o cliente sem passar por este gate.

  2. Escopo

Coberto: Revisão criativa de renders 3D, peças gráficas, vídeos, posts de redes sociais, materiais de PDV, book de vendas, folder, apresentações.

Exclusões: Revisão técnica de modelos 3D (SOP 3D). Revisão de copy/redação (SOP MKT). Testes de impressão.

  5. Procedimento Passo a Passo

5.1. Recebimento da peça para aprovação

Ação: BU submete peça via canal definido (TBO OS ou pasta no Drive). Deve incluir: peça em formato de revisão, briefing criativo de referência, contexto de uso (onde será aplicada).

Responsável: Líder da BU

Output: Peça registrada para aprovação

Prazo referência: Imediato

5.2. Checklist de aderência ao briefing

Ação: Verificar cada item contra o briefing criativo aprovado:
- Paleta cromática correta?
- Materialidade consistente?
- Tom de voz alinhado?
- Tipografia correta?
- Logo com área de proteção respeitada?
- Mood visual coerente com moodboard?
- Hierarquia de informação clara?

Responsável: Diretor Criativo

Output: Checklist preenchido (pass/fail por item)

Prazo referência: 0,5 dia

5.3. Avaliação qualitativa

Ação: Além do checklist técnico, avaliar: impacto visual, originalidade, diferenciação competitiva, adequação ao público-alvo, coerência dentro do ecossistema de peças.

Responsável: Diretor Criativo

Output: Parecer qualitativo (aprovado / aprovado com ressalvas / reprovado)

Prazo referência: Junto com 5.2

5.4. Feedback estruturado

Ação: Se não aprovado, produzir feedback estruturado: o que está errado (específico), por que está errado (referência ao briefing), como corrigir (direção clara), prazo para correção.

Responsável: Diretor Criativo

Output: Documento de feedback com marcações visuais

Prazo referência: Imediato

[ATENÇÃO] Feedback nunca é "não gostei" ou "está estranho". É sempre referenciado ao briefing: "A cor X não está na paleta aprovada" ou "O mood está noturno mas o briefing define golden hour".

5.5. Resubmissão e reavaliação

Ação: BU implementa ajustes e resubmete. Diretor Criativo reavalia apenas os pontos levantados.

Responsável: Líder da BU + Diretor Criativo

Output: Peça aprovada ou novo feedback

Prazo referência: 0,5 dia por rodada

[DECISÃO] Máximo 3 rodadas de revisão. Se após 3 rodadas ainda há problemas, escalar para reunião presencial com a BU.

5.6. Selo de aprovação

Ação: Peça recebe selo de aprovação criativa no TBO OS. Só peças com selo podem ser enviadas ao cliente.

Responsável: Diretor Criativo

Output: Peça com status "Aprovado DC" no sistema

Prazo referência: Imediato

[APROVAÇÃO] Peça aprovada — liberada para envio ao cliente

  6. Critérios de Qualidade

100% das peças passam por QA criativo antes do cliente. Checklist de aderência ao briefing 100% preenchido. Feedback sempre estruturado e referenciado ao briefing. Máximo 3 rodadas de revisão por peça. Tempo máximo de resposta do QA: 24h úteis. Rastreabilidade: todas as aprovações documentadas no TBO OS.

  8. SLAs e Prazos

Primeira resposta do QA: até 24h úteis após submissão. Rodada de revisão: 0,5 dia por rodada. Peça urgente (flag no TBO OS): 4h úteis.

  11. Histórico de Revisões

Versão | Data | Autor | Alterações
1.0 | 2026-03-22 | Marco Andolfato | Criação inicial do SOP
',
    '',
    'published',
    'critical',
    ARRAY['aprovação','qa','qualidade','marca','briefing','checklist','direção-criativa']::TEXT[],
    5,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type) VALUES
  (v_sop_id, '1. Objetivo', 'Garantir que TODA peça produzida pela TBO esteja alinhada ao briefing criativo, identidade visual e padrão de qualidade do empreendimento. Nenhuma peça sai para o cliente sem passar por este gate.', '', 0, 'step'),
  (v_sop_id, '5.1. Recebimento da peça', 'BU submete via TBO OS ou Drive. Deve incluir: peça em formato de revisão, briefing de referência, contexto de uso.

Output: Peça registrada para aprovação', '', 1, 'step'),
  (v_sop_id, '5.2. Checklist de aderência ao briefing', 'Verificar cada item:
- Paleta cromática correta?
- Materialidade consistente?
- Tom de voz alinhado?
- Tipografia correta?
- Logo com área de proteção respeitada?
- Mood visual coerente com moodboard?
- Hierarquia de informação clara?

Output: Checklist preenchido (pass/fail por item)', '', 2, 'step'),
  (v_sop_id, '5.3. Avaliação qualitativa', 'Além do checklist técnico: impacto visual, originalidade, diferenciação competitiva, adequação ao público-alvo, coerência no ecossistema de peças.

Output: Parecer (aprovado / aprovado com ressalvas / reprovado)', '', 3, 'step'),
  (v_sop_id, '5.4. Feedback estruturado', 'Se não aprovado, produzir:
- **O que** está errado (específico)
- **Por que** está errado (referência ao briefing)
- **Como** corrigir (direção clara)
- **Prazo** para correção

Output: Documento de feedback com marcações visuais', '', 4, 'step'),
  (v_sop_id, 'Feedback nunca é subjetivo', 'Nunca "não gostei" ou "está estranho". Sempre referenciado ao briefing: "A cor X não está na paleta aprovada" ou "O mood está noturno mas o briefing define golden hour".', '', 5, 'warning'),
  (v_sop_id, '5.5. Resubmissão', 'BU implementa ajustes e resubmete. Diretor Criativo reavalia apenas os pontos levantados. Máximo 3 rodadas de revisão — se ainda há problemas, escalar para reunião presencial.

Prazo: 0,5 dia por rodada', '', 6, 'step'),
  (v_sop_id, '5.6. Selo de aprovação', 'Peça recebe status "Aprovado DC" no TBO OS. Só peças com selo podem ser enviadas ao cliente.', '', 7, 'checkpoint'),
  (v_sop_id, '6. Critérios de Qualidade', '100% das peças passam por QA antes do cliente. Checklist 100% preenchido. Feedback estruturado e referenciado. Máximo 3 rodadas. Resposta em até 24h úteis. Rastreabilidade no TBO OS.', '', 8, 'step'),
  (v_sop_id, 'SLA de urgência', 'Peças com flag "urgente" no TBO OS: resposta do QA em até 4h úteis. Usar com parcimônia — se tudo é urgente, nada é urgente.', '', 9, 'tip');


  -- ══════════════════════════════════════════════════════════════════
END $$;
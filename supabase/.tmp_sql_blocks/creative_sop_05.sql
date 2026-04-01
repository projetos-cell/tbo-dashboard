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
  -- SOP DC-005: Key Visual (KV)
  -- ══════════════════════════════════════════════════════════════════
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Key Visual (KV) do Empreendimento',
    'tbo-dc-005-key-visual',
    'branding',
    'processo',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Key Visual (KV) do Empreendimento

Código: TBO-DC-005 | Versão: 1.0 | Data: 2026-03-22

  1. Objetivo

Definir o processo de criação do Key Visual (KV) — a imagem-mãe do empreendimento que define o padrão estético para todas as demais peças. O KV é a primeira imagem que o mercado vê e deve sintetizar posicionamento, qualidade e diferenciação em uma única composição.

  2. Escopo

Coberto: Definição de câmera KV, render em qualidade máxima, pós-produção conceitual, composição com elementos gráficos (logo, tagline), aprovação multi-stakeholder.

Exclusões: Renders secundários. Adaptações de formato. Peças gráficas derivadas.

  5. Procedimento Passo a Passo

5.1. Seleção da câmera KV

Ação: A partir da prancha de câmeras (TBO-DC-002), selecionar O ângulo que melhor sintetiza o empreendimento. Critérios: impacto visual, clareza do produto, diferenciação, escalabilidade para múltiplos formatos.

Responsável: Diretor Criativo

Output: Câmera KV definida com justificativa

Prazo referência: Junto com DC-002

5.2. Render KV em qualidade máxima

Ação: Renderizar câmera KV com qualidade final: resolução 8000x5000px mínimo, iluminação refinada, materiais finais, vegetação detalhada, sky HDR selecionado.

Responsável: Artista 3D sênior

Output: Render base KV (TIF/EXR 16-bit)

Prazo referência: 2-3 dias

[ATENÇÃO] O KV NUNCA sai direto do render. Sempre passa por pós-produção conceitual do Diretor Criativo.

5.3. Pós-produção conceitual

Ação: Ajustes de cor e mood (color grading), inserção de pessoas/lifestyle, tratamento de céu e atmosfera, correção de materiais, inserção de vegetação complementar, composição com elementos de primeiro plano.

Responsável: Diretor Criativo + Artista de pós

Output: KV pós-produzido (PSD em layers)

Prazo referência: 2-3 dias

5.4. Composição com elementos de marca

Ação: Adicionar logo do empreendimento, tagline/assinatura, selo da incorporadora. Definir posicionamento que não compete com a imagem.

Responsável: Designer Gráfico sob direção criativa

Output: KV com marca aplicada

Prazo referência: 0,5 dia

5.5. Revisão do Diretor Criativo

Ação: Revisão pixel a pixel: consistência de cor, qualidade de inserções, legibilidade da marca, impacto geral.

Responsável: Diretor Criativo

Output: KV aprovado internamente

Prazo referência: 0,5 dia

5.6. Aprovação da incorporadora

Ação: Apresentar KV ao cliente com contextualização da direção criativa.

Responsável: Atendimento + Diretor Criativo

Output: KV aprovado pelo cliente

Prazo referência: 1 dia + tempo do cliente

[APROVAÇÃO] KV aprovado — referência para TODAS as peças subsequentes

  6. Critérios de Qualidade

Resolução mínima 8000x5000px. Color grading consistente com briefing. Pessoas/lifestyle integradas naturalmente. Céu coerente com mood definido. Logo legível em todos os formatos. KV funciona em outdoor, digital, material impresso. Impacto visual em 3 segundos (teste de primeiro olhar).

  8. SLAs e Prazos

Prazo padrão total: 5-7 dias úteis. Render: 2-3 dias. Pós-produção: 2-3 dias. Composição + aprovação: 1-2 dias.

  11. Histórico de Revisões

Versão | Data | Autor | Alterações
1.0 | 2026-03-22 | Marco Andolfato | Criação inicial do SOP
',
    '',
    'published',
    'critical',
    ARRAY['kv','key-visual','render','pós-produção','marca','direção-criativa','hero']::TEXT[],
    4,
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
  (v_sop_id, '1. Objetivo', 'Definir o processo de criação do Key Visual (KV) — a imagem-mãe do empreendimento. O KV é a primeira imagem que o mercado vê e deve sintetizar posicionamento, qualidade e diferenciação em uma única composição.', '', 0, 'step'),
  (v_sop_id, '5.1. Seleção da câmera KV', 'A partir da prancha de câmeras (TBO-DC-002), selecionar O ângulo que melhor sintetiza o empreendimento. Critérios: impacto visual, clareza do produto, diferenciação, escalabilidade para múltiplos formatos.

Output: Câmera KV definida com justificativa', '', 1, 'step'),
  (v_sop_id, '5.2. Render KV em qualidade máxima', 'Resolução 8000x5000px mínimo, iluminação refinada, materiais finais, vegetação detalhada, sky HDR selecionado.

Responsável: Artista 3D sênior

Output: Render base KV (TIF/EXR 16-bit)

Prazo: 2-3 dias', '', 2, 'step'),
  (v_sop_id, 'O KV NUNCA sai direto do render', 'Sempre passa por pós-produção conceitual do Diretor Criativo. Render bruto ≠ KV. A diferença entre amador e premium está na pós.', '', 3, 'warning'),
  (v_sop_id, '5.3. Pós-produção conceitual', 'Color grading, inserção de pessoas/lifestyle, tratamento de céu e atmosfera, correção de materiais, vegetação complementar, elementos de primeiro plano.

Output: KV pós-produzido (PSD em layers)

Prazo: 2-3 dias', '', 4, 'step'),
  (v_sop_id, '5.4. Composição com elementos de marca', 'Logo do empreendimento, tagline/assinatura, selo da incorporadora. Posicionamento que não compete com a imagem.

Prazo: 0,5 dia', '', 5, 'step'),
  (v_sop_id, '5.5. Revisão pixel a pixel', 'Consistência de cor, qualidade de inserções, legibilidade da marca, impacto geral.

Output: KV aprovado internamente', '', 6, 'checkpoint'),
  (v_sop_id, '5.6. Aprovação da incorporadora', 'Apresentar com contextualização da direção criativa.

Output: KV aprovado pelo cliente', '', 7, 'checkpoint'),
  (v_sop_id, 'Teste de primeiro olhar', 'O KV deve causar impacto visual em 3 segundos. Se precisa de mais tempo para "funcionar", a composição ou o mood precisam de ajuste. Testar com pessoa de fora do projeto.', '', 8, 'tip'),
  (v_sop_id, '6. Critérios de Qualidade', 'Resolução mínima 8000x5000px. Color grading consistente com briefing. Pessoas integradas naturalmente. Céu coerente com mood. Logo legível em todos os formatos. Funciona em outdoor, digital e impresso.', '', 9, 'step');


  -- ══════════════════════════════════════════════════════════════════
END $$;
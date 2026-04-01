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
  -- SOP DC-008: Direção de Fotografia e Vídeo Arquitetônico
  -- ══════════════════════════════════════════════════════════════════
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Direção de Fotografia e Vídeo Arquitetônico',
    'tbo-dc-008-direcao-foto-video',
    'audiovisual',
    'processo',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Direção de Fotografia e Vídeo Arquitetônico

Código: TBO-DC-008 | Versão: 1.0 | Data: 2026-03-22

  1. Objetivo

Definir o processo de direção de fotografia e vídeo para empreendimentos imobiliários — tanto para obra em andamento quanto para empreendimentos entregues. Garantir que o material fotográfico e audiovisual siga o padrão estético definido no briefing criativo e comunique a qualidade do produto.

  2. Escopo

Coberto: Direção de fotografia arquitetônica (exterior e interior), direção de vídeo institucional/lançamento, definição de estilo visual (iluminação, composição, mood), seleção de equipe e equipamento, direção em set.

Exclusões: Edição de vídeo (SOP de Audiovisual). Pós-produção fotográfica avançada (SOP específico). Fotografia de eventos.

  5. Procedimento Passo a Passo

5.1. Planejamento de produção

Ação: Definir: lista de takes (fotos/cenas) necessários, horários ideais (golden hour, blue hour, meio-dia para interiores), equipamento (câmera, lentes, drone, gimbal, iluminação), equipe (fotógrafo, videomaker, produtor, assistente), logística (acesso ao canteiro, segurança, permissões).

Responsável: Diretor Criativo + Produtor AV

Output: Plano de produção (shot list + cronograma)

Prazo referência: 2 dias antes da diária

5.2. Definição de estilo visual

Ação: Criar referência visual para fotógrafo/videomaker: estilo de iluminação (natural, artificial, mista), composição (linhas, simetria, escala humana), color mood (quente, frio, neutro, contrastado), referências específicas de resultado esperado (Pinterest/portfólio).

Responsável: Diretor Criativo

Output: Prancha de referência para produção (PDF/Figma)

Prazo referência: Junto com 5.1

5.3. Briefing com equipe de produção

Ação: Apresentar briefing criativo e prancha de referências para toda a equipe. Alinhar expectativas, tirar dúvidas, definir prioridades.

Responsável: Diretor Criativo

Output: Equipe alinhada

Prazo referência: 1 dia antes ou início da diária

5.4. Direção em set

Ação: Dirigir cada take no local: composição, enquadramento, iluminação, elementos em cena (staging de mobiliário, vegetação, pessoas). Para vídeo: movimentos de câmera, ritmo, transições. Para drone: rota de voo, altitude, velocidade.

Responsável: Diretor Criativo

Output: Material bruto capturado

Prazo referência: 1 diária (8-12h)

[ATENÇÃO] Sempre capturar 20-30% a mais de takes do que o planejado. Material extra dá liberdade na edição e protege contra takes que não funcionam.

5.5. Revisão de selects

Ação: Revisar material bruto, selecionar takes aprovados (selects), descartar takes com problemas técnicos ou criativos. Para vídeo: selecionar cenas + definir sequência narrativa.

Responsável: Diretor Criativo

Output: Selects aprovados + direção de edição

Prazo referência: 1 dia após diária

5.6. Direção de pós-produção

Ação: Definir direção de tratamento: color grading, retoque, limpeza de cena (fios, placas), inserção de céu (se necessário), compositing. Para vídeo: ritmo de edição, trilha sonora, tipografia.

Responsável: Diretor Criativo

Output: Briefing de pós-produção

Prazo referência: Junto com 5.5

[APROVAÇÃO] Selects e direção de pós aprovados — equipe de edição inicia trabalho

  6. Critérios de Qualidade

Shot list 100% capturada. Iluminação consistente com briefing. Composição com intencionalidade (não casual). Material bruto em qualidade técnica (foco, exposição, estabilização). Selects revisados pelo Diretor Criativo. Direção de pós documentada.

  7. Equipamento mínimo recomendado

Fotografia: câmera full-frame, lentes 16-35mm + 24-70mm + tilt-shift (arquitetura), tripé, flash portátil. Vídeo: câmera cinema/mirrorless 4K+, gimbal, slider, drone (DJI Mavic 3 ou superior), microfone direcional. Iluminação: painéis LED portáteis para interiores.

  8. SLAs e Prazos

Planejamento: 2 dias antes. Diária de captação: 1 dia. Selects + direção de pós: 1 dia após. Total fotografia: 4 dias úteis. Total vídeo: 5-7 dias úteis (inclui edição).

  11. Histórico de Revisões

Versão | Data | Autor | Alterações
1.0 | 2026-03-22 | Marco Andolfato | Criação inicial do SOP
',
    '',
    'published',
    'high',
    ARRAY['fotografia','vídeo','audiovisual','drone','direção-criativa','produção','arquitetônico']::TEXT[],
    7,
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
  (v_sop_id, '1. Objetivo', 'Definir o processo de direção de fotografia e vídeo para empreendimentos imobiliários. Garantir que o material siga o padrão estético do briefing criativo e comunique a qualidade do produto.', '', 0, 'step'),
  (v_sop_id, '5.1. Planejamento de produção', 'Definir: lista de takes, horários ideais (golden hour, blue hour), equipamento, equipe, logística de acesso.

Output: Plano de produção (shot list + cronograma)

Prazo: 2 dias antes da diária', '', 1, 'step'),
  (v_sop_id, '5.2. Definição de estilo visual', 'Criar referência para equipe: estilo de iluminação (natural/artificial/mista), composição (linhas, simetria, escala humana), color mood (quente/frio/neutro), referências específicas.

Output: Prancha de referência (PDF/Figma)', '', 2, 'step'),
  (v_sop_id, '5.3. Briefing com equipe', 'Apresentar briefing criativo e referências. Alinhar expectativas, prioridades.

Prazo: 1 dia antes ou início da diária', '', 3, 'step'),
  (v_sop_id, '5.4. Direção em set', 'Dirigir cada take: composição, enquadramento, iluminação, staging (mobiliário, vegetação, pessoas). Vídeo: movimentos de câmera, ritmo. Drone: rota, altitude, velocidade.

Output: Material bruto capturado

Prazo: 1 diária (8-12h)', '', 4, 'step'),
  (v_sop_id, 'Capturar 20-30% a mais', 'Sempre capturar mais takes do que o planejado. Material extra dá liberdade na edição e protege contra takes que não funcionam na pós.', '', 5, 'tip'),
  (v_sop_id, '5.5. Revisão de selects', 'Revisar material bruto, selecionar takes aprovados, descartar problemas técnicos/criativos. Vídeo: selecionar cenas + sequência narrativa.

Output: Selects aprovados + direção de edição

Prazo: 1 dia após diária', '', 6, 'step'),
  (v_sop_id, '5.6. Direção de pós-produção', 'Definir: color grading, retoque, limpeza de cena, inserção de céu, compositing. Vídeo: ritmo, trilha, tipografia.

Output: Briefing de pós-produção', '', 7, 'step'),
  (v_sop_id, 'Equipamento mínimo', '**Foto:** Full-frame, lentes 16-35mm + 24-70mm + tilt-shift, tripé, flash portátil.
**Vídeo:** Cinema/mirrorless 4K+, gimbal, slider, drone DJI Mavic 3+, mic direcional.
**Iluminação:** Painéis LED portáteis para interiores.', '', 8, 'note'),
  (v_sop_id, '6. Critérios de Qualidade', 'Shot list 100% capturada. Iluminação consistente com briefing. Composição intencional. Material bruto com qualidade técnica (foco, exposição, estabilização). Selects revisados pelo DC. Direção de pós documentada.', '', 9, 'step');


  RAISE NOTICE 'Seed de SOPs de Direção Criativa concluído: 8 SOPs inseridos.';
END $$;

END $$;
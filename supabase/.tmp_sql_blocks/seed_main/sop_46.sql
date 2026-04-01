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
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Acompanhamento de Obras Videolog',
    'tbo-av-006-acompanhamento-de-obras-videolog',
    'audiovisual',
    'checklist',
    'Acompanhamento de Obras (Videolog)',
    'Standard Operating Procedure

Acompanhamento de Obras (Videolog)

Código

TBO-AV-006

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Audiovisual

Responsável

Marco Andolfato (Diretor Criativo)

Aprovador

Marco Andolfato



  1. Objetivo

Documentar o avanço físico da obra em visitas periódicas, produzindo vídeos de update (30–90s) e banco de imagens para comunicação com compradores, marketing do lançamento e acervo jurídico.

  2. Escopo

2.1 O que está coberto

Visitas mensais ou bimestrais ao canteiro; captação aérea e terrestre; edição de videolog; comparativo percentual de avanço; entrega de pacote de fotos e vídeo.

2.2 Exclusões

Laudos técnicos de engenharia, relatórios de conformidade estrutural, fiscalização de obra (responsabilidade da incorporadora).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Equipe AV (Operador/Cinegrafista)

Captação em campo

Executor

—

Marco Andolfato

Aprovação do material e padrão estético

Aprovador

—

Incorporadora / Engenharia

Acesso à obra, informações de avanço (%)

Consultado

Informado

Carol (Ops)

Agendamento de visitas, entrega ao cliente

Executor

—

  4. Pré-requisitos

4.1 Inputs necessários

Cronograma de obras do cliente; percentual de avanço atual; EPI necessário para acesso ao canteiro; credenciamento prévio para operação de drone em área de obra; identidade visual do empreendimento para motion.

4.2 Ferramentas e Acessos

Câmera cinema ou mirrorless (Sony A7IV / FX6), drone DJI com autorização DECEA, tripé/gimbal, Adobe Premiere Pro, After Effects, Google Drive.



  5. Procedimento Passo a Passo

5.1. Agendamento e Briefing da Visita

Ação: Carol agenda visita com engenheiro responsável; confirma EPI disponível, zonas de acesso liberadas, autorização de voo drone e percentual de avanço a destacar.

Responsável: Carol (Ops)

Output: Visita confirmada com checklist de acesso

Prazo referência: 7 dias antes da visita

5.2. Captação em Campo

Ação: Filmar panorâmica geral do canteiro (aérea e terrestre), detalhar estrutura/acabamento no estágio atual, captar comparativos com visita anterior (mesmo ângulo), registrar equipe em ação.

Responsável: Equipe AV

Output: Rushes organizados por zona de obra

Prazo referência: Dia da visita

5.3. Edição do Videolog

Ação: Montar vídeo de 30–90s com narração em off sobre percentual de avanço; inserir comparativos lado a lado (visita anterior vs. atual); motion com indicadores de progresso; trilha positiva e energética.

Responsável: Equipe AV

Output: Videolog editado para revisão

Prazo referência: 3 dias após visita

5.4. Revisão e Entrega

Ação: Marco revisar; enviar ao cliente para aprovação rápida (24h); aplicar ajustes se necessário; exportar MP4 para comunicação com compradores e ProRes para arquivo; entregar pacote de fotos em alta.

Responsável: Marco Andolfato + Carol (Ops)

Output: Videolog + fotos entregues no Google Drive do cliente

Prazo referência: 5 dias após visita

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] EPI utilizado durante toda a captação; [ ] Drone com autorização DECEA válida; [ ] Ângulos comparativos replicados da visita anterior; [ ] Percentual de avanço informado pela engenharia incluído no vídeo; [ ] Backup imediato dos arquivos no servidor TBO.

6.2 Erros Comuns a Evitar

Acesso ao canteiro negado por falta de agendamento → visita cancelada. Drone sem autorização → multa ANAC. Não replicar ângulos anteriores → impossibilidade de comparativo. Dados de avanço incorretos → problema com comprador.

  7. Ferramentas e Templates

Sony FX6 / A7IV, DJI Drone, Adobe Premiere Pro, After Effects, Google Drive, Asana.

  8. SLAs e Prazos

Agendamento: mínimo 7 dias antes. Entrega do videolog: 5 dias úteis após visita. Frequência: mensal ou conforme contrato.

  9. Fluxograma

Início → Agendamento da Visita (7 dias antes) → Checklist de Acesso → Captação em Campo → Backup Imediato → Edição Videolog + Fotos → Revisão (Marco) → Aprovação Cliente → Exportação → Entrega → Fim

  10. Glossário

Videolog: vídeo-registro periódico de avanço de obra. EPI: Equipamento de Proteção Individual. DECEA: Departamento de Controle do Espaço Aéreo (autorização para drones). Comparativo lado a lado: split screen de visita anterior vs. atual.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Acompanhamento de Obras (Videolog)</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-AV-006</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Audiovisual</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Documentar o avanço físico da obra em visitas periódicas, produzindo vídeos de update (30–90s) e banco de imagens para comunicação com compradores, marketing do lançamento e acervo jurídico.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Visitas mensais ou bimestrais ao canteiro; captação aérea e terrestre; edição de videolog; comparativo percentual de avanço; entrega de pacote de fotos e vídeo.</p><p><strong>2.2 Exclusões</strong></p><p>Laudos técnicos de engenharia, relatórios de conformidade estrutural, fiscalização de obra (responsabilidade da incorporadora).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Equipe AV (Operador/Cinegrafista)</p></td><td><p>Captação em campo</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação do material e padrão estético</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Incorporadora / Engenharia</p></td><td><p>Acesso à obra, informações de avanço (%)</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Agendamento de visitas, entrega ao cliente</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Cronograma de obras do cliente; percentual de avanço atual; EPI necessário para acesso ao canteiro; credenciamento prévio para operação de drone em área de obra; identidade visual do empreendimento para motion.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Câmera cinema ou mirrorless (Sony A7IV / FX6), drone DJI com autorização DECEA, tripé/gimbal, Adobe Premiere Pro, After Effects, Google Drive.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Agendamento e Briefing da Visita</strong></p><p>Ação: Carol agenda visita com engenheiro responsável; confirma EPI disponível, zonas de acesso liberadas, autorização de voo drone e percentual de avanço a destacar.</p><p>Responsável: Carol (Ops)</p><p>Output: Visita confirmada com checklist de acesso</p><p>Prazo referência: 7 dias antes da visita</p><p><strong>5.2. Captação em Campo</strong></p><p>Ação: Filmar panorâmica geral do canteiro (aérea e terrestre), detalhar estrutura/acabamento no estágio atual, captar comparativos com visita anterior (mesmo ângulo), registrar equipe em ação.</p><p>Responsável: Equipe AV</p><p>Output: Rushes organizados por zona de obra</p><p>Prazo referência: Dia da visita</p><p><strong>5.3. Edição do Videolog</strong></p><p>Ação: Montar vídeo de 30–90s com narração em off sobre percentual de avanço; inserir comparativos lado a lado (visita anterior vs. atual); motion com indicadores de progresso; trilha positiva e energética.</p><p>Responsável: Equipe AV</p><p>Output: Videolog editado para revisão</p><p>Prazo referência: 3 dias após visita</p><p><strong>5.4. Revisão e Entrega</strong></p><p>Ação: Marco revisar; enviar ao cliente para aprovação rápida (24h); aplicar ajustes se necessário; exportar MP4 para comunicação com compradores e ProRes para arquivo; entregar pacote de fotos em alta.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Videolog + fotos entregues no Google Drive do cliente</p><p>Prazo referência: 5 dias após visita</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] EPI utilizado durante toda a captação; [ ] Drone com autorização DECEA válida; [ ] Ângulos comparativos replicados da visita anterior; [ ] Percentual de avanço informado pela engenharia incluído no vídeo; [ ] Backup imediato dos arquivos no servidor TBO.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Acesso ao canteiro negado por falta de agendamento → visita cancelada. Drone sem autorização → multa ANAC. Não replicar ângulos anteriores → impossibilidade de comparativo. Dados de avanço incorretos → problema com comprador.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Sony FX6 / A7IV, DJI Drone, Adobe Premiere Pro, After Effects, Google Drive, Asana.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Agendamento: mínimo 7 dias antes. Entrega do videolog: 5 dias úteis após visita. Frequência: mensal ou conforme contrato.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Agendamento da Visita (7 dias antes) → Checklist de Acesso → Captação em Campo → Backup Imediato → Edição Videolog + Fotos → Revisão (Marco) → Aprovação Cliente → Exportação → Entrega → Fim</p><p><strong>  10. Glossário</strong></p><p>Videolog: vídeo-registro periódico de avanço de obra. EPI: Equipamento de Proteção Individual. DECEA: Departamento de Controle do Espaço Aéreo (autorização para drones). Comparativo lado a lado: split screen de visita anterior vs. atual.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['video','filme','audiovisual','entrega','qualidade','cliente']::TEXT[],
    5,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-AV-006
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Documentar o avanço físico da obra em visitas periódicas, produzindo vídeos de update (30–90s) e banco de imagens para comunicação com compradores, marketing do lançamento e acervo jurídico.', '<p>Documentar o avanço físico da obra em visitas periódicas, produzindo vídeos de update (30–90s) e banco de imagens para comunicação com compradores, marketing do lançamento e acervo jurídico.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Visitas mensais ou bimestrais ao canteiro; captação aérea e terrestre; edição de videolog; comparativo percentual de avanço; entrega de pacote de fotos e vídeo.', '<p>Visitas mensais ou bimestrais ao canteiro; captação aérea e terrestre; edição de videolog; comparativo percentual de avanço; entrega de pacote de fotos e vídeo.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Laudos técnicos de engenharia, relatórios de conformidade estrutural, fiscalização de obra (responsabilidade da incorporadora).', '<p>Laudos técnicos de engenharia, relatórios de conformidade estrutural, fiscalização de obra (responsabilidade da incorporadora).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Equipe AV (Operador/Cinegrafista)

Captação em campo

Executor

—

Marco Andolfato

Aprovação do material e padrão estético

Aprovador

—

Incorporadora / Engenharia

Acesso à obra, informações de avanço (%)

Consultado

Informado

Carol (Ops)

Agendamento de visitas, entrega ao cliente

Executor

—', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Equipe AV (Operador/Cinegrafista)</p></td><td><p>Captação em campo</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação do material e padrão estético</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Incorporadora / Engenharia</p></td><td><p>Acesso à obra, informações de avanço (%)</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Agendamento de visitas, entrega ao cliente</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Cronograma de obras do cliente; percentual de avanço atual; EPI necessário para acesso ao canteiro; credenciamento prévio para operação de drone em área de obra; identidade visual do empreendimento para motion.', '<p>Cronograma de obras do cliente; percentual de avanço atual; EPI necessário para acesso ao canteiro; credenciamento prévio para operação de drone em área de obra; identidade visual do empreendimento para motion.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Câmera cinema ou mirrorless (Sony A7IV / FX6), drone DJI com autorização DECEA, tripé/gimbal, Adobe Premiere Pro, After Effects, Google Drive.', '<p>Câmera cinema ou mirrorless (Sony A7IV / FX6), drone DJI com autorização DECEA, tripé/gimbal, Adobe Premiere Pro, After Effects, Google Drive.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Agendamento e Briefing da Visita', 'Ação: Carol agenda visita com engenheiro responsável; confirma EPI disponível, zonas de acesso liberadas, autorização de voo drone e percentual de avanço a destacar.

Responsável: Carol (Ops)

Output: Visita confirmada com checklist de acesso

Prazo referência: 7 dias antes da visita', '<p>Ação: Carol agenda visita com engenheiro responsável; confirma EPI disponível, zonas de acesso liberadas, autorização de voo drone e percentual de avanço a destacar.</p><p>Responsável: Carol (Ops)</p><p>Output: Visita confirmada com checklist de acesso</p><p>Prazo referência: 7 dias antes da visita</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Captação em Campo', 'Ação: Filmar panorâmica geral do canteiro (aérea e terrestre), detalhar estrutura/acabamento no estágio atual, captar comparativos com visita anterior (mesmo ângulo), registrar equipe em ação.

Responsável: Equipe AV

Output: Rushes organizados por zona de obra

Prazo referência: Dia da visita', '<p>Ação: Filmar panorâmica geral do canteiro (aérea e terrestre), detalhar estrutura/acabamento no estágio atual, captar comparativos com visita anterior (mesmo ângulo), registrar equipe em ação.</p><p>Responsável: Equipe AV</p><p>Output: Rushes organizados por zona de obra</p><p>Prazo referência: Dia da visita</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Edição do Videolog', 'Ação: Montar vídeo de 30–90s com narração em off sobre percentual de avanço; inserir comparativos lado a lado (visita anterior vs. atual); motion com indicadores de progresso; trilha positiva e energética.

Responsável: Equipe AV

Output: Videolog editado para revisão

Prazo referência: 3 dias após visita', '<p>Ação: Montar vídeo de 30–90s com narração em off sobre percentual de avanço; inserir comparativos lado a lado (visita anterior vs. atual); motion com indicadores de progresso; trilha positiva e energética.</p><p>Responsável: Equipe AV</p><p>Output: Videolog editado para revisão</p><p>Prazo referência: 3 dias após visita</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Revisão e Entrega', 'Ação: Marco revisar; enviar ao cliente para aprovação rápida (24h); aplicar ajustes se necessário; exportar MP4 para comunicação com compradores e ProRes para arquivo; entregar pacote de fotos em alta.

Responsável: Marco Andolfato + Carol (Ops)

Output: Videolog + fotos entregues no Google Drive do cliente

Prazo referência: 5 dias após visita', '<p>Ação: Marco revisar; enviar ao cliente para aprovação rápida (24h); aplicar ajustes se necessário; exportar MP4 para comunicação com compradores e ProRes para arquivo; entregar pacote de fotos em alta.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Videolog + fotos entregues no Google Drive do cliente</p><p>Prazo referência: 5 dias após visita</p>', 9, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] EPI utilizado durante toda a captação; [ ] Drone com autorização DECEA válida; [ ] Ângulos comparativos replicados da visita anterior; [ ] Percentual de avanço informado pela engenharia incluído no vídeo; [ ] Backup imediato dos arquivos no servidor TBO.', '<p>[ ] EPI utilizado durante toda a captação; [ ] Drone com autorização DECEA válida; [ ] Ângulos comparativos replicados da visita anterior; [ ] Percentual de avanço informado pela engenharia incluído no vídeo; [ ] Backup imediato dos arquivos no servidor TBO.</p>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Acesso ao canteiro negado por falta de agendamento → visita cancelada. Drone sem autorização → multa ANAC. Não replicar ângulos anteriores → impossibilidade de comparativo. Dados de avanço incorretos → problema com comprador.', '<p>Acesso ao canteiro negado por falta de agendamento → visita cancelada. Drone sem autorização → multa ANAC. Não replicar ângulos anteriores → impossibilidade de comparativo. Dados de avanço incorretos → problema com comprador.</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Sony FX6 / A7IV, DJI Drone, Adobe Premiere Pro, After Effects, Google Drive, Asana.', '<p>Sony FX6 / A7IV, DJI Drone, Adobe Premiere Pro, After Effects, Google Drive, Asana.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Agendamento: mínimo 7 dias antes. Entrega do videolog: 5 dias úteis após visita. Frequência: mensal ou conforme contrato.', '<p>Agendamento: mínimo 7 dias antes. Entrega do videolog: 5 dias úteis após visita. Frequência: mensal ou conforme contrato.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Agendamento da Visita (7 dias antes) → Checklist de Acesso → Captação em Campo → Backup Imediato → Edição Videolog + Fotos → Revisão (Marco) → Aprovação Cliente → Exportação → Entrega → Fim', '<p>Início → Agendamento da Visita (7 dias antes) → Checklist de Acesso → Captação em Campo → Backup Imediato → Edição Videolog + Fotos → Revisão (Marco) → Aprovação Cliente → Exportação → Entrega → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Videolog: vídeo-registro periódico de avanço de obra. EPI: Equipamento de Proteção Individual. DECEA: Departamento de Controle do Espaço Aéreo (autorização para drones). Comparativo lado a lado: split screen de visita anterior vs. atual.', '<p>Videolog: vídeo-registro periódico de avanço de obra. EPI: Equipamento de Proteção Individual. DECEA: Departamento de Controle do Espaço Aéreo (autorização para drones). Comparativo lado a lado: split screen de visita anterior vs. atual.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-GAM-001: Maquete Interativa para Vendas ──
END $$;
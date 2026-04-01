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
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Maquete Interativa para Vendas',
    'tbo-gam-001-maquete-interativa-para-vendas',
    'gamificacao',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Maquete Interativa para Vendas

Código

TBO-GAM-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Gamificação

Responsável

Marco Andolfato (Diretor Criativo)

Aprovador

Marco Andolfato



  1. Objetivo

Desenvolver aplicação interativa em tempo real (totem, mesa touch ou web) que permite ao corretor e comprador explorar o empreendimento em 3D, consultar disponibilidade de unidades, visualizar plantas e personalizar acabamentos no stand de vendas.

  2. Escopo

2.1 O que está coberto

Modelagem 3D do empreendimento e entorno, desenvolvimento da aplicação interativa (Unreal Engine ou Three.js/WebGL), integração com tabela de disponibilidade, testes em hardware do stand, entrega e treinamento.

2.2 Exclusões

Fornecimento de hardware (totem, mesa touch) — responsabilidade da incorporadora, integração em tempo real com sistema de CRM para fechamento de venda, manutenção pós-entrega sem contrato de suporte.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção criativa, arquitetura da solução, aprovação final

Aprovador

—

Dev 3D / Artista Técnico

Modelagem, texturização, desenvolvimento da aplicação

Executor

—

Cliente / Incorporadora

Plantas, tabelas de disponibilidade, aprovações

Consultado

Informado

Carol (Ops)

Cronograma, entrega de assets, aceite formal

Executor

—

  4. Pré-requisitos

4.1 Inputs necessários

Plantas completas do empreendimento (DWG ou PDF vetorial); renders aprovados como referência estética; tabela de unidades (bloco, andar, tipologia, metragem, status); identidade visual; especificações do hardware alvo (totem/mesa touch/PC).

4.2 Ferramentas e Acessos

Unreal Engine 5 (preferencial para alto realismo) ou Three.js + WebGL (para aplicação web sem instalação), Blender/3ds Max para modelagem, Adobe Substance Painter para texturas, Git (controle de versão do projeto), Asana.



  5. Procedimento Passo a Passo

5.1. Discovery Técnico e Briefing

Ação: Reunião técnica com cliente: levantar plantas, definir hardware alvo, número de unidades, fluxo de interação desejado (navegar por blocos → andar → unidade → planta → personalização). Marco define arquitetura técnica da solução.

Responsável: Marco Andolfato + Cliente

Output: Documento de escopo técnico aprovado

Prazo referência: Dia 1–3

5.2. Modelagem 3D do Empreendimento

Ação: Modelar maquete 3D do empreendimento (fachada, implantação, apartamentos-tipo por tipologia) a partir das plantas DWG; aplicar texturas realistas e iluminação de dia/noite.

Responsável: Dev 3D

Output: Modelos 3D aprovados esteticamente por Marco

Prazo referência: Dia 4–15

5.3. Desenvolvimento da Aplicação Interativa

Ação: Desenvolver a aplicação no engine definido: navegação 3D, seleção de unidade por andar, popup de informações (metragem, preço, status), visualização de planta, módulo de personalização de acabamento (paletas de revestimento).

Responsável: Dev 3D + Marco

Output: Build alpha funcional para testes internos

Prazo referência: Dia 16–30

5.4. Integração da Tabela de Disponibilidade

Ação: Conectar a aplicação à tabela de unidades (JSON/CSV ou API REST); implementar lógica de status (disponível/reservado/vendido) com atualização manual ou automática; testar fluxo completo.

Responsável: Dev 3D

Output: Disponibilidade integrada e testada

Prazo referência: Dia 28–33

5.5. Testes em Hardware Real e Ajustes de Performance

Ação: Instalar build no hardware do stand; medir framerate (meta: ≥30fps constante), responsividade do touch, fluxo de navegação com corretor real; ajustar LOD, iluminação e UX conforme achados.

Responsável: Dev 3D + Marco

Output: Build beta aprovada em hardware real

Prazo referência: Dia 34–38

5.6. Treinamento e Entrega

Ação: Treinar equipe de corretores e atendentes do stand (1–2h); entregar documentação de operação e guia de atualização da tabela; entregar build final + código-fonte ao cliente; fechar projeto no Asana.

Responsável: Marco Andolfato + Carol (Ops)

Output: Stand operacional, equipe treinada, aceite assinado

Prazo referência: Dia 39–40

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Todas as tipologias de unidade modeladas e testadas; [ ] Tabela de disponibilidade sem unidades com status incorreto; [ ] Framerate ≥30fps no hardware de produção; [ ] Touch/mouse responsivo sem lag perceptível; [ ] Fluxo completo testado por um corretor real antes da entrega; [ ] Documentação de operação entregue.

6.2 Erros Comuns a Evitar

Plantas DWG recebidas com erros → modelagem incorreta, necessidade de retrabalho. Performance insuficiente no hardware → experiência ruim no stand. Tabela de disponibilidade desatualizada → corretor apresenta unidade já vendida (problema grave). Falta de treinamento → equipe não usa a ferramenta.

  7. Ferramentas e Templates

Unreal Engine 5, Blender, 3ds Max, Adobe Substance Painter, Three.js, WebGL, Git, Asana, Google Drive.

  8. SLAs e Prazos

Escopo técnico aprovado: 3 dias. Build alpha: 30 dias úteis. Entrega final: 40 dias úteis pós-início. Inclui: 2 rodadas de revisão estética e 1 sessão de treinamento.

  9. Fluxograma

Início → Discovery Técnico → Escopo Aprovado → Modelagem 3D → Aprovação Estética → Desenvolvimento da Aplicação → Integração de Disponibilidade → Build Alpha (testes internos) → Testes em Hardware Real → Ajustes de Performance → Build Beta Aprovada → Treinamento → Entrega Final → Aceite Formal → Fim

  10. Glossário

LOD: Level of Detail — técnica de otimização que reduz complexidade de modelos distantes. Framerate: quadros por segundo renderizados (FPS). Build: versão compilada e executável da aplicação. Touch: interação por toque em tela sensível. Tipologia: categoria de unidade por número de quartos/área.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Maquete Interativa para Vendas</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-GAM-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Gamificação</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Desenvolver aplicação interativa em tempo real (totem, mesa touch ou web) que permite ao corretor e comprador explorar o empreendimento em 3D, consultar disponibilidade de unidades, visualizar plantas e personalizar acabamentos no stand de vendas.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Modelagem 3D do empreendimento e entorno, desenvolvimento da aplicação interativa (Unreal Engine ou Three.js/WebGL), integração com tabela de disponibilidade, testes em hardware do stand, entrega e treinamento.</p><p><strong>2.2 Exclusões</strong></p><p>Fornecimento de hardware (totem, mesa touch) — responsabilidade da incorporadora, integração em tempo real com sistema de CRM para fechamento de venda, manutenção pós-entrega sem contrato de suporte.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Direção criativa, arquitetura da solução, aprovação final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Dev 3D / Artista Técnico</p></td><td><p>Modelagem, texturização, desenvolvimento da aplicação</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Plantas, tabelas de disponibilidade, aprovações</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Cronograma, entrega de assets, aceite formal</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Plantas completas do empreendimento (DWG ou PDF vetorial); renders aprovados como referência estética; tabela de unidades (bloco, andar, tipologia, metragem, status); identidade visual; especificações do hardware alvo (totem/mesa touch/PC).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Unreal Engine 5 (preferencial para alto realismo) ou Three.js + WebGL (para aplicação web sem instalação), Blender/3ds Max para modelagem, Adobe Substance Painter para texturas, Git (controle de versão do projeto), Asana.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Discovery Técnico e Briefing</strong></p><p>Ação: Reunião técnica com cliente: levantar plantas, definir hardware alvo, número de unidades, fluxo de interação desejado (navegar por blocos → andar → unidade → planta → personalização). Marco define arquitetura técnica da solução.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Documento de escopo técnico aprovado</p><p>Prazo referência: Dia 1–3</p><p><strong>5.2. Modelagem 3D do Empreendimento</strong></p><p>Ação: Modelar maquete 3D do empreendimento (fachada, implantação, apartamentos-tipo por tipologia) a partir das plantas DWG; aplicar texturas realistas e iluminação de dia/noite.</p><p>Responsável: Dev 3D</p><p>Output: Modelos 3D aprovados esteticamente por Marco</p><p>Prazo referência: Dia 4–15</p><p><strong>5.3. Desenvolvimento da Aplicação Interativa</strong></p><p>Ação: Desenvolver a aplicação no engine definido: navegação 3D, seleção de unidade por andar, popup de informações (metragem, preço, status), visualização de planta, módulo de personalização de acabamento (paletas de revestimento).</p><p>Responsável: Dev 3D + Marco</p><p>Output: Build alpha funcional para testes internos</p><p>Prazo referência: Dia 16–30</p><p><strong>5.4. Integração da Tabela de Disponibilidade</strong></p><p>Ação: Conectar a aplicação à tabela de unidades (JSON/CSV ou API REST); implementar lógica de status (disponível/reservado/vendido) com atualização manual ou automática; testar fluxo completo.</p><p>Responsável: Dev 3D</p><p>Output: Disponibilidade integrada e testada</p><p>Prazo referência: Dia 28–33</p><p><strong>5.5. Testes em Hardware Real e Ajustes de Performance</strong></p><p>Ação: Instalar build no hardware do stand; medir framerate (meta: ≥30fps constante), responsividade do touch, fluxo de navegação com corretor real; ajustar LOD, iluminação e UX conforme achados.</p><p>Responsável: Dev 3D + Marco</p><p>Output: Build beta aprovada em hardware real</p><p>Prazo referência: Dia 34–38</p><p><strong>5.6. Treinamento e Entrega</strong></p><p>Ação: Treinar equipe de corretores e atendentes do stand (1–2h); entregar documentação de operação e guia de atualização da tabela; entregar build final + código-fonte ao cliente; fechar projeto no Asana.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Stand operacional, equipe treinada, aceite assinado</p><p>Prazo referência: Dia 39–40</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Todas as tipologias de unidade modeladas e testadas; [ ] Tabela de disponibilidade sem unidades com status incorreto; [ ] Framerate ≥30fps no hardware de produção; [ ] Touch/mouse responsivo sem lag perceptível; [ ] Fluxo completo testado por um corretor real antes da entrega; [ ] Documentação de operação entregue.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Plantas DWG recebidas com erros → modelagem incorreta, necessidade de retrabalho. Performance insuficiente no hardware → experiência ruim no stand. Tabela de disponibilidade desatualizada → corretor apresenta unidade já vendida (problema grave). Falta de treinamento → equipe não usa a ferramenta.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Unreal Engine 5, Blender, 3ds Max, Adobe Substance Painter, Three.js, WebGL, Git, Asana, Google Drive.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Escopo técnico aprovado: 3 dias. Build alpha: 30 dias úteis. Entrega final: 40 dias úteis pós-início. Inclui: 2 rodadas de revisão estética e 1 sessão de treinamento.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Discovery Técnico → Escopo Aprovado → Modelagem 3D → Aprovação Estética → Desenvolvimento da Aplicação → Integração de Disponibilidade → Build Alpha (testes internos) → Testes em Hardware Real → Ajustes de Performance → Build Beta Aprovada → Treinamento → Entrega Final → Aceite Formal → Fim</p><p><strong>  10. Glossário</strong></p><p>LOD: Level of Detail — técnica de otimização que reduz complexidade de modelos distantes. Framerate: quadros por segundo renderizados (FPS). Build: versão compilada e executável da aplicação. Touch: interação por toque em tela sensível. Tipologia: categoria de unidade por número de quartos/área.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['interativo','gamificacao','entrega','qualidade','cliente','aprovacao']::TEXT[],
    0,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-GAM-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Desenvolver aplicação interativa em tempo real (totem, mesa touch ou web) que permite ao corretor e comprador explorar o empreendimento em 3D, consultar disponibilidade de unidades, visualizar plantas e personalizar acabamentos no stand de vendas.', '<p>Desenvolver aplicação interativa em tempo real (totem, mesa touch ou web) que permite ao corretor e comprador explorar o empreendimento em 3D, consultar disponibilidade de unidades, visualizar plantas e personalizar acabamentos no stand de vendas.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Modelagem 3D do empreendimento e entorno, desenvolvimento da aplicação interativa (Unreal Engine ou Three.js/WebGL), integração com tabela de disponibilidade, testes em hardware do stand, entrega e treinamento.', '<p>Modelagem 3D do empreendimento e entorno, desenvolvimento da aplicação interativa (Unreal Engine ou Three.js/WebGL), integração com tabela de disponibilidade, testes em hardware do stand, entrega e treinamento.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Fornecimento de hardware (totem, mesa touch) — responsabilidade da incorporadora, integração em tempo real com sistema de CRM para fechamento de venda, manutenção pós-entrega sem contrato de suporte.', '<p>Fornecimento de hardware (totem, mesa touch) — responsabilidade da incorporadora, integração em tempo real com sistema de CRM para fechamento de venda, manutenção pós-entrega sem contrato de suporte.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção criativa, arquitetura da solução, aprovação final

Aprovador

—

Dev 3D / Artista Técnico

Modelagem, texturização, desenvolvimento da aplicação

Executor

—

Cliente / Incorporadora

Plantas, tabelas de disponibilidade, aprovações

Consultado

Informado

Carol (Ops)

Cronograma, entrega de assets, aceite formal

Executor

—', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Direção criativa, arquitetura da solução, aprovação final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Dev 3D / Artista Técnico</p></td><td><p>Modelagem, texturização, desenvolvimento da aplicação</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Plantas, tabelas de disponibilidade, aprovações</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Cronograma, entrega de assets, aceite formal</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plantas completas do empreendimento (DWG ou PDF vetorial); renders aprovados como referência estética; tabela de unidades (bloco, andar, tipologia, metragem, status); identidade visual; especificações do hardware alvo (totem/mesa touch/PC).', '<p>Plantas completas do empreendimento (DWG ou PDF vetorial); renders aprovados como referência estética; tabela de unidades (bloco, andar, tipologia, metragem, status); identidade visual; especificações do hardware alvo (totem/mesa touch/PC).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Unreal Engine 5 (preferencial para alto realismo) ou Three.js + WebGL (para aplicação web sem instalação), Blender/3ds Max para modelagem, Adobe Substance Painter para texturas, Git (controle de versão do projeto), Asana.', '<p>Unreal Engine 5 (preferencial para alto realismo) ou Three.js + WebGL (para aplicação web sem instalação), Blender/3ds Max para modelagem, Adobe Substance Painter para texturas, Git (controle de versão do projeto), Asana.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Discovery Técnico e Briefing', 'Ação: Reunião técnica com cliente: levantar plantas, definir hardware alvo, número de unidades, fluxo de interação desejado (navegar por blocos → andar → unidade → planta → personalização). Marco define arquitetura técnica da solução.

Responsável: Marco Andolfato + Cliente

Output: Documento de escopo técnico aprovado

Prazo referência: Dia 1–3', '<p>Ação: Reunião técnica com cliente: levantar plantas, definir hardware alvo, número de unidades, fluxo de interação desejado (navegar por blocos → andar → unidade → planta → personalização). Marco define arquitetura técnica da solução.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Documento de escopo técnico aprovado</p><p>Prazo referência: Dia 1–3</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Modelagem 3D do Empreendimento', 'Ação: Modelar maquete 3D do empreendimento (fachada, implantação, apartamentos-tipo por tipologia) a partir das plantas DWG; aplicar texturas realistas e iluminação de dia/noite.

Responsável: Dev 3D

Output: Modelos 3D aprovados esteticamente por Marco

Prazo referência: Dia 4–15', '<p>Ação: Modelar maquete 3D do empreendimento (fachada, implantação, apartamentos-tipo por tipologia) a partir das plantas DWG; aplicar texturas realistas e iluminação de dia/noite.</p><p>Responsável: Dev 3D</p><p>Output: Modelos 3D aprovados esteticamente por Marco</p><p>Prazo referência: Dia 4–15</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Desenvolvimento da Aplicação Interativa', 'Ação: Desenvolver a aplicação no engine definido: navegação 3D, seleção de unidade por andar, popup de informações (metragem, preço, status), visualização de planta, módulo de personalização de acabamento (paletas de revestimento).

Responsável: Dev 3D + Marco

Output: Build alpha funcional para testes internos

Prazo referência: Dia 16–30', '<p>Ação: Desenvolver a aplicação no engine definido: navegação 3D, seleção de unidade por andar, popup de informações (metragem, preço, status), visualização de planta, módulo de personalização de acabamento (paletas de revestimento).</p><p>Responsável: Dev 3D + Marco</p><p>Output: Build alpha funcional para testes internos</p><p>Prazo referência: Dia 16–30</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Integração da Tabela de Disponibilidade', 'Ação: Conectar a aplicação à tabela de unidades (JSON/CSV ou API REST); implementar lógica de status (disponível/reservado/vendido) com atualização manual ou automática; testar fluxo completo.

Responsável: Dev 3D

Output: Disponibilidade integrada e testada

Prazo referência: Dia 28–33', '<p>Ação: Conectar a aplicação à tabela de unidades (JSON/CSV ou API REST); implementar lógica de status (disponível/reservado/vendido) com atualização manual ou automática; testar fluxo completo.</p><p>Responsável: Dev 3D</p><p>Output: Disponibilidade integrada e testada</p><p>Prazo referência: Dia 28–33</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Testes em Hardware Real e Ajustes de Performance', 'Ação: Instalar build no hardware do stand; medir framerate (meta: ≥30fps constante), responsividade do touch, fluxo de navegação com corretor real; ajustar LOD, iluminação e UX conforme achados.

Responsável: Dev 3D + Marco

Output: Build beta aprovada em hardware real

Prazo referência: Dia 34–38', '<p>Ação: Instalar build no hardware do stand; medir framerate (meta: ≥30fps constante), responsividade do touch, fluxo de navegação com corretor real; ajustar LOD, iluminação e UX conforme achados.</p><p>Responsável: Dev 3D + Marco</p><p>Output: Build beta aprovada em hardware real</p><p>Prazo referência: Dia 34–38</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Treinamento e Entrega', 'Ação: Treinar equipe de corretores e atendentes do stand (1–2h); entregar documentação de operação e guia de atualização da tabela; entregar build final + código-fonte ao cliente; fechar projeto no Asana.

Responsável: Marco Andolfato + Carol (Ops)

Output: Stand operacional, equipe treinada, aceite assinado

Prazo referência: Dia 39–40', '<p>Ação: Treinar equipe de corretores e atendentes do stand (1–2h); entregar documentação de operação e guia de atualização da tabela; entregar build final + código-fonte ao cliente; fechar projeto no Asana.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Stand operacional, equipe treinada, aceite assinado</p><p>Prazo referência: Dia 39–40</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todas as tipologias de unidade modeladas e testadas; [ ] Tabela de disponibilidade sem unidades com status incorreto; [ ] Framerate ≥30fps no hardware de produção; [ ] Touch/mouse responsivo sem lag perceptível; [ ] Fluxo completo testado por um corretor real antes da entrega; [ ] Documentação de operação entregue.', '<p>[ ] Todas as tipologias de unidade modeladas e testadas; [ ] Tabela de disponibilidade sem unidades com status incorreto; [ ] Framerate ≥30fps no hardware de produção; [ ] Touch/mouse responsivo sem lag perceptível; [ ] Fluxo completo testado por um corretor real antes da entrega; [ ] Documentação de operação entregue.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Plantas DWG recebidas com erros → modelagem incorreta, necessidade de retrabalho. Performance insuficiente no hardware → experiência ruim no stand. Tabela de disponibilidade desatualizada → corretor apresenta unidade já vendida (problema grave). Falta de treinamento → equipe não usa a ferramenta.', '<p>Plantas DWG recebidas com erros → modelagem incorreta, necessidade de retrabalho. Performance insuficiente no hardware → experiência ruim no stand. Tabela de disponibilidade desatualizada → corretor apresenta unidade já vendida (problema grave). Falta de treinamento → equipe não usa a ferramenta.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Unreal Engine 5, Blender, 3ds Max, Adobe Substance Painter, Three.js, WebGL, Git, Asana, Google Drive.', '<p>Unreal Engine 5, Blender, 3ds Max, Adobe Substance Painter, Three.js, WebGL, Git, Asana, Google Drive.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Escopo técnico aprovado: 3 dias. Build alpha: 30 dias úteis. Entrega final: 40 dias úteis pós-início. Inclui: 2 rodadas de revisão estética e 1 sessão de treinamento.', '<p>Escopo técnico aprovado: 3 dias. Build alpha: 30 dias úteis. Entrega final: 40 dias úteis pós-início. Inclui: 2 rodadas de revisão estética e 1 sessão de treinamento.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Discovery Técnico → Escopo Aprovado → Modelagem 3D → Aprovação Estética → Desenvolvimento da Aplicação → Integração de Disponibilidade → Build Alpha (testes internos) → Testes em Hardware Real → Ajustes de Performance → Build Beta Aprovada → Treinamento → Entrega Final → Aceite Formal → Fim', '<p>Início → Discovery Técnico → Escopo Aprovado → Modelagem 3D → Aprovação Estética → Desenvolvimento da Aplicação → Integração de Disponibilidade → Build Alpha (testes internos) → Testes em Hardware Real → Ajustes de Performance → Build Beta Aprovada → Treinamento → Entrega Final → Aceite Formal → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'LOD: Level of Detail — técnica de otimização que reduz complexidade de modelos distantes. Framerate: quadros por segundo renderizados (FPS). Build: versão compilada e executável da aplicação. Touch: interação por toque em tela sensível. Tipologia: categoria de unidade por número de quartos/área.', '<p>LOD: Level of Detail — técnica de otimização que reduz complexidade de modelos distantes. Framerate: quadros por segundo renderizados (FPS). Build: versão compilada e executável da aplicação. Touch: interação por toque em tela sensível. Tipologia: categoria de unidade por número de quartos/área.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-GAM-002: Plataforma de Personalização de Unidades ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Plataforma de Personalização de Unidades',
    'tbo-gam-002-plataforma-de-personalizacao-de-unidades',
    'gamificacao',
    'checklist',
    'Plataforma de Personalização de Unidades',
    'Standard Operating Procedure

Plataforma de Personalização de Unidades

Código

TBO-GAM-002

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Gamificação

Responsável

Marco Andolfato (Diretor Criativo)

Aprovador

Marco Andolfato



  1. Objetivo

Desenvolver plataforma web ou aplicação (WebGL/Three.js) que permite ao comprador personalizar acabamentos, móveis e materiais da sua unidade em tempo real, gerando PDF de escolhas para formalização com a incorporadora.

  2. Escopo

2.1 O que está coberto

Modelagem 3D dos ambientes personalizáveis, desenvolvimento da plataforma com múltiplos pacotes de acabamento, lógica de preço diferencial por pacote, geração de PDF/relatório de escolha, testes e entrega.

2.2 Exclusões

Integração com ERP para pedido de compra automático (demanda de integração separada), personalização estrutural (mudança de paredes), aplicativo nativo iOS/Android (escopo desta entrega é web).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção criativa, arquitetura da solução

Aprovador

—

Dev 3D / Frontend

Desenvolvimento da plataforma web

Executor

—

Arquiteto / Incorporadora

Definição de pacotes, materiais, preços e restrições

Consultado

Informado

Carol (Ops)

Cronograma, testes com usuários reais, entrega

Executor

—

  4. Pré-requisitos

4.1 Inputs necessários

Plantas dos ambientes personalizáveis (sala, cozinha, quartos); catálogo completo de materiais (piso, parede, bancada, louças) com fotos/renders e preços por pacote; identidade visual da incorporadora; briefing de UX (fluxo de personalização desejado pelo cliente).

4.2 Ferramentas e Acessos

Three.js + React (para plataforma web), Blender para modelagem de ambientes, Adobe Substance Painter para materiais PBR, Figma para protótipo UX, jsPDF ou Puppeteer para geração de PDF, Git, Asana.



  5. Procedimento Passo a Passo

5.1. Discovery de Produto e UX

Ação: Workshop com cliente (incorporadora + arquiteto): mapear ambientes personalizáveis, pacotes disponíveis, lógica de preço diferencial, restrições de combinação e fluxo de escolha do comprador. Marco prototipa fluxo no Figma.

Responsável: Marco Andolfato + Cliente

Output: Protótipo de UX aprovado no Figma

Prazo referência: Dia 1–5

5.2. Modelagem 3D dos Ambientes

Ação: Modelar cada ambiente personalizável com todos os materiais mapeados como camadas independentes (piso, parede, bancada); texturizar materiais PBR para realismo; otimizar para web.

Responsável: Dev 3D

Output: Modelos 3D otimizados para web, aprovados esteticamente

Prazo referência: Dia 6–18

5.3. Desenvolvimento do Engine de Personalização

Ação: Implementar visualizador 3D em Three.js com troca de materiais em tempo real; criar painel de seleção de pacotes; implementar lógica de preço cumulativo e validação de combinações inválidas.

Responsável: Dev 3D + Dev Frontend

Output: Engine de personalização funcional

Prazo referência: Dia 19–35

5.4. Geração de PDF e Resumo de Escolhas

Ação: Implementar módulo de exportação: capturar screenshot de cada ambiente personalizado; gerar PDF com resumo de escolhas (ambiente, material, código, preço por pacote, valor total diferencial); incluir assinatura digital ou código de confirmação.

Responsável: Dev Frontend

Output: PDF de escolhas gerado automaticamente

Prazo referência: Dia 33–38

5.5. Testes com Usuários e Ajustes

Ação: Realizar sessão de testes com 3–5 compradores reais ou corretores; observar pontos de confusão; ajustar UX, performance e fluxo de confirmação; teste de stress em diferentes dispositivos (desktop, tablet, mobile).

Responsável: Carol (Ops) + Marco

Output: Plataforma aprovada em testes com usuários

Prazo referência: Dia 39–43

5.6. Entrega, Deploy e Treinamento

Ação: Realizar deploy em ambiente de produção (Vercel ou servidor do cliente); configurar domínio; treinar equipe da incorporadora para gerenciar catálogo de materiais; entregar código-fonte e documentação técnica.

Responsável: Marco Andolfato + Carol (Ops)

Output: Plataforma no ar, equipe treinada, aceite formal assinado

Prazo referência: Dia 44–45

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Todos os pacotes de material com foto + código + preço corretos; [ ] Troca de material em tempo real sem travamento visível; [ ] PDF gerado com todas as escolhas e valor total; [ ] Plataforma funcional em desktop e tablet; [ ] Nenhuma combinação inválida permitida pelo sistema; [ ] Deploy testado no domínio de produção antes da entrega.

6.2 Erros Comuns a Evitar

Catálogo de materiais incompleto no início → retrabalho de modelagem e dados. Performance lenta na web → frustração do comprador e abandono. PDF com dados errados → problema jurídico com a incorporadora. Combinações sem validação → comprador escolhe opção não disponível.

  7. Ferramentas e Templates

Three.js, React, Blender, Adobe Substance Painter, Figma, jsPDF, Puppeteer, Git, Vercel, Asana.

  8. SLAs e Prazos

Protótipo UX: 5 dias. Plataforma funcional (alpha): 35 dias úteis. Entrega final: 45 dias úteis pós-início. Inclui: 2 rodadas de ajuste de UX e 1 sessão de treinamento.

  9. Fluxograma

Início → Discovery UX → Protótipo Figma Aprovado → Modelagem 3D → Engine de Personalização → Geração de PDF → Alpha Interna → Testes com Usuários Reais → Ajustes → Deploy em Produção → Treinamento → Aceite Formal → Fim

  10. Glossário

PBR: Physically Based Rendering — sistema de texturização que simula comportamento real da luz sobre materiais. Engine: motor de renderização e lógica da aplicação. Deploy: publicação da aplicação em ambiente de produção acessível ao usuário final. Pacote de acabamento: conjunto pré-definido de materiais com preço diferencial.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Plataforma de Personalização de Unidades</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-GAM-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Gamificação</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Desenvolver plataforma web ou aplicação (WebGL/Three.js) que permite ao comprador personalizar acabamentos, móveis e materiais da sua unidade em tempo real, gerando PDF de escolhas para formalização com a incorporadora.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Modelagem 3D dos ambientes personalizáveis, desenvolvimento da plataforma com múltiplos pacotes de acabamento, lógica de preço diferencial por pacote, geração de PDF/relatório de escolha, testes e entrega.</p><p><strong>2.2 Exclusões</strong></p><p>Integração com ERP para pedido de compra automático (demanda de integração separada), personalização estrutural (mudança de paredes), aplicativo nativo iOS/Android (escopo desta entrega é web).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Direção criativa, arquitetura da solução</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Dev 3D / Frontend</p></td><td><p>Desenvolvimento da plataforma web</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Arquiteto / Incorporadora</p></td><td><p>Definição de pacotes, materiais, preços e restrições</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Cronograma, testes com usuários reais, entrega</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Plantas dos ambientes personalizáveis (sala, cozinha, quartos); catálogo completo de materiais (piso, parede, bancada, louças) com fotos/renders e preços por pacote; identidade visual da incorporadora; briefing de UX (fluxo de personalização desejado pelo cliente).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Three.js + React (para plataforma web), Blender para modelagem de ambientes, Adobe Substance Painter para materiais PBR, Figma para protótipo UX, jsPDF ou Puppeteer para geração de PDF, Git, Asana.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Discovery de Produto e UX</strong></p><p>Ação: Workshop com cliente (incorporadora + arquiteto): mapear ambientes personalizáveis, pacotes disponíveis, lógica de preço diferencial, restrições de combinação e fluxo de escolha do comprador. Marco prototipa fluxo no Figma.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Protótipo de UX aprovado no Figma</p><p>Prazo referência: Dia 1–5</p><p><strong>5.2. Modelagem 3D dos Ambientes</strong></p><p>Ação: Modelar cada ambiente personalizável com todos os materiais mapeados como camadas independentes (piso, parede, bancada); texturizar materiais PBR para realismo; otimizar para web.</p><p>Responsável: Dev 3D</p><p>Output: Modelos 3D otimizados para web, aprovados esteticamente</p><p>Prazo referência: Dia 6–18</p><p><strong>5.3. Desenvolvimento do Engine de Personalização</strong></p><p>Ação: Implementar visualizador 3D em Three.js com troca de materiais em tempo real; criar painel de seleção de pacotes; implementar lógica de preço cumulativo e validação de combinações inválidas.</p><p>Responsável: Dev 3D + Dev Frontend</p><p>Output: Engine de personalização funcional</p><p>Prazo referência: Dia 19–35</p><p><strong>5.4. Geração de PDF e Resumo de Escolhas</strong></p><p>Ação: Implementar módulo de exportação: capturar screenshot de cada ambiente personalizado; gerar PDF com resumo de escolhas (ambiente, material, código, preço por pacote, valor total diferencial); incluir assinatura digital ou código de confirmação.</p><p>Responsável: Dev Frontend</p><p>Output: PDF de escolhas gerado automaticamente</p><p>Prazo referência: Dia 33–38</p><p><strong>5.5. Testes com Usuários e Ajustes</strong></p><p>Ação: Realizar sessão de testes com 3–5 compradores reais ou corretores; observar pontos de confusão; ajustar UX, performance e fluxo de confirmação; teste de stress em diferentes dispositivos (desktop, tablet, mobile).</p><p>Responsável: Carol (Ops) + Marco</p><p>Output: Plataforma aprovada em testes com usuários</p><p>Prazo referência: Dia 39–43</p><p><strong>5.6. Entrega, Deploy e Treinamento</strong></p><p>Ação: Realizar deploy em ambiente de produção (Vercel ou servidor do cliente); configurar domínio; treinar equipe da incorporadora para gerenciar catálogo de materiais; entregar código-fonte e documentação técnica.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Plataforma no ar, equipe treinada, aceite formal assinado</p><p>Prazo referência: Dia 44–45</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Todos os pacotes de material com foto + código + preço corretos; [ ] Troca de material em tempo real sem travamento visível; [ ] PDF gerado com todas as escolhas e valor total; [ ] Plataforma funcional em desktop e tablet; [ ] Nenhuma combinação inválida permitida pelo sistema; [ ] Deploy testado no domínio de produção antes da entrega.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Catálogo de materiais incompleto no início → retrabalho de modelagem e dados. Performance lenta na web → frustração do comprador e abandono. PDF com dados errados → problema jurídico com a incorporadora. Combinações sem validação → comprador escolhe opção não disponível.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Three.js, React, Blender, Adobe Substance Painter, Figma, jsPDF, Puppeteer, Git, Vercel, Asana.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Protótipo UX: 5 dias. Plataforma funcional (alpha): 35 dias úteis. Entrega final: 45 dias úteis pós-início. Inclui: 2 rodadas de ajuste de UX e 1 sessão de treinamento.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Discovery UX → Protótipo Figma Aprovado → Modelagem 3D → Engine de Personalização → Geração de PDF → Alpha Interna → Testes com Usuários Reais → Ajustes → Deploy em Produção → Treinamento → Aceite Formal → Fim</p><p><strong>  10. Glossário</strong></p><p>PBR: Physically Based Rendering — sistema de texturização que simula comportamento real da luz sobre materiais. Engine: motor de renderização e lógica da aplicação. Deploy: publicação da aplicação em ambiente de produção acessível ao usuário final. Pacote de acabamento: conjunto pré-definido de materiais com preço diferencial.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['interativo','gamificacao','entrega','qualidade','cliente']::TEXT[],
    1,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-GAM-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Desenvolver plataforma web ou aplicação (WebGL/Three.js) que permite ao comprador personalizar acabamentos, móveis e materiais da sua unidade em tempo real, gerando PDF de escolhas para formalização com a incorporadora.', '<p>Desenvolver plataforma web ou aplicação (WebGL/Three.js) que permite ao comprador personalizar acabamentos, móveis e materiais da sua unidade em tempo real, gerando PDF de escolhas para formalização com a incorporadora.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Modelagem 3D dos ambientes personalizáveis, desenvolvimento da plataforma com múltiplos pacotes de acabamento, lógica de preço diferencial por pacote, geração de PDF/relatório de escolha, testes e entrega.', '<p>Modelagem 3D dos ambientes personalizáveis, desenvolvimento da plataforma com múltiplos pacotes de acabamento, lógica de preço diferencial por pacote, geração de PDF/relatório de escolha, testes e entrega.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Integração com ERP para pedido de compra automático (demanda de integração separada), personalização estrutural (mudança de paredes), aplicativo nativo iOS/Android (escopo desta entrega é web).', '<p>Integração com ERP para pedido de compra automático (demanda de integração separada), personalização estrutural (mudança de paredes), aplicativo nativo iOS/Android (escopo desta entrega é web).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção criativa, arquitetura da solução

Aprovador

—

Dev 3D / Frontend

Desenvolvimento da plataforma web

Executor

—

Arquiteto / Incorporadora

Definição de pacotes, materiais, preços e restrições

Consultado

Informado

Carol (Ops)

Cronograma, testes com usuários reais, entrega

Executor

—', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Direção criativa, arquitetura da solução</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Dev 3D / Frontend</p></td><td><p>Desenvolvimento da plataforma web</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Arquiteto / Incorporadora</p></td><td><p>Definição de pacotes, materiais, preços e restrições</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Cronograma, testes com usuários reais, entrega</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plantas dos ambientes personalizáveis (sala, cozinha, quartos); catálogo completo de materiais (piso, parede, bancada, louças) com fotos/renders e preços por pacote; identidade visual da incorporadora; briefing de UX (fluxo de personalização desejado pelo cliente).', '<p>Plantas dos ambientes personalizáveis (sala, cozinha, quartos); catálogo completo de materiais (piso, parede, bancada, louças) com fotos/renders e preços por pacote; identidade visual da incorporadora; briefing de UX (fluxo de personalização desejado pelo cliente).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Three.js + React (para plataforma web), Blender para modelagem de ambientes, Adobe Substance Painter para materiais PBR, Figma para protótipo UX, jsPDF ou Puppeteer para geração de PDF, Git, Asana.', '<p>Three.js + React (para plataforma web), Blender para modelagem de ambientes, Adobe Substance Painter para materiais PBR, Figma para protótipo UX, jsPDF ou Puppeteer para geração de PDF, Git, Asana.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Discovery de Produto e UX', 'Ação: Workshop com cliente (incorporadora + arquiteto): mapear ambientes personalizáveis, pacotes disponíveis, lógica de preço diferencial, restrições de combinação e fluxo de escolha do comprador. Marco prototipa fluxo no Figma.

Responsável: Marco Andolfato + Cliente

Output: Protótipo de UX aprovado no Figma

Prazo referência: Dia 1–5', '<p>Ação: Workshop com cliente (incorporadora + arquiteto): mapear ambientes personalizáveis, pacotes disponíveis, lógica de preço diferencial, restrições de combinação e fluxo de escolha do comprador. Marco prototipa fluxo no Figma.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Protótipo de UX aprovado no Figma</p><p>Prazo referência: Dia 1–5</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Modelagem 3D dos Ambientes', 'Ação: Modelar cada ambiente personalizável com todos os materiais mapeados como camadas independentes (piso, parede, bancada); texturizar materiais PBR para realismo; otimizar para web.

Responsável: Dev 3D

Output: Modelos 3D otimizados para web, aprovados esteticamente

Prazo referência: Dia 6–18', '<p>Ação: Modelar cada ambiente personalizável com todos os materiais mapeados como camadas independentes (piso, parede, bancada); texturizar materiais PBR para realismo; otimizar para web.</p><p>Responsável: Dev 3D</p><p>Output: Modelos 3D otimizados para web, aprovados esteticamente</p><p>Prazo referência: Dia 6–18</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Desenvolvimento do Engine de Personalização', 'Ação: Implementar visualizador 3D em Three.js com troca de materiais em tempo real; criar painel de seleção de pacotes; implementar lógica de preço cumulativo e validação de combinações inválidas.

Responsável: Dev 3D + Dev Frontend

Output: Engine de personalização funcional

Prazo referência: Dia 19–35', '<p>Ação: Implementar visualizador 3D em Three.js com troca de materiais em tempo real; criar painel de seleção de pacotes; implementar lógica de preço cumulativo e validação de combinações inválidas.</p><p>Responsável: Dev 3D + Dev Frontend</p><p>Output: Engine de personalização funcional</p><p>Prazo referência: Dia 19–35</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Geração de PDF e Resumo de Escolhas', 'Ação: Implementar módulo de exportação: capturar screenshot de cada ambiente personalizado; gerar PDF com resumo de escolhas (ambiente, material, código, preço por pacote, valor total diferencial); incluir assinatura digital ou código de confirmação.

Responsável: Dev Frontend

Output: PDF de escolhas gerado automaticamente

Prazo referência: Dia 33–38', '<p>Ação: Implementar módulo de exportação: capturar screenshot de cada ambiente personalizado; gerar PDF com resumo de escolhas (ambiente, material, código, preço por pacote, valor total diferencial); incluir assinatura digital ou código de confirmação.</p><p>Responsável: Dev Frontend</p><p>Output: PDF de escolhas gerado automaticamente</p><p>Prazo referência: Dia 33–38</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Testes com Usuários e Ajustes', 'Ação: Realizar sessão de testes com 3–5 compradores reais ou corretores; observar pontos de confusão; ajustar UX, performance e fluxo de confirmação; teste de stress em diferentes dispositivos (desktop, tablet, mobile).

Responsável: Carol (Ops) + Marco

Output: Plataforma aprovada em testes com usuários

Prazo referência: Dia 39–43', '<p>Ação: Realizar sessão de testes com 3–5 compradores reais ou corretores; observar pontos de confusão; ajustar UX, performance e fluxo de confirmação; teste de stress em diferentes dispositivos (desktop, tablet, mobile).</p><p>Responsável: Carol (Ops) + Marco</p><p>Output: Plataforma aprovada em testes com usuários</p><p>Prazo referência: Dia 39–43</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Entrega, Deploy e Treinamento', 'Ação: Realizar deploy em ambiente de produção (Vercel ou servidor do cliente); configurar domínio; treinar equipe da incorporadora para gerenciar catálogo de materiais; entregar código-fonte e documentação técnica.

Responsável: Marco Andolfato + Carol (Ops)

Output: Plataforma no ar, equipe treinada, aceite formal assinado

Prazo referência: Dia 44–45', '<p>Ação: Realizar deploy em ambiente de produção (Vercel ou servidor do cliente); configurar domínio; treinar equipe da incorporadora para gerenciar catálogo de materiais; entregar código-fonte e documentação técnica.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Plataforma no ar, equipe treinada, aceite formal assinado</p><p>Prazo referência: Dia 44–45</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todos os pacotes de material com foto + código + preço corretos; [ ] Troca de material em tempo real sem travamento visível; [ ] PDF gerado com todas as escolhas e valor total; [ ] Plataforma funcional em desktop e tablet; [ ] Nenhuma combinação inválida permitida pelo sistema; [ ] Deploy testado no domínio de produção antes da entrega.', '<p>[ ] Todos os pacotes de material com foto + código + preço corretos; [ ] Troca de material em tempo real sem travamento visível; [ ] PDF gerado com todas as escolhas e valor total; [ ] Plataforma funcional em desktop e tablet; [ ] Nenhuma combinação inválida permitida pelo sistema; [ ] Deploy testado no domínio de produção antes da entrega.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Catálogo de materiais incompleto no início → retrabalho de modelagem e dados. Performance lenta na web → frustração do comprador e abandono. PDF com dados errados → problema jurídico com a incorporadora. Combinações sem validação → comprador escolhe opção não disponível.', '<p>Catálogo de materiais incompleto no início → retrabalho de modelagem e dados. Performance lenta na web → frustração do comprador e abandono. PDF com dados errados → problema jurídico com a incorporadora. Combinações sem validação → comprador escolhe opção não disponível.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Three.js, React, Blender, Adobe Substance Painter, Figma, jsPDF, Puppeteer, Git, Vercel, Asana.', '<p>Three.js, React, Blender, Adobe Substance Painter, Figma, jsPDF, Puppeteer, Git, Vercel, Asana.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Protótipo UX: 5 dias. Plataforma funcional (alpha): 35 dias úteis. Entrega final: 45 dias úteis pós-início. Inclui: 2 rodadas de ajuste de UX e 1 sessão de treinamento.', '<p>Protótipo UX: 5 dias. Plataforma funcional (alpha): 35 dias úteis. Entrega final: 45 dias úteis pós-início. Inclui: 2 rodadas de ajuste de UX e 1 sessão de treinamento.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Discovery UX → Protótipo Figma Aprovado → Modelagem 3D → Engine de Personalização → Geração de PDF → Alpha Interna → Testes com Usuários Reais → Ajustes → Deploy em Produção → Treinamento → Aceite Formal → Fim', '<p>Início → Discovery UX → Protótipo Figma Aprovado → Modelagem 3D → Engine de Personalização → Geração de PDF → Alpha Interna → Testes com Usuários Reais → Ajustes → Deploy em Produção → Treinamento → Aceite Formal → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'PBR: Physically Based Rendering — sistema de texturização que simula comportamento real da luz sobre materiais. Engine: motor de renderização e lógica da aplicação. Deploy: publicação da aplicação em ambiente de produção acessível ao usuário final. Pacote de acabamento: conjunto pré-definido de materiais com preço diferencial.', '<p>PBR: Physically Based Rendering — sistema de texturização que simula comportamento real da luz sobre materiais. Engine: motor de renderização e lógica da aplicação. Deploy: publicação da aplicação em ambiente de produção acessível ao usuário final. Pacote de acabamento: conjunto pré-definido de materiais com preço diferencial.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-OPS-001: Onboarding de Novo Colaborador ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Onboarding de Novo Colaborador',
    'tbo-ops-001-onboarding-de-novo-colaborador',
    'operacoes',
    'checklist',
    'Carol (Coordenadora de Operações)',
    'Standard Operating Procedure

Onboarding de Novo Colaborador

Código

TBO-OPS-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Operações

Responsável

Carol (Coordenadora de Operações)

Aprovador

Marco Andolfato



  1. Objetivo

Garantir que todo novo colaborador da TBO seja integrado de forma estruturada nos primeiros 30 dias, compreendendo cultura, ferramentas, processos e responsabilidades antes de assumir projetos de forma independente.

  2. Escopo

2.1 O que está coberto

Processo de integração do momento da contratação até o fim do período de onboarding (30 dias), cobrindo cultura TBO, stack de ferramentas, acompanhamento por mentor e avaliação de conclusão.

2.2 Exclusões

Processo seletivo e contratação (pré-onboarding), treinamentos técnicos específicos de BU (responsabilidade de cada líder de área), férias e benefícios (RH).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar todo o processo de onboarding, materiais e agenda

Executor

—

Marco Andolfato

Apresentar cultura, valores TBO e missão estratégica

Aprovador

—

Líder de BU

Mentor técnico do novo colaborador

Executor

—

Novo Colaborador

Participar ativamente, completar checklist, tirar dúvidas

Executor

—

  4. Pré-requisitos

4.1 Inputs necessários

Contrato assinado; e-mail corporativo criado; acesso ao Google Workspace, Asana e Supabase configurado; kit de boas-vindas preparado; agenda dos primeiros 5 dias montada.

4.2 Ferramentas e Acessos

Google Workspace (Drive, Agenda, Meet), Asana, Supabase (acesso por role), Slack (ou WhatsApp corporativo), plataforma de documentação interna.



  5. Procedimento Passo a Passo

5.1. Preparação Pré-chegada (D-2)

Ação: Carol configura acessos (e-mail, Asana, Drive, Supabase com role correto); prepara pasta de onboarding no Drive com: contrato de trabalho, guia de cultura, organograma, lista de ferramentas e credenciais; agenda reunião de boas-vindas com Marco.

Responsável: Carol (Ops)

Output: Acessos configurados, pasta Drive pronta, agenda bloqueada

Prazo referência: 2 dias antes da entrada

5.2. Dia 1 — Boas-vindas e Cultura

Ação: Marco apresenta a TBO: história, missão ''think, build, own'', valores, clientes atuais, posicionamento no mercado imobiliário e o que diferencia a agência. Tour pelo espaço (presencial ou virtual). Carol apresenta equipe e ferramentas.

Responsável: Marco Andolfato + Carol (Ops)

Output: Colaborador ambientado culturalmente

Prazo referência: Dia 1

5.3. Semana 1 — Ferramentas e Processos

Ação: Líder de BU conduz treinamento de ferramentas da área (Premiere, Unreal, Asana etc.); Carol orienta sobre processos operacionais: abertura de projeto, comunicação com cliente, registro de horas, gestão de arquivos no Drive.

Responsável: Líder de BU + Carol (Ops)

Output: Checklist de ferramentas concluído

Prazo referência: Dia 2–5

5.4. Semana 2–3 — Imersão em Projeto Real

Ação: Novo colaborador participa de projeto real em andamento como observador/apoio (não responsável); líder de BU realiza daily check-in de 15min; Carol acompanha registro no Asana.

Responsável: Líder de BU + Novo Colaborador

Output: Participação documentada em projeto real

Prazo referência: Dia 6–15

5.5. Semana 4 — Avaliação e Feedback

Ação: Carol e líder de BU realizam avaliação formal: checklist de competências esperadas, feedback 360° (Marco incluso), alinhamento de expectativas para o período pós-onboarding; registrar no Supabase.

Responsável: Carol (Ops) + Líder de BU + Marco

Output: Avaliação registrada, plano de desenvolvimento definido

Prazo referência: Dia 25–30

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Todos os acessos configurados antes do Dia 1; [ ] Agenda da primeira semana montada e enviada ao colaborador; [ ] Guia de cultura entregue e discutido; [ ] Checklist de ferramentas 100% concluído; [ ] Avaliação de 30 dias realizada e registrada no sistema.

6.2 Erros Comuns a Evitar

Colaborador sem acesso às ferramentas no Dia 1 → primeira impressão negativa e improdutividade. Onboarding apenas informal → não internaliza processos, gera retrabalho futuro. Sem mentor definido → colaborador perdido nas primeiras semanas.

  7. Ferramentas e Templates

Google Workspace, Asana, Supabase, Slack/WhatsApp corporativo, documentação interna.

  8. SLAs e Prazos

Configuração de acessos: 2 dias antes da entrada. Avaliação formal: até 30 dias após início. Duração total do onboarding: 30 dias corridos.

  9. Fluxograma

Início → Preparação D-2 (acessos + pasta Drive) → Dia 1 (boas-vindas + cultura) → Semana 1 (ferramentas + processos) → Semanas 2–3 (imersão em projeto real) → Semana 4 (avaliação + feedback) → Onboarding Concluído → Fim

  10. Glossário

Role: permissão de acesso no sistema (ex.: colaborador, diretoria, founder). Checklist de ferramentas: lista de ferramentas que o colaborador deve dominar ao fim do onboarding. 360°: feedback dado por pares, líderes e liderados simultaneamente.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Onboarding de Novo Colaborador</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-OPS-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Operações</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Garantir que todo novo colaborador da TBO seja integrado de forma estruturada nos primeiros 30 dias, compreendendo cultura, ferramentas, processos e responsabilidades antes de assumir projetos de forma independente.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Processo de integração do momento da contratação até o fim do período de onboarding (30 dias), cobrindo cultura TBO, stack de ferramentas, acompanhamento por mentor e avaliação de conclusão.</p><p><strong>2.2 Exclusões</strong></p><p>Processo seletivo e contratação (pré-onboarding), treinamentos técnicos específicos de BU (responsabilidade de cada líder de área), férias e benefícios (RH).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coordenar todo o processo de onboarding, materiais e agenda</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Apresentar cultura, valores TBO e missão estratégica</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Líder de BU</p></td><td><p>Mentor técnico do novo colaborador</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Novo Colaborador</p></td><td><p>Participar ativamente, completar checklist, tirar dúvidas</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contrato assinado; e-mail corporativo criado; acesso ao Google Workspace, Asana e Supabase configurado; kit de boas-vindas preparado; agenda dos primeiros 5 dias montada.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Workspace (Drive, Agenda, Meet), Asana, Supabase (acesso por role), Slack (ou WhatsApp corporativo), plataforma de documentação interna.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Preparação Pré-chegada (D-2)</strong></p><p>Ação: Carol configura acessos (e-mail, Asana, Drive, Supabase com role correto); prepara pasta de onboarding no Drive com: contrato de trabalho, guia de cultura, organograma, lista de ferramentas e credenciais; agenda reunião de boas-vindas com Marco.</p><p>Responsável: Carol (Ops)</p><p>Output: Acessos configurados, pasta Drive pronta, agenda bloqueada</p><p>Prazo referência: 2 dias antes da entrada</p><p><strong>5.2. Dia 1 — Boas-vindas e Cultura</strong></p><p>Ação: Marco apresenta a TBO: história, missão ''think, build, own'', valores, clientes atuais, posicionamento no mercado imobiliário e o que diferencia a agência. Tour pelo espaço (presencial ou virtual). Carol apresenta equipe e ferramentas.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Colaborador ambientado culturalmente</p><p>Prazo referência: Dia 1</p><p><strong>5.3. Semana 1 — Ferramentas e Processos</strong></p><p>Ação: Líder de BU conduz treinamento de ferramentas da área (Premiere, Unreal, Asana etc.); Carol orienta sobre processos operacionais: abertura de projeto, comunicação com cliente, registro de horas, gestão de arquivos no Drive.</p><p>Responsável: Líder de BU + Carol (Ops)</p><p>Output: Checklist de ferramentas concluído</p><p>Prazo referência: Dia 2–5</p><p><strong>5.4. Semana 2–3 — Imersão em Projeto Real</strong></p><p>Ação: Novo colaborador participa de projeto real em andamento como observador/apoio (não responsável); líder de BU realiza daily check-in de 15min; Carol acompanha registro no Asana.</p><p>Responsável: Líder de BU + Novo Colaborador</p><p>Output: Participação documentada em projeto real</p><p>Prazo referência: Dia 6–15</p><p><strong>5.5. Semana 4 — Avaliação e Feedback</strong></p><p>Ação: Carol e líder de BU realizam avaliação formal: checklist de competências esperadas, feedback 360° (Marco incluso), alinhamento de expectativas para o período pós-onboarding; registrar no Supabase.</p><p>Responsável: Carol (Ops) + Líder de BU + Marco</p><p>Output: Avaliação registrada, plano de desenvolvimento definido</p><p>Prazo referência: Dia 25–30</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Todos os acessos configurados antes do Dia 1; [ ] Agenda da primeira semana montada e enviada ao colaborador; [ ] Guia de cultura entregue e discutido; [ ] Checklist de ferramentas 100% concluído; [ ] Avaliação de 30 dias realizada e registrada no sistema.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Colaborador sem acesso às ferramentas no Dia 1 → primeira impressão negativa e improdutividade. Onboarding apenas informal → não internaliza processos, gera retrabalho futuro. Sem mentor definido → colaborador perdido nas primeiras semanas.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Workspace, Asana, Supabase, Slack/WhatsApp corporativo, documentação interna.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Configuração de acessos: 2 dias antes da entrada. Avaliação formal: até 30 dias após início. Duração total do onboarding: 30 dias corridos.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Preparação D-2 (acessos + pasta Drive) → Dia 1 (boas-vindas + cultura) → Semana 1 (ferramentas + processos) → Semanas 2–3 (imersão em projeto real) → Semana 4 (avaliação + feedback) → Onboarding Concluído → Fim</p><p><strong>  10. Glossário</strong></p><p>Role: permissão de acesso no sistema (ex.: colaborador, diretoria, founder). Checklist de ferramentas: lista de ferramentas que o colaborador deve dominar ao fim do onboarding. 360°: feedback dado por pares, líderes e liderados simultaneamente.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['operacoes','processo','gestao','entrega','qualidade','cliente']::TEXT[],
    0,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-OPS-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que todo novo colaborador da TBO seja integrado de forma estruturada nos primeiros 30 dias, compreendendo cultura, ferramentas, processos e responsabilidades antes de assumir projetos de forma independente.', '<p>Garantir que todo novo colaborador da TBO seja integrado de forma estruturada nos primeiros 30 dias, compreendendo cultura, ferramentas, processos e responsabilidades antes de assumir projetos de forma independente.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Processo de integração do momento da contratação até o fim do período de onboarding (30 dias), cobrindo cultura TBO, stack de ferramentas, acompanhamento por mentor e avaliação de conclusão.', '<p>Processo de integração do momento da contratação até o fim do período de onboarding (30 dias), cobrindo cultura TBO, stack de ferramentas, acompanhamento por mentor e avaliação de conclusão.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Processo seletivo e contratação (pré-onboarding), treinamentos técnicos específicos de BU (responsabilidade de cada líder de área), férias e benefícios (RH).', '<p>Processo seletivo e contratação (pré-onboarding), treinamentos técnicos específicos de BU (responsabilidade de cada líder de área), férias e benefícios (RH).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar todo o processo de onboarding, materiais e agenda

Executor

—

Marco Andolfato

Apresentar cultura, valores TBO e missão estratégica

Aprovador

—

Líder de BU

Mentor técnico do novo colaborador

Executor

—

Novo Colaborador

Participar ativamente, completar checklist, tirar dúvidas

Executor

—', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coordenar todo o processo de onboarding, materiais e agenda</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Apresentar cultura, valores TBO e missão estratégica</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Líder de BU</p></td><td><p>Mentor técnico do novo colaborador</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Novo Colaborador</p></td><td><p>Participar ativamente, completar checklist, tirar dúvidas</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado; e-mail corporativo criado; acesso ao Google Workspace, Asana e Supabase configurado; kit de boas-vindas preparado; agenda dos primeiros 5 dias montada.', '<p>Contrato assinado; e-mail corporativo criado; acesso ao Google Workspace, Asana e Supabase configurado; kit de boas-vindas preparado; agenda dos primeiros 5 dias montada.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Workspace (Drive, Agenda, Meet), Asana, Supabase (acesso por role), Slack (ou WhatsApp corporativo), plataforma de documentação interna.', '<p>Google Workspace (Drive, Agenda, Meet), Asana, Supabase (acesso por role), Slack (ou WhatsApp corporativo), plataforma de documentação interna.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Preparação Pré-chegada (D-2)', 'Ação: Carol configura acessos (e-mail, Asana, Drive, Supabase com role correto); prepara pasta de onboarding no Drive com: contrato de trabalho, guia de cultura, organograma, lista de ferramentas e credenciais; agenda reunião de boas-vindas com Marco.

Responsável: Carol (Ops)

Output: Acessos configurados, pasta Drive pronta, agenda bloqueada

Prazo referência: 2 dias antes da entrada', '<p>Ação: Carol configura acessos (e-mail, Asana, Drive, Supabase com role correto); prepara pasta de onboarding no Drive com: contrato de trabalho, guia de cultura, organograma, lista de ferramentas e credenciais; agenda reunião de boas-vindas com Marco.</p><p>Responsável: Carol (Ops)</p><p>Output: Acessos configurados, pasta Drive pronta, agenda bloqueada</p><p>Prazo referência: 2 dias antes da entrada</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Dia 1 — Boas-vindas e Cultura', 'Ação: Marco apresenta a TBO: história, missão ''think, build, own'', valores, clientes atuais, posicionamento no mercado imobiliário e o que diferencia a agência. Tour pelo espaço (presencial ou virtual). Carol apresenta equipe e ferramentas.

Responsável: Marco Andolfato + Carol (Ops)

Output: Colaborador ambientado culturalmente

Prazo referência: Dia 1', '<p>Ação: Marco apresenta a TBO: história, missão ''think, build, own'', valores, clientes atuais, posicionamento no mercado imobiliário e o que diferencia a agência. Tour pelo espaço (presencial ou virtual). Carol apresenta equipe e ferramentas.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Colaborador ambientado culturalmente</p><p>Prazo referência: Dia 1</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Semana 1 — Ferramentas e Processos', 'Ação: Líder de BU conduz treinamento de ferramentas da área (Premiere, Unreal, Asana etc.); Carol orienta sobre processos operacionais: abertura de projeto, comunicação com cliente, registro de horas, gestão de arquivos no Drive.

Responsável: Líder de BU + Carol (Ops)

Output: Checklist de ferramentas concluído

Prazo referência: Dia 2–5', '<p>Ação: Líder de BU conduz treinamento de ferramentas da área (Premiere, Unreal, Asana etc.); Carol orienta sobre processos operacionais: abertura de projeto, comunicação com cliente, registro de horas, gestão de arquivos no Drive.</p><p>Responsável: Líder de BU + Carol (Ops)</p><p>Output: Checklist de ferramentas concluído</p><p>Prazo referência: Dia 2–5</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Semana 2–3 — Imersão em Projeto Real', 'Ação: Novo colaborador participa de projeto real em andamento como observador/apoio (não responsável); líder de BU realiza daily check-in de 15min; Carol acompanha registro no Asana.

Responsável: Líder de BU + Novo Colaborador

Output: Participação documentada em projeto real

Prazo referência: Dia 6–15', '<p>Ação: Novo colaborador participa de projeto real em andamento como observador/apoio (não responsável); líder de BU realiza daily check-in de 15min; Carol acompanha registro no Asana.</p><p>Responsável: Líder de BU + Novo Colaborador</p><p>Output: Participação documentada em projeto real</p><p>Prazo referência: Dia 6–15</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Semana 4 — Avaliação e Feedback', 'Ação: Carol e líder de BU realizam avaliação formal: checklist de competências esperadas, feedback 360° (Marco incluso), alinhamento de expectativas para o período pós-onboarding; registrar no Supabase.

Responsável: Carol (Ops) + Líder de BU + Marco

Output: Avaliação registrada, plano de desenvolvimento definido

Prazo referência: Dia 25–30', '<p>Ação: Carol e líder de BU realizam avaliação formal: checklist de competências esperadas, feedback 360° (Marco incluso), alinhamento de expectativas para o período pós-onboarding; registrar no Supabase.</p><p>Responsável: Carol (Ops) + Líder de BU + Marco</p><p>Output: Avaliação registrada, plano de desenvolvimento definido</p><p>Prazo referência: Dia 25–30</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todos os acessos configurados antes do Dia 1; [ ] Agenda da primeira semana montada e enviada ao colaborador; [ ] Guia de cultura entregue e discutido; [ ] Checklist de ferramentas 100% concluído; [ ] Avaliação de 30 dias realizada e registrada no sistema.', '<p>[ ] Todos os acessos configurados antes do Dia 1; [ ] Agenda da primeira semana montada e enviada ao colaborador; [ ] Guia de cultura entregue e discutido; [ ] Checklist de ferramentas 100% concluído; [ ] Avaliação de 30 dias realizada e registrada no sistema.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Colaborador sem acesso às ferramentas no Dia 1 → primeira impressão negativa e improdutividade. Onboarding apenas informal → não internaliza processos, gera retrabalho futuro. Sem mentor definido → colaborador perdido nas primeiras semanas.', '<p>Colaborador sem acesso às ferramentas no Dia 1 → primeira impressão negativa e improdutividade. Onboarding apenas informal → não internaliza processos, gera retrabalho futuro. Sem mentor definido → colaborador perdido nas primeiras semanas.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Workspace, Asana, Supabase, Slack/WhatsApp corporativo, documentação interna.', '<p>Google Workspace, Asana, Supabase, Slack/WhatsApp corporativo, documentação interna.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Configuração de acessos: 2 dias antes da entrada. Avaliação formal: até 30 dias após início. Duração total do onboarding: 30 dias corridos.', '<p>Configuração de acessos: 2 dias antes da entrada. Avaliação formal: até 30 dias após início. Duração total do onboarding: 30 dias corridos.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Preparação D-2 (acessos + pasta Drive) → Dia 1 (boas-vindas + cultura) → Semana 1 (ferramentas + processos) → Semanas 2–3 (imersão em projeto real) → Semana 4 (avaliação + feedback) → Onboarding Concluído → Fim', '<p>Início → Preparação D-2 (acessos + pasta Drive) → Dia 1 (boas-vindas + cultura) → Semana 1 (ferramentas + processos) → Semanas 2–3 (imersão em projeto real) → Semana 4 (avaliação + feedback) → Onboarding Concluído → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Role: permissão de acesso no sistema (ex.: colaborador, diretoria, founder). Checklist de ferramentas: lista de ferramentas que o colaborador deve dominar ao fim do onboarding. 360°: feedback dado por pares, líderes e liderados simultaneamente.', '<p>Role: permissão de acesso no sistema (ex.: colaborador, diretoria, founder). Checklist de ferramentas: lista de ferramentas que o colaborador deve dominar ao fim do onboarding. 360°: feedback dado por pares, líderes e liderados simultaneamente.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-OPS-002: Onboarding de Novo Cliente ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Onboarding de Novo Cliente',
    'tbo-ops-002-onboarding-de-novo-cliente',
    'operacoes',
    'checklist',
    'Carol (Coordenadora de Operações)',
    'Standard Operating Procedure

Onboarding de Novo Cliente

Código

TBO-OPS-002

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Operações

Responsável

Carol (Coordenadora de Operações)

Aprovador

Marco Andolfato



  1. Objetivo

Estruturar a entrada de um novo cliente na TBO de forma organizada e profissional, garantindo alinhamento de expectativas, configuração de canais de comunicação, acesso a plataformas e kick-off do primeiro projeto contratado.

  2. Escopo

2.1 O que está coberto

Do momento da assinatura do contrato até o início do primeiro projeto: configuração de pasta no Drive, cadastro no Asana, apresentação da equipe, reunião de alinhamento e entrega do guia do cliente.

2.2 Exclusões

Processo comercial e negociação (pré-contrato), execução dos projetos em si (cobertos pelos SOPs de cada BU).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar todo o processo, configurar plataformas, conduzir reuniões

Executor

—

Marco Andolfato

Apresentar TBO, validar estratégia inicial, relação de confiança

Consultado

Informado

Líder de BU responsável

Apresentar equipe técnica e metodologia

Executor

—

Cliente

Participar das reuniões, fornecer materiais e acessos solicitados

Consultado

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Contrato assinado; proposta comercial aprovada; contato principal do cliente (nome, e-mail, WhatsApp); escopo inicial dos projetos contratados.

4.2 Ferramentas e Acessos

Google Drive (estrutura de pastas padrão TBO), Asana (projeto criado por template), WhatsApp Business, Google Meet, planilha de controle de projetos.



  5. Procedimento Passo a Passo

5.1. Configuração de Infraestrutura do Cliente

Ação: Carol cria pasta padrão no Google Drive (/_clientes/NOME_CLIENTE com subpastas: /briefings, /aprovações, /entregas, /financeiro); cria projeto no Asana a partir do template TBO; adiciona cliente como colaborador externo nas plataformas pertinentes.

Responsável: Carol (Ops)

Output: Infraestrutura de projeto configurada

Prazo referência: Dia 1 (após contrato assinado)

5.2. Envio do Guia do Cliente

Ação: Carol envia e-mail de boas-vindas com: guia do cliente TBO (como trabalhamos, prazos, canais de comunicação, processo de aprovação, política de revisões), agenda da reunião de kick-off e link do Asana.

Responsável: Carol (Ops)

Output: E-mail de boas-vindas enviado

Prazo referência: Dia 1

5.3. Reunião de Apresentação da Equipe

Ação: Marco e líder de BU se apresentam ao cliente; apresentar estrutura da agência, cases relevantes para o segmento, equipe que atenderá a conta; alinhamento de canais de comunicação preferenciais e cadência de reuniões.

Responsável: Marco Andolfato + Carol (Ops)

Output: Equipe e processos apresentados ao cliente

Prazo referência: Dia 2–3

5.4. Coleta de Assets e Materiais

Ação: Carol envia checklist de materiais necessários para início dos projetos (logo em vetor, brandbook, fotos/renders, plantas, textos institucionais, credenciais de plataformas se houver); monitorar recebimento via Drive.

Responsável: Carol (Ops)

Output: Checklist de assets enviado e controlado

Prazo referência: Dia 2–5

5.5. Kick-off do Primeiro Projeto

Ação: Executar SOP OPS-03 (Briefing e Kick-off de Projeto) para o primeiro projeto; registrar todas as decisões no Asana; confirmar prazo de entrega e responsáveis; iniciar produção.

Responsável: Carol (Ops) + Líder de BU

Output: Primeiro projeto em andamento no Asana

Prazo referência: Dia 5–7

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Pasta no Drive criada com estrutura padrão; [ ] Asana configurado com projeto e responsáveis; [ ] Guia do cliente enviado no Dia 1; [ ] Reunião de apresentação realizada; [ ] Checklist de assets enviado ao cliente; [ ] Primeiro projeto com data de início registrada.

6.2 Erros Comuns a Evitar

Início de projeto sem folder de cliente → arquivos perdidos em pastas genéricas. Cliente sem guia de processo → expectativas desalinhadas, conflitos futuros. Assets não coletados antes do kick-off → project delay imediato.

  7. Ferramentas e Templates

Google Drive, Asana, Google Meet, WhatsApp Business, Gmail.

  8. SLAs e Prazos

Configuração de infraestrutura: Dia 1 após contrato. Guia do cliente: Dia 1. Reunião de apresentação: até 3 dias úteis. Kick-off do primeiro projeto: até 7 dias úteis.

  9. Fluxograma

Início (contrato assinado) → Configuração Drive + Asana → E-mail de Boas-vindas + Guia → Reunião de Apresentação → Coleta de Assets → Kick-off Primeiro Projeto → Cliente Ativo → Fim

  10. Glossário

Onboarding de cliente: processo estruturado de entrada de um novo cliente na agência. Guia do cliente: documento que explica como a TBO trabalha, prazos e processos. Cadência: frequência definida de reuniões de acompanhamento.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Onboarding de Novo Cliente</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-OPS-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Operações</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Estruturar a entrada de um novo cliente na TBO de forma organizada e profissional, garantindo alinhamento de expectativas, configuração de canais de comunicação, acesso a plataformas e kick-off do primeiro projeto contratado.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Do momento da assinatura do contrato até o início do primeiro projeto: configuração de pasta no Drive, cadastro no Asana, apresentação da equipe, reunião de alinhamento e entrega do guia do cliente.</p><p><strong>2.2 Exclusões</strong></p><p>Processo comercial e negociação (pré-contrato), execução dos projetos em si (cobertos pelos SOPs de cada BU).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coordenar todo o processo, configurar plataformas, conduzir reuniões</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Apresentar TBO, validar estratégia inicial, relação de confiança</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Líder de BU responsável</p></td><td><p>Apresentar equipe técnica e metodologia</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente</p></td><td><p>Participar das reuniões, fornecer materiais e acessos solicitados</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contrato assinado; proposta comercial aprovada; contato principal do cliente (nome, e-mail, WhatsApp); escopo inicial dos projetos contratados.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Drive (estrutura de pastas padrão TBO), Asana (projeto criado por template), WhatsApp Business, Google Meet, planilha de controle de projetos.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Configuração de Infraestrutura do Cliente</strong></p><p>Ação: Carol cria pasta padrão no Google Drive (/_clientes/NOME_CLIENTE com subpastas: /briefings, /aprovações, /entregas, /financeiro); cria projeto no Asana a partir do template TBO; adiciona cliente como colaborador externo nas plataformas pertinentes.</p><p>Responsável: Carol (Ops)</p><p>Output: Infraestrutura de projeto configurada</p><p>Prazo referência: Dia 1 (após contrato assinado)</p><p><strong>5.2. Envio do Guia do Cliente</strong></p><p>Ação: Carol envia e-mail de boas-vindas com: guia do cliente TBO (como trabalhamos, prazos, canais de comunicação, processo de aprovação, política de revisões), agenda da reunião de kick-off e link do Asana.</p><p>Responsável: Carol (Ops)</p><p>Output: E-mail de boas-vindas enviado</p><p>Prazo referência: Dia 1</p><p><strong>5.3. Reunião de Apresentação da Equipe</strong></p><p>Ação: Marco e líder de BU se apresentam ao cliente; apresentar estrutura da agência, cases relevantes para o segmento, equipe que atenderá a conta; alinhamento de canais de comunicação preferenciais e cadência de reuniões.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Equipe e processos apresentados ao cliente</p><p>Prazo referência: Dia 2–3</p><p><strong>5.4. Coleta de Assets e Materiais</strong></p><p>Ação: Carol envia checklist de materiais necessários para início dos projetos (logo em vetor, brandbook, fotos/renders, plantas, textos institucionais, credenciais de plataformas se houver); monitorar recebimento via Drive.</p><p>Responsável: Carol (Ops)</p><p>Output: Checklist de assets enviado e controlado</p><p>Prazo referência: Dia 2–5</p><p><strong>5.5. Kick-off do Primeiro Projeto</strong></p><p>Ação: Executar SOP OPS-03 (Briefing e Kick-off de Projeto) para o primeiro projeto; registrar todas as decisões no Asana; confirmar prazo de entrega e responsáveis; iniciar produção.</p><p>Responsável: Carol (Ops) + Líder de BU</p><p>Output: Primeiro projeto em andamento no Asana</p><p>Prazo referência: Dia 5–7</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Pasta no Drive criada com estrutura padrão; [ ] Asana configurado com projeto e responsáveis; [ ] Guia do cliente enviado no Dia 1; [ ] Reunião de apresentação realizada; [ ] Checklist de assets enviado ao cliente; [ ] Primeiro projeto com data de início registrada.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Início de projeto sem folder de cliente → arquivos perdidos em pastas genéricas. Cliente sem guia de processo → expectativas desalinhadas, conflitos futuros. Assets não coletados antes do kick-off → project delay imediato.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Drive, Asana, Google Meet, WhatsApp Business, Gmail.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Configuração de infraestrutura: Dia 1 após contrato. Guia do cliente: Dia 1. Reunião de apresentação: até 3 dias úteis. Kick-off do primeiro projeto: até 7 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início (contrato assinado) → Configuração Drive + Asana → E-mail de Boas-vindas + Guia → Reunião de Apresentação → Coleta de Assets → Kick-off Primeiro Projeto → Cliente Ativo → Fim</p><p><strong>  10. Glossário</strong></p><p>Onboarding de cliente: processo estruturado de entrada de um novo cliente na agência. Guia do cliente: documento que explica como a TBO trabalha, prazos e processos. Cadência: frequência definida de reuniões de acompanhamento.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['operacoes','processo','gestao','entrega','qualidade','cliente']::TEXT[],
    1,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-OPS-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Estruturar a entrada de um novo cliente na TBO de forma organizada e profissional, garantindo alinhamento de expectativas, configuração de canais de comunicação, acesso a plataformas e kick-off do primeiro projeto contratado.', '<p>Estruturar a entrada de um novo cliente na TBO de forma organizada e profissional, garantindo alinhamento de expectativas, configuração de canais de comunicação, acesso a plataformas e kick-off do primeiro projeto contratado.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Do momento da assinatura do contrato até o início do primeiro projeto: configuração de pasta no Drive, cadastro no Asana, apresentação da equipe, reunião de alinhamento e entrega do guia do cliente.', '<p>Do momento da assinatura do contrato até o início do primeiro projeto: configuração de pasta no Drive, cadastro no Asana, apresentação da equipe, reunião de alinhamento e entrega do guia do cliente.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Processo comercial e negociação (pré-contrato), execução dos projetos em si (cobertos pelos SOPs de cada BU).', '<p>Processo comercial e negociação (pré-contrato), execução dos projetos em si (cobertos pelos SOPs de cada BU).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar todo o processo, configurar plataformas, conduzir reuniões

Executor

—

Marco Andolfato

Apresentar TBO, validar estratégia inicial, relação de confiança

Consultado

Informado

Líder de BU responsável

Apresentar equipe técnica e metodologia

Executor

—

Cliente

Participar das reuniões, fornecer materiais e acessos solicitados

Consultado

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coordenar todo o processo, configurar plataformas, conduzir reuniões</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Apresentar TBO, validar estratégia inicial, relação de confiança</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Líder de BU responsável</p></td><td><p>Apresentar equipe técnica e metodologia</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente</p></td><td><p>Participar das reuniões, fornecer materiais e acessos solicitados</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado; proposta comercial aprovada; contato principal do cliente (nome, e-mail, WhatsApp); escopo inicial dos projetos contratados.', '<p>Contrato assinado; proposta comercial aprovada; contato principal do cliente (nome, e-mail, WhatsApp); escopo inicial dos projetos contratados.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Drive (estrutura de pastas padrão TBO), Asana (projeto criado por template), WhatsApp Business, Google Meet, planilha de controle de projetos.', '<p>Google Drive (estrutura de pastas padrão TBO), Asana (projeto criado por template), WhatsApp Business, Google Meet, planilha de controle de projetos.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Configuração de Infraestrutura do Cliente', 'Ação: Carol cria pasta padrão no Google Drive (/_clientes/NOME_CLIENTE com subpastas: /briefings, /aprovações, /entregas, /financeiro); cria projeto no Asana a partir do template TBO; adiciona cliente como colaborador externo nas plataformas pertinentes.

Responsável: Carol (Ops)

Output: Infraestrutura de projeto configurada

Prazo referência: Dia 1 (após contrato assinado)', '<p>Ação: Carol cria pasta padrão no Google Drive (/_clientes/NOME_CLIENTE com subpastas: /briefings, /aprovações, /entregas, /financeiro); cria projeto no Asana a partir do template TBO; adiciona cliente como colaborador externo nas plataformas pertinentes.</p><p>Responsável: Carol (Ops)</p><p>Output: Infraestrutura de projeto configurada</p><p>Prazo referência: Dia 1 (após contrato assinado)</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Envio do Guia do Cliente', 'Ação: Carol envia e-mail de boas-vindas com: guia do cliente TBO (como trabalhamos, prazos, canais de comunicação, processo de aprovação, política de revisões), agenda da reunião de kick-off e link do Asana.

Responsável: Carol (Ops)

Output: E-mail de boas-vindas enviado

Prazo referência: Dia 1', '<p>Ação: Carol envia e-mail de boas-vindas com: guia do cliente TBO (como trabalhamos, prazos, canais de comunicação, processo de aprovação, política de revisões), agenda da reunião de kick-off e link do Asana.</p><p>Responsável: Carol (Ops)</p><p>Output: E-mail de boas-vindas enviado</p><p>Prazo referência: Dia 1</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Reunião de Apresentação da Equipe', 'Ação: Marco e líder de BU se apresentam ao cliente; apresentar estrutura da agência, cases relevantes para o segmento, equipe que atenderá a conta; alinhamento de canais de comunicação preferenciais e cadência de reuniões.

Responsável: Marco Andolfato + Carol (Ops)

Output: Equipe e processos apresentados ao cliente

Prazo referência: Dia 2–3', '<p>Ação: Marco e líder de BU se apresentam ao cliente; apresentar estrutura da agência, cases relevantes para o segmento, equipe que atenderá a conta; alinhamento de canais de comunicação preferenciais e cadência de reuniões.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Equipe e processos apresentados ao cliente</p><p>Prazo referência: Dia 2–3</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Coleta de Assets e Materiais', 'Ação: Carol envia checklist de materiais necessários para início dos projetos (logo em vetor, brandbook, fotos/renders, plantas, textos institucionais, credenciais de plataformas se houver); monitorar recebimento via Drive.

Responsável: Carol (Ops)

Output: Checklist de assets enviado e controlado

Prazo referência: Dia 2–5', '<p>Ação: Carol envia checklist de materiais necessários para início dos projetos (logo em vetor, brandbook, fotos/renders, plantas, textos institucionais, credenciais de plataformas se houver); monitorar recebimento via Drive.</p><p>Responsável: Carol (Ops)</p><p>Output: Checklist de assets enviado e controlado</p><p>Prazo referência: Dia 2–5</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Kick-off do Primeiro Projeto', 'Ação: Executar SOP OPS-03 (Briefing e Kick-off de Projeto) para o primeiro projeto; registrar todas as decisões no Asana; confirmar prazo de entrega e responsáveis; iniciar produção.

Responsável: Carol (Ops) + Líder de BU

Output: Primeiro projeto em andamento no Asana

Prazo referência: Dia 5–7', '<p>Ação: Executar SOP OPS-03 (Briefing e Kick-off de Projeto) para o primeiro projeto; registrar todas as decisões no Asana; confirmar prazo de entrega e responsáveis; iniciar produção.</p><p>Responsável: Carol (Ops) + Líder de BU</p><p>Output: Primeiro projeto em andamento no Asana</p><p>Prazo referência: Dia 5–7</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Pasta no Drive criada com estrutura padrão; [ ] Asana configurado com projeto e responsáveis; [ ] Guia do cliente enviado no Dia 1; [ ] Reunião de apresentação realizada; [ ] Checklist de assets enviado ao cliente; [ ] Primeiro projeto com data de início registrada.', '<p>[ ] Pasta no Drive criada com estrutura padrão; [ ] Asana configurado com projeto e responsáveis; [ ] Guia do cliente enviado no Dia 1; [ ] Reunião de apresentação realizada; [ ] Checklist de assets enviado ao cliente; [ ] Primeiro projeto com data de início registrada.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Início de projeto sem folder de cliente → arquivos perdidos em pastas genéricas. Cliente sem guia de processo → expectativas desalinhadas, conflitos futuros. Assets não coletados antes do kick-off → project delay imediato.', '<p>Início de projeto sem folder de cliente → arquivos perdidos em pastas genéricas. Cliente sem guia de processo → expectativas desalinhadas, conflitos futuros. Assets não coletados antes do kick-off → project delay imediato.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Drive, Asana, Google Meet, WhatsApp Business, Gmail.', '<p>Google Drive, Asana, Google Meet, WhatsApp Business, Gmail.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Configuração de infraestrutura: Dia 1 após contrato. Guia do cliente: Dia 1. Reunião de apresentação: até 3 dias úteis. Kick-off do primeiro projeto: até 7 dias úteis.', '<p>Configuração de infraestrutura: Dia 1 após contrato. Guia do cliente: Dia 1. Reunião de apresentação: até 3 dias úteis. Kick-off do primeiro projeto: até 7 dias úteis.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início (contrato assinado) → Configuração Drive + Asana → E-mail de Boas-vindas + Guia → Reunião de Apresentação → Coleta de Assets → Kick-off Primeiro Projeto → Cliente Ativo → Fim', '<p>Início (contrato assinado) → Configuração Drive + Asana → E-mail de Boas-vindas + Guia → Reunião de Apresentação → Coleta de Assets → Kick-off Primeiro Projeto → Cliente Ativo → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Onboarding de cliente: processo estruturado de entrada de um novo cliente na agência. Guia do cliente: documento que explica como a TBO trabalha, prazos e processos. Cadência: frequência definida de reuniões de acompanhamento.', '<p>Onboarding de cliente: processo estruturado de entrada de um novo cliente na agência. Guia do cliente: documento que explica como a TBO trabalha, prazos e processos. Cadência: frequência definida de reuniões de acompanhamento.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-OPS-003: Briefing e Kick off de Projeto ──
END $$;
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
    'Filme de Produto Empreendimento',
    'tbo-av-004-filme-de-produto-empreendimento',
    'audiovisual',
    'checklist',
    'Filme de Produto (Empreendimento)',
    'Standard Operating Procedure

Filme de Produto (Empreendimento)

Código

TBO-AV-004

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

Produzir vídeo específico de um empreendimento imobiliário (apartamento, casa, lote) com foco em diferenciais arquitetônicos, planta, acabamentos e lifestyle, para uso em stand de vendas e plataformas digitais.

  2. Escopo

2.1 O que está coberto

Captação de ambientes decorados, maquete física ou digital, renders em movimento, depoimento de arquiteto/incorporador (opcional), edição e entrega.

2.2 Exclusões

Filme de lançamento com campanha completa (SOP AV-02), fotos do produto (demanda separada), visita virtual 360° (demanda de Gamificação).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção e aprovação final

Aprovador

—

Equipe AV

Captação, edição, motion

Executor

—

Arquiteto / Incorporadora

Informações técnicas do produto

Consultado

Informado

Carol (Ops)

Agendamento de decorado, entrega

Executor

—

  4. Pré-requisitos

4.1 Inputs necessários

Briefing do produto; plantas e memorial descritivo; acesso ao decorado ou renders finais em 4K; identidade visual do empreendimento; lista de diferenciais técnicos e de design.

4.2 Ferramentas e Acessos

Adobe Premiere Pro, After Effects, DaVinci Resolve, câmeras cinema + lentes grande angular, steady/gimbal para ambientes internos, drone (áreas externas), frame.io.



  5. Procedimento Passo a Passo

5.1. Briefing de Produto

Ação: Receber briefing técnico do produto; visitar decorado ou revisar renders; definir com Marco os ângulos e cenas prioritárias para comunicar os diferenciais.

Responsável: Marco Andolfato + Cliente

Output: Lista de cenas e ângulos prioritários aprovada

Prazo referência: Dia 1–2

5.2. Pré-produção e Logística

Ação: Agendar acesso ao decorado; montar lista de equipamentos para interiores (iluminação, gran-angular, gimbal); definir horário de melhor luz natural.

Responsável: Carol (Ops) + Equipe AV

Output: Call sheet e agendamento confirmados

Prazo referência: Dia 3

5.3. Captação de Ambientes

Ação: Filmar todos os ambientes do decorado com movimentos de câmera fluidos (gimbal); captar área de lazer, fachada e entorno com drone; registrar detalhes de acabamento em close.

Responsável: Equipe AV

Output: Rushes completos, backup no servidor

Prazo referência: Dia 4

5.4. Integração de Renders e Plantas

Ação: Integrar renders 3D do empreendimento ao corte no After Effects; animar planta baixa com destaques dos ambientes; inserir cards de texto com metragens e especificações.

Responsável: Equipe AV

Output: Sequência de renders e planta animada

Prazo referência: Dia 5–6

5.5. Edição, Revisão e Entrega

Ação: Montar corte completo; trilha emocional; inserir logo e informações do produto; enviar cut v1 ao cliente; aplicar até 2 rodadas de ajuste; color grading; exportar e entregar.

Responsável: Equipe AV + Marco + Carol (Ops)

Output: Arquivos finais entregues no Google Drive

Prazo referência: Dia 7–12

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Acesso ao decorado confirmado com antecedência; [ ] Todos os ambientes listados no briefing filmados; [ ] Renders recebidos em resolução mínima 4K; [ ] Cards de texto com dados conferidos pelo cliente; [ ] Todas as versões (web, stand, redes) exportadas.

6.2 Erros Comuns a Evitar

Decorado com móveis fora do lugar → imagem não representativa do produto. Renders em baixa resolução → qualidade visivelmente inferior. Informações técnicas incorretas nos cards → problema jurídico/comercial.

  7. Ferramentas e Templates

Adobe Premiere Pro, After Effects, DaVinci Resolve, câmera cinema, gimbal, drone, frame.io, Google Drive, Asana.

  8. SLAs e Prazos

Cut v1: 6 dias úteis após captação. Entrega final: 12 dias úteis pós-início. Revisões inclusas: 2.

  9. Fluxograma

Início → Briefing de Produto → Pré-produção → Captação de Ambientes → Integração de Renders + Plantas → Edição + Motion → Cut v1 → Feedback (até 2x) → Color Grading → Exportação → Entrega → Fim

  10. Glossário

Decorado: apartamento/casa montado e decorado para visitação comercial. Memorial descritivo: documento técnico com especificações de acabamento. Gran-angular: lente de campo visual amplo para ambientes internos. Card: sobreposição de texto com informações na tela.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Filme de Produto (Empreendimento)</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-AV-004</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Audiovisual</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir vídeo específico de um empreendimento imobiliário (apartamento, casa, lote) com foco em diferenciais arquitetônicos, planta, acabamentos e lifestyle, para uso em stand de vendas e plataformas digitais.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Captação de ambientes decorados, maquete física ou digital, renders em movimento, depoimento de arquiteto/incorporador (opcional), edição e entrega.</p><p><strong>2.2 Exclusões</strong></p><p>Filme de lançamento com campanha completa (SOP AV-02), fotos do produto (demanda separada), visita virtual 360° (demanda de Gamificação).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Direção e aprovação final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Equipe AV</p></td><td><p>Captação, edição, motion</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Arquiteto / Incorporadora</p></td><td><p>Informações técnicas do produto</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Agendamento de decorado, entrega</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Briefing do produto; plantas e memorial descritivo; acesso ao decorado ou renders finais em 4K; identidade visual do empreendimento; lista de diferenciais técnicos e de design.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe Premiere Pro, After Effects, DaVinci Resolve, câmeras cinema + lentes grande angular, steady/gimbal para ambientes internos, drone (áreas externas), frame.io.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Briefing de Produto</strong></p><p>Ação: Receber briefing técnico do produto; visitar decorado ou revisar renders; definir com Marco os ângulos e cenas prioritárias para comunicar os diferenciais.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Lista de cenas e ângulos prioritários aprovada</p><p>Prazo referência: Dia 1–2</p><p><strong>5.2. Pré-produção e Logística</strong></p><p>Ação: Agendar acesso ao decorado; montar lista de equipamentos para interiores (iluminação, gran-angular, gimbal); definir horário de melhor luz natural.</p><p>Responsável: Carol (Ops) + Equipe AV</p><p>Output: Call sheet e agendamento confirmados</p><p>Prazo referência: Dia 3</p><p><strong>5.3. Captação de Ambientes</strong></p><p>Ação: Filmar todos os ambientes do decorado com movimentos de câmera fluidos (gimbal); captar área de lazer, fachada e entorno com drone; registrar detalhes de acabamento em close.</p><p>Responsável: Equipe AV</p><p>Output: Rushes completos, backup no servidor</p><p>Prazo referência: Dia 4</p><p><strong>5.4. Integração de Renders e Plantas</strong></p><p>Ação: Integrar renders 3D do empreendimento ao corte no After Effects; animar planta baixa com destaques dos ambientes; inserir cards de texto com metragens e especificações.</p><p>Responsável: Equipe AV</p><p>Output: Sequência de renders e planta animada</p><p>Prazo referência: Dia 5–6</p><p><strong>5.5. Edição, Revisão e Entrega</strong></p><p>Ação: Montar corte completo; trilha emocional; inserir logo e informações do produto; enviar cut v1 ao cliente; aplicar até 2 rodadas de ajuste; color grading; exportar e entregar.</p><p>Responsável: Equipe AV + Marco + Carol (Ops)</p><p>Output: Arquivos finais entregues no Google Drive</p><p>Prazo referência: Dia 7–12</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Acesso ao decorado confirmado com antecedência; [ ] Todos os ambientes listados no briefing filmados; [ ] Renders recebidos em resolução mínima 4K; [ ] Cards de texto com dados conferidos pelo cliente; [ ] Todas as versões (web, stand, redes) exportadas.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Decorado com móveis fora do lugar → imagem não representativa do produto. Renders em baixa resolução → qualidade visivelmente inferior. Informações técnicas incorretas nos cards → problema jurídico/comercial.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe Premiere Pro, After Effects, DaVinci Resolve, câmera cinema, gimbal, drone, frame.io, Google Drive, Asana.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Cut v1: 6 dias úteis após captação. Entrega final: 12 dias úteis pós-início. Revisões inclusas: 2.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing de Produto → Pré-produção → Captação de Ambientes → Integração de Renders + Plantas → Edição + Motion → Cut v1 → Feedback (até 2x) → Color Grading → Exportação → Entrega → Fim</p><p><strong>  10. Glossário</strong></p><p>Decorado: apartamento/casa montado e decorado para visitação comercial. Memorial descritivo: documento técnico com especificações de acabamento. Gran-angular: lente de campo visual amplo para ambientes internos. Card: sobreposição de texto com informações na tela.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['video','filme','audiovisual','entrega','qualidade','cliente']::TEXT[],
    3,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-AV-004
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir vídeo específico de um empreendimento imobiliário (apartamento, casa, lote) com foco em diferenciais arquitetônicos, planta, acabamentos e lifestyle, para uso em stand de vendas e plataformas digitais.', '<p>Produzir vídeo específico de um empreendimento imobiliário (apartamento, casa, lote) com foco em diferenciais arquitetônicos, planta, acabamentos e lifestyle, para uso em stand de vendas e plataformas digitais.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Captação de ambientes decorados, maquete física ou digital, renders em movimento, depoimento de arquiteto/incorporador (opcional), edição e entrega.', '<p>Captação de ambientes decorados, maquete física ou digital, renders em movimento, depoimento de arquiteto/incorporador (opcional), edição e entrega.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Filme de lançamento com campanha completa (SOP AV-02), fotos do produto (demanda separada), visita virtual 360° (demanda de Gamificação).', '<p>Filme de lançamento com campanha completa (SOP AV-02), fotos do produto (demanda separada), visita virtual 360° (demanda de Gamificação).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção e aprovação final

Aprovador

—

Equipe AV

Captação, edição, motion

Executor

—

Arquiteto / Incorporadora

Informações técnicas do produto

Consultado

Informado

Carol (Ops)

Agendamento de decorado, entrega

Executor

—', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Direção e aprovação final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Equipe AV</p></td><td><p>Captação, edição, motion</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Arquiteto / Incorporadora</p></td><td><p>Informações técnicas do produto</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Agendamento de decorado, entrega</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Briefing do produto; plantas e memorial descritivo; acesso ao decorado ou renders finais em 4K; identidade visual do empreendimento; lista de diferenciais técnicos e de design.', '<p>Briefing do produto; plantas e memorial descritivo; acesso ao decorado ou renders finais em 4K; identidade visual do empreendimento; lista de diferenciais técnicos e de design.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Premiere Pro, After Effects, DaVinci Resolve, câmeras cinema + lentes grande angular, steady/gimbal para ambientes internos, drone (áreas externas), frame.io.', '<p>Adobe Premiere Pro, After Effects, DaVinci Resolve, câmeras cinema + lentes grande angular, steady/gimbal para ambientes internos, drone (áreas externas), frame.io.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Briefing de Produto', 'Ação: Receber briefing técnico do produto; visitar decorado ou revisar renders; definir com Marco os ângulos e cenas prioritárias para comunicar os diferenciais.

Responsável: Marco Andolfato + Cliente

Output: Lista de cenas e ângulos prioritários aprovada

Prazo referência: Dia 1–2', '<p>Ação: Receber briefing técnico do produto; visitar decorado ou revisar renders; definir com Marco os ângulos e cenas prioritárias para comunicar os diferenciais.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Lista de cenas e ângulos prioritários aprovada</p><p>Prazo referência: Dia 1–2</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Pré-produção e Logística', 'Ação: Agendar acesso ao decorado; montar lista de equipamentos para interiores (iluminação, gran-angular, gimbal); definir horário de melhor luz natural.

Responsável: Carol (Ops) + Equipe AV

Output: Call sheet e agendamento confirmados

Prazo referência: Dia 3', '<p>Ação: Agendar acesso ao decorado; montar lista de equipamentos para interiores (iluminação, gran-angular, gimbal); definir horário de melhor luz natural.</p><p>Responsável: Carol (Ops) + Equipe AV</p><p>Output: Call sheet e agendamento confirmados</p><p>Prazo referência: Dia 3</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Captação de Ambientes', 'Ação: Filmar todos os ambientes do decorado com movimentos de câmera fluidos (gimbal); captar área de lazer, fachada e entorno com drone; registrar detalhes de acabamento em close.

Responsável: Equipe AV

Output: Rushes completos, backup no servidor

Prazo referência: Dia 4', '<p>Ação: Filmar todos os ambientes do decorado com movimentos de câmera fluidos (gimbal); captar área de lazer, fachada e entorno com drone; registrar detalhes de acabamento em close.</p><p>Responsável: Equipe AV</p><p>Output: Rushes completos, backup no servidor</p><p>Prazo referência: Dia 4</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Integração de Renders e Plantas', 'Ação: Integrar renders 3D do empreendimento ao corte no After Effects; animar planta baixa com destaques dos ambientes; inserir cards de texto com metragens e especificações.

Responsável: Equipe AV

Output: Sequência de renders e planta animada

Prazo referência: Dia 5–6', '<p>Ação: Integrar renders 3D do empreendimento ao corte no After Effects; animar planta baixa com destaques dos ambientes; inserir cards de texto com metragens e especificações.</p><p>Responsável: Equipe AV</p><p>Output: Sequência de renders e planta animada</p><p>Prazo referência: Dia 5–6</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Edição, Revisão e Entrega', 'Ação: Montar corte completo; trilha emocional; inserir logo e informações do produto; enviar cut v1 ao cliente; aplicar até 2 rodadas de ajuste; color grading; exportar e entregar.

Responsável: Equipe AV + Marco + Carol (Ops)

Output: Arquivos finais entregues no Google Drive

Prazo referência: Dia 7–12', '<p>Ação: Montar corte completo; trilha emocional; inserir logo e informações do produto; enviar cut v1 ao cliente; aplicar até 2 rodadas de ajuste; color grading; exportar e entregar.</p><p>Responsável: Equipe AV + Marco + Carol (Ops)</p><p>Output: Arquivos finais entregues no Google Drive</p><p>Prazo referência: Dia 7–12</p>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Acesso ao decorado confirmado com antecedência; [ ] Todos os ambientes listados no briefing filmados; [ ] Renders recebidos em resolução mínima 4K; [ ] Cards de texto com dados conferidos pelo cliente; [ ] Todas as versões (web, stand, redes) exportadas.', '<p>[ ] Acesso ao decorado confirmado com antecedência; [ ] Todos os ambientes listados no briefing filmados; [ ] Renders recebidos em resolução mínima 4K; [ ] Cards de texto com dados conferidos pelo cliente; [ ] Todas as versões (web, stand, redes) exportadas.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Decorado com móveis fora do lugar → imagem não representativa do produto. Renders em baixa resolução → qualidade visivelmente inferior. Informações técnicas incorretas nos cards → problema jurídico/comercial.', '<p>Decorado com móveis fora do lugar → imagem não representativa do produto. Renders em baixa resolução → qualidade visivelmente inferior. Informações técnicas incorretas nos cards → problema jurídico/comercial.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Premiere Pro, After Effects, DaVinci Resolve, câmera cinema, gimbal, drone, frame.io, Google Drive, Asana.', '<p>Adobe Premiere Pro, After Effects, DaVinci Resolve, câmera cinema, gimbal, drone, frame.io, Google Drive, Asana.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Cut v1: 6 dias úteis após captação. Entrega final: 12 dias úteis pós-início. Revisões inclusas: 2.', '<p>Cut v1: 6 dias úteis após captação. Entrega final: 12 dias úteis pós-início. Revisões inclusas: 2.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing de Produto → Pré-produção → Captação de Ambientes → Integração de Renders + Plantas → Edição + Motion → Cut v1 → Feedback (até 2x) → Color Grading → Exportação → Entrega → Fim', '<p>Início → Briefing de Produto → Pré-produção → Captação de Ambientes → Integração de Renders + Plantas → Edição + Motion → Cut v1 → Feedback (até 2x) → Color Grading → Exportação → Entrega → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Decorado: apartamento/casa montado e decorado para visitação comercial. Memorial descritivo: documento técnico com especificações de acabamento. Gran-angular: lente de campo visual amplo para ambientes internos. Card: sobreposição de texto com informações na tela.', '<p>Decorado: apartamento/casa montado e decorado para visitação comercial. Memorial descritivo: documento técnico com especificações de acabamento. Gran-angular: lente de campo visual amplo para ambientes internos. Card: sobreposição de texto com informações na tela.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-AV-005: Pílulas Social Conteúdo para Redes Sociais ──
END $$;
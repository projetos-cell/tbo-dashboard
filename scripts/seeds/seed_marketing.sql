-- Seed: marketing (12 SOPs)
DO $$
DECLARE v_sop_id UUID;
BEGIN

  -- TBO-MKT-001
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Diagnóstico de Marketing', 'tbo-mkt-001-diagnostico-de-marketing', 'marketing', 'checklist', 'Realizar análise completa do cenário de marketing do cliente, do produto imobiliário e do mercado local para embasar o planejamento estratégico de comunicação e mídia.', 'Standard Operating Procedure

Diagnóstico de Marketing

Código

TBO-MKT-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Marketing

Responsável

Rafa (PO Marketing)

Aprovador

Marco Andolfato



  1. Objetivo

Realizar análise completa do cenário de marketing do cliente, do produto imobiliário e do mercado local para embasar o planejamento estratégico de comunicação e mídia.

  2. Escopo

2.1 O que está coberto

Briefing com cliente, análise de posicionamento, pesquisa de concorrência, análise de público-alvo, auditoria de ativos digitais existentes e mapeamento de oportunidades.

2.2 Exclusões

Criação de materiais, execução de campanhas, definição de budgets de mídia.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Conduz briefing e análise

Marco Andolfato

Diretor de Criação, BU Estratégia

Analista de Marketing

Coleta dados, pesquisa concorrência

Rafa / Lucca

Cliente

BU Estratégia

Valida posicionamento e persona

Marco Andolfato

Rafa / Lucca

  4. Pré-requisitos

4.1 Inputs necessários

Contrato assinado; briefing inicial do cliente; materiais do produto (memorial descritivo, planta, localização); histórico de campanhas anteriores (se houver).

4.2 Ferramentas e Acessos

Google Analytics, Meta Business Suite, Semrush, Google Trends, Hotjar (se site existir), planilha de diagnóstico TBO.



  5. Procedimento Passo a Passo

5.1. Briefing Estruturado

Ação: Realizar sessão de briefing com cliente usando template TBO: produto, público, concorrentes, diferenciais, histórico, expectativas de VGV e prazo de lançamento.

Responsável: Rafa / Lucca

Output: Briefing preenchido e validado pelo cliente.

Prazo referência: D+2 após kickoff

5.2. Pesquisa de Mercado e Concorrência

Ação: Mapear 5-8 concorrentes diretos na região. Analisar posicionamento, canais, criativos, estimativa de investimento em mídia e diferenciais comunicados.

Responsável: Analista de Marketing

Output: Relatório de benchmarking com prints e análise qualitativa.

Prazo referência: D+5

5.3. Análise de Público-Alvo

Ação: Cruzar dados demográficos do bairro (IBGE), perfil do produto e dados do cliente para construir personas primária e secundária. Validar com BU Estratégia.

Responsável: Rafa / Lucca + BU Estratégia

Output: Documento de personas com dores, desejos, canais preferidos e jornada de compra imobiliária.

Prazo referência: D+7

5.4. Auditoria de Ativos Digitais

Ação: Auditar site, redes sociais, base de e-mails e campanhas anteriores do cliente. Avaliar performance histórica (CTR, CPL, taxa de conversão) se dados disponíveis.

Responsável: Analista de Marketing

Output: Planilha de auditoria com notas por canal e gaps identificados.

Prazo referência: D+7

5.5. Consolidação do Diagnóstico

Ação: Compilar achados em documento de diagnóstico: SWOT de marketing, oportunidades por canal, posicionamento recomendado, alertas e riscos.

Responsável: Rafa / Lucca

Output: Documento de Diagnóstico de Marketing (PDF + slides).

Prazo referência: D+10

5.6. Apresentação ao Cliente

Ação: Apresentar diagnóstico ao cliente em reunião formal. Coletar validações, ajustes e alinhamentos estratégicos antes de avançar ao Plano de Marketing.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Diagnóstico aprovado com ata de reunião e registro de ajustes.

Prazo referência: D+12

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Briefing com todas as seções preenchidas; mínimo 5 concorrentes mapeados; personas validadas pela BU Estratégia; auditoria digital com dados (não apenas capturas de tela); diagnóstico revisado por Marco antes da apresentação.

6.2 Erros Comuns a Evitar

Diagnóstico genérico sem especificidade do produto ou região; personas baseadas apenas em feeling sem dados; concorrentes mapeados fora do raio de influência do empreendimento; auditoria sem análise de performance histórica quando dados existem.

  7. Ferramentas e Templates

Semrush (análise de domínio e concorrência), Google Trends, Meta Ad Library, Google Analytics, Hotjar, planilha de diagnóstico TBO, Notion (documentação).

  8. SLAs e Prazos

Briefing: até D+2; diagnóstico completo: até D+12 após kickoff; aprovação do cliente: até D+15.

  9. Fluxograma

Início → Kickoff + Briefing → Pesquisa de Concorrência → Construção de Personas → Auditoria Digital → Consolidação SWOT → Revisão interna (Marco) → Apresentação ao cliente → Aprovação → Fim

  10. Glossário

CPL: Custo por Lead. VGV: Valor Geral de Vendas. Persona: representação semifictícia do cliente ideal. SWOT: análise de forças, fraquezas, oportunidades e ameaças. CTR: Click-Through Rate.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marketing','campanha']::TEXT[], 0, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Realizar análise completa do cenário de marketing do cliente, do produto imobiliário e do mercado local para embasar o planejamento estratégico de comunicação e mídia.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Briefing com cliente, análise de posicionamento, pesquisa de concorrência, análise de público-alvo, auditoria de ativos digitais existentes e mapeamento de oportunidades.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Criação de materiais, execução de campanhas, definição de budgets de mídia.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Conduz briefing e análise

Marco Andolfato

Diretor de Criação, BU Estratégia

Analista de Marketing

Coleta dados, pesquisa concorrência

Rafa / Lucca

Cliente

BU Estratégia

Valida posicionamento e persona

Marco Andolfato

Rafa / Lucca', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado; briefing inicial do cliente; materiais do produto (memorial descritivo, planta, localização); histórico de campanhas anteriores (se houver).', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Analytics, Meta Business Suite, Semrush, Google Trends, Hotjar (se site existir), planilha de diagnóstico TBO.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Briefing Estruturado', 'Ação: Realizar sessão de briefing com cliente usando template TBO: produto, público, concorrentes, diferenciais, histórico, expectativas de VGV e prazo de lançamento.

Responsável: Rafa / Lucca

Output: Briefing preenchido e validado pelo cliente.

Prazo referência: D+2 após kickoff', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Pesquisa de Mercado e Concorrência', 'Ação: Mapear 5-8 concorrentes diretos na região. Analisar posicionamento, canais, criativos, estimativa de investimento em mídia e diferenciais comunicados.

Responsável: Analista de Marketing

Output: Relatório de benchmarking com prints e análise qualitativa.

Prazo referência: D+5', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Análise de Público-Alvo', 'Ação: Cruzar dados demográficos do bairro (IBGE), perfil do produto e dados do cliente para construir personas primária e secundária. Validar com BU Estratégia.

Responsável: Rafa / Lucca + BU Estratégia

Output: Documento de personas com dores, desejos, canais preferidos e jornada de compra imobiliária.

Prazo referência: D+7', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Auditoria de Ativos Digitais', 'Ação: Auditar site, redes sociais, base de e-mails e campanhas anteriores do cliente. Avaliar performance histórica (CTR, CPL, taxa de conversão) se dados disponíveis.

Responsável: Analista de Marketing

Output: Planilha de auditoria com notas por canal e gaps identificados.

Prazo referência: D+7', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Consolidação do Diagnóstico', 'Ação: Compilar achados em documento de diagnóstico: SWOT de marketing, oportunidades por canal, posicionamento recomendado, alertas e riscos.

Responsável: Rafa / Lucca

Output: Documento de Diagnóstico de Marketing (PDF + slides).

Prazo referência: D+10', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Apresentação ao Cliente', 'Ação: Apresentar diagnóstico ao cliente em reunião formal. Coletar validações, ajustes e alinhamentos estratégicos antes de avançar ao Plano de Marketing.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Diagnóstico aprovado com ata de reunião e registro de ajustes.

Prazo referência: D+12', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Briefing com todas as seções preenchidas; mínimo 5 concorrentes mapeados; personas validadas pela BU Estratégia; auditoria digital com dados (não apenas capturas de tela); diagnóstico revisado por Marco antes da apresentação.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Diagnóstico genérico sem especificidade do produto ou região; personas baseadas apenas em feeling sem dados; concorrentes mapeados fora do raio de influência do empreendimento; auditoria sem análise de performance histórica quando dados existem.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Semrush (análise de domínio e concorrência), Google Trends, Meta Ad Library, Google Analytics, Hotjar, planilha de diagnóstico TBO, Notion (documentação).', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Briefing: até D+2; diagnóstico completo: até D+12 após kickoff; aprovação do cliente: até D+15.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Kickoff + Briefing → Pesquisa de Concorrência → Construção de Personas → Auditoria Digital → Consolidação SWOT → Revisão interna (Marco) → Apresentação ao cliente → Aprovação → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'CPL: Custo por Lead. VGV: Valor Geral de Vendas. Persona: representação semifictícia do cliente ideal. SWOT: análise de forças, fraquezas, oportunidades e ameaças. CTR: Click-Through Rate.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-MKT-002
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Plano de Marketing', 'tbo-mkt-002-plano-de-marketing', 'marketing', 'checklist', 'Estruturar o plano estratégico de marketing do empreendimento imobiliário, definindo posicionamento, mensagem central, canais, fases de campanha e metas de performance para todo o ciclo do lançamento.', 'Standard Operating Procedure

Plano de Marketing

Código

TBO-MKT-002

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Marketing

Responsável

Rafa (PO Marketing)

Aprovador

Marco Andolfato



  1. Objetivo

Estruturar o plano estratégico de marketing do empreendimento imobiliário, definindo posicionamento, mensagem central, canais, fases de campanha e metas de performance para todo o ciclo do lançamento.

  2. Escopo

2.1 O que está coberto

Definição de posicionamento e naming, estratégia por fase (pré-lançamento, lançamento, sustentação), definição de canais, metas de CPL e volume de leads, calendário macro de marketing.

2.2 Exclusões

Produção de criativos, execução de mídia paga, detalhamento de plano de mídias (coberto no SOP MKT-03).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Elabora e lidera plano

Marco Andolfato

Cliente, BU Criação

BU Estratégia

Valida posicionamento e mensagem

Marco Andolfato

Rafa / Lucca

BU Criação

Recebe briefing criativo derivado do plano

Rafa / Lucca

Cliente

  4. Pré-requisitos

4.1 Inputs necessários

Diagnóstico de Marketing aprovado (MKT-01); briefing de produto final; budget total de marketing aprovado pelo cliente; data-alvo do lançamento.

4.2 Ferramentas e Acessos

Notion, Google Slides, planilha de metas TBO, RD Station (para mapeamento de funil).



  5. Procedimento Passo a Passo

5.1. Definição de Posicionamento e Mensagem Central

Ação: Com base no diagnóstico e nas personas, definir o posicionamento único do produto: tagline, pilares de comunicação (máximo 3) e promessa central da marca do empreendimento.

Responsável: Rafa / Lucca + BU Estratégia

Output: Documento de posicionamento com tagline, pilares e mensagem central aprovados.

Prazo referência: D+3 após diagnóstico aprovado

5.2. Definição de Fases e Objetivos por Fase

Ação: Estruturar as 3 fases de campanha: Pré-Lançamento (geração de expectativa e base de leads), Lançamento (conversão de leads em propostas) e Sustentação (manutenção de velocidade de vendas). Definir objetivo principal, KPI meta e tom de comunicação de cada fase.

Responsável: Rafa / Lucca

Output: Documento de fases com objetivos, KPIs-meta e tom por fase.

Prazo referência: D+5

5.3. Definição de Canais e Mix de Marketing

Ação: Selecionar canais por fase (mídia paga, social media, e-mail, influenciadores, OOH, eventos, portal imobiliário). Justificar cada canal com base nas personas e no benchmark de concorrência.

Responsável: Rafa / Lucca

Output: Matriz de canais por fase com justificativa e peso estratégico.

Prazo referência: D+7

5.4. Metas e KPIs do Plano

Ação: Definir metas quantitativas: volume de leads por fase, CPL-alvo por canal, taxa de conversão lead→visita→proposta→venda, alcance e frequência estimados. Basear em benchmarks de mercado imobiliário e histórico do cliente.

Responsável: Rafa / Lucca

Output: Planilha de metas com targets por fase, canal e métrica.

Prazo referência: D+9

5.5. Calendário Macro de Marketing

Ação: Montar calendário de marco: ações-chave, datas de ativação por fase, eventos de lançamento, entregas de conteúdo e marcos de revisão de performance.

Responsável: Analista de Marketing

Output: Calendário macro em formato visual (Gantt ou timeline) compartilhado com cliente.

Prazo referência: D+10

5.6. Revisão Interna e Aprovação do Plano

Ação: Apresentar plano internamente para Marco Andolfato e BU Criação. Incorporar feedbacks. Apresentar ao cliente para aprovação formal.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Plano de Marketing aprovado com assinatura ou e-mail de validação do cliente.

Prazo referência: D+14

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Posicionamento diferenciado do concorrente mapeado; metas baseadas em dados (não arbitrárias); todos os canais justificados; calendário alinhado com data de lançamento; plano revisado por Marco antes de ir ao cliente.

6.2 Erros Comuns a Evitar

Metas de CPL sem embasamento em benchmark; plano genérico que poderia ser de qualquer produto; canais selecionados por hábito, não por persona; calendário sem folga para produção de criativos.

  7. Ferramentas e Templates

Notion (documentação), Google Slides (apresentação), planilha de metas TBO, RD Station (funil), Google Calendar / Gantt.

  8. SLAs e Prazos

Posicionamento: D+3; plano completo: D+14 após diagnóstico aprovado; aprovação cliente: D+17.

  9. Fluxograma

Início → Posicionamento + Mensagem → Fases e Objetivos → Mix de Canais → Metas e KPIs → Calendário Macro → Revisão interna → Apresentação cliente → Aprovação → Fim

  10. Glossário

CPL: Custo por Lead. OOH: Out-of-Home (mídia exterior). Mix de canais: combinação de meios de comunicação utilizados. KPI: Key Performance Indicator. Funil: etapas da jornada do lead até a compra.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marketing','campanha']::TEXT[], 1, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Estruturar o plano estratégico de marketing do empreendimento imobiliário, definindo posicionamento, mensagem central, canais, fases de campanha e metas de performance para todo o ciclo do lançamento.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Definição de posicionamento e naming, estratégia por fase (pré-lançamento, lançamento, sustentação), definição de canais, metas de CPL e volume de leads, calendário macro de marketing.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de criativos, execução de mídia paga, detalhamento de plano de mídias (coberto no SOP MKT-03).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Elabora e lidera plano

Marco Andolfato

Cliente, BU Criação

BU Estratégia

Valida posicionamento e mensagem

Marco Andolfato

Rafa / Lucca

BU Criação

Recebe briefing criativo derivado do plano

Rafa / Lucca

Cliente', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Diagnóstico de Marketing aprovado (MKT-01); briefing de produto final; budget total de marketing aprovado pelo cliente; data-alvo do lançamento.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Notion, Google Slides, planilha de metas TBO, RD Station (para mapeamento de funil).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Definição de Posicionamento e Mensagem Central', 'Ação: Com base no diagnóstico e nas personas, definir o posicionamento único do produto: tagline, pilares de comunicação (máximo 3) e promessa central da marca do empreendimento.

Responsável: Rafa / Lucca + BU Estratégia

Output: Documento de posicionamento com tagline, pilares e mensagem central aprovados.

Prazo referência: D+3 após diagnóstico aprovado', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Definição de Fases e Objetivos por Fase', 'Ação: Estruturar as 3 fases de campanha: Pré-Lançamento (geração de expectativa e base de leads), Lançamento (conversão de leads em propostas) e Sustentação (manutenção de velocidade de vendas). Definir objetivo principal, KPI meta e tom de comunicação de cada fase.

Responsável: Rafa / Lucca

Output: Documento de fases com objetivos, KPIs-meta e tom por fase.

Prazo referência: D+5', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Definição de Canais e Mix de Marketing', 'Ação: Selecionar canais por fase (mídia paga, social media, e-mail, influenciadores, OOH, eventos, portal imobiliário). Justificar cada canal com base nas personas e no benchmark de concorrência.

Responsável: Rafa / Lucca

Output: Matriz de canais por fase com justificativa e peso estratégico.

Prazo referência: D+7', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Metas e KPIs do Plano', 'Ação: Definir metas quantitativas: volume de leads por fase, CPL-alvo por canal, taxa de conversão lead→visita→proposta→venda, alcance e frequência estimados. Basear em benchmarks de mercado imobiliário e histórico do cliente.

Responsável: Rafa / Lucca

Output: Planilha de metas com targets por fase, canal e métrica.

Prazo referência: D+9', 9, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Calendário Macro de Marketing', 'Ação: Montar calendário de marco: ações-chave, datas de ativação por fase, eventos de lançamento, entregas de conteúdo e marcos de revisão de performance.

Responsável: Analista de Marketing

Output: Calendário macro em formato visual (Gantt ou timeline) compartilhado com cliente.

Prazo referência: D+10', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Revisão Interna e Aprovação do Plano', 'Ação: Apresentar plano internamente para Marco Andolfato e BU Criação. Incorporar feedbacks. Apresentar ao cliente para aprovação formal.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Plano de Marketing aprovado com assinatura ou e-mail de validação do cliente.

Prazo referência: D+14', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Posicionamento diferenciado do concorrente mapeado; metas baseadas em dados (não arbitrárias); todos os canais justificados; calendário alinhado com data de lançamento; plano revisado por Marco antes de ir ao cliente.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Metas de CPL sem embasamento em benchmark; plano genérico que poderia ser de qualquer produto; canais selecionados por hábito, não por persona; calendário sem folga para produção de criativos.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Notion (documentação), Google Slides (apresentação), planilha de metas TBO, RD Station (funil), Google Calendar / Gantt.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Posicionamento: D+3; plano completo: D+14 após diagnóstico aprovado; aprovação cliente: D+17.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Posicionamento + Mensagem → Fases e Objetivos → Mix de Canais → Metas e KPIs → Calendário Macro → Revisão interna → Apresentação cliente → Aprovação → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'CPL: Custo por Lead. OOH: Out-of-Home (mídia exterior). Mix de canais: combinação de meios de comunicação utilizados. KPI: Key Performance Indicator. Funil: etapas da jornada do lead até a compra.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-MKT-003
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Plano de Mídias', 'tbo-mkt-003-plano-de-midias', 'marketing', 'checklist', 'Elaborar o plano tático de mídias pagas e orgânicas do empreendimento, detalhando distribuição de budget, canais, segmentações, formatos, cronograma de ativação e projeções de entrega por fase.', 'Standard Operating Procedure

Plano de Mídias

Código

TBO-MKT-003

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Marketing

Responsável

Rafa (PO Marketing)

Aprovador

Marco Andolfato



  1. Objetivo

Elaborar o plano tático de mídias pagas e orgânicas do empreendimento, detalhando distribuição de budget, canais, segmentações, formatos, cronograma de ativação e projeções de entrega por fase.

  2. Escopo

2.1 O que está coberto

Planejamento de Google Ads, Meta Ads, portais imobiliários, mídia programática, YouTube, influenciadores (budget), e distribuição de investimento por fase e canal.

2.2 Exclusões

Execução e gestão das campanhas (coberto em MKT-09), produção de criativos (BU Criação), gestão de influenciadores (MKT-07).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Elabora plano de mídias

Marco Andolfato

Cliente, BU Criação

Especialista em Tráfego

Valida viabilidade técnica e projeções

Rafa / Lucca

Analista de Marketing

Cliente / Incorporadora

Aprova budget e distribuição

Marco Andolfato

Rafa / Lucca

  4. Pré-requisitos

4.1 Inputs necessários

Plano de Marketing aprovado (MKT-02); budget total de mídia aprovado; personas finais; data de lançamento; portais imobiliários de preferência do cliente.

4.2 Ferramentas e Acessos

Google Ads Keyword Planner, Meta Ads Manager (estimativas), planilha de plano de mídias TBO, Semrush.



  5. Procedimento Passo a Passo

5.1. Distribuição de Budget por Fase e Canal

Ação: Alocar o budget total de mídia entre as fases (Pré-Lançamento, Lançamento, Sustentação) e dentro de cada fase entre os canais (Meta Ads, Google Ads, portais, YouTube, programática). Justificar pesos com base nas personas e objetivos de cada fase.

Responsável: Rafa / Lucca + Especialista em Tráfego

Output: Planilha de distribuição de budget com percentuais e valores absolutos por fase/canal.

Prazo referência: D+3 após plano aprovado

5.2. Definição de Segmentações e Públicos

Ação: Mapear segmentações para cada canal: públicos por interesse, comportamento, localização (raio do empreendimento), faixa de renda estimada, lookalike de clientes anteriores. Criar matriz de públicos por fase.

Responsável: Especialista em Tráfego

Output: Matriz de segmentação por canal e fase.

Prazo referência: D+5

5.3. Definição de Formatos e Criativos Necessários

Ação: Listar todos os formatos de anúncio necessários por canal (stories, feed, carrossel, vídeo, display, search, responsive). Gerar briefing de produção para BU Criação com especificações técnicas.

Responsável: Rafa / Lucca

Output: Lista de formatos por canal e briefing de produção para criação.

Prazo referência: D+6

5.4. Projeções de Entrega e Metas por Canal

Ação: Calcular projeções de impressões, cliques, CPL estimado e volume de leads por canal baseado no budget alocado e benchmarks históricos de mercado imobiliário.

Responsável: Especialista em Tráfego

Output: Planilha de projeções com alcance, frequência, CTR estimado, CPL e volume de leads por canal.

Prazo referência: D+8

5.5. Cronograma de Ativação de Mídias

Ação: Definir datas de ativação, pausas e intensificações de cada canal ao longo das fases. Incluir períodos de testes A/B e janelas de otimização.

Responsável: Rafa / Lucca

Output: Cronograma de ativação em formato calendário ou Gantt.

Prazo referência: D+9

5.6. Aprovação do Plano de Mídias

Ação: Apresentar plano ao cliente com distribuição de budget, projeções e cronograma. Obter aprovação formal antes de iniciar produção de criativos e configuração das campanhas.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Plano de mídias aprovado (documento assinado ou e-mail de validação).

Prazo referência: D+12

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Budget 100% alocado sem valor residual sem destino; projeções baseadas em CPL de referência de mercado imobiliário (não fictícias); todos os formatos mapeados para briefing de criação; cronograma alinhado com calendário de produção; aprovação formal registrada.

6.2 Erros Comuns a Evitar

Budget distribuído igualmente entre canais sem critério estratégico; projeções superestimadas sem embasamento; formatos de anúncio não especificados tecnicamente; plano sem cronograma de ativação.

  7. Ferramentas e Templates

Google Ads Keyword Planner, Meta Ads Manager (ferramenta de estimativas), planilha de plano de mídias TBO, Semrush, Notion.

  8. SLAs e Prazos

Rascunho do plano: D+9; aprovação cliente: D+12 após plano de marketing aprovado.

  9. Fluxograma

Início → Distribuição de Budget → Segmentações e Públicos → Formatos e Briefing Criação → Projeções por Canal → Cronograma de Ativação → Revisão interna → Apresentação cliente → Aprovação → Fim

  10. Glossário

CPM: Custo por Mil Impressões. CTR: Click-Through Rate. Lookalike: público similar a uma base de referência. Programática: compra automatizada de mídia digital. Formatos: dimensões e tipos de peças publicitárias por plataforma.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marketing','campanha']::TEXT[], 2, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Elaborar o plano tático de mídias pagas e orgânicas do empreendimento, detalhando distribuição de budget, canais, segmentações, formatos, cronograma de ativação e projeções de entrega por fase.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Planejamento de Google Ads, Meta Ads, portais imobiliários, mídia programática, YouTube, influenciadores (budget), e distribuição de investimento por fase e canal.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Execução e gestão das campanhas (coberto em MKT-09), produção de criativos (BU Criação), gestão de influenciadores (MKT-07).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Elabora plano de mídias

Marco Andolfato

Cliente, BU Criação

Especialista em Tráfego

Valida viabilidade técnica e projeções

Rafa / Lucca

Analista de Marketing

Cliente / Incorporadora

Aprova budget e distribuição

Marco Andolfato

Rafa / Lucca', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plano de Marketing aprovado (MKT-02); budget total de mídia aprovado; personas finais; data de lançamento; portais imobiliários de preferência do cliente.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Ads Keyword Planner, Meta Ads Manager (estimativas), planilha de plano de mídias TBO, Semrush.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Distribuição de Budget por Fase e Canal', 'Ação: Alocar o budget total de mídia entre as fases (Pré-Lançamento, Lançamento, Sustentação) e dentro de cada fase entre os canais (Meta Ads, Google Ads, portais, YouTube, programática). Justificar pesos com base nas personas e objetivos de cada fase.

Responsável: Rafa / Lucca + Especialista em Tráfego

Output: Planilha de distribuição de budget com percentuais e valores absolutos por fase/canal.

Prazo referência: D+3 após plano aprovado', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Definição de Segmentações e Públicos', 'Ação: Mapear segmentações para cada canal: públicos por interesse, comportamento, localização (raio do empreendimento), faixa de renda estimada, lookalike de clientes anteriores. Criar matriz de públicos por fase.

Responsável: Especialista em Tráfego

Output: Matriz de segmentação por canal e fase.

Prazo referência: D+5', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Definição de Formatos e Criativos Necessários', 'Ação: Listar todos os formatos de anúncio necessários por canal (stories, feed, carrossel, vídeo, display, search, responsive). Gerar briefing de produção para BU Criação com especificações técnicas.

Responsável: Rafa / Lucca

Output: Lista de formatos por canal e briefing de produção para criação.

Prazo referência: D+6', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Projeções de Entrega e Metas por Canal', 'Ação: Calcular projeções de impressões, cliques, CPL estimado e volume de leads por canal baseado no budget alocado e benchmarks históricos de mercado imobiliário.

Responsável: Especialista em Tráfego

Output: Planilha de projeções com alcance, frequência, CTR estimado, CPL e volume de leads por canal.

Prazo referência: D+8', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Cronograma de Ativação de Mídias', 'Ação: Definir datas de ativação, pausas e intensificações de cada canal ao longo das fases. Incluir períodos de testes A/B e janelas de otimização.

Responsável: Rafa / Lucca

Output: Cronograma de ativação em formato calendário ou Gantt.

Prazo referência: D+9', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Aprovação do Plano de Mídias', 'Ação: Apresentar plano ao cliente com distribuição de budget, projeções e cronograma. Obter aprovação formal antes de iniciar produção de criativos e configuração das campanhas.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Plano de mídias aprovado (documento assinado ou e-mail de validação).

Prazo referência: D+12', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Budget 100% alocado sem valor residual sem destino; projeções baseadas em CPL de referência de mercado imobiliário (não fictícias); todos os formatos mapeados para briefing de criação; cronograma alinhado com calendário de produção; aprovação formal registrada.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Budget distribuído igualmente entre canais sem critério estratégico; projeções superestimadas sem embasamento; formatos de anúncio não especificados tecnicamente; plano sem cronograma de ativação.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Ads Keyword Planner, Meta Ads Manager (ferramenta de estimativas), planilha de plano de mídias TBO, Semrush, Notion.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Rascunho do plano: D+9; aprovação cliente: D+12 após plano de marketing aprovado.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Distribuição de Budget → Segmentações e Públicos → Formatos e Briefing Criação → Projeções por Canal → Cronograma de Ativação → Revisão interna → Apresentação cliente → Aprovação → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'CPM: Custo por Mil Impressões. CTR: Click-Through Rate. Lookalike: público similar a uma base de referência. Programática: compra automatizada de mídia digital. Formatos: dimensões e tipos de peças publicitárias por plataforma.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-MKT-004
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Gestão de Campanha Pré Lançamento 45d', 'tbo-mkt-004-gestao-de-campanha-pre-lancamento-45d', 'marketing', 'checklist', 'Gestão de Campanha — Pré-Lançamento (45d)', 'Standard Operating Procedure

Gestão de Campanha — Pré-Lançamento (45d)

Código

TBO-MKT-004

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Marketing

Responsável

Rafa (PO Marketing)

Aprovador

Marco Andolfato



  1. Objetivo

Executar a fase de pré-lançamento da campanha imobiliária nos 45 dias anteriores ao evento de lançamento, construindo base de leads qualificados, gerando expectativa e preparando todos os ativos digitais para o lançamento.

  2. Escopo

2.1 O que está coberto

Ativação de campanhas de captura de leads, construção de landing page, aquecimento de base, ativação de influenciadores, monitoramento de performance e otimização diária de campanhas.

2.2 Exclusões

Evento de lançamento presencial (BU Eventos), produção de criativos (BU Criação), gestão de relacionamento pós-visita (BU Comercial).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Lidera execução da fase

Marco Andolfato

Cliente, BU Comercial

Especialista em Tráfego

Opera campanhas pagas diariamente

Rafa / Lucca

Analista de Marketing

Analista de Marketing

Monitora KPIs e prepara relatório semanal

Rafa / Lucca

Cliente

  4. Pré-requisitos

4.1 Inputs necessários

Plano de Mídias aprovado (MKT-03); criativos da fase pré-lançamento entregues e aprovados (BU Criação); landing page da campanha desenvolvida e testada; URL de rastreamento configurada; RD Station configurado com fluxo de nutrição.

4.2 Ferramentas e Acessos

Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO.



  5. Procedimento Passo a Passo

5.1. Setup e Ativação das Campanhas

Ação: Configurar todas as campanhas no Meta Ads e Google Ads conforme plano de mídias: criar públicos, carregar criativos, definir objetivos de campanha (conversão/leads), configurar pixel e tags de rastreamento. Testar fluxo completo lead → CRM antes de ativar.

Responsável: Especialista em Tráfego

Output: Campanhas ativas com rastreamento validado e leads chegando ao RD Station.

Prazo referência: D-45 (início da fase)

5.2. Validação da Landing Page e Rastreamento

Ação: Validar landing page com checklist: velocidade (PageSpeed >80), formulário funcionando, pixel disparando, GA4 registrando eventos, Hotjar gravando sessões, responsividade mobile.

Responsável: Analista de Marketing + Especialista em Tráfego

Output: Checklist de validação 100% aprovado. Hotjar e GA4 confirmados.

Prazo referência: D-45

5.3. Ativação de Influenciadores e Conteúdo Orgânico

Ação: Coordenar publicações dos influenciadores contratados conforme calendário. Publicar conteúdo orgânico nas redes do empreendimento e do cliente (teasers, countdown, bastidores). Monitorar engajamento e responder comentários.

Responsável: Rafa / Lucca + Analista de Marketing

Output: Publicações realizadas conforme calendário com registro de métricas de engajamento.

Prazo referência: Conforme calendário de conteúdo

5.4. Monitoramento Diário e Otimização

Ação: Revisar diariamente: custo por lead, volume de leads, CTR, frequência de anúncios, qualidade dos leads (taxa de resposta no CRM). Realizar otimizações: pausar criativos com baixo desempenho, ajustar lances, testar novos públicos.

Responsável: Especialista em Tráfego

Output: Log diário de otimizações na planilha de monitoramento.

Prazo referência: Diário durante os 45 dias

5.5. Relatório Semanal de Performance

Ação: Compilar relatório semanal com evolução dos KPIs: leads acumulados vs. meta, CPL por canal, distribuição por público, principais criativos, aprendizados e próximos ajustes. Enviar ao cliente toda segunda-feira.

Responsável: Analista de Marketing

Output: Relatório semanal enviado ao cliente com análise e recomendações.

Prazo referência: Toda segunda-feira

5.6. Preparação da Base para o Lançamento

Ação: Nos 7 dias anteriores ao lançamento: intensificar campanhas, enviar e-mail de convite ao evento para toda a base, ativar fluxo de nutrição intensivo no RD Station, preparar relatório de status da base para o time comercial.

Responsável: Rafa / Lucca

Output: Relatório de base de leads para BU Comercial: volume, segmentação por temperatura, histórico de interações.

Prazo referência: D-7 antes do lançamento

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Rastreamento validado antes de ativar campanhas; meta de leads da fase >80% atingida ao fim dos 45 dias; relatórios semanais enviados sem atraso; log de otimizações completo; base entregue ao comercial com segmentação de temperatura.

6.2 Erros Comuns a Evitar

Campanhas ativadas sem validar rastreamento; otimizações apenas semanais (devem ser diárias); relatório semanal sem recomendações práticas; base entregue ao comercial sem segmentação por temperatura de interesse.

  7. Ferramentas e Templates

Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO, Notion.

  8. SLAs e Prazos

Setup: D-45 (dia 1 da fase); primeiros leads em 48h após ativação; relatório semanal toda segunda-feira; entrega de base ao comercial: D-7 do lançamento.

  9. Fluxograma

Início → Setup campanhas + LP → Validação rastreamento → Ativação campanhas → Conteúdo orgânico e influenciadores → Monitoramento diário → Relatório semanal → Intensificação (D-7) → Entrega base ao comercial → Fim da fase

  10. Glossário

LP: Landing Page. CRM: Customer Relationship Management (RD Station). Pixel: código de rastreamento do Meta. Temperatura de lead: classificação por nível de interesse (quente, morno, frio). Frequência: média de vezes que o mesmo usuário viu o anúncio.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marketing','campanha']::TEXT[], 3, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Executar a fase de pré-lançamento da campanha imobiliária nos 45 dias anteriores ao evento de lançamento, construindo base de leads qualificados, gerando expectativa e preparando todos os ativos digitais para o lançamento.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Ativação de campanhas de captura de leads, construção de landing page, aquecimento de base, ativação de influenciadores, monitoramento de performance e otimização diária de campanhas.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Evento de lançamento presencial (BU Eventos), produção de criativos (BU Criação), gestão de relacionamento pós-visita (BU Comercial).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Lidera execução da fase

Marco Andolfato

Cliente, BU Comercial

Especialista em Tráfego

Opera campanhas pagas diariamente

Rafa / Lucca

Analista de Marketing

Analista de Marketing

Monitora KPIs e prepara relatório semanal

Rafa / Lucca

Cliente', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plano de Mídias aprovado (MKT-03); criativos da fase pré-lançamento entregues e aprovados (BU Criação); landing page da campanha desenvolvida e testada; URL de rastreamento configurada; RD Station configurado com fluxo de nutrição.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Setup e Ativação das Campanhas', 'Ação: Configurar todas as campanhas no Meta Ads e Google Ads conforme plano de mídias: criar públicos, carregar criativos, definir objetivos de campanha (conversão/leads), configurar pixel e tags de rastreamento. Testar fluxo completo lead → CRM antes de ativar.

Responsável: Especialista em Tráfego

Output: Campanhas ativas com rastreamento validado e leads chegando ao RD Station.

Prazo referência: D-45 (início da fase)', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Validação da Landing Page e Rastreamento', 'Ação: Validar landing page com checklist: velocidade (PageSpeed >80), formulário funcionando, pixel disparando, GA4 registrando eventos, Hotjar gravando sessões, responsividade mobile.

Responsável: Analista de Marketing + Especialista em Tráfego

Output: Checklist de validação 100% aprovado. Hotjar e GA4 confirmados.

Prazo referência: D-45', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Ativação de Influenciadores e Conteúdo Orgânico', 'Ação: Coordenar publicações dos influenciadores contratados conforme calendário. Publicar conteúdo orgânico nas redes do empreendimento e do cliente (teasers, countdown, bastidores). Monitorar engajamento e responder comentários.

Responsável: Rafa / Lucca + Analista de Marketing

Output: Publicações realizadas conforme calendário com registro de métricas de engajamento.

Prazo referência: Conforme calendário de conteúdo', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Monitoramento Diário e Otimização', 'Ação: Revisar diariamente: custo por lead, volume de leads, CTR, frequência de anúncios, qualidade dos leads (taxa de resposta no CRM). Realizar otimizações: pausar criativos com baixo desempenho, ajustar lances, testar novos públicos.

Responsável: Especialista em Tráfego

Output: Log diário de otimizações na planilha de monitoramento.

Prazo referência: Diário durante os 45 dias', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Relatório Semanal de Performance', 'Ação: Compilar relatório semanal com evolução dos KPIs: leads acumulados vs. meta, CPL por canal, distribuição por público, principais criativos, aprendizados e próximos ajustes. Enviar ao cliente toda segunda-feira.

Responsável: Analista de Marketing

Output: Relatório semanal enviado ao cliente com análise e recomendações.

Prazo referência: Toda segunda-feira', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Preparação da Base para o Lançamento', 'Ação: Nos 7 dias anteriores ao lançamento: intensificar campanhas, enviar e-mail de convite ao evento para toda a base, ativar fluxo de nutrição intensivo no RD Station, preparar relatório de status da base para o time comercial.

Responsável: Rafa / Lucca

Output: Relatório de base de leads para BU Comercial: volume, segmentação por temperatura, histórico de interações.

Prazo referência: D-7 antes do lançamento', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Rastreamento validado antes de ativar campanhas; meta de leads da fase >80% atingida ao fim dos 45 dias; relatórios semanais enviados sem atraso; log de otimizações completo; base entregue ao comercial com segmentação de temperatura.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Campanhas ativadas sem validar rastreamento; otimizações apenas semanais (devem ser diárias); relatório semanal sem recomendações práticas; base entregue ao comercial sem segmentação por temperatura de interesse.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO, Notion.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Setup: D-45 (dia 1 da fase); primeiros leads em 48h após ativação; relatório semanal toda segunda-feira; entrega de base ao comercial: D-7 do lançamento.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Setup campanhas + LP → Validação rastreamento → Ativação campanhas → Conteúdo orgânico e influenciadores → Monitoramento diário → Relatório semanal → Intensificação (D-7) → Entrega base ao comercial → Fim da fase', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'LP: Landing Page. CRM: Customer Relationship Management (RD Station). Pixel: código de rastreamento do Meta. Temperatura de lead: classificação por nível de interesse (quente, morno, frio). Frequência: média de vezes que o mesmo usuário viu o anúncio.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-MKT-005
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Gestão de Campanha Lançamento 120d', 'tbo-mkt-005-gestao-de-campanha-lancamento-120d', 'marketing', 'checklist', 'Gestão de Campanha — Lançamento (120d)', 'Standard Operating Procedure

Gestão de Campanha — Lançamento (120d)

Código

TBO-MKT-005

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Marketing

Responsável

Rafa (PO Marketing)

Aprovador

Marco Andolfato



  1. Objetivo

Executar a fase de lançamento da campanha imobiliária nos 120 dias após o evento de lançamento, maximizando a conversão de leads em visitas e propostas, mantendo volume de leads qualificados e ajustando estratégia conforme velocidade de vendas.

  2. Escopo

2.1 O que está coberto

Operação intensiva de mídia paga, nutrição da base de leads, produção de conteúdo de prova social, ajuste de segmentações conforme perfil de compradores, interface diária com time comercial.

2.2 Exclusões

Gestão do processo de vendas (BU Comercial), produção de criativos sob demanda (BU Criação), eventos presenciais de vendas (BU Eventos).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Lidera estratégia e otimização da fase

Marco Andolfato

Cliente, BU Comercial

Especialista em Tráfego

Opera campanhas e otimizações diárias

Rafa / Lucca

Analista de Marketing

Analista de Marketing

Monitora KPIs, relatório quinzenal e nutrição

Rafa / Lucca

Cliente

  4. Pré-requisitos

4.1 Inputs necessários

Base de leads da fase pré-lançamento; dados do evento de lançamento (leads gerados, vendas realizadas, perfil dos compradores); criativos pós-lançamento aprovados; budget da fase confirmado.

4.2 Ferramentas e Acessos

Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Hotjar, planilha de performance TBO, dashboard de campanha.



  5. Procedimento Passo a Passo

5.1. Reconfiguração de Campanhas Pós-Lançamento

Ação: Atualizar campanhas com criativos do lançamento (fotos do evento, depoimentos, unidades disponíveis). Reampliar alcance para públicos frios. Criar campanha de remarketing para leads que não compraram. Ajustar budget conforme performance do evento.

Responsável: Especialista em Tráfego

Output: Campanhas atualizadas ativas com novos criativos e segmentações revisadas.

Prazo referência: D+1 a D+3 após evento

5.2. Revisão Quinzenal de Estratégia com Comercial

Ação: Realizar reunião quinzenal com BU Comercial para: alinhamento de volume e qualidade de leads, feedbacks sobre perfil de compradores, ajuste de segmentações, revisão de scripts de abordagem de leads do marketing.

Responsável: Rafa / Lucca + BU Comercial

Output: Ata de reunião com ajustes acordados e implementados nas campanhas.

Prazo referência: A cada 15 dias

5.3. Nutrição da Base e E-mail Marketing

Ação: Operar fluxos de nutrição no RD Station: envio de conteúdos de valor (tour virtual, plant tour, vídeo do empreendimento), cases de clientes, urgência de unidades disponíveis. Monitorar taxa de abertura, cliques e conversões.

Responsável: Analista de Marketing

Output: Fluxos de nutrição ativos com relatório mensal de performance de e-mail.

Prazo referência: Contínuo durante 120 dias

5.4. Produção e Ativação de Prova Social

Ação: Coordenar produção de depoimentos de primeiros compradores, vídeos de visita à obra, posts de reconhecimento de clientes. Usar como criativos em campanhas pagas e orgânico para reduzir objeções.

Responsável: Rafa / Lucca + BU Criação

Output: Peças de prova social publicadas e ativadas como criativos em campanhas.

Prazo referência: A partir de D+30

5.5. Otimização Contínua de Campanhas

Ação: Manter rotina diária de otimização: pausar anúncios com frequência >3 ou CTR abaixo do benchmark, testar novos criativos a cada 3 semanas, ajustar segmentações conforme perfil dos compradores efetivos, redistribuir budget para canais com menor CPL.

Responsável: Especialista em Tráfego

Output: Log de otimizações atualizado diariamente. Benchmark de CPL por canal atualizado semanalmente.

Prazo referência: Diário

5.6. Relatório Quinzenal e Gestão de Performance

Ação: Elaborar relatório quinzenal com: leads gerados vs. meta, CPL por canal, funil de conversão (lead→visita→proposta→venda), velocidade de vendas, estoque restante, projeção de encerramento da fase.

Responsável: Analista de Marketing

Output: Relatório quinzenal enviado ao cliente com análise e recomendações de ajuste.

Prazo referência: A cada 15 dias

5.7. Avaliação de Transição para Sustentação

Ação: Ao atingir 75% das unidades vendidas ou ao fim dos 120 dias, avaliar com cliente e BU Comercial a necessidade de transição para fase de sustentação. Documentar aprendizados e KPIs finais da fase.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Decisão documentada sobre transição + relatório de encerramento da fase de lançamento.

Prazo referência: D+110 a D+120

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Campanhas atualizadas em 72h após evento de lançamento; reuniões quinzenais com comercial realizadas e documentadas; fluxos de nutrição ativos durante toda a fase; relatórios quinzenais sem atraso; log de otimizações diário completo.

6.2 Erros Comuns a Evitar

Manter os mesmos criativos do pré-lançamento sem atualização; ausência de integração com comercial; nutrição pausada após evento; relatório apenas com dados sem análise e recomendações.

  7. Ferramentas e Templates

Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Hotjar, planilha de performance TBO, dashboard de campanha TBO.

  8. SLAs e Prazos

Atualização de campanhas pós-evento: D+3; reuniões com comercial: quinzenais; relatório quinzenal: até 2 dias após fechamento da quinzena; avaliação de transição: D+110.

  9. Fluxograma

Início → Reconfiguração pós-evento → Ativação campanhas de lançamento → Nutrição base → Reunião quinzenal comercial → Otimização diária → Prova social → Relatório quinzenal → Avaliação transição → Fim da fase

  10. Glossário

Prova social: depoimentos e evidências de compras realizadas. Remarketing: campanhas direcionadas a usuários que já interagiram. Velocidade de vendas: número de unidades vendidas por período. Funil de conversão: proporção de leads que avançam em cada etapa.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marketing','campanha']::TEXT[], 4, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Executar a fase de lançamento da campanha imobiliária nos 120 dias após o evento de lançamento, maximizando a conversão de leads em visitas e propostas, mantendo volume de leads qualificados e ajustando estratégia conforme velocidade de vendas.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Operação intensiva de mídia paga, nutrição da base de leads, produção de conteúdo de prova social, ajuste de segmentações conforme perfil de compradores, interface diária com time comercial.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Gestão do processo de vendas (BU Comercial), produção de criativos sob demanda (BU Criação), eventos presenciais de vendas (BU Eventos).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Lidera estratégia e otimização da fase

Marco Andolfato

Cliente, BU Comercial

Especialista em Tráfego

Opera campanhas e otimizações diárias

Rafa / Lucca

Analista de Marketing

Analista de Marketing

Monitora KPIs, relatório quinzenal e nutrição

Rafa / Lucca

Cliente', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Base de leads da fase pré-lançamento; dados do evento de lançamento (leads gerados, vendas realizadas, perfil dos compradores); criativos pós-lançamento aprovados; budget da fase confirmado.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Hotjar, planilha de performance TBO, dashboard de campanha.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Reconfiguração de Campanhas Pós-Lançamento', 'Ação: Atualizar campanhas com criativos do lançamento (fotos do evento, depoimentos, unidades disponíveis). Reampliar alcance para públicos frios. Criar campanha de remarketing para leads que não compraram. Ajustar budget conforme performance do evento.

Responsável: Especialista em Tráfego

Output: Campanhas atualizadas ativas com novos criativos e segmentações revisadas.

Prazo referência: D+1 a D+3 após evento', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Revisão Quinzenal de Estratégia com Comercial', 'Ação: Realizar reunião quinzenal com BU Comercial para: alinhamento de volume e qualidade de leads, feedbacks sobre perfil de compradores, ajuste de segmentações, revisão de scripts de abordagem de leads do marketing.

Responsável: Rafa / Lucca + BU Comercial

Output: Ata de reunião com ajustes acordados e implementados nas campanhas.

Prazo referência: A cada 15 dias', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Nutrição da Base e E-mail Marketing', 'Ação: Operar fluxos de nutrição no RD Station: envio de conteúdos de valor (tour virtual, plant tour, vídeo do empreendimento), cases de clientes, urgência de unidades disponíveis. Monitorar taxa de abertura, cliques e conversões.

Responsável: Analista de Marketing

Output: Fluxos de nutrição ativos com relatório mensal de performance de e-mail.

Prazo referência: Contínuo durante 120 dias', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Produção e Ativação de Prova Social', 'Ação: Coordenar produção de depoimentos de primeiros compradores, vídeos de visita à obra, posts de reconhecimento de clientes. Usar como criativos em campanhas pagas e orgânico para reduzir objeções.

Responsável: Rafa / Lucca + BU Criação

Output: Peças de prova social publicadas e ativadas como criativos em campanhas.

Prazo referência: A partir de D+30', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Otimização Contínua de Campanhas', 'Ação: Manter rotina diária de otimização: pausar anúncios com frequência >3 ou CTR abaixo do benchmark, testar novos criativos a cada 3 semanas, ajustar segmentações conforme perfil dos compradores efetivos, redistribuir budget para canais com menor CPL.

Responsável: Especialista em Tráfego

Output: Log de otimizações atualizado diariamente. Benchmark de CPL por canal atualizado semanalmente.

Prazo referência: Diário', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Relatório Quinzenal e Gestão de Performance', 'Ação: Elaborar relatório quinzenal com: leads gerados vs. meta, CPL por canal, funil de conversão (lead→visita→proposta→venda), velocidade de vendas, estoque restante, projeção de encerramento da fase.

Responsável: Analista de Marketing

Output: Relatório quinzenal enviado ao cliente com análise e recomendações de ajuste.

Prazo referência: A cada 15 dias', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.7. Avaliação de Transição para Sustentação', 'Ação: Ao atingir 75% das unidades vendidas ou ao fim dos 120 dias, avaliar com cliente e BU Comercial a necessidade de transição para fase de sustentação. Documentar aprendizados e KPIs finais da fase.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Decisão documentada sobre transição + relatório de encerramento da fase de lançamento.

Prazo referência: D+110 a D+120', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Campanhas atualizadas em 72h após evento de lançamento; reuniões quinzenais com comercial realizadas e documentadas; fluxos de nutrição ativos durante toda a fase; relatórios quinzenais sem atraso; log de otimizações diário completo.', 13, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Manter os mesmos criativos do pré-lançamento sem atualização; ausência de integração com comercial; nutrição pausada após evento; relatório apenas com dados sem análise e recomendações.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Hotjar, planilha de performance TBO, dashboard de campanha TBO.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Atualização de campanhas pós-evento: D+3; reuniões com comercial: quinzenais; relatório quinzenal: até 2 dias após fechamento da quinzena; avaliação de transição: D+110.', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Reconfiguração pós-evento → Ativação campanhas de lançamento → Nutrição base → Reunião quinzenal comercial → Otimização diária → Prova social → Relatório quinzenal → Avaliação transição → Fim da fase', 17, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Prova social: depoimentos e evidências de compras realizadas. Remarketing: campanhas direcionadas a usuários que já interagiram. Velocidade de vendas: número de unidades vendidas por período. Funil de conversão: proporção de leads que avançam em cada etapa.', 18, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 19, 'step');

  -- TBO-MKT-006
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Gestão de Campanha Sustentação 120d', 'tbo-mkt-006-gestao-de-campanha-sustentacao-120d', 'marketing', 'checklist', 'Gestão de Campanha — Sustentação (120d)', 'Standard Operating Procedure

Gestão de Campanha — Sustentação (120d)

Código

TBO-MKT-006

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Marketing

Responsável

Rafa (PO Marketing)

Aprovador

Marco Andolfato



  1. Objetivo

Manter a performance de vendas do empreendimento na fase de sustentação, gerenciando a comunicação de estoque restante, reativando leads frios e maximizando a conversão das últimas unidades disponíveis.

  2. Escopo

2.1 O que está coberto

Operação de campanhas de estoque final, reativação de base de leads, comunicação de urgência e escassez, ajuste de mix de mídia para maior eficiência de custo, relatórios de encerramento.

2.2 Exclusões

Estratégia de precificação das últimas unidades (Incorporadora/Comercial), negociações com compradores (BU Comercial).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Lidera estratégia de sustentação

Marco Andolfato

Cliente, BU Comercial

Especialista em Tráfego

Opera campanhas e otimizações

Rafa / Lucca

Analista de Marketing

Analista de Marketing

Monitora leads, reativação e relatórios

Rafa / Lucca

Cliente

  4. Pré-requisitos

4.1 Inputs necessários

Relatório de encerramento da fase de lançamento; estoque atualizado de unidades disponíveis; budget da fase de sustentação confirmado; lista de leads não convertidos da base.

4.2 Ferramentas e Acessos

Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, planilha de estoque de unidades.



  5. Procedimento Passo a Passo

5.1. Reconfiguração de Campanhas para Sustentação

Ação: Reduzir volume total de campanhas e focar em canais com menor CPL histórico. Criar campanha específica de estoque final com comunicação de urgência e escassez (unidades disponíveis, planta, preço). Pausar campanhas de awareness puro.

Responsável: Especialista em Tráfego

Output: Campanhas de sustentação ativas com novo posicionamento de estoque.

Prazo referência: D+1 a D+5 após início da fase

5.2. Campanha de Reativação da Base de Leads

Ação: Segmentar toda a base de leads não convertidos no RD Station por temperatura e motivo de não compra. Criar fluxo de reativação com nova oferta (condições especiais, unidades premium disponíveis, nova visita). Ativar e-mail + WhatsApp (se disponível).

Responsável: Analista de Marketing

Output: Fluxo de reativação ativo com meta de recuperação de 10-15% da base.

Prazo referência: D+7

5.3. Comunicação de Escassez e Urgência

Ação: Atualizar criativos semanalmente com informações de estoque real (ex.: ''últimas 8 unidades'', ''tipo X esgotado''). Criar senso de urgência genuíno baseado em dados reais. Coordenar com BU Criação para peças atualizadas.

Responsável: Rafa / Lucca

Output: Criativos de urgência atualizados semanalmente alinhados com estoque real.

Prazo referência: Semanal

5.4. Otimização de Budget para Eficiência

Ação: Revisar distribuição de budget quinzenalmente. Concentrar recursos em canais com melhor CPL histórico do empreendimento. Testar canais alternativos de menor custo (ex.: portais imobiliários orgânico, SEO local). Reduzir gradualmente o volume conforme estoque diminui.

Responsável: Especialista em Tráfego

Output: Budget redistribuído com foco em eficiência de custo. CPL da fase controlado.

Prazo referência: A cada 15 dias

5.5. Relatório Mensal de Sustentação

Ação: Elaborar relatório mensal com: unidades vendidas no período, estoque restante, leads gerados, CPL, taxa de reativação de leads antigos, projeção de encerramento total de vendas.

Responsável: Analista de Marketing

Output: Relatório mensal enviado ao cliente com projeção de encerramento.

Prazo referência: Mensal

5.6. Encerramento da Campanha

Ação: Ao vender última unidade ou ao fim dos 120 dias: pausar todas as campanhas, exportar dados completos de performance, elaborar relatório final de campanha (do início ao fim), documentar aprendizados para próximos produtos.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Relatório final completo do ciclo da campanha. Aprendizados documentados no Notion.

Prazo referência: Em até 7 dias após última unidade vendida ou D+120

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Campanhas reconfiguradas dentro de 5 dias do início da fase; fluxo de reativação ativo; criativos de urgência com dados reais (não fictícios); budget reduzido proporcionalmente ao estoque restante; relatório final entregue ao cliente.

6.2 Erros Comuns a Evitar

Manter volume de campanhas igual ao lançamento sem ajuste de eficiência; comunicar urgência sem embasamento em estoque real; não reativar base de leads não convertidos; encerrar campanha sem relatório final documentado.

  7. Ferramentas e Templates

Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, planilha de estoque de unidades, Notion (documentação de aprendizados).

  8. SLAs e Prazos

Reconfiguração: D+5; fluxo de reativação: D+7; relatório mensal: até dia 5 do mês seguinte; relatório final: 7 dias após encerramento.

  9. Fluxograma

Início → Reconfiguração campanhas sustentação → Reativação base de leads → Comunicação de escassez → Otimização budget → Relatório mensal → Revisão quinzenal com comercial → Encerramento e relatório final → Fim

  10. Glossário

Estoque: unidades disponíveis para venda. Reativação: ações para reengajar leads que não responderam anteriormente. Escassez: comunicação baseada em disponibilidade limitada real. CPL: Custo por Lead.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marketing','campanha']::TEXT[], 5, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Manter a performance de vendas do empreendimento na fase de sustentação, gerenciando a comunicação de estoque restante, reativando leads frios e maximizando a conversão das últimas unidades disponíveis.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Operação de campanhas de estoque final, reativação de base de leads, comunicação de urgência e escassez, ajuste de mix de mídia para maior eficiência de custo, relatórios de encerramento.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Estratégia de precificação das últimas unidades (Incorporadora/Comercial), negociações com compradores (BU Comercial).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Lidera estratégia de sustentação

Marco Andolfato

Cliente, BU Comercial

Especialista em Tráfego

Opera campanhas e otimizações

Rafa / Lucca

Analista de Marketing

Analista de Marketing

Monitora leads, reativação e relatórios

Rafa / Lucca

Cliente', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Relatório de encerramento da fase de lançamento; estoque atualizado de unidades disponíveis; budget da fase de sustentação confirmado; lista de leads não convertidos da base.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, planilha de estoque de unidades.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Reconfiguração de Campanhas para Sustentação', 'Ação: Reduzir volume total de campanhas e focar em canais com menor CPL histórico. Criar campanha específica de estoque final com comunicação de urgência e escassez (unidades disponíveis, planta, preço). Pausar campanhas de awareness puro.

Responsável: Especialista em Tráfego

Output: Campanhas de sustentação ativas com novo posicionamento de estoque.

Prazo referência: D+1 a D+5 após início da fase', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Campanha de Reativação da Base de Leads', 'Ação: Segmentar toda a base de leads não convertidos no RD Station por temperatura e motivo de não compra. Criar fluxo de reativação com nova oferta (condições especiais, unidades premium disponíveis, nova visita). Ativar e-mail + WhatsApp (se disponível).

Responsável: Analista de Marketing

Output: Fluxo de reativação ativo com meta de recuperação de 10-15% da base.

Prazo referência: D+7', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Comunicação de Escassez e Urgência', 'Ação: Atualizar criativos semanalmente com informações de estoque real (ex.: ''últimas 8 unidades'', ''tipo X esgotado''). Criar senso de urgência genuíno baseado em dados reais. Coordenar com BU Criação para peças atualizadas.

Responsável: Rafa / Lucca

Output: Criativos de urgência atualizados semanalmente alinhados com estoque real.

Prazo referência: Semanal', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Otimização de Budget para Eficiência', 'Ação: Revisar distribuição de budget quinzenalmente. Concentrar recursos em canais com melhor CPL histórico do empreendimento. Testar canais alternativos de menor custo (ex.: portais imobiliários orgânico, SEO local). Reduzir gradualmente o volume conforme estoque diminui.

Responsável: Especialista em Tráfego

Output: Budget redistribuído com foco em eficiência de custo. CPL da fase controlado.

Prazo referência: A cada 15 dias', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Relatório Mensal de Sustentação', 'Ação: Elaborar relatório mensal com: unidades vendidas no período, estoque restante, leads gerados, CPL, taxa de reativação de leads antigos, projeção de encerramento total de vendas.

Responsável: Analista de Marketing

Output: Relatório mensal enviado ao cliente com projeção de encerramento.

Prazo referência: Mensal', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Encerramento da Campanha', 'Ação: Ao vender última unidade ou ao fim dos 120 dias: pausar todas as campanhas, exportar dados completos de performance, elaborar relatório final de campanha (do início ao fim), documentar aprendizados para próximos produtos.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Relatório final completo do ciclo da campanha. Aprendizados documentados no Notion.

Prazo referência: Em até 7 dias após última unidade vendida ou D+120', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Campanhas reconfiguradas dentro de 5 dias do início da fase; fluxo de reativação ativo; criativos de urgência com dados reais (não fictícios); budget reduzido proporcionalmente ao estoque restante; relatório final entregue ao cliente.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Manter volume de campanhas igual ao lançamento sem ajuste de eficiência; comunicar urgência sem embasamento em estoque real; não reativar base de leads não convertidos; encerrar campanha sem relatório final documentado.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, planilha de estoque de unidades, Notion (documentação de aprendizados).', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Reconfiguração: D+5; fluxo de reativação: D+7; relatório mensal: até dia 5 do mês seguinte; relatório final: 7 dias após encerramento.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Reconfiguração campanhas sustentação → Reativação base de leads → Comunicação de escassez → Otimização budget → Relatório mensal → Revisão quinzenal com comercial → Encerramento e relatório final → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Estoque: unidades disponíveis para venda. Reativação: ações para reengajar leads que não responderam anteriormente. Escassez: comunicação baseada em disponibilidade limitada real. CPL: Custo por Lead.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-MKT-007
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Gestão de Influenciadores', 'tbo-mkt-007-gestao-de-influenciadores', 'marketing', 'checklist', 'Selecionar, contratar, briefar e gerenciar influenciadores digitais para amplificar o alcance das campanhas imobiliárias, gerando prova social, expectativa e credibilidade para o empreendimento.', 'Standard Operating Procedure

Gestão de Influenciadores

Código

TBO-MKT-007

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Marketing

Responsável

Rafa (PO Marketing)

Aprovador

Marco Andolfato



  1. Objetivo

Selecionar, contratar, briefar e gerenciar influenciadores digitais para amplificar o alcance das campanhas imobiliárias, gerando prova social, expectativa e credibilidade para o empreendimento.

  2. Escopo

2.1 O que está coberto

Prospecção e seleção de influenciadores, negociação e contrato, briefing de conteúdo, aprovação de posts, monitoramento de performance e pagamento.

2.2 Exclusões

Produção de criativos institucionais (BU Criação), gestão de mídia paga com impulsionamento de posts de influenciadores (MKT-09).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Lidera seleção, negociação e gestão

Marco Andolfato

Cliente, Jurídico

Analista de Marketing

Monitora publicações, engajamento e pagamentos

Rafa / Lucca

Influenciador

Jurídico / Financeiro TBO

Valida contrato e processa pagamento

Marco Andolfato

Rafa / Lucca

  4. Pré-requisitos

4.1 Inputs necessários

Plano de Marketing aprovado (MKT-02) com budget de influenciadores definido; briefing do produto; personas do empreendimento; calendário de ativação.

4.2 Ferramentas e Acessos

Instagram Insights, YouTube Analytics, HypeAuditor (ou similar), planilha de gestão de influenciadores TBO, Notion, contrato-padrão TBO.



  5. Procedimento Passo a Passo

5.1. Prospecção e Seleção de Influenciadores

Ação: Mapear influenciadores alinhados às personas do produto: segmento (arquitetura, lifestyle, imóveis, família, luxo), localização geográfica, faixa de seguidores (macro: >100k, micro: 10k-100k, nano: 1k-10k). Analisar taxa de engajamento real, autenticidade de audiência (sem compra de seguidores) e histórico de parcerias.

Responsável: Rafa / Lucca + Analista de Marketing

Output: Shortlist de 5-10 influenciadores com análise de métricas e alinhamento à persona.

Prazo referência: D+5 após aprovação do plano

5.2. Negociação e Contratação

Ação: Entrar em contato com influenciadores selecionados (via direct, e-mail ou assessoria). Negociar formato de entrega, número de posts, janela de exclusividade, valor. Formalizar via contrato-padrão TBO com cláusula de aprovação prévia de conteúdo.

Responsável: Rafa / Lucca

Output: Contratos assinados com todos os influenciadores da campanha.

Prazo referência: D+12

5.3. Briefing de Conteúdo

Ação: Elaborar briefing por influenciador: mensagens obrigatórias, tom de voz, produtos/cômodos a destacar, hashtags, menções obrigatórias, data de publicação, formato (stories, reels, feed, YouTube). Incluir o que NÃO deve ser comunicado (preço, condições, concorrentes).

Responsável: Rafa / Lucca

Output: Briefing individual por influenciador aprovado pelo cliente.

Prazo referência: D+15

5.4. Aprovação de Conteúdo Antes da Publicação

Ação: Receber rascunho/roteiro de cada conteúdo antes da publicação. Revisar aderência ao briefing, mensagens obrigatórias, tom. Solicitar ajustes se necessário. Aprovar formalmente antes de publicar.

Responsável: Rafa / Lucca

Output: Conteúdo aprovado documentado por influenciador (print ou e-mail de aprovação).

Prazo referência: 48h antes da publicação prevista

5.5. Monitoramento de Publicações e Performance

Ação: Após publicação: registrar métricas nas primeiras 24h (alcance, impressões, engajamento, cliques no link, stories swipe-up). Solicitar print de insights direto do influenciador. Registrar na planilha de gestão.

Responsável: Analista de Marketing

Output: Planilha de performance de influenciadores atualizada por publicação.

Prazo referência: 24-48h após cada publicação

5.6. Gestão de Pagamento e Encerramento

Ação: Após entrega completa e validação das métricas, encaminhar para financeiro para pagamento conforme contrato. Documentar performance final de cada influenciador para base de dados de influenciadores TBO.

Responsável: Analista de Marketing + Financeiro TBO

Output: Pagamento processado e ficha do influenciador atualizada no banco de dados TBO.

Prazo referência: Conforme prazo contratual

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Influenciadores selecionados com análise de autenticidade de audiência; contrato assinado antes de qualquer publicação; briefing individual por influenciador; aprovação prévia de 100% dos conteúdos; métricas coletadas e registradas; pagamento somente após entrega validada.

6.2 Erros Comuns a Evitar

Selecionar influenciadores por número de seguidores sem analisar engajamento real; publicar sem contrato; não ter aprovação prévia de conteúdo; pagar antes de receber métricas; não registrar performance para base de dados futura.

  7. Ferramentas e Templates

HypeAuditor (ou similar para análise de audiência), Instagram Insights, YouTube Analytics, planilha de gestão de influenciadores TBO, contrato-padrão TBO, Notion.

  8. SLAs e Prazos

Shortlist: D+5; contratos: D+12; briefings: D+15; aprovação de conteúdo: 48h antes da publicação; métricas: 48h após publicação; pagamento: conforme contrato.

  9. Fluxograma

Início → Prospecção e análise → Shortlist → Negociação → Contrato → Briefing → Recebimento de rascunho → Aprovação → Publicação → Coleta de métricas → Validação → Pagamento → Fim

  10. Glossário

Micro-influenciador: perfil com 10k-100k seguidores. Taxa de engajamento: percentual de seguidores que interagem com o conteúdo. Swipe-up: ação de arrastar no stories para acessar link. Exclusividade: período em que o influenciador não pode promover concorrentes.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marketing','campanha']::TEXT[], 6, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Selecionar, contratar, briefar e gerenciar influenciadores digitais para amplificar o alcance das campanhas imobiliárias, gerando prova social, expectativa e credibilidade para o empreendimento.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Prospecção e seleção de influenciadores, negociação e contrato, briefing de conteúdo, aprovação de posts, monitoramento de performance e pagamento.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de criativos institucionais (BU Criação), gestão de mídia paga com impulsionamento de posts de influenciadores (MKT-09).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Lidera seleção, negociação e gestão

Marco Andolfato

Cliente, Jurídico

Analista de Marketing

Monitora publicações, engajamento e pagamentos

Rafa / Lucca

Influenciador

Jurídico / Financeiro TBO

Valida contrato e processa pagamento

Marco Andolfato

Rafa / Lucca', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plano de Marketing aprovado (MKT-02) com budget de influenciadores definido; briefing do produto; personas do empreendimento; calendário de ativação.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Instagram Insights, YouTube Analytics, HypeAuditor (ou similar), planilha de gestão de influenciadores TBO, Notion, contrato-padrão TBO.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Prospecção e Seleção de Influenciadores', 'Ação: Mapear influenciadores alinhados às personas do produto: segmento (arquitetura, lifestyle, imóveis, família, luxo), localização geográfica, faixa de seguidores (macro: >100k, micro: 10k-100k, nano: 1k-10k). Analisar taxa de engajamento real, autenticidade de audiência (sem compra de seguidores) e histórico de parcerias.

Responsável: Rafa / Lucca + Analista de Marketing

Output: Shortlist de 5-10 influenciadores com análise de métricas e alinhamento à persona.

Prazo referência: D+5 após aprovação do plano', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Negociação e Contratação', 'Ação: Entrar em contato com influenciadores selecionados (via direct, e-mail ou assessoria). Negociar formato de entrega, número de posts, janela de exclusividade, valor. Formalizar via contrato-padrão TBO com cláusula de aprovação prévia de conteúdo.

Responsável: Rafa / Lucca

Output: Contratos assinados com todos os influenciadores da campanha.

Prazo referência: D+12', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Briefing de Conteúdo', 'Ação: Elaborar briefing por influenciador: mensagens obrigatórias, tom de voz, produtos/cômodos a destacar, hashtags, menções obrigatórias, data de publicação, formato (stories, reels, feed, YouTube). Incluir o que NÃO deve ser comunicado (preço, condições, concorrentes).

Responsável: Rafa / Lucca

Output: Briefing individual por influenciador aprovado pelo cliente.

Prazo referência: D+15', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Aprovação de Conteúdo Antes da Publicação', 'Ação: Receber rascunho/roteiro de cada conteúdo antes da publicação. Revisar aderência ao briefing, mensagens obrigatórias, tom. Solicitar ajustes se necessário. Aprovar formalmente antes de publicar.

Responsável: Rafa / Lucca

Output: Conteúdo aprovado documentado por influenciador (print ou e-mail de aprovação).

Prazo referência: 48h antes da publicação prevista', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Monitoramento de Publicações e Performance', 'Ação: Após publicação: registrar métricas nas primeiras 24h (alcance, impressões, engajamento, cliques no link, stories swipe-up). Solicitar print de insights direto do influenciador. Registrar na planilha de gestão.

Responsável: Analista de Marketing

Output: Planilha de performance de influenciadores atualizada por publicação.

Prazo referência: 24-48h após cada publicação', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Gestão de Pagamento e Encerramento', 'Ação: Após entrega completa e validação das métricas, encaminhar para financeiro para pagamento conforme contrato. Documentar performance final de cada influenciador para base de dados de influenciadores TBO.

Responsável: Analista de Marketing + Financeiro TBO

Output: Pagamento processado e ficha do influenciador atualizada no banco de dados TBO.

Prazo referência: Conforme prazo contratual', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Influenciadores selecionados com análise de autenticidade de audiência; contrato assinado antes de qualquer publicação; briefing individual por influenciador; aprovação prévia de 100% dos conteúdos; métricas coletadas e registradas; pagamento somente após entrega validada.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Selecionar influenciadores por número de seguidores sem analisar engajamento real; publicar sem contrato; não ter aprovação prévia de conteúdo; pagar antes de receber métricas; não registrar performance para base de dados futura.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'HypeAuditor (ou similar para análise de audiência), Instagram Insights, YouTube Analytics, planilha de gestão de influenciadores TBO, contrato-padrão TBO, Notion.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Shortlist: D+5; contratos: D+12; briefings: D+15; aprovação de conteúdo: 48h antes da publicação; métricas: 48h após publicação; pagamento: conforme contrato.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Prospecção e análise → Shortlist → Negociação → Contrato → Briefing → Recebimento de rascunho → Aprovação → Publicação → Coleta de métricas → Validação → Pagamento → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Micro-influenciador: perfil com 10k-100k seguidores. Taxa de engajamento: percentual de seguidores que interagem com o conteúdo. Swipe-up: ação de arrastar no stories para acessar link. Exclusividade: período em que o influenciador não pode promover concorrentes.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-MKT-008
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'E mail Marketing', 'tbo-mkt-008-e-mail-marketing', 'marketing', 'checklist', 'Planejar, criar, segmentar e disparar campanhas de e-mail marketing para nutrição de leads, comunicação de marcos da campanha e reengajamento de base ao longo de todo o ciclo do empreendimento.', 'Standard Operating Procedure

E-mail Marketing

Código

TBO-MKT-008

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Marketing

Responsável

Rafa (PO Marketing)

Aprovador

Marco Andolfato



  1. Objetivo

Planejar, criar, segmentar e disparar campanhas de e-mail marketing para nutrição de leads, comunicação de marcos da campanha e reengajamento de base ao longo de todo o ciclo do empreendimento.

  2. Escopo

2.1 O que está coberto

Estratégia de e-mail por fase, criação de fluxos de automação, segmentação de base, criação de e-mails, testes A/B, análise de performance e otimização.

2.2 Exclusões

Produção de criativos HTML complexos (BU Criação), gestão do CRM além do e-mail (BU Comercial), WhatsApp Marketing.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Analista de Marketing

Opera e-mail marketing diariamente

Rafa / Lucca

Cliente

Rafa / Lucca

Define estratégia e aprova conteúdo

Marco Andolfato

BU Comercial

BU Criação

Fornece assets visuais para e-mails

Rafa / Lucca

Analista de Marketing

  4. Pré-requisitos

4.1 Inputs necessários

Base de leads no RD Station segmentada por origem e temperatura; plano de conteúdo aprovado; criativos e textos aprovados; LGPD: consentimento de todos os contatos confirmado.

4.2 Ferramentas e Acessos

RD Station (automação e envio), Mailchimp (backup/alternativo), Google Analytics 4 (rastreamento de cliques), planilha de calendário de e-mails TBO.



  5. Procedimento Passo a Passo

5.1. Estratégia e Calendário de E-mails

Ação: Mapear todos os e-mails da campanha por fase: boas-vindas, nutrição (conteúdo de valor), convite ao evento, pós-evento, urgência de estoque, reativação. Definir frequência, segmentação e objetivo de cada e-mail. Montar calendário.

Responsável: Rafa / Lucca

Output: Calendário de e-mail marketing com tipo, data, segmentação e objetivo de cada disparo.

Prazo referência: D+3 após plano de marketing aprovado

5.2. Configuração de Fluxos de Automação

Ação: Configurar no RD Station: fluxo de boas-vindas (imediato após lead), fluxo de nutrição (sequência de conteúdos de valor em 7/14/21 dias), fluxo de lead frio (reativação após 30 dias sem interação), lead scoring para qualificação automática.

Responsável: Analista de Marketing

Output: Fluxos de automação ativos e testados no RD Station.

Prazo referência: D+7

5.3. Criação e Aprovação de E-mails

Ação: Criar e-mails seguindo template TBO: assunto (max 50 caracteres), preheader, body com 1 CTA claro, texto do botão, versão mobile otimizada. Revisão ortográfica e de links. Aprovação do cliente para comunicações diretas.

Responsável: Analista de Marketing

Output: E-mails criados, revisados e aprovados no RD Station prontos para disparo.

Prazo referência: Conforme calendário

5.4. Segmentação e Personalização

Ação: Segmentar base antes de cada disparo: temperatura (quente/morno/frio), origem do lead (Meta/Google/orgânico/indicação), estágio no funil, perfil de interesse (tipo de unidade). Personalizar assunto e CTA conforme segmento.

Responsável: Analista de Marketing

Output: Segmentos criados no RD Station com lista de envio validada antes do disparo.

Prazo referência: 24h antes do disparo

5.5. Teste A/B e Disparo

Ação: Para e-mails de alta importância (convite ao lançamento, oferta de estoque final): testar 2 versões de assunto com 20% da base. Aguardar 4h, selecionar vencedor e disparar para 80% restante.

Responsável: Analista de Marketing

Output: Registro do teste A/B com resultado e versão selecionada. Disparo realizado.

Prazo referência: Conforme calendário

5.6. Análise de Performance e Otimização

Ação: Analisar métricas 48h após cada disparo: taxa de abertura (benchmark: >25%), CTR (benchmark: >3%), taxa de descadastro (<0.5%), conversões rastreadas via GA4. Documentar aprendizados e ajustar próximos e-mails.

Responsável: Analista de Marketing

Output: Relatório de performance por e-mail com análise e recomendações para próximos disparos.

Prazo referência: 48h após cada disparo

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Consentimento LGPD verificado antes de qualquer disparo; todos os links testados antes do envio; versão mobile testada; taxa de descadastro monitorada; fluxos de automação testados com lead de teste antes de ativar.

6.2 Erros Comuns a Evitar

Disparar para base sem segmentação; e-mail sem CTA claro; assunto genérico sem personalização; não testar links antes do envio; não monitorar taxa de descadastro; fluxos de automação ativados sem teste.

  7. Ferramentas e Templates

RD Station (principal), Mailchimp (backup), Google Analytics 4, planilha de calendário TBO, Litmus ou Email on Acid (teste de renderização mobile).

  8. SLAs e Prazos

Calendário de e-mails: D+3; fluxos de automação: D+7; análise de performance: 48h após cada disparo; taxa de descadastro máxima: 0,5% por disparo.

  9. Fluxograma

Início → Estratégia e calendário → Fluxos de automação → Criação de e-mails → Segmentação → Teste A/B → Disparo → Análise de performance → Otimização → Próximo e-mail → Fim

  10. Glossário

Taxa de abertura: percentual de destinatários que abriram o e-mail. CTR: percentual que clicou em algum link. Lead scoring: pontuação automática de leads por comportamento. LGPD: Lei Geral de Proteção de Dados. Preheader: texto de prévia exibido após o assunto na caixa de entrada.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marketing','campanha']::TEXT[], 7, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Planejar, criar, segmentar e disparar campanhas de e-mail marketing para nutrição de leads, comunicação de marcos da campanha e reengajamento de base ao longo de todo o ciclo do empreendimento.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Estratégia de e-mail por fase, criação de fluxos de automação, segmentação de base, criação de e-mails, testes A/B, análise de performance e otimização.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de criativos HTML complexos (BU Criação), gestão do CRM além do e-mail (BU Comercial), WhatsApp Marketing.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Analista de Marketing

Opera e-mail marketing diariamente

Rafa / Lucca

Cliente

Rafa / Lucca

Define estratégia e aprova conteúdo

Marco Andolfato

BU Comercial

BU Criação

Fornece assets visuais para e-mails

Rafa / Lucca

Analista de Marketing', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Base de leads no RD Station segmentada por origem e temperatura; plano de conteúdo aprovado; criativos e textos aprovados; LGPD: consentimento de todos os contatos confirmado.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'RD Station (automação e envio), Mailchimp (backup/alternativo), Google Analytics 4 (rastreamento de cliques), planilha de calendário de e-mails TBO.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Estratégia e Calendário de E-mails', 'Ação: Mapear todos os e-mails da campanha por fase: boas-vindas, nutrição (conteúdo de valor), convite ao evento, pós-evento, urgência de estoque, reativação. Definir frequência, segmentação e objetivo de cada e-mail. Montar calendário.

Responsável: Rafa / Lucca

Output: Calendário de e-mail marketing com tipo, data, segmentação e objetivo de cada disparo.

Prazo referência: D+3 após plano de marketing aprovado', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Configuração de Fluxos de Automação', 'Ação: Configurar no RD Station: fluxo de boas-vindas (imediato após lead), fluxo de nutrição (sequência de conteúdos de valor em 7/14/21 dias), fluxo de lead frio (reativação após 30 dias sem interação), lead scoring para qualificação automática.

Responsável: Analista de Marketing

Output: Fluxos de automação ativos e testados no RD Station.

Prazo referência: D+7', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Criação e Aprovação de E-mails', 'Ação: Criar e-mails seguindo template TBO: assunto (max 50 caracteres), preheader, body com 1 CTA claro, texto do botão, versão mobile otimizada. Revisão ortográfica e de links. Aprovação do cliente para comunicações diretas.

Responsável: Analista de Marketing

Output: E-mails criados, revisados e aprovados no RD Station prontos para disparo.

Prazo referência: Conforme calendário', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Segmentação e Personalização', 'Ação: Segmentar base antes de cada disparo: temperatura (quente/morno/frio), origem do lead (Meta/Google/orgânico/indicação), estágio no funil, perfil de interesse (tipo de unidade). Personalizar assunto e CTA conforme segmento.

Responsável: Analista de Marketing

Output: Segmentos criados no RD Station com lista de envio validada antes do disparo.

Prazo referência: 24h antes do disparo', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Teste A/B e Disparo', 'Ação: Para e-mails de alta importância (convite ao lançamento, oferta de estoque final): testar 2 versões de assunto com 20% da base. Aguardar 4h, selecionar vencedor e disparar para 80% restante.

Responsável: Analista de Marketing

Output: Registro do teste A/B com resultado e versão selecionada. Disparo realizado.

Prazo referência: Conforme calendário', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Análise de Performance e Otimização', 'Ação: Analisar métricas 48h após cada disparo: taxa de abertura (benchmark: >25%), CTR (benchmark: >3%), taxa de descadastro (<0.5%), conversões rastreadas via GA4. Documentar aprendizados e ajustar próximos e-mails.

Responsável: Analista de Marketing

Output: Relatório de performance por e-mail com análise e recomendações para próximos disparos.

Prazo referência: 48h após cada disparo', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Consentimento LGPD verificado antes de qualquer disparo; todos os links testados antes do envio; versão mobile testada; taxa de descadastro monitorada; fluxos de automação testados com lead de teste antes de ativar.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Disparar para base sem segmentação; e-mail sem CTA claro; assunto genérico sem personalização; não testar links antes do envio; não monitorar taxa de descadastro; fluxos de automação ativados sem teste.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'RD Station (principal), Mailchimp (backup), Google Analytics 4, planilha de calendário TBO, Litmus ou Email on Acid (teste de renderização mobile).', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Calendário de e-mails: D+3; fluxos de automação: D+7; análise de performance: 48h após cada disparo; taxa de descadastro máxima: 0,5% por disparo.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Estratégia e calendário → Fluxos de automação → Criação de e-mails → Segmentação → Teste A/B → Disparo → Análise de performance → Otimização → Próximo e-mail → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Taxa de abertura: percentual de destinatários que abriram o e-mail. CTR: percentual que clicou em algum link. Lead scoring: pontuação automática de leads por comportamento. LGPD: Lei Geral de Proteção de Dados. Preheader: texto de prévia exibido após o assunto na caixa de entrada.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-MKT-009
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Tráfego Pago', 'tbo-mkt-009-trafego-pago', 'marketing', 'checklist', 'Operar as campanhas de mídia paga (Meta Ads, Google Ads e portais imobiliários) do empreendimento com máxima eficiência, garantindo volume de leads qualificados dentro do CPL-alvo definido no plano de mídias.', 'Standard Operating Procedure

Tráfego Pago

Código

TBO-MKT-009

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Marketing

Responsável

Rafa (PO Marketing)

Aprovador

Marco Andolfato



  1. Objetivo

Operar as campanhas de mídia paga (Meta Ads, Google Ads e portais imobiliários) do empreendimento com máxima eficiência, garantindo volume de leads qualificados dentro do CPL-alvo definido no plano de mídias.

  2. Escopo

2.1 O que está coberto

Configuração e operação de campanhas no Meta Ads e Google Ads, criação de públicos, setup de pixel e tags, testes criativos, otimização diária de lances e segmentações, relatório de tráfego.

2.2 Exclusões

Produção de criativos (BU Criação), planejamento de budget (MKT-03), gestão de portais imobiliários orgânico (BU Comercial).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Especialista em Tráfego

Opera e otimiza campanhas diariamente

Rafa / Lucca

Analista de Marketing

Rafa / Lucca

Define estratégia e aprova mudanças significativas

Marco Andolfato

Cliente

Analista de Marketing

Monitora KPIs e reporta anomalias

Rafa / Lucca

Especialista em Tráfego

  4. Pré-requisitos

4.1 Inputs necessários

Plano de mídias aprovado (MKT-03); criativos aprovados nos formatos corretos; landing page validada com pixel instalado; acesso ao Gerenciador de Negócios Meta e Google Ads com permissão de editor; UTMs padronizadas conforme protocolo TBO.

4.2 Ferramentas e Acessos

Meta Ads Manager, Google Ads, Google Tag Manager, Google Analytics 4, planilha de monitoramento de campanhas TBO.



  5. Procedimento Passo a Passo

5.1. Setup Técnico e Configuração Inicial

Ação: Configurar estrutura de campanhas: campanha → conjunto de anúncios → anúncios. Instalar/validar Pixel Meta e Google Tag via GTM. Configurar eventos de conversão (FormSubmit, PageView, Lead). Criar públicos personalizados (visitantes do site, engajadores, lookalike). Definir UTMs padrão TBO.

Responsável: Especialista em Tráfego

Output: Estrutura de campanhas criada, pixels validados no Pixel Helper e Tag Assistant, eventos de conversão disparando corretamente.

Prazo referência: D-2 antes da ativação

5.2. Ativação e Primeiras 48h

Ação: Ativar campanhas conforme cronograma. Monitorar a cada 4h nas primeiras 48h: gasto vs. budget, CTR, custo por clique, volume de leads, qualidade dos leads no CRM. Intervir imediatamente se CPL > 2x o alvo ou se houver zero conversões em 24h.

Responsável: Especialista em Tráfego

Output: Log de monitoramento das primeiras 48h com ajustes realizados documentados.

Prazo referência: Primeiras 48h após ativação

5.3. Rotina de Otimização Diária

Ação: Todos os dias: verificar entrega e frequência de cada conjunto de anúncios; pausar anúncios com frequência >3.5 ou CTR abaixo de 0.8% (Meta) / 2% (Google Search); escalar budget em conjuntos com CPL abaixo do alvo; atualizar planilha de monitoramento.

Responsável: Especialista em Tráfego

Output: Planilha de monitoramento atualizada diariamente com ações tomadas.

Prazo referência: Diário

5.4. Testes Criativos e de Públicos

Ação: A cada 3 semanas, testar novos criativos (mínimo 2 variações por conjunto de anúncios). Testar novos públicos (lookalike de compradores, interesses alternativos). Documentar resultados e elevar os vencedores. Pausar perdedores após 7 dias de teste.

Responsável: Especialista em Tráfego + BU Criação

Output: Registro de testes com resultado por criativo e público. Criativos vencedores escalados.

Prazo referência: A cada 3 semanas

5.5. Configuração de Remarketing

Ação: Criar e ativar campanhas de remarketing para: visitantes da LP que não converteram (últimos 30 dias), leads que não agendaram visita (via lista do RD Station), visualizadores de vídeo >50% (Meta). Definir cap de frequência e mensagens específicas por estágio.

Responsável: Especialista em Tráfego

Output: Campanhas de remarketing ativas por segmento com mensagens diferenciadas.

Prazo referência: D+7 após ativação principal

5.6. Relatório Semanal de Tráfego

Ação: Elaborar relatório semanal: investimento total vs. budget, leads gerados por canal, CPL por canal, CTR médio, frequência média, melhores criativos, anomalias e ações tomadas, projeção para a semana seguinte.

Responsável: Especialista em Tráfego + Analista de Marketing

Output: Relatório semanal de tráfego enviado à Rafa/Lucca toda segunda-feira.

Prazo referência: Toda segunda-feira

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Pixel e tags validados antes da ativação; UTMs configuradas em 100% dos anúncios; remarketing ativo dentro de 7 dias; log de otimizações diário completo; testes criativos documentados; relatório semanal sem atraso.

6.2 Erros Comuns a Evitar

Ativar campanhas sem validar pixel; ausência de UTMs (impossibilita rastreamento no GA4); não pausar criativos fatigados; otimizar apenas semanalmente; escalar budget sem verificar qualidade dos leads gerados.

  7. Ferramentas e Templates

Meta Ads Manager, Google Ads, Google Tag Manager, Google Analytics 4, Facebook Pixel Helper (extensão Chrome), Google Tag Assistant, planilha de monitoramento TBO.

  8. SLAs e Prazos

Setup: D-2 antes da ativação; monitoramento intensivo: primeiras 48h; otimização diária: todos os dias; remarketing: D+7; relatório semanal: toda segunda-feira.

  9. Fluxograma

Início → Setup técnico + pixels → Ativação → Monitoramento 48h → Rotina diária de otimização → Testes criativos (3 semanas) → Remarketing (D+7) → Relatório semanal → Fim

  10. Glossário

Pixel: código de rastreamento que monitora ações no site. GTM: Google Tag Manager. UTM: parâmetros de rastreamento em URLs. Frequência: média de vezes que o mesmo usuário viu o anúncio. Lookalike: público similar a uma base de referência. CPL: Custo por Lead.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marketing','campanha']::TEXT[], 8, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Operar as campanhas de mídia paga (Meta Ads, Google Ads e portais imobiliários) do empreendimento com máxima eficiência, garantindo volume de leads qualificados dentro do CPL-alvo definido no plano de mídias.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Configuração e operação de campanhas no Meta Ads e Google Ads, criação de públicos, setup de pixel e tags, testes criativos, otimização diária de lances e segmentações, relatório de tráfego.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de criativos (BU Criação), planejamento de budget (MKT-03), gestão de portais imobiliários orgânico (BU Comercial).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Especialista em Tráfego

Opera e otimiza campanhas diariamente

Rafa / Lucca

Analista de Marketing

Rafa / Lucca

Define estratégia e aprova mudanças significativas

Marco Andolfato

Cliente

Analista de Marketing

Monitora KPIs e reporta anomalias

Rafa / Lucca

Especialista em Tráfego', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plano de mídias aprovado (MKT-03); criativos aprovados nos formatos corretos; landing page validada com pixel instalado; acesso ao Gerenciador de Negócios Meta e Google Ads com permissão de editor; UTMs padronizadas conforme protocolo TBO.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Meta Ads Manager, Google Ads, Google Tag Manager, Google Analytics 4, planilha de monitoramento de campanhas TBO.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Setup Técnico e Configuração Inicial', 'Ação: Configurar estrutura de campanhas: campanha → conjunto de anúncios → anúncios. Instalar/validar Pixel Meta e Google Tag via GTM. Configurar eventos de conversão (FormSubmit, PageView, Lead). Criar públicos personalizados (visitantes do site, engajadores, lookalike). Definir UTMs padrão TBO.

Responsável: Especialista em Tráfego

Output: Estrutura de campanhas criada, pixels validados no Pixel Helper e Tag Assistant, eventos de conversão disparando corretamente.

Prazo referência: D-2 antes da ativação', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Ativação e Primeiras 48h', 'Ação: Ativar campanhas conforme cronograma. Monitorar a cada 4h nas primeiras 48h: gasto vs. budget, CTR, custo por clique, volume de leads, qualidade dos leads no CRM. Intervir imediatamente se CPL > 2x o alvo ou se houver zero conversões em 24h.

Responsável: Especialista em Tráfego

Output: Log de monitoramento das primeiras 48h com ajustes realizados documentados.

Prazo referência: Primeiras 48h após ativação', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Rotina de Otimização Diária', 'Ação: Todos os dias: verificar entrega e frequência de cada conjunto de anúncios; pausar anúncios com frequência >3.5 ou CTR abaixo de 0.8% (Meta) / 2% (Google Search); escalar budget em conjuntos com CPL abaixo do alvo; atualizar planilha de monitoramento.

Responsável: Especialista em Tráfego

Output: Planilha de monitoramento atualizada diariamente com ações tomadas.

Prazo referência: Diário', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Testes Criativos e de Públicos', 'Ação: A cada 3 semanas, testar novos criativos (mínimo 2 variações por conjunto de anúncios). Testar novos públicos (lookalike de compradores, interesses alternativos). Documentar resultados e elevar os vencedores. Pausar perdedores após 7 dias de teste.

Responsável: Especialista em Tráfego + BU Criação

Output: Registro de testes com resultado por criativo e público. Criativos vencedores escalados.

Prazo referência: A cada 3 semanas', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Configuração de Remarketing', 'Ação: Criar e ativar campanhas de remarketing para: visitantes da LP que não converteram (últimos 30 dias), leads que não agendaram visita (via lista do RD Station), visualizadores de vídeo >50% (Meta). Definir cap de frequência e mensagens específicas por estágio.

Responsável: Especialista em Tráfego

Output: Campanhas de remarketing ativas por segmento com mensagens diferenciadas.

Prazo referência: D+7 após ativação principal', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Relatório Semanal de Tráfego', 'Ação: Elaborar relatório semanal: investimento total vs. budget, leads gerados por canal, CPL por canal, CTR médio, frequência média, melhores criativos, anomalias e ações tomadas, projeção para a semana seguinte.

Responsável: Especialista em Tráfego + Analista de Marketing

Output: Relatório semanal de tráfego enviado à Rafa/Lucca toda segunda-feira.

Prazo referência: Toda segunda-feira', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Pixel e tags validados antes da ativação; UTMs configuradas em 100% dos anúncios; remarketing ativo dentro de 7 dias; log de otimizações diário completo; testes criativos documentados; relatório semanal sem atraso.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Ativar campanhas sem validar pixel; ausência de UTMs (impossibilita rastreamento no GA4); não pausar criativos fatigados; otimizar apenas semanalmente; escalar budget sem verificar qualidade dos leads gerados.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Meta Ads Manager, Google Ads, Google Tag Manager, Google Analytics 4, Facebook Pixel Helper (extensão Chrome), Google Tag Assistant, planilha de monitoramento TBO.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Setup: D-2 antes da ativação; monitoramento intensivo: primeiras 48h; otimização diária: todos os dias; remarketing: D+7; relatório semanal: toda segunda-feira.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Setup técnico + pixels → Ativação → Monitoramento 48h → Rotina diária de otimização → Testes criativos (3 semanas) → Remarketing (D+7) → Relatório semanal → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Pixel: código de rastreamento que monitora ações no site. GTM: Google Tag Manager. UTM: parâmetros de rastreamento em URLs. Frequência: média de vezes que o mesmo usuário viu o anúncio. Lookalike: público similar a uma base de referência. CPL: Custo por Lead.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-MKT-010
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'SEO', 'tbo-mkt-010-seo', 'marketing', 'checklist', 'Implementar estratégia de SEO para o empreendimento imobiliário, aumentando a visibilidade orgânica nos buscadores para termos relevantes de compra de imóveis na região do produto, gerando tráfego qualificado de custo zero.', 'Standard Operating Procedure

SEO

Código

TBO-MKT-010

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Marketing

Responsável

Rafa (PO Marketing)

Aprovador

Marco Andolfato



  1. Objetivo

Implementar estratégia de SEO para o empreendimento imobiliário, aumentando a visibilidade orgânica nos buscadores para termos relevantes de compra de imóveis na região do produto, gerando tráfego qualificado de custo zero.

  2. Escopo

2.1 O que está coberto

Pesquisa de palavras-chave, otimização on-page da landing page e site do empreendimento, SEO local (Google Meu Negócio), link building básico, monitoramento de rankings e tráfego orgânico.

2.2 Exclusões

Desenvolvimento de site (TI/BU Criação), produção de conteúdo editorial de blog (escopo separado), SEO técnico de servidor (TI).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Analista de Marketing

Executa pesquisa de palavras-chave e otimizações on-page

Rafa / Lucca

BU Criação / TI

Rafa / Lucca

Define estratégia e prioriza ações

Marco Andolfato

Cliente

BU Criação / TI

Implementa otimizações técnicas na LP

Rafa / Lucca

Analista de Marketing

  4. Pré-requisitos

4.1 Inputs necessários

Landing page do empreendimento publicada; acesso ao Google Search Console e Google Analytics 4; acesso ao Google Meu Negócio do cliente; Semrush conta ativa.

4.2 Ferramentas e Acessos

Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog (auditoria técnica).



  5. Procedimento Passo a Passo

5.1. Pesquisa de Palavras-Chave

Ação: Mapear palavras-chave relevantes: termos de produto (ex.: ''apartamento 2 quartos no Água Verde''), termos de localização, termos de intenção de compra, termos de concorrentes. Priorizar por volume, dificuldade e intenção transacional. Mínimo 30 termos mapeados.

Responsável: Analista de Marketing

Output: Planilha de palavras-chave com volume, dificuldade, intenção e prioridade.

Prazo referência: D+5 após início

5.2. Auditoria Técnica da Landing Page

Ação: Auditar LP com Screaming Frog e PageSpeed: velocidade de carregamento (<3s mobile), estrutura de headings (H1 único com palavra-chave principal), meta title e description, alt text em imagens, URL amigável, schema markup de imóvel.

Responsável: Analista de Marketing

Output: Relatório de auditoria com lista priorizada de correções.

Prazo referência: D+7

5.3. Otimização On-Page

Ação: Implementar (ou briefar TI/Criação): meta title com palavra-chave principal (<60 chars), meta description com CTA (<155 chars), H1 com localização e tipo de produto, conteúdo da LP com palavras-chave naturalmente inseridas, schema markup de RealEstateListing, URLs canônicas.

Responsável: Analista de Marketing + BU Criação / TI

Output: LP otimizada com todas as correções implementadas e validadas no Search Console.

Prazo referência: D+15

5.4. SEO Local e Google Meu Negócio

Ação: Otimizar perfil do Google Meu Negócio do incorporador/empreendimento: categorias corretas, fotos do produto, descrição com palavras-chave, horário de atendimento do estande de vendas, posts regulares sobre o empreendimento. Monitorar avaliações.

Responsável: Analista de Marketing

Output: Perfil Google Meu Negócio 100% preenchido e postagens ativas.

Prazo referência: D+10

5.5. Link Building Básico

Ação: Obter links relevantes para a LP: portais imobiliários (Zap, VivaReal, OLX Imóveis) com link para o site, assessoria de imprensa local, parcerias com blogs de decoração/arquitetura da região.

Responsável: Rafa / Lucca

Output: Mínimo 5 links externos de qualidade apontando para a LP registrados na planilha.

Prazo referência: D+30

5.6. Monitoramento Mensal de Performance Orgânica

Ação: Monitorar mensalmente via Search Console e GA4: posição média das palavras-chave alvo, cliques orgânicos, impressões, taxa de cliques (CTR). Identificar termos com posições 4-10 (oportunidade de push para top 3). Ajustar conteúdo conforme dados.

Responsável: Analista de Marketing

Output: Relatório mensal de SEO com evolução de rankings e recomendações.

Prazo referência: Mensal

  6. Critérios de Qualidade

6.1 Checklist de Entrega

H1 único e com palavra-chave principal; meta title e description em 100% das páginas; PageSpeed >70 no mobile; Google Meu Negócio completo; mínimo 5 links externos; Search Console sem erros críticos.

6.2 Erros Comuns a Evitar

Múltiplos H1 na mesma página; meta description duplicada; imagens sem alt text; LP sem schema markup de imóvel; não monitorar rankings após otimização.

  7. Ferramentas e Templates

Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog.

  8. SLAs e Prazos

Pesquisa de palavras-chave: D+5; auditoria técnica: D+7; otimizações on-page: D+15; Google Meu Negócio: D+10; link building inicial: D+30; relatório mensal: todo dia 5.

  9. Fluxograma

Início → Pesquisa de palavras-chave → Auditoria técnica → Otimização on-page → SEO Local (GMB) → Link building → Monitoramento mensal → Ajustes → Fim

  10. Glossário

SEO: Search Engine Optimization. On-page: otimizações realizadas dentro do próprio site. Schema markup: código estruturado que ajuda o Google a entender o conteúdo. GMB: Google Meu Negócio. Search Console: ferramenta do Google para monitorar performance orgânica. Canonical: tag que indica a URL principal de uma página.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marketing','campanha']::TEXT[], 9, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Implementar estratégia de SEO para o empreendimento imobiliário, aumentando a visibilidade orgânica nos buscadores para termos relevantes de compra de imóveis na região do produto, gerando tráfego qualificado de custo zero.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Pesquisa de palavras-chave, otimização on-page da landing page e site do empreendimento, SEO local (Google Meu Negócio), link building básico, monitoramento de rankings e tráfego orgânico.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Desenvolvimento de site (TI/BU Criação), produção de conteúdo editorial de blog (escopo separado), SEO técnico de servidor (TI).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Analista de Marketing

Executa pesquisa de palavras-chave e otimizações on-page

Rafa / Lucca

BU Criação / TI

Rafa / Lucca

Define estratégia e prioriza ações

Marco Andolfato

Cliente

BU Criação / TI

Implementa otimizações técnicas na LP

Rafa / Lucca

Analista de Marketing', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Landing page do empreendimento publicada; acesso ao Google Search Console e Google Analytics 4; acesso ao Google Meu Negócio do cliente; Semrush conta ativa.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog (auditoria técnica).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Pesquisa de Palavras-Chave', 'Ação: Mapear palavras-chave relevantes: termos de produto (ex.: ''apartamento 2 quartos no Água Verde''), termos de localização, termos de intenção de compra, termos de concorrentes. Priorizar por volume, dificuldade e intenção transacional. Mínimo 30 termos mapeados.

Responsável: Analista de Marketing

Output: Planilha de palavras-chave com volume, dificuldade, intenção e prioridade.

Prazo referência: D+5 após início', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Auditoria Técnica da Landing Page', 'Ação: Auditar LP com Screaming Frog e PageSpeed: velocidade de carregamento (<3s mobile), estrutura de headings (H1 único com palavra-chave principal), meta title e description, alt text em imagens, URL amigável, schema markup de imóvel.

Responsável: Analista de Marketing

Output: Relatório de auditoria com lista priorizada de correções.

Prazo referência: D+7', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Otimização On-Page', 'Ação: Implementar (ou briefar TI/Criação): meta title com palavra-chave principal (<60 chars), meta description com CTA (<155 chars), H1 com localização e tipo de produto, conteúdo da LP com palavras-chave naturalmente inseridas, schema markup de RealEstateListing, URLs canônicas.

Responsável: Analista de Marketing + BU Criação / TI

Output: LP otimizada com todas as correções implementadas e validadas no Search Console.

Prazo referência: D+15', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. SEO Local e Google Meu Negócio', 'Ação: Otimizar perfil do Google Meu Negócio do incorporador/empreendimento: categorias corretas, fotos do produto, descrição com palavras-chave, horário de atendimento do estande de vendas, posts regulares sobre o empreendimento. Monitorar avaliações.

Responsável: Analista de Marketing

Output: Perfil Google Meu Negócio 100% preenchido e postagens ativas.

Prazo referência: D+10', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Link Building Básico', 'Ação: Obter links relevantes para a LP: portais imobiliários (Zap, VivaReal, OLX Imóveis) com link para o site, assessoria de imprensa local, parcerias com blogs de decoração/arquitetura da região.

Responsável: Rafa / Lucca

Output: Mínimo 5 links externos de qualidade apontando para a LP registrados na planilha.

Prazo referência: D+30', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Monitoramento Mensal de Performance Orgânica', 'Ação: Monitorar mensalmente via Search Console e GA4: posição média das palavras-chave alvo, cliques orgânicos, impressões, taxa de cliques (CTR). Identificar termos com posições 4-10 (oportunidade de push para top 3). Ajustar conteúdo conforme dados.

Responsável: Analista de Marketing

Output: Relatório mensal de SEO com evolução de rankings e recomendações.

Prazo referência: Mensal', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'H1 único e com palavra-chave principal; meta title e description em 100% das páginas; PageSpeed >70 no mobile; Google Meu Negócio completo; mínimo 5 links externos; Search Console sem erros críticos.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Múltiplos H1 na mesma página; meta description duplicada; imagens sem alt text; LP sem schema markup de imóvel; não monitorar rankings após otimização.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Pesquisa de palavras-chave: D+5; auditoria técnica: D+7; otimizações on-page: D+15; Google Meu Negócio: D+10; link building inicial: D+30; relatório mensal: todo dia 5.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Pesquisa de palavras-chave → Auditoria técnica → Otimização on-page → SEO Local (GMB) → Link building → Monitoramento mensal → Ajustes → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'SEO: Search Engine Optimization. On-page: otimizações realizadas dentro do próprio site. Schema markup: código estruturado que ajuda o Google a entender o conteúdo. GMB: Google Meu Negócio. Search Console: ferramenta do Google para monitorar performance orgânica. Canonical: tag que indica a URL principal de uma página.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-MKT-011
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Gestão de Social Media', 'tbo-mkt-011-gestao-de-social-media', 'marketing', 'checklist', 'Gerenciar a presença orgânica do empreendimento nas redes sociais (Instagram, Facebook e YouTube) ao longo de todo o ciclo de campanha, construindo comunidade, gerando engajamento e alimentando o funil de leads de forma consistente.', 'Standard Operating Procedure

Gestão de Social Media

Código

TBO-MKT-011

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Marketing

Responsável

Rafa (PO Marketing)

Aprovador

Marco Andolfato



  1. Objetivo

Gerenciar a presença orgânica do empreendimento nas redes sociais (Instagram, Facebook e YouTube) ao longo de todo o ciclo de campanha, construindo comunidade, gerando engajamento e alimentando o funil de leads de forma consistente.

  2. Escopo

2.1 O que está coberto

Planejamento e criação de calendário de conteúdo, briefing de conteúdo para BU Criação, publicação e agendamento, moderação de comentários e direct, análise de performance e relatório mensal.

2.2 Exclusões

Produção de criativos e vídeos (BU Criação), mídia paga de impulsionamento (MKT-09), gestão de WhatsApp Business (BU Comercial).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Analista de Marketing

Opera social media diariamente

Rafa / Lucca

BU Criação

Rafa / Lucca

Aprova calendário e estratégia de conteúdo

Marco Andolfato

Cliente

BU Criação

Produz criativos conforme briefing do calendário

Rafa / Lucca

Analista de Marketing

  4. Pré-requisitos

4.1 Inputs necessários

Plano de Marketing aprovado (MKT-02) com diretrizes de tom e posicionamento; acesso admin às contas do Instagram, Facebook e YouTube do empreendimento; criativos disponíveis da BU Criação.

4.2 Ferramentas e Acessos

Meta Business Suite, Later ou Buffer (agendamento), Google Analytics 4 (rastreamento de cliques em bio), planilha de calendário de conteúdo TBO, Notion.



  5. Procedimento Passo a Passo

5.1. Calendário Mensal de Conteúdo

Ação: Elaborar calendário mensal com: frequência de publicação (mínimo 4x/semana no Instagram), mix de formatos (feed, stories, reels, YouTube), temas por semana (produto, lifestyle, bastidores, prova social, conteúdo de valor), e data de briefing para BU Criação (mínimo 10 dias antes da publicação).

Responsável: Rafa / Lucca

Output: Calendário mensal aprovado pelo cliente até o dia 25 do mês anterior.

Prazo referência: Até dia 25 do mês anterior

5.2. Briefing de Conteúdo para BU Criação

Ação: Para cada peça do calendário, elaborar briefing com: tema, referências visuais, texto/copy sugerido, formato e dimensões, call-to-action, data de entrega necessária (mínimo 5 dias antes da publicação).

Responsável: Analista de Marketing

Output: Briefings individuais entregues à BU Criação conforme prazo do calendário.

Prazo referência: Mínimo 10 dias antes da publicação

5.3. Publicação e Agendamento

Ação: Agendar posts no Later/Buffer com textos revisados, hashtags relevantes (15-25 hashtags por feed post), localização gerada, marcações. Verificar pré-visualização mobile antes de confirmar agendamento. Stories complementares no dia da publicação.

Responsável: Analista de Marketing

Output: Posts agendados com 5 dias de antecedência mínima.

Prazo referência: 5 dias antes da publicação

5.4. Moderação de Comentários e Direct

Ação: Responder 100% dos comentários e directs em até 4h (dias úteis). Script de respostas padrão para dúvidas frequentes (preço, disponibilidade, localização, contato do corretor). Escalar para BU Comercial qualquer lead com intenção de compra clara.

Responsável: Analista de Marketing

Output: Zero comentários ou directs sem resposta após 4h (dias úteis). Leads com intenção de compra escalados ao CRM.

Prazo referência: 4h durante dias úteis

5.5. Monitoramento de Engajamento e Hashtags

Ação: Monitorar diariamente: comentários, menções, hashtags do produto, perfis de concorrentes. Identificar oportunidades de engajamento espontâneo (compartilhar stories de clientes, responder menções). Registrar na planilha de monitoramento.

Responsável: Analista de Marketing

Output: Log diário de monitoramento com ações de engajamento registradas.

Prazo referência: Diário

5.6. Relatório Mensal de Social Media

Ação: Elaborar relatório mensal com: crescimento de seguidores, alcance total, impressões, taxa de engajamento por formato, posts de melhor e pior performance, leads gerados via social (link na bio/stories), aprendizados e ajustes para o próximo mês.

Responsável: Analista de Marketing

Output: Relatório mensal enviado ao cliente até o dia 5 do mês seguinte.

Prazo referência: Até dia 5 do mês seguinte

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Calendário aprovado até dia 25 do mês anterior; zero posts sem resposta após 4h nos dias úteis; briefings entregues 10 dias antes da publicação; relatório mensal sem atraso; leads de social escalados ao CRM no mesmo dia.

6.2 Erros Comuns a Evitar

Publicar sem aprovação do conteúdo; atrasos no calendário que causam impulsionamento de última hora; comentários sem resposta por mais de 24h; relatório apenas com dados sem análise; hashtags genéricas sem relevância ao nicho imobiliário.

  7. Ferramentas e Templates

Meta Business Suite, Later ou Buffer, Google Analytics 4, planilha de calendário TBO, Notion, Canva (ajustes rápidos de formato).

  8. SLAs e Prazos

Calendário mensal: dia 25 do mês anterior; briefings para criação: D-10 da publicação; agendamento: D-5; moderação: 4h dias úteis; relatório: dia 5 do mês seguinte.

  9. Fluxograma

Início → Calendário mensal → Briefing BU Criação → Recebimento criativos → Revisão e aprovação → Agendamento → Publicação → Moderação diária → Monitoramento → Relatório mensal → Fim

  10. Glossário

Taxa de engajamento: percentual de seguidores que interagem com as publicações. Reels: formato de vídeo curto do Instagram. Stories: publicações efêmeras de 24h. Moderação: resposta e gestão de comentários e mensagens. Reach: número de perfis únicos que viram a publicação.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marketing','campanha']::TEXT[], 10, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Gerenciar a presença orgânica do empreendimento nas redes sociais (Instagram, Facebook e YouTube) ao longo de todo o ciclo de campanha, construindo comunidade, gerando engajamento e alimentando o funil de leads de forma consistente.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Planejamento e criação de calendário de conteúdo, briefing de conteúdo para BU Criação, publicação e agendamento, moderação de comentários e direct, análise de performance e relatório mensal.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de criativos e vídeos (BU Criação), mídia paga de impulsionamento (MKT-09), gestão de WhatsApp Business (BU Comercial).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Analista de Marketing

Opera social media diariamente

Rafa / Lucca

BU Criação

Rafa / Lucca

Aprova calendário e estratégia de conteúdo

Marco Andolfato

Cliente

BU Criação

Produz criativos conforme briefing do calendário

Rafa / Lucca

Analista de Marketing', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plano de Marketing aprovado (MKT-02) com diretrizes de tom e posicionamento; acesso admin às contas do Instagram, Facebook e YouTube do empreendimento; criativos disponíveis da BU Criação.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Meta Business Suite, Later ou Buffer (agendamento), Google Analytics 4 (rastreamento de cliques em bio), planilha de calendário de conteúdo TBO, Notion.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Calendário Mensal de Conteúdo', 'Ação: Elaborar calendário mensal com: frequência de publicação (mínimo 4x/semana no Instagram), mix de formatos (feed, stories, reels, YouTube), temas por semana (produto, lifestyle, bastidores, prova social, conteúdo de valor), e data de briefing para BU Criação (mínimo 10 dias antes da publicação).

Responsável: Rafa / Lucca

Output: Calendário mensal aprovado pelo cliente até o dia 25 do mês anterior.

Prazo referência: Até dia 25 do mês anterior', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Briefing de Conteúdo para BU Criação', 'Ação: Para cada peça do calendário, elaborar briefing com: tema, referências visuais, texto/copy sugerido, formato e dimensões, call-to-action, data de entrega necessária (mínimo 5 dias antes da publicação).

Responsável: Analista de Marketing

Output: Briefings individuais entregues à BU Criação conforme prazo do calendário.

Prazo referência: Mínimo 10 dias antes da publicação', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Publicação e Agendamento', 'Ação: Agendar posts no Later/Buffer com textos revisados, hashtags relevantes (15-25 hashtags por feed post), localização gerada, marcações. Verificar pré-visualização mobile antes de confirmar agendamento. Stories complementares no dia da publicação.

Responsável: Analista de Marketing

Output: Posts agendados com 5 dias de antecedência mínima.

Prazo referência: 5 dias antes da publicação', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Moderação de Comentários e Direct', 'Ação: Responder 100% dos comentários e directs em até 4h (dias úteis). Script de respostas padrão para dúvidas frequentes (preço, disponibilidade, localização, contato do corretor). Escalar para BU Comercial qualquer lead com intenção de compra clara.

Responsável: Analista de Marketing

Output: Zero comentários ou directs sem resposta após 4h (dias úteis). Leads com intenção de compra escalados ao CRM.

Prazo referência: 4h durante dias úteis', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Monitoramento de Engajamento e Hashtags', 'Ação: Monitorar diariamente: comentários, menções, hashtags do produto, perfis de concorrentes. Identificar oportunidades de engajamento espontâneo (compartilhar stories de clientes, responder menções). Registrar na planilha de monitoramento.

Responsável: Analista de Marketing

Output: Log diário de monitoramento com ações de engajamento registradas.

Prazo referência: Diário', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Relatório Mensal de Social Media', 'Ação: Elaborar relatório mensal com: crescimento de seguidores, alcance total, impressões, taxa de engajamento por formato, posts de melhor e pior performance, leads gerados via social (link na bio/stories), aprendizados e ajustes para o próximo mês.

Responsável: Analista de Marketing

Output: Relatório mensal enviado ao cliente até o dia 5 do mês seguinte.

Prazo referência: Até dia 5 do mês seguinte', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Calendário aprovado até dia 25 do mês anterior; zero posts sem resposta após 4h nos dias úteis; briefings entregues 10 dias antes da publicação; relatório mensal sem atraso; leads de social escalados ao CRM no mesmo dia.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Publicar sem aprovação do conteúdo; atrasos no calendário que causam impulsionamento de última hora; comentários sem resposta por mais de 24h; relatório apenas com dados sem análise; hashtags genéricas sem relevância ao nicho imobiliário.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Meta Business Suite, Later ou Buffer, Google Analytics 4, planilha de calendário TBO, Notion, Canva (ajustes rápidos de formato).', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Calendário mensal: dia 25 do mês anterior; briefings para criação: D-10 da publicação; agendamento: D-5; moderação: 4h dias úteis; relatório: dia 5 do mês seguinte.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Calendário mensal → Briefing BU Criação → Recebimento criativos → Revisão e aprovação → Agendamento → Publicação → Moderação diária → Monitoramento → Relatório mensal → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Taxa de engajamento: percentual de seguidores que interagem com as publicações. Reels: formato de vídeo curto do Instagram. Stories: publicações efêmeras de 24h. Moderação: resposta e gestão de comentários e mensagens. Reach: número de perfis únicos que viram a publicação.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-MKT-012
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Reports e Análise de Performance', 'tbo-mkt-012-reports-e-analise-de-performance', 'marketing', 'checklist', 'Reports e Análise de Performance', 'Standard Operating Procedure

Reports e Análise de Performance

Código

TBO-MKT-012

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Marketing

Responsável

Rafa (PO Marketing)

Aprovador

Marco Andolfato



  1. Objetivo

Compilar, analisar e apresentar os dados de performance de marketing do empreendimento de forma estruturada, garantindo que clientes e stakeholders internos tenham visibilidade clara dos resultados, ROI e recomendações estratégicas a cada ciclo.

  2. Escopo

2.1 O que está coberto

Coleta de dados de todos os canais, consolidação em dashboard unificado, análise de funil de conversão, elaboração de relatórios semanais (tráfego), quinzenais (lançamento) e mensais (visão geral), relatório final de campanha.

2.2 Exclusões

Análise de dados de vendas (BU Comercial), relatório de resultado financeiro do empreendimento (Incorporadora).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Analista de Marketing

Coleta dados, monta e envia relatórios

Rafa / Lucca

Especialista em Tráfego

Rafa / Lucca

Analisa e assina recomendações estratégicas

Marco Andolfato

Cliente

Marco Andolfato

Aprova relatório final de campanha

—

Cliente, BU Estratégia

  4. Pré-requisitos

4.1 Inputs necessários

Acesso a todos os canais de dados: Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Social Media Insights, planilha de estoque/vendas da incorporadora.

4.2 Ferramentas e Acessos

Google Looker Studio (dashboard), Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides.



  5. Procedimento Passo a Passo

5.1. Configuração do Dashboard de Performance

Ação: Criar dashboard unificado no Google Looker Studio conectando: GA4, Meta Ads, Google Ads, e dados manuais de social/e-mail. Dashboard deve exibir: leads por canal, CPL por canal, funil de conversão (lead→visita→proposta→venda), investimento acumulado vs. budget, alcance e frequência.

Responsável: Analista de Marketing

Output: Dashboard ao vivo compartilhado com cliente e gestores internos.

Prazo referência: D+7 após início da campanha

5.2. Coleta e Consolidação Semanal de Dados

Ação: Toda sexta-feira: exportar dados da semana de todos os canais e consolidar na planilha master. Validar consistência: volume de leads no Meta/Google vs. chegada no RD Station (tolerância de 5% de discrepância máxima). Investigar e registrar qualquer anomalia.

Responsável: Analista de Marketing

Output: Planilha master atualizada toda sexta-feira com dados consolidados e validados.

Prazo referência: Toda sexta-feira

5.3. Relatório Semanal de Tráfego

Ação: Elaborar relatório semanal (para Rafa/Lucca e cliente): investimento da semana, leads gerados por canal, CPL por canal vs. meta, criativos de melhor e pior performance, frequência, anomalias detectadas e ações tomadas, perspectiva para próxima semana.

Responsável: Analista de Marketing

Output: Relatório semanal enviado toda segunda-feira via e-mail ao cliente.

Prazo referência: Toda segunda-feira

5.4. Relatório Quinzenal de Performance (Fase Lançamento)

Ação: Na fase de lançamento, elaborar relatório quinzenal com visão mais estratégica: leads acumulados vs. meta da fase, funil completo com taxas de conversão, qualidade de leads (feedback do comercial), ROI parcial estimado, ajustes de estratégia recomendados.

Responsável: Rafa / Lucca + Analista de Marketing

Output: Relatório quinzenal apresentado ao cliente em reunião de alinhamento.

Prazo referência: A cada 15 dias durante a fase de lançamento

5.5. Relatório Mensal Consolidado

Ação: Todo mês: consolidar performance mensal de todos os canais com análise de tendência (comparativo mês anterior), análise de qualidade dos leads (taxa de conversão em visitas e propostas), análise de ROI de mídia por canal, ranking de criativos do mês, recomendações para o mês seguinte.

Responsável: Rafa / Lucca

Output: Relatório mensal completo enviado até o dia 5 de cada mês.

Prazo referência: Até dia 5 do mês seguinte

5.6. Relatório Final de Campanha

Ação: Ao encerrar o ciclo completo da campanha: compilar relatório final com visão integral da campanha (pré-lançamento + lançamento + sustentação). Incluir: total investido, total de leads gerados, CPL médio por fase, funil de conversão completo, ROI total, 5 principais aprendizados e recomendações para o próximo produto.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Relatório final de campanha apresentado ao cliente em reunião de encerramento. Cópia arquivada no Notion.

Prazo referência: Até 15 dias após encerramento da campanha

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Dashboard ao vivo compartilhado desde a semana 1; relatórios semanais sem atraso; discrepância entre plataformas investigada (máx 5%); relatório final entregue em até 15 dias; aprendizados arquivados no Notion para uso futuro.

6.2 Erros Comuns a Evitar

Relatórios apenas com dados sem análise e recomendações; inconsistências entre plataformas não investigadas; dashboard não atualizado em tempo real; relatório final sem aprendizados documentados; envio de relatório sem contextualização estratégica.

  7. Ferramentas e Templates

Google Looker Studio, Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides, Notion.

  8. SLAs e Prazos

Dashboard ao vivo: D+7; relatório semanal: toda segunda-feira; relatório quinzenal: a cada 15 dias (fase lançamento); relatório mensal: dia 5 do mês seguinte; relatório final: 15 dias após encerramento.

  9. Fluxograma

Início → Setup dashboard (D+7) → Coleta semanal (sextas) → Relatório semanal (segundas) → Relatório quinzenal (lançamento) → Relatório mensal (dia 5) → Relatório final (até D+15 do encerramento) → Fim

  10. Glossário

Looker Studio: ferramenta de visualização de dados do Google (antes Data Studio). Funil de conversão: sequência lead → visita → proposta → venda com taxas de cada etapa. ROI: Return on Investment. CPL médio: média ponderada do custo por lead considerando todos os canais. Benchmark: referência de mercado para comparação de KPIs.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marketing','campanha']::TEXT[], 11, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Compilar, analisar e apresentar os dados de performance de marketing do empreendimento de forma estruturada, garantindo que clientes e stakeholders internos tenham visibilidade clara dos resultados, ROI e recomendações estratégicas a cada ciclo.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Coleta de dados de todos os canais, consolidação em dashboard unificado, análise de funil de conversão, elaboração de relatórios semanais (tráfego), quinzenais (lançamento) e mensais (visão geral), relatório final de campanha.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Análise de dados de vendas (BU Comercial), relatório de resultado financeiro do empreendimento (Incorporadora).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Analista de Marketing

Coleta dados, monta e envia relatórios

Rafa / Lucca

Especialista em Tráfego

Rafa / Lucca

Analisa e assina recomendações estratégicas

Marco Andolfato

Cliente

Marco Andolfato

Aprova relatório final de campanha

—

Cliente, BU Estratégia', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Acesso a todos os canais de dados: Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Social Media Insights, planilha de estoque/vendas da incorporadora.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Looker Studio (dashboard), Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Configuração do Dashboard de Performance', 'Ação: Criar dashboard unificado no Google Looker Studio conectando: GA4, Meta Ads, Google Ads, e dados manuais de social/e-mail. Dashboard deve exibir: leads por canal, CPL por canal, funil de conversão (lead→visita→proposta→venda), investimento acumulado vs. budget, alcance e frequência.

Responsável: Analista de Marketing

Output: Dashboard ao vivo compartilhado com cliente e gestores internos.

Prazo referência: D+7 após início da campanha', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Coleta e Consolidação Semanal de Dados', 'Ação: Toda sexta-feira: exportar dados da semana de todos os canais e consolidar na planilha master. Validar consistência: volume de leads no Meta/Google vs. chegada no RD Station (tolerância de 5% de discrepância máxima). Investigar e registrar qualquer anomalia.

Responsável: Analista de Marketing

Output: Planilha master atualizada toda sexta-feira com dados consolidados e validados.

Prazo referência: Toda sexta-feira', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Relatório Semanal de Tráfego', 'Ação: Elaborar relatório semanal (para Rafa/Lucca e cliente): investimento da semana, leads gerados por canal, CPL por canal vs. meta, criativos de melhor e pior performance, frequência, anomalias detectadas e ações tomadas, perspectiva para próxima semana.

Responsável: Analista de Marketing

Output: Relatório semanal enviado toda segunda-feira via e-mail ao cliente.

Prazo referência: Toda segunda-feira', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Relatório Quinzenal de Performance (Fase Lançamento)', 'Ação: Na fase de lançamento, elaborar relatório quinzenal com visão mais estratégica: leads acumulados vs. meta da fase, funil completo com taxas de conversão, qualidade de leads (feedback do comercial), ROI parcial estimado, ajustes de estratégia recomendados.

Responsável: Rafa / Lucca + Analista de Marketing

Output: Relatório quinzenal apresentado ao cliente em reunião de alinhamento.

Prazo referência: A cada 15 dias durante a fase de lançamento', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Relatório Mensal Consolidado', 'Ação: Todo mês: consolidar performance mensal de todos os canais com análise de tendência (comparativo mês anterior), análise de qualidade dos leads (taxa de conversão em visitas e propostas), análise de ROI de mídia por canal, ranking de criativos do mês, recomendações para o mês seguinte.

Responsável: Rafa / Lucca

Output: Relatório mensal completo enviado até o dia 5 de cada mês.

Prazo referência: Até dia 5 do mês seguinte', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Relatório Final de Campanha', 'Ação: Ao encerrar o ciclo completo da campanha: compilar relatório final com visão integral da campanha (pré-lançamento + lançamento + sustentação). Incluir: total investido, total de leads gerados, CPL médio por fase, funil de conversão completo, ROI total, 5 principais aprendizados e recomendações para o próximo produto.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Relatório final de campanha apresentado ao cliente em reunião de encerramento. Cópia arquivada no Notion.

Prazo referência: Até 15 dias após encerramento da campanha', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Dashboard ao vivo compartilhado desde a semana 1; relatórios semanais sem atraso; discrepância entre plataformas investigada (máx 5%); relatório final entregue em até 15 dias; aprendizados arquivados no Notion para uso futuro.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Relatórios apenas com dados sem análise e recomendações; inconsistências entre plataformas não investigadas; dashboard não atualizado em tempo real; relatório final sem aprendizados documentados; envio de relatório sem contextualização estratégica.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Looker Studio, Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides, Notion.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Dashboard ao vivo: D+7; relatório semanal: toda segunda-feira; relatório quinzenal: a cada 15 dias (fase lançamento); relatório mensal: dia 5 do mês seguinte; relatório final: 15 dias após encerramento.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Setup dashboard (D+7) → Coleta semanal (sextas) → Relatório semanal (segundas) → Relatório quinzenal (lançamento) → Relatório mensal (dia 5) → Relatório final (até D+15 do encerramento) → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Looker Studio: ferramenta de visualização de dados do Google (antes Data Studio). Funil de conversão: sequência lead → visita → proposta → venda com taxas de cada etapa. ROI: Return on Investment. CPL médio: média ponderada do custo por lead considerando todos os canais. Benchmark: referência de mercado para comparação de KPIs.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

END $$;

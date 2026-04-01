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
    'Diagnóstico de Marketing',
    'tbo-mkt-001-diagnostico-de-marketing',
    'marketing',
    'checklist',
    'Realizar análise completa do cenário de marketing do cliente, do produto imobiliário e do mercado local para embasar o planejamento estratégico de comunicação e mídia.',
    'Standard Operating Procedure

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

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Diagnóstico de Marketing</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Realizar análise completa do cenário de marketing do cliente, do produto imobiliário e do mercado local para embasar o planejamento estratégico de comunicação e mídia.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Briefing com cliente, análise de posicionamento, pesquisa de concorrência, análise de público-alvo, auditoria de ativos digitais existentes e mapeamento de oportunidades.</p><p><strong>2.2 Exclusões</strong></p><p>Criação de materiais, execução de campanhas, definição de budgets de mídia.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Conduz briefing e análise</p></td><td><p>Marco Andolfato</p></td><td><p>Diretor de Criação, BU Estratégia</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Coleta dados, pesquisa concorrência</p></td><td><p>Rafa / Lucca</p></td><td><p>Cliente</p></td></tr><tr><td><p>BU Estratégia</p></td><td><p>Valida posicionamento e persona</p></td><td><p>Marco Andolfato</p></td><td><p>Rafa / Lucca</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contrato assinado; briefing inicial do cliente; materiais do produto (memorial descritivo, planta, localização); histórico de campanhas anteriores (se houver).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Analytics, Meta Business Suite, Semrush, Google Trends, Hotjar (se site existir), planilha de diagnóstico TBO.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Briefing Estruturado</strong></p><p>Ação: Realizar sessão de briefing com cliente usando template TBO: produto, público, concorrentes, diferenciais, histórico, expectativas de VGV e prazo de lançamento.</p><p>Responsável: Rafa / Lucca</p><p>Output: Briefing preenchido e validado pelo cliente.</p><p>Prazo referência: D+2 após kickoff</p><p><strong>5.2. Pesquisa de Mercado e Concorrência</strong></p><p>Ação: Mapear 5-8 concorrentes diretos na região. Analisar posicionamento, canais, criativos, estimativa de investimento em mídia e diferenciais comunicados.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório de benchmarking com prints e análise qualitativa.</p><p>Prazo referência: D+5</p><p><strong>5.3. Análise de Público-Alvo</strong></p><p>Ação: Cruzar dados demográficos do bairro (IBGE), perfil do produto e dados do cliente para construir personas primária e secundária. Validar com BU Estratégia.</p><p>Responsável: Rafa / Lucca + BU Estratégia</p><p>Output: Documento de personas com dores, desejos, canais preferidos e jornada de compra imobiliária.</p><p>Prazo referência: D+7</p><p><strong>5.4. Auditoria de Ativos Digitais</strong></p><p>Ação: Auditar site, redes sociais, base de e-mails e campanhas anteriores do cliente. Avaliar performance histórica (CTR, CPL, taxa de conversão) se dados disponíveis.</p><p>Responsável: Analista de Marketing</p><p>Output: Planilha de auditoria com notas por canal e gaps identificados.</p><p>Prazo referência: D+7</p><p><strong>5.5. Consolidação do Diagnóstico</strong></p><p>Ação: Compilar achados em documento de diagnóstico: SWOT de marketing, oportunidades por canal, posicionamento recomendado, alertas e riscos.</p><p>Responsável: Rafa / Lucca</p><p>Output: Documento de Diagnóstico de Marketing (PDF + slides).</p><p>Prazo referência: D+10</p><p><strong>5.6. Apresentação ao Cliente</strong></p><p>Ação: Apresentar diagnóstico ao cliente em reunião formal. Coletar validações, ajustes e alinhamentos estratégicos antes de avançar ao Plano de Marketing.</p><p>Responsável: Rafa / Lucca + Marco Andolfato</p><p>Output: Diagnóstico aprovado com ata de reunião e registro de ajustes.</p><p>Prazo referência: D+12</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Briefing com todas as seções preenchidas; mínimo 5 concorrentes mapeados; personas validadas pela BU Estratégia; auditoria digital com dados (não apenas capturas de tela); diagnóstico revisado por Marco antes da apresentação.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Diagnóstico genérico sem especificidade do produto ou região; personas baseadas apenas em feeling sem dados; concorrentes mapeados fora do raio de influência do empreendimento; auditoria sem análise de performance histórica quando dados existem.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Semrush (análise de domínio e concorrência), Google Trends, Meta Ad Library, Google Analytics, Hotjar, planilha de diagnóstico TBO, Notion (documentação).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Briefing: até D+2; diagnóstico completo: até D+12 após kickoff; aprovação do cliente: até D+15.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Kickoff + Briefing → Pesquisa de Concorrência → Construção de Personas → Auditoria Digital → Consolidação SWOT → Revisão interna (Marco) → Apresentação ao cliente → Aprovação → Fim</p><p><strong>  10. Glossário</strong></p><p>CPL: Custo por Lead. VGV: Valor Geral de Vendas. Persona: representação semifictícia do cliente ideal. SWOT: análise de forças, fraquezas, oportunidades e ameaças. CTR: Click-Through Rate.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-MKT-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Realizar análise completa do cenário de marketing do cliente, do produto imobiliário e do mercado local para embasar o planejamento estratégico de comunicação e mídia.', '<p>Realizar análise completa do cenário de marketing do cliente, do produto imobiliário e do mercado local para embasar o planejamento estratégico de comunicação e mídia.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Briefing com cliente, análise de posicionamento, pesquisa de concorrência, análise de público-alvo, auditoria de ativos digitais existentes e mapeamento de oportunidades.', '<p>Briefing com cliente, análise de posicionamento, pesquisa de concorrência, análise de público-alvo, auditoria de ativos digitais existentes e mapeamento de oportunidades.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Criação de materiais, execução de campanhas, definição de budgets de mídia.', '<p>Criação de materiais, execução de campanhas, definição de budgets de mídia.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Rafa / Lucca', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Conduz briefing e análise</p></td><td><p>Marco Andolfato</p></td><td><p>Diretor de Criação, BU Estratégia</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Coleta dados, pesquisa concorrência</p></td><td><p>Rafa / Lucca</p></td><td><p>Cliente</p></td></tr><tr><td><p>BU Estratégia</p></td><td><p>Valida posicionamento e persona</p></td><td><p>Marco Andolfato</p></td><td><p>Rafa / Lucca</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado; briefing inicial do cliente; materiais do produto (memorial descritivo, planta, localização); histórico de campanhas anteriores (se houver).', '<p>Contrato assinado; briefing inicial do cliente; materiais do produto (memorial descritivo, planta, localização); histórico de campanhas anteriores (se houver).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Analytics, Meta Business Suite, Semrush, Google Trends, Hotjar (se site existir), planilha de diagnóstico TBO.', '<p>Google Analytics, Meta Business Suite, Semrush, Google Trends, Hotjar (se site existir), planilha de diagnóstico TBO.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Briefing Estruturado', 'Ação: Realizar sessão de briefing com cliente usando template TBO: produto, público, concorrentes, diferenciais, histórico, expectativas de VGV e prazo de lançamento.

Responsável: Rafa / Lucca

Output: Briefing preenchido e validado pelo cliente.

Prazo referência: D+2 após kickoff', '<p>Ação: Realizar sessão de briefing com cliente usando template TBO: produto, público, concorrentes, diferenciais, histórico, expectativas de VGV e prazo de lançamento.</p><p>Responsável: Rafa / Lucca</p><p>Output: Briefing preenchido e validado pelo cliente.</p><p>Prazo referência: D+2 após kickoff</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Pesquisa de Mercado e Concorrência', 'Ação: Mapear 5-8 concorrentes diretos na região. Analisar posicionamento, canais, criativos, estimativa de investimento em mídia e diferenciais comunicados.

Responsável: Analista de Marketing

Output: Relatório de benchmarking com prints e análise qualitativa.

Prazo referência: D+5', '<p>Ação: Mapear 5-8 concorrentes diretos na região. Analisar posicionamento, canais, criativos, estimativa de investimento em mídia e diferenciais comunicados.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório de benchmarking com prints e análise qualitativa.</p><p>Prazo referência: D+5</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Análise de Público-Alvo', 'Ação: Cruzar dados demográficos do bairro (IBGE), perfil do produto e dados do cliente para construir personas primária e secundária. Validar com BU Estratégia.

Responsável: Rafa / Lucca + BU Estratégia

Output: Documento de personas com dores, desejos, canais preferidos e jornada de compra imobiliária.

Prazo referência: D+7', '<p>Ação: Cruzar dados demográficos do bairro (IBGE), perfil do produto e dados do cliente para construir personas primária e secundária. Validar com BU Estratégia.</p><p>Responsável: Rafa / Lucca + BU Estratégia</p><p>Output: Documento de personas com dores, desejos, canais preferidos e jornada de compra imobiliária.</p><p>Prazo referência: D+7</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Auditoria de Ativos Digitais', 'Ação: Auditar site, redes sociais, base de e-mails e campanhas anteriores do cliente. Avaliar performance histórica (CTR, CPL, taxa de conversão) se dados disponíveis.

Responsável: Analista de Marketing

Output: Planilha de auditoria com notas por canal e gaps identificados.

Prazo referência: D+7', '<p>Ação: Auditar site, redes sociais, base de e-mails e campanhas anteriores do cliente. Avaliar performance histórica (CTR, CPL, taxa de conversão) se dados disponíveis.</p><p>Responsável: Analista de Marketing</p><p>Output: Planilha de auditoria com notas por canal e gaps identificados.</p><p>Prazo referência: D+7</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Consolidação do Diagnóstico', 'Ação: Compilar achados em documento de diagnóstico: SWOT de marketing, oportunidades por canal, posicionamento recomendado, alertas e riscos.

Responsável: Rafa / Lucca

Output: Documento de Diagnóstico de Marketing (PDF + slides).

Prazo referência: D+10', '<p>Ação: Compilar achados em documento de diagnóstico: SWOT de marketing, oportunidades por canal, posicionamento recomendado, alertas e riscos.</p><p>Responsável: Rafa / Lucca</p><p>Output: Documento de Diagnóstico de Marketing (PDF + slides).</p><p>Prazo referência: D+10</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Apresentação ao Cliente', 'Ação: Apresentar diagnóstico ao cliente em reunião formal. Coletar validações, ajustes e alinhamentos estratégicos antes de avançar ao Plano de Marketing.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Diagnóstico aprovado com ata de reunião e registro de ajustes.

Prazo referência: D+12', '<p>Ação: Apresentar diagnóstico ao cliente em reunião formal. Coletar validações, ajustes e alinhamentos estratégicos antes de avançar ao Plano de Marketing.</p><p>Responsável: Rafa / Lucca + Marco Andolfato</p><p>Output: Diagnóstico aprovado com ata de reunião e registro de ajustes.</p><p>Prazo referência: D+12</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Briefing com todas as seções preenchidas; mínimo 5 concorrentes mapeados; personas validadas pela BU Estratégia; auditoria digital com dados (não apenas capturas de tela); diagnóstico revisado por Marco antes da apresentação.', '<p>Briefing com todas as seções preenchidas; mínimo 5 concorrentes mapeados; personas validadas pela BU Estratégia; auditoria digital com dados (não apenas capturas de tela); diagnóstico revisado por Marco antes da apresentação.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Diagnóstico genérico sem especificidade do produto ou região; personas baseadas apenas em feeling sem dados; concorrentes mapeados fora do raio de influência do empreendimento; auditoria sem análise de performance histórica quando dados existem.', '<p>Diagnóstico genérico sem especificidade do produto ou região; personas baseadas apenas em feeling sem dados; concorrentes mapeados fora do raio de influência do empreendimento; auditoria sem análise de performance histórica quando dados existem.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Semrush (análise de domínio e concorrência), Google Trends, Meta Ad Library, Google Analytics, Hotjar, planilha de diagnóstico TBO, Notion (documentação).', '<p>Semrush (análise de domínio e concorrência), Google Trends, Meta Ad Library, Google Analytics, Hotjar, planilha de diagnóstico TBO, Notion (documentação).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Briefing: até D+2; diagnóstico completo: até D+12 após kickoff; aprovação do cliente: até D+15.', '<p>Briefing: até D+2; diagnóstico completo: até D+12 após kickoff; aprovação do cliente: até D+15.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Kickoff + Briefing → Pesquisa de Concorrência → Construção de Personas → Auditoria Digital → Consolidação SWOT → Revisão interna (Marco) → Apresentação ao cliente → Aprovação → Fim', '<p>Início → Kickoff + Briefing → Pesquisa de Concorrência → Construção de Personas → Auditoria Digital → Consolidação SWOT → Revisão interna (Marco) → Apresentação ao cliente → Aprovação → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'CPL: Custo por Lead. VGV: Valor Geral de Vendas. Persona: representação semifictícia do cliente ideal. SWOT: análise de forças, fraquezas, oportunidades e ameaças. CTR: Click-Through Rate.', '<p>CPL: Custo por Lead. VGV: Valor Geral de Vendas. Persona: representação semifictícia do cliente ideal. SWOT: análise de forças, fraquezas, oportunidades e ameaças. CTR: Click-Through Rate.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-MKT-002: Plano de Marketing ──
END $$;
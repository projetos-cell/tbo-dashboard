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
    'Tráfego Pago',
    'tbo-mkt-009-trafego-pago',
    'marketing',
    'checklist',
    'Operar as campanhas de mídia paga (Meta Ads, Google Ads e portais imobiliários) do empreendimento com máxima eficiência, garantindo volume de leads qualificados dentro do CPL-alvo definido no plano de mídias.',
    'Standard Operating Procedure

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

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Tráfego Pago</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-009</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Operar as campanhas de mídia paga (Meta Ads, Google Ads e portais imobiliários) do empreendimento com máxima eficiência, garantindo volume de leads qualificados dentro do CPL-alvo definido no plano de mídias.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Configuração e operação de campanhas no Meta Ads e Google Ads, criação de públicos, setup de pixel e tags, testes criativos, otimização diária de lances e segmentações, relatório de tráfego.</p><p><strong>2.2 Exclusões</strong></p><p>Produção de criativos (BU Criação), planejamento de budget (MKT-03), gestão de portais imobiliários orgânico (BU Comercial).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Especialista em Tráfego</p></td><td><p>Opera e otimiza campanhas diariamente</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Define estratégia e aprova mudanças significativas</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Monitora KPIs e reporta anomalias</p></td><td><p>Rafa / Lucca</p></td><td><p>Especialista em Tráfego</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Plano de mídias aprovado (MKT-03); criativos aprovados nos formatos corretos; landing page validada com pixel instalado; acesso ao Gerenciador de Negócios Meta e Google Ads com permissão de editor; UTMs padronizadas conforme protocolo TBO.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Meta Ads Manager, Google Ads, Google Tag Manager, Google Analytics 4, planilha de monitoramento de campanhas TBO.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Setup Técnico e Configuração Inicial</strong></p><p>Ação: Configurar estrutura de campanhas: campanha → conjunto de anúncios → anúncios. Instalar/validar Pixel Meta e Google Tag via GTM. Configurar eventos de conversão (FormSubmit, PageView, Lead). Criar públicos personalizados (visitantes do site, engajadores, lookalike). Definir UTMs padrão TBO.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Estrutura de campanhas criada, pixels validados no Pixel Helper e Tag Assistant, eventos de conversão disparando corretamente.</p><p>Prazo referência: D-2 antes da ativação</p><p><strong>5.2. Ativação e Primeiras 48h</strong></p><p>Ação: Ativar campanhas conforme cronograma. Monitorar a cada 4h nas primeiras 48h: gasto vs. budget, CTR, custo por clique, volume de leads, qualidade dos leads no CRM. Intervir imediatamente se CPL &gt; 2x o alvo ou se houver zero conversões em 24h.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Log de monitoramento das primeiras 48h com ajustes realizados documentados.</p><p>Prazo referência: Primeiras 48h após ativação</p><p><strong>5.3. Rotina de Otimização Diária</strong></p><p>Ação: Todos os dias: verificar entrega e frequência de cada conjunto de anúncios; pausar anúncios com frequência &gt;3.5 ou CTR abaixo de 0.8% (Meta) / 2% (Google Search); escalar budget em conjuntos com CPL abaixo do alvo; atualizar planilha de monitoramento.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Planilha de monitoramento atualizada diariamente com ações tomadas.</p><p>Prazo referência: Diário</p><p><strong>5.4. Testes Criativos e de Públicos</strong></p><p>Ação: A cada 3 semanas, testar novos criativos (mínimo 2 variações por conjunto de anúncios). Testar novos públicos (lookalike de compradores, interesses alternativos). Documentar resultados e elevar os vencedores. Pausar perdedores após 7 dias de teste.</p><p>Responsável: Especialista em Tráfego + BU Criação</p><p>Output: Registro de testes com resultado por criativo e público. Criativos vencedores escalados.</p><p>Prazo referência: A cada 3 semanas</p><p><strong>5.5. Configuração de Remarketing</strong></p><p>Ação: Criar e ativar campanhas de remarketing para: visitantes da LP que não converteram (últimos 30 dias), leads que não agendaram visita (via lista do RD Station), visualizadores de vídeo &gt;50% (Meta). Definir cap de frequência e mensagens específicas por estágio.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Campanhas de remarketing ativas por segmento com mensagens diferenciadas.</p><p>Prazo referência: D+7 após ativação principal</p><p><strong>5.6. Relatório Semanal de Tráfego</strong></p><p>Ação: Elaborar relatório semanal: investimento total vs. budget, leads gerados por canal, CPL por canal, CTR médio, frequência média, melhores criativos, anomalias e ações tomadas, projeção para a semana seguinte.</p><p>Responsável: Especialista em Tráfego + Analista de Marketing</p><p>Output: Relatório semanal de tráfego enviado à Rafa/Lucca toda segunda-feira.</p><p>Prazo referência: Toda segunda-feira</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Pixel e tags validados antes da ativação; UTMs configuradas em 100% dos anúncios; remarketing ativo dentro de 7 dias; log de otimizações diário completo; testes criativos documentados; relatório semanal sem atraso.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Ativar campanhas sem validar pixel; ausência de UTMs (impossibilita rastreamento no GA4); não pausar criativos fatigados; otimizar apenas semanalmente; escalar budget sem verificar qualidade dos leads gerados.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Meta Ads Manager, Google Ads, Google Tag Manager, Google Analytics 4, Facebook Pixel Helper (extensão Chrome), Google Tag Assistant, planilha de monitoramento TBO.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Setup: D-2 antes da ativação; monitoramento intensivo: primeiras 48h; otimização diária: todos os dias; remarketing: D+7; relatório semanal: toda segunda-feira.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Setup técnico + pixels → Ativação → Monitoramento 48h → Rotina diária de otimização → Testes criativos (3 semanas) → Remarketing (D+7) → Relatório semanal → Fim</p><p><strong>  10. Glossário</strong></p><p>Pixel: código de rastreamento que monitora ações no site. GTM: Google Tag Manager. UTM: parâmetros de rastreamento em URLs. Frequência: média de vezes que o mesmo usuário viu o anúncio. Lookalike: público similar a uma base de referência. CPL: Custo por Lead.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
    8,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-MKT-009
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Operar as campanhas de mídia paga (Meta Ads, Google Ads e portais imobiliários) do empreendimento com máxima eficiência, garantindo volume de leads qualificados dentro do CPL-alvo definido no plano de mídias.', '<p>Operar as campanhas de mídia paga (Meta Ads, Google Ads e portais imobiliários) do empreendimento com máxima eficiência, garantindo volume de leads qualificados dentro do CPL-alvo definido no plano de mídias.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Configuração e operação de campanhas no Meta Ads e Google Ads, criação de públicos, setup de pixel e tags, testes criativos, otimização diária de lances e segmentações, relatório de tráfego.', '<p>Configuração e operação de campanhas no Meta Ads e Google Ads, criação de públicos, setup de pixel e tags, testes criativos, otimização diária de lances e segmentações, relatório de tráfego.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de criativos (BU Criação), planejamento de budget (MKT-03), gestão de portais imobiliários orgânico (BU Comercial).', '<p>Produção de criativos (BU Criação), planejamento de budget (MKT-03), gestão de portais imobiliários orgânico (BU Comercial).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Especialista em Tráfego', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Especialista em Tráfego</p></td><td><p>Opera e otimiza campanhas diariamente</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Define estratégia e aprova mudanças significativas</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Monitora KPIs e reporta anomalias</p></td><td><p>Rafa / Lucca</p></td><td><p>Especialista em Tráfego</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plano de mídias aprovado (MKT-03); criativos aprovados nos formatos corretos; landing page validada com pixel instalado; acesso ao Gerenciador de Negócios Meta e Google Ads com permissão de editor; UTMs padronizadas conforme protocolo TBO.', '<p>Plano de mídias aprovado (MKT-03); criativos aprovados nos formatos corretos; landing page validada com pixel instalado; acesso ao Gerenciador de Negócios Meta e Google Ads com permissão de editor; UTMs padronizadas conforme protocolo TBO.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Meta Ads Manager, Google Ads, Google Tag Manager, Google Analytics 4, planilha de monitoramento de campanhas TBO.', '<p>Meta Ads Manager, Google Ads, Google Tag Manager, Google Analytics 4, planilha de monitoramento de campanhas TBO.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Setup Técnico e Configuração Inicial', 'Ação: Configurar estrutura de campanhas: campanha → conjunto de anúncios → anúncios. Instalar/validar Pixel Meta e Google Tag via GTM. Configurar eventos de conversão (FormSubmit, PageView, Lead). Criar públicos personalizados (visitantes do site, engajadores, lookalike). Definir UTMs padrão TBO.

Responsável: Especialista em Tráfego

Output: Estrutura de campanhas criada, pixels validados no Pixel Helper e Tag Assistant, eventos de conversão disparando corretamente.

Prazo referência: D-2 antes da ativação', '<p>Ação: Configurar estrutura de campanhas: campanha → conjunto de anúncios → anúncios. Instalar/validar Pixel Meta e Google Tag via GTM. Configurar eventos de conversão (FormSubmit, PageView, Lead). Criar públicos personalizados (visitantes do site, engajadores, lookalike). Definir UTMs padrão TBO.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Estrutura de campanhas criada, pixels validados no Pixel Helper e Tag Assistant, eventos de conversão disparando corretamente.</p><p>Prazo referência: D-2 antes da ativação</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Ativação e Primeiras 48h', 'Ação: Ativar campanhas conforme cronograma. Monitorar a cada 4h nas primeiras 48h: gasto vs. budget, CTR, custo por clique, volume de leads, qualidade dos leads no CRM. Intervir imediatamente se CPL > 2x o alvo ou se houver zero conversões em 24h.

Responsável: Especialista em Tráfego

Output: Log de monitoramento das primeiras 48h com ajustes realizados documentados.

Prazo referência: Primeiras 48h após ativação', '<p>Ação: Ativar campanhas conforme cronograma. Monitorar a cada 4h nas primeiras 48h: gasto vs. budget, CTR, custo por clique, volume de leads, qualidade dos leads no CRM. Intervir imediatamente se CPL &gt; 2x o alvo ou se houver zero conversões em 24h.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Log de monitoramento das primeiras 48h com ajustes realizados documentados.</p><p>Prazo referência: Primeiras 48h após ativação</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Rotina de Otimização Diária', 'Ação: Todos os dias: verificar entrega e frequência de cada conjunto de anúncios; pausar anúncios com frequência >3.5 ou CTR abaixo de 0.8% (Meta) / 2% (Google Search); escalar budget em conjuntos com CPL abaixo do alvo; atualizar planilha de monitoramento.

Responsável: Especialista em Tráfego

Output: Planilha de monitoramento atualizada diariamente com ações tomadas.

Prazo referência: Diário', '<p>Ação: Todos os dias: verificar entrega e frequência de cada conjunto de anúncios; pausar anúncios com frequência &gt;3.5 ou CTR abaixo de 0.8% (Meta) / 2% (Google Search); escalar budget em conjuntos com CPL abaixo do alvo; atualizar planilha de monitoramento.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Planilha de monitoramento atualizada diariamente com ações tomadas.</p><p>Prazo referência: Diário</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Testes Criativos e de Públicos', 'Ação: A cada 3 semanas, testar novos criativos (mínimo 2 variações por conjunto de anúncios). Testar novos públicos (lookalike de compradores, interesses alternativos). Documentar resultados e elevar os vencedores. Pausar perdedores após 7 dias de teste.

Responsável: Especialista em Tráfego + BU Criação

Output: Registro de testes com resultado por criativo e público. Criativos vencedores escalados.

Prazo referência: A cada 3 semanas', '<p>Ação: A cada 3 semanas, testar novos criativos (mínimo 2 variações por conjunto de anúncios). Testar novos públicos (lookalike de compradores, interesses alternativos). Documentar resultados e elevar os vencedores. Pausar perdedores após 7 dias de teste.</p><p>Responsável: Especialista em Tráfego + BU Criação</p><p>Output: Registro de testes com resultado por criativo e público. Criativos vencedores escalados.</p><p>Prazo referência: A cada 3 semanas</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Configuração de Remarketing', 'Ação: Criar e ativar campanhas de remarketing para: visitantes da LP que não converteram (últimos 30 dias), leads que não agendaram visita (via lista do RD Station), visualizadores de vídeo >50% (Meta). Definir cap de frequência e mensagens específicas por estágio.

Responsável: Especialista em Tráfego

Output: Campanhas de remarketing ativas por segmento com mensagens diferenciadas.

Prazo referência: D+7 após ativação principal', '<p>Ação: Criar e ativar campanhas de remarketing para: visitantes da LP que não converteram (últimos 30 dias), leads que não agendaram visita (via lista do RD Station), visualizadores de vídeo &gt;50% (Meta). Definir cap de frequência e mensagens específicas por estágio.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Campanhas de remarketing ativas por segmento com mensagens diferenciadas.</p><p>Prazo referência: D+7 após ativação principal</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Relatório Semanal de Tráfego', 'Ação: Elaborar relatório semanal: investimento total vs. budget, leads gerados por canal, CPL por canal, CTR médio, frequência média, melhores criativos, anomalias e ações tomadas, projeção para a semana seguinte.

Responsável: Especialista em Tráfego + Analista de Marketing

Output: Relatório semanal de tráfego enviado à Rafa/Lucca toda segunda-feira.

Prazo referência: Toda segunda-feira', '<p>Ação: Elaborar relatório semanal: investimento total vs. budget, leads gerados por canal, CPL por canal, CTR médio, frequência média, melhores criativos, anomalias e ações tomadas, projeção para a semana seguinte.</p><p>Responsável: Especialista em Tráfego + Analista de Marketing</p><p>Output: Relatório semanal de tráfego enviado à Rafa/Lucca toda segunda-feira.</p><p>Prazo referência: Toda segunda-feira</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Pixel e tags validados antes da ativação; UTMs configuradas em 100% dos anúncios; remarketing ativo dentro de 7 dias; log de otimizações diário completo; testes criativos documentados; relatório semanal sem atraso.', '<p>Pixel e tags validados antes da ativação; UTMs configuradas em 100% dos anúncios; remarketing ativo dentro de 7 dias; log de otimizações diário completo; testes criativos documentados; relatório semanal sem atraso.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Ativar campanhas sem validar pixel; ausência de UTMs (impossibilita rastreamento no GA4); não pausar criativos fatigados; otimizar apenas semanalmente; escalar budget sem verificar qualidade dos leads gerados.', '<p>Ativar campanhas sem validar pixel; ausência de UTMs (impossibilita rastreamento no GA4); não pausar criativos fatigados; otimizar apenas semanalmente; escalar budget sem verificar qualidade dos leads gerados.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Meta Ads Manager, Google Ads, Google Tag Manager, Google Analytics 4, Facebook Pixel Helper (extensão Chrome), Google Tag Assistant, planilha de monitoramento TBO.', '<p>Meta Ads Manager, Google Ads, Google Tag Manager, Google Analytics 4, Facebook Pixel Helper (extensão Chrome), Google Tag Assistant, planilha de monitoramento TBO.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Setup: D-2 antes da ativação; monitoramento intensivo: primeiras 48h; otimização diária: todos os dias; remarketing: D+7; relatório semanal: toda segunda-feira.', '<p>Setup: D-2 antes da ativação; monitoramento intensivo: primeiras 48h; otimização diária: todos os dias; remarketing: D+7; relatório semanal: toda segunda-feira.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Setup técnico + pixels → Ativação → Monitoramento 48h → Rotina diária de otimização → Testes criativos (3 semanas) → Remarketing (D+7) → Relatório semanal → Fim', '<p>Início → Setup técnico + pixels → Ativação → Monitoramento 48h → Rotina diária de otimização → Testes criativos (3 semanas) → Remarketing (D+7) → Relatório semanal → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Pixel: código de rastreamento que monitora ações no site. GTM: Google Tag Manager. UTM: parâmetros de rastreamento em URLs. Frequência: média de vezes que o mesmo usuário viu o anúncio. Lookalike: público similar a uma base de referência. CPL: Custo por Lead.', '<p>Pixel: código de rastreamento que monitora ações no site. GTM: Google Tag Manager. UTM: parâmetros de rastreamento em URLs. Frequência: média de vezes que o mesmo usuário viu o anúncio. Lookalike: público similar a uma base de referência. CPL: Custo por Lead.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-MKT-010: SEO ──
END $$;
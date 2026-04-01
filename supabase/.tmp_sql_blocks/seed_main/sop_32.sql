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
    'Gestão de Campanha Pré Lançamento 45d',
    'tbo-mkt-004-gestao-de-campanha-pre-lancamento-45d',
    'marketing',
    'checklist',
    'Gestão de Campanha — Pré-Lançamento (45d)',
    'Standard Operating Procedure

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

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Campanha — Pré-Lançamento (45d)</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-004</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Executar a fase de pré-lançamento da campanha imobiliária nos 45 dias anteriores ao evento de lançamento, construindo base de leads qualificados, gerando expectativa e preparando todos os ativos digitais para o lançamento.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Ativação de campanhas de captura de leads, construção de landing page, aquecimento de base, ativação de influenciadores, monitoramento de performance e otimização diária de campanhas.</p><p><strong>2.2 Exclusões</strong></p><p>Evento de lançamento presencial (BU Eventos), produção de criativos (BU Criação), gestão de relacionamento pós-visita (BU Comercial).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Lidera execução da fase</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente, BU Comercial</p></td></tr><tr><td><p>Especialista em Tráfego</p></td><td><p>Opera campanhas pagas diariamente</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Monitora KPIs e prepara relatório semanal</p></td><td><p>Rafa / Lucca</p></td><td><p>Cliente</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Plano de Mídias aprovado (MKT-03); criativos da fase pré-lançamento entregues e aprovados (BU Criação); landing page da campanha desenvolvida e testada; URL de rastreamento configurada; RD Station configurado com fluxo de nutrição.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Setup e Ativação das Campanhas</strong></p><p>Ação: Configurar todas as campanhas no Meta Ads e Google Ads conforme plano de mídias: criar públicos, carregar criativos, definir objetivos de campanha (conversão/leads), configurar pixel e tags de rastreamento. Testar fluxo completo lead → CRM antes de ativar.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Campanhas ativas com rastreamento validado e leads chegando ao RD Station.</p><p>Prazo referência: D-45 (início da fase)</p><p><strong>5.2. Validação da Landing Page e Rastreamento</strong></p><p>Ação: Validar landing page com checklist: velocidade (PageSpeed &gt;80), formulário funcionando, pixel disparando, GA4 registrando eventos, Hotjar gravando sessões, responsividade mobile.</p><p>Responsável: Analista de Marketing + Especialista em Tráfego</p><p>Output: Checklist de validação 100% aprovado. Hotjar e GA4 confirmados.</p><p>Prazo referência: D-45</p><p><strong>5.3. Ativação de Influenciadores e Conteúdo Orgânico</strong></p><p>Ação: Coordenar publicações dos influenciadores contratados conforme calendário. Publicar conteúdo orgânico nas redes do empreendimento e do cliente (teasers, countdown, bastidores). Monitorar engajamento e responder comentários.</p><p>Responsável: Rafa / Lucca + Analista de Marketing</p><p>Output: Publicações realizadas conforme calendário com registro de métricas de engajamento.</p><p>Prazo referência: Conforme calendário de conteúdo</p><p><strong>5.4. Monitoramento Diário e Otimização</strong></p><p>Ação: Revisar diariamente: custo por lead, volume de leads, CTR, frequência de anúncios, qualidade dos leads (taxa de resposta no CRM). Realizar otimizações: pausar criativos com baixo desempenho, ajustar lances, testar novos públicos.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Log diário de otimizações na planilha de monitoramento.</p><p>Prazo referência: Diário durante os 45 dias</p><p><strong>5.5. Relatório Semanal de Performance</strong></p><p>Ação: Compilar relatório semanal com evolução dos KPIs: leads acumulados vs. meta, CPL por canal, distribuição por público, principais criativos, aprendizados e próximos ajustes. Enviar ao cliente toda segunda-feira.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório semanal enviado ao cliente com análise e recomendações.</p><p>Prazo referência: Toda segunda-feira</p><p><strong>5.6. Preparação da Base para o Lançamento</strong></p><p>Ação: Nos 7 dias anteriores ao lançamento: intensificar campanhas, enviar e-mail de convite ao evento para toda a base, ativar fluxo de nutrição intensivo no RD Station, preparar relatório de status da base para o time comercial.</p><p>Responsável: Rafa / Lucca</p><p>Output: Relatório de base de leads para BU Comercial: volume, segmentação por temperatura, histórico de interações.</p><p>Prazo referência: D-7 antes do lançamento</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Rastreamento validado antes de ativar campanhas; meta de leads da fase &gt;80% atingida ao fim dos 45 dias; relatórios semanais enviados sem atraso; log de otimizações completo; base entregue ao comercial com segmentação de temperatura.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Campanhas ativadas sem validar rastreamento; otimizações apenas semanais (devem ser diárias); relatório semanal sem recomendações práticas; base entregue ao comercial sem segmentação por temperatura de interesse.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO, Notion.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Setup: D-45 (dia 1 da fase); primeiros leads em 48h após ativação; relatório semanal toda segunda-feira; entrega de base ao comercial: D-7 do lançamento.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Setup campanhas + LP → Validação rastreamento → Ativação campanhas → Conteúdo orgânico e influenciadores → Monitoramento diário → Relatório semanal → Intensificação (D-7) → Entrega base ao comercial → Fim da fase</p><p><strong>  10. Glossário</strong></p><p>LP: Landing Page. CRM: Customer Relationship Management (RD Station). Pixel: código de rastreamento do Meta. Temperatura de lead: classificação por nível de interesse (quente, morno, frio). Frequência: média de vezes que o mesmo usuário viu o anúncio.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-MKT-004
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Executar a fase de pré-lançamento da campanha imobiliária nos 45 dias anteriores ao evento de lançamento, construindo base de leads qualificados, gerando expectativa e preparando todos os ativos digitais para o lançamento.', '<p>Executar a fase de pré-lançamento da campanha imobiliária nos 45 dias anteriores ao evento de lançamento, construindo base de leads qualificados, gerando expectativa e preparando todos os ativos digitais para o lançamento.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Ativação de campanhas de captura de leads, construção de landing page, aquecimento de base, ativação de influenciadores, monitoramento de performance e otimização diária de campanhas.', '<p>Ativação de campanhas de captura de leads, construção de landing page, aquecimento de base, ativação de influenciadores, monitoramento de performance e otimização diária de campanhas.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Evento de lançamento presencial (BU Eventos), produção de criativos (BU Criação), gestão de relacionamento pós-visita (BU Comercial).', '<p>Evento de lançamento presencial (BU Eventos), produção de criativos (BU Criação), gestão de relacionamento pós-visita (BU Comercial).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Cliente', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Lidera execução da fase</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente, BU Comercial</p></td></tr><tr><td><p>Especialista em Tráfego</p></td><td><p>Opera campanhas pagas diariamente</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Monitora KPIs e prepara relatório semanal</p></td><td><p>Rafa / Lucca</p></td><td><p>Cliente</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plano de Mídias aprovado (MKT-03); criativos da fase pré-lançamento entregues e aprovados (BU Criação); landing page da campanha desenvolvida e testada; URL de rastreamento configurada; RD Station configurado com fluxo de nutrição.', '<p>Plano de Mídias aprovado (MKT-03); criativos da fase pré-lançamento entregues e aprovados (BU Criação); landing page da campanha desenvolvida e testada; URL de rastreamento configurada; RD Station configurado com fluxo de nutrição.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO.', '<p>Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Setup e Ativação das Campanhas', 'Ação: Configurar todas as campanhas no Meta Ads e Google Ads conforme plano de mídias: criar públicos, carregar criativos, definir objetivos de campanha (conversão/leads), configurar pixel e tags de rastreamento. Testar fluxo completo lead → CRM antes de ativar.

Responsável: Especialista em Tráfego

Output: Campanhas ativas com rastreamento validado e leads chegando ao RD Station.

Prazo referência: D-45 (início da fase)', '<p>Ação: Configurar todas as campanhas no Meta Ads e Google Ads conforme plano de mídias: criar públicos, carregar criativos, definir objetivos de campanha (conversão/leads), configurar pixel e tags de rastreamento. Testar fluxo completo lead → CRM antes de ativar.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Campanhas ativas com rastreamento validado e leads chegando ao RD Station.</p><p>Prazo referência: D-45 (início da fase)</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Validação da Landing Page e Rastreamento', 'Ação: Validar landing page com checklist: velocidade (PageSpeed >80), formulário funcionando, pixel disparando, GA4 registrando eventos, Hotjar gravando sessões, responsividade mobile.

Responsável: Analista de Marketing + Especialista em Tráfego

Output: Checklist de validação 100% aprovado. Hotjar e GA4 confirmados.

Prazo referência: D-45', '<p>Ação: Validar landing page com checklist: velocidade (PageSpeed &gt;80), formulário funcionando, pixel disparando, GA4 registrando eventos, Hotjar gravando sessões, responsividade mobile.</p><p>Responsável: Analista de Marketing + Especialista em Tráfego</p><p>Output: Checklist de validação 100% aprovado. Hotjar e GA4 confirmados.</p><p>Prazo referência: D-45</p>', 7, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Ativação de Influenciadores e Conteúdo Orgânico', 'Ação: Coordenar publicações dos influenciadores contratados conforme calendário. Publicar conteúdo orgânico nas redes do empreendimento e do cliente (teasers, countdown, bastidores). Monitorar engajamento e responder comentários.

Responsável: Rafa / Lucca + Analista de Marketing

Output: Publicações realizadas conforme calendário com registro de métricas de engajamento.

Prazo referência: Conforme calendário de conteúdo', '<p>Ação: Coordenar publicações dos influenciadores contratados conforme calendário. Publicar conteúdo orgânico nas redes do empreendimento e do cliente (teasers, countdown, bastidores). Monitorar engajamento e responder comentários.</p><p>Responsável: Rafa / Lucca + Analista de Marketing</p><p>Output: Publicações realizadas conforme calendário com registro de métricas de engajamento.</p><p>Prazo referência: Conforme calendário de conteúdo</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Monitoramento Diário e Otimização', 'Ação: Revisar diariamente: custo por lead, volume de leads, CTR, frequência de anúncios, qualidade dos leads (taxa de resposta no CRM). Realizar otimizações: pausar criativos com baixo desempenho, ajustar lances, testar novos públicos.

Responsável: Especialista em Tráfego

Output: Log diário de otimizações na planilha de monitoramento.

Prazo referência: Diário durante os 45 dias', '<p>Ação: Revisar diariamente: custo por lead, volume de leads, CTR, frequência de anúncios, qualidade dos leads (taxa de resposta no CRM). Realizar otimizações: pausar criativos com baixo desempenho, ajustar lances, testar novos públicos.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Log diário de otimizações na planilha de monitoramento.</p><p>Prazo referência: Diário durante os 45 dias</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Relatório Semanal de Performance', 'Ação: Compilar relatório semanal com evolução dos KPIs: leads acumulados vs. meta, CPL por canal, distribuição por público, principais criativos, aprendizados e próximos ajustes. Enviar ao cliente toda segunda-feira.

Responsável: Analista de Marketing

Output: Relatório semanal enviado ao cliente com análise e recomendações.

Prazo referência: Toda segunda-feira', '<p>Ação: Compilar relatório semanal com evolução dos KPIs: leads acumulados vs. meta, CPL por canal, distribuição por público, principais criativos, aprendizados e próximos ajustes. Enviar ao cliente toda segunda-feira.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório semanal enviado ao cliente com análise e recomendações.</p><p>Prazo referência: Toda segunda-feira</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Preparação da Base para o Lançamento', 'Ação: Nos 7 dias anteriores ao lançamento: intensificar campanhas, enviar e-mail de convite ao evento para toda a base, ativar fluxo de nutrição intensivo no RD Station, preparar relatório de status da base para o time comercial.

Responsável: Rafa / Lucca

Output: Relatório de base de leads para BU Comercial: volume, segmentação por temperatura, histórico de interações.

Prazo referência: D-7 antes do lançamento', '<p>Ação: Nos 7 dias anteriores ao lançamento: intensificar campanhas, enviar e-mail de convite ao evento para toda a base, ativar fluxo de nutrição intensivo no RD Station, preparar relatório de status da base para o time comercial.</p><p>Responsável: Rafa / Lucca</p><p>Output: Relatório de base de leads para BU Comercial: volume, segmentação por temperatura, histórico de interações.</p><p>Prazo referência: D-7 antes do lançamento</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Rastreamento validado antes de ativar campanhas; meta de leads da fase >80% atingida ao fim dos 45 dias; relatórios semanais enviados sem atraso; log de otimizações completo; base entregue ao comercial com segmentação de temperatura.', '<p>Rastreamento validado antes de ativar campanhas; meta de leads da fase &gt;80% atingida ao fim dos 45 dias; relatórios semanais enviados sem atraso; log de otimizações completo; base entregue ao comercial com segmentação de temperatura.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Campanhas ativadas sem validar rastreamento; otimizações apenas semanais (devem ser diárias); relatório semanal sem recomendações práticas; base entregue ao comercial sem segmentação por temperatura de interesse.', '<p>Campanhas ativadas sem validar rastreamento; otimizações apenas semanais (devem ser diárias); relatório semanal sem recomendações práticas; base entregue ao comercial sem segmentação por temperatura de interesse.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO, Notion.', '<p>Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO, Notion.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Setup: D-45 (dia 1 da fase); primeiros leads em 48h após ativação; relatório semanal toda segunda-feira; entrega de base ao comercial: D-7 do lançamento.', '<p>Setup: D-45 (dia 1 da fase); primeiros leads em 48h após ativação; relatório semanal toda segunda-feira; entrega de base ao comercial: D-7 do lançamento.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Setup campanhas + LP → Validação rastreamento → Ativação campanhas → Conteúdo orgânico e influenciadores → Monitoramento diário → Relatório semanal → Intensificação (D-7) → Entrega base ao comercial → Fim da fase', '<p>Início → Setup campanhas + LP → Validação rastreamento → Ativação campanhas → Conteúdo orgânico e influenciadores → Monitoramento diário → Relatório semanal → Intensificação (D-7) → Entrega base ao comercial → Fim da fase</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'LP: Landing Page. CRM: Customer Relationship Management (RD Station). Pixel: código de rastreamento do Meta. Temperatura de lead: classificação por nível de interesse (quente, morno, frio). Frequência: média de vezes que o mesmo usuário viu o anúncio.', '<p>LP: Landing Page. CRM: Customer Relationship Management (RD Station). Pixel: código de rastreamento do Meta. Temperatura de lead: classificação por nível de interesse (quente, morno, frio). Frequência: média de vezes que o mesmo usuário viu o anúncio.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-MKT-005: Gestão de Campanha Lançamento 120d ──
END $$;
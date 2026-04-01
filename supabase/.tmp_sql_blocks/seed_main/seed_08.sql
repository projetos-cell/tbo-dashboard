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
    'E mail Marketing',
    'tbo-mkt-008-e-mail-marketing',
    'marketing',
    'checklist',
    'Planejar, criar, segmentar e disparar campanhas de e-mail marketing para nutrição de leads, comunicação de marcos da campanha e reengajamento de base ao longo de todo o ciclo do empreendimento.',
    'Standard Operating Procedure

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

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>E-mail Marketing</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-008</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Planejar, criar, segmentar e disparar campanhas de e-mail marketing para nutrição de leads, comunicação de marcos da campanha e reengajamento de base ao longo de todo o ciclo do empreendimento.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Estratégia de e-mail por fase, criação de fluxos de automação, segmentação de base, criação de e-mails, testes A/B, análise de performance e otimização.</p><p><strong>2.2 Exclusões</strong></p><p>Produção de criativos HTML complexos (BU Criação), gestão do CRM além do e-mail (BU Comercial), WhatsApp Marketing.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Opera e-mail marketing diariamente</p></td><td><p>Rafa / Lucca</p></td><td><p>Cliente</p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Define estratégia e aprova conteúdo</p></td><td><p>Marco Andolfato</p></td><td><p>BU Comercial</p></td></tr><tr><td><p>BU Criação</p></td><td><p>Fornece assets visuais para e-mails</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Base de leads no RD Station segmentada por origem e temperatura; plano de conteúdo aprovado; criativos e textos aprovados; LGPD: consentimento de todos os contatos confirmado.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>RD Station (automação e envio), Mailchimp (backup/alternativo), Google Analytics 4 (rastreamento de cliques), planilha de calendário de e-mails TBO.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Estratégia e Calendário de E-mails</strong></p><p>Ação: Mapear todos os e-mails da campanha por fase: boas-vindas, nutrição (conteúdo de valor), convite ao evento, pós-evento, urgência de estoque, reativação. Definir frequência, segmentação e objetivo de cada e-mail. Montar calendário.</p><p>Responsável: Rafa / Lucca</p><p>Output: Calendário de e-mail marketing com tipo, data, segmentação e objetivo de cada disparo.</p><p>Prazo referência: D+3 após plano de marketing aprovado</p><p><strong>5.2. Configuração de Fluxos de Automação</strong></p><p>Ação: Configurar no RD Station: fluxo de boas-vindas (imediato após lead), fluxo de nutrição (sequência de conteúdos de valor em 7/14/21 dias), fluxo de lead frio (reativação após 30 dias sem interação), lead scoring para qualificação automática.</p><p>Responsável: Analista de Marketing</p><p>Output: Fluxos de automação ativos e testados no RD Station.</p><p>Prazo referência: D+7</p><p><strong>5.3. Criação e Aprovação de E-mails</strong></p><p>Ação: Criar e-mails seguindo template TBO: assunto (max 50 caracteres), preheader, body com 1 CTA claro, texto do botão, versão mobile otimizada. Revisão ortográfica e de links. Aprovação do cliente para comunicações diretas.</p><p>Responsável: Analista de Marketing</p><p>Output: E-mails criados, revisados e aprovados no RD Station prontos para disparo.</p><p>Prazo referência: Conforme calendário</p><p><strong>5.4. Segmentação e Personalização</strong></p><p>Ação: Segmentar base antes de cada disparo: temperatura (quente/morno/frio), origem do lead (Meta/Google/orgânico/indicação), estágio no funil, perfil de interesse (tipo de unidade). Personalizar assunto e CTA conforme segmento.</p><p>Responsável: Analista de Marketing</p><p>Output: Segmentos criados no RD Station com lista de envio validada antes do disparo.</p><p>Prazo referência: 24h antes do disparo</p><p><strong>5.5. Teste A/B e Disparo</strong></p><p>Ação: Para e-mails de alta importância (convite ao lançamento, oferta de estoque final): testar 2 versões de assunto com 20% da base. Aguardar 4h, selecionar vencedor e disparar para 80% restante.</p><p>Responsável: Analista de Marketing</p><p>Output: Registro do teste A/B com resultado e versão selecionada. Disparo realizado.</p><p>Prazo referência: Conforme calendário</p><p><strong>5.6. Análise de Performance e Otimização</strong></p><p>Ação: Analisar métricas 48h após cada disparo: taxa de abertura (benchmark: &gt;25%), CTR (benchmark: &gt;3%), taxa de descadastro (&lt;0.5%), conversões rastreadas via GA4. Documentar aprendizados e ajustar próximos e-mails.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório de performance por e-mail com análise e recomendações para próximos disparos.</p><p>Prazo referência: 48h após cada disparo</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Consentimento LGPD verificado antes de qualquer disparo; todos os links testados antes do envio; versão mobile testada; taxa de descadastro monitorada; fluxos de automação testados com lead de teste antes de ativar.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Disparar para base sem segmentação; e-mail sem CTA claro; assunto genérico sem personalização; não testar links antes do envio; não monitorar taxa de descadastro; fluxos de automação ativados sem teste.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>RD Station (principal), Mailchimp (backup), Google Analytics 4, planilha de calendário TBO, Litmus ou Email on Acid (teste de renderização mobile).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Calendário de e-mails: D+3; fluxos de automação: D+7; análise de performance: 48h após cada disparo; taxa de descadastro máxima: 0,5% por disparo.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Estratégia e calendário → Fluxos de automação → Criação de e-mails → Segmentação → Teste A/B → Disparo → Análise de performance → Otimização → Próximo e-mail → Fim</p><p><strong>  10. Glossário</strong></p><p>Taxa de abertura: percentual de destinatários que abriram o e-mail. CTR: percentual que clicou em algum link. Lead scoring: pontuação automática de leads por comportamento. LGPD: Lei Geral de Proteção de Dados. Preheader: texto de prévia exibido após o assunto na caixa de entrada.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
    7,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-MKT-008
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Planejar, criar, segmentar e disparar campanhas de e-mail marketing para nutrição de leads, comunicação de marcos da campanha e reengajamento de base ao longo de todo o ciclo do empreendimento.', '<p>Planejar, criar, segmentar e disparar campanhas de e-mail marketing para nutrição de leads, comunicação de marcos da campanha e reengajamento de base ao longo de todo o ciclo do empreendimento.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Estratégia de e-mail por fase, criação de fluxos de automação, segmentação de base, criação de e-mails, testes A/B, análise de performance e otimização.', '<p>Estratégia de e-mail por fase, criação de fluxos de automação, segmentação de base, criação de e-mails, testes A/B, análise de performance e otimização.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de criativos HTML complexos (BU Criação), gestão do CRM além do e-mail (BU Comercial), WhatsApp Marketing.', '<p>Produção de criativos HTML complexos (BU Criação), gestão do CRM além do e-mail (BU Comercial), WhatsApp Marketing.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Analista de Marketing', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Opera e-mail marketing diariamente</p></td><td><p>Rafa / Lucca</p></td><td><p>Cliente</p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Define estratégia e aprova conteúdo</p></td><td><p>Marco Andolfato</p></td><td><p>BU Comercial</p></td></tr><tr><td><p>BU Criação</p></td><td><p>Fornece assets visuais para e-mails</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Base de leads no RD Station segmentada por origem e temperatura; plano de conteúdo aprovado; criativos e textos aprovados; LGPD: consentimento de todos os contatos confirmado.', '<p>Base de leads no RD Station segmentada por origem e temperatura; plano de conteúdo aprovado; criativos e textos aprovados; LGPD: consentimento de todos os contatos confirmado.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'RD Station (automação e envio), Mailchimp (backup/alternativo), Google Analytics 4 (rastreamento de cliques), planilha de calendário de e-mails TBO.', '<p>RD Station (automação e envio), Mailchimp (backup/alternativo), Google Analytics 4 (rastreamento de cliques), planilha de calendário de e-mails TBO.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Estratégia e Calendário de E-mails', 'Ação: Mapear todos os e-mails da campanha por fase: boas-vindas, nutrição (conteúdo de valor), convite ao evento, pós-evento, urgência de estoque, reativação. Definir frequência, segmentação e objetivo de cada e-mail. Montar calendário.

Responsável: Rafa / Lucca

Output: Calendário de e-mail marketing com tipo, data, segmentação e objetivo de cada disparo.

Prazo referência: D+3 após plano de marketing aprovado', '<p>Ação: Mapear todos os e-mails da campanha por fase: boas-vindas, nutrição (conteúdo de valor), convite ao evento, pós-evento, urgência de estoque, reativação. Definir frequência, segmentação e objetivo de cada e-mail. Montar calendário.</p><p>Responsável: Rafa / Lucca</p><p>Output: Calendário de e-mail marketing com tipo, data, segmentação e objetivo de cada disparo.</p><p>Prazo referência: D+3 após plano de marketing aprovado</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Configuração de Fluxos de Automação', 'Ação: Configurar no RD Station: fluxo de boas-vindas (imediato após lead), fluxo de nutrição (sequência de conteúdos de valor em 7/14/21 dias), fluxo de lead frio (reativação após 30 dias sem interação), lead scoring para qualificação automática.

Responsável: Analista de Marketing

Output: Fluxos de automação ativos e testados no RD Station.

Prazo referência: D+7', '<p>Ação: Configurar no RD Station: fluxo de boas-vindas (imediato após lead), fluxo de nutrição (sequência de conteúdos de valor em 7/14/21 dias), fluxo de lead frio (reativação após 30 dias sem interação), lead scoring para qualificação automática.</p><p>Responsável: Analista de Marketing</p><p>Output: Fluxos de automação ativos e testados no RD Station.</p><p>Prazo referência: D+7</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Criação e Aprovação de E-mails', 'Ação: Criar e-mails seguindo template TBO: assunto (max 50 caracteres), preheader, body com 1 CTA claro, texto do botão, versão mobile otimizada. Revisão ortográfica e de links. Aprovação do cliente para comunicações diretas.

Responsável: Analista de Marketing

Output: E-mails criados, revisados e aprovados no RD Station prontos para disparo.

Prazo referência: Conforme calendário', '<p>Ação: Criar e-mails seguindo template TBO: assunto (max 50 caracteres), preheader, body com 1 CTA claro, texto do botão, versão mobile otimizada. Revisão ortográfica e de links. Aprovação do cliente para comunicações diretas.</p><p>Responsável: Analista de Marketing</p><p>Output: E-mails criados, revisados e aprovados no RD Station prontos para disparo.</p><p>Prazo referência: Conforme calendário</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Segmentação e Personalização', 'Ação: Segmentar base antes de cada disparo: temperatura (quente/morno/frio), origem do lead (Meta/Google/orgânico/indicação), estágio no funil, perfil de interesse (tipo de unidade). Personalizar assunto e CTA conforme segmento.

Responsável: Analista de Marketing

Output: Segmentos criados no RD Station com lista de envio validada antes do disparo.

Prazo referência: 24h antes do disparo', '<p>Ação: Segmentar base antes de cada disparo: temperatura (quente/morno/frio), origem do lead (Meta/Google/orgânico/indicação), estágio no funil, perfil de interesse (tipo de unidade). Personalizar assunto e CTA conforme segmento.</p><p>Responsável: Analista de Marketing</p><p>Output: Segmentos criados no RD Station com lista de envio validada antes do disparo.</p><p>Prazo referência: 24h antes do disparo</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Teste A/B e Disparo', 'Ação: Para e-mails de alta importância (convite ao lançamento, oferta de estoque final): testar 2 versões de assunto com 20% da base. Aguardar 4h, selecionar vencedor e disparar para 80% restante.

Responsável: Analista de Marketing

Output: Registro do teste A/B com resultado e versão selecionada. Disparo realizado.

Prazo referência: Conforme calendário', '<p>Ação: Para e-mails de alta importância (convite ao lançamento, oferta de estoque final): testar 2 versões de assunto com 20% da base. Aguardar 4h, selecionar vencedor e disparar para 80% restante.</p><p>Responsável: Analista de Marketing</p><p>Output: Registro do teste A/B com resultado e versão selecionada. Disparo realizado.</p><p>Prazo referência: Conforme calendário</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Análise de Performance e Otimização', 'Ação: Analisar métricas 48h após cada disparo: taxa de abertura (benchmark: >25%), CTR (benchmark: >3%), taxa de descadastro (<0.5%), conversões rastreadas via GA4. Documentar aprendizados e ajustar próximos e-mails.

Responsável: Analista de Marketing

Output: Relatório de performance por e-mail com análise e recomendações para próximos disparos.

Prazo referência: 48h após cada disparo', '<p>Ação: Analisar métricas 48h após cada disparo: taxa de abertura (benchmark: &gt;25%), CTR (benchmark: &gt;3%), taxa de descadastro (&lt;0.5%), conversões rastreadas via GA4. Documentar aprendizados e ajustar próximos e-mails.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório de performance por e-mail com análise e recomendações para próximos disparos.</p><p>Prazo referência: 48h após cada disparo</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Consentimento LGPD verificado antes de qualquer disparo; todos os links testados antes do envio; versão mobile testada; taxa de descadastro monitorada; fluxos de automação testados com lead de teste antes de ativar.', '<p>Consentimento LGPD verificado antes de qualquer disparo; todos os links testados antes do envio; versão mobile testada; taxa de descadastro monitorada; fluxos de automação testados com lead de teste antes de ativar.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Disparar para base sem segmentação; e-mail sem CTA claro; assunto genérico sem personalização; não testar links antes do envio; não monitorar taxa de descadastro; fluxos de automação ativados sem teste.', '<p>Disparar para base sem segmentação; e-mail sem CTA claro; assunto genérico sem personalização; não testar links antes do envio; não monitorar taxa de descadastro; fluxos de automação ativados sem teste.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'RD Station (principal), Mailchimp (backup), Google Analytics 4, planilha de calendário TBO, Litmus ou Email on Acid (teste de renderização mobile).', '<p>RD Station (principal), Mailchimp (backup), Google Analytics 4, planilha de calendário TBO, Litmus ou Email on Acid (teste de renderização mobile).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Calendário de e-mails: D+3; fluxos de automação: D+7; análise de performance: 48h após cada disparo; taxa de descadastro máxima: 0,5% por disparo.', '<p>Calendário de e-mails: D+3; fluxos de automação: D+7; análise de performance: 48h após cada disparo; taxa de descadastro máxima: 0,5% por disparo.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Estratégia e calendário → Fluxos de automação → Criação de e-mails → Segmentação → Teste A/B → Disparo → Análise de performance → Otimização → Próximo e-mail → Fim', '<p>Início → Estratégia e calendário → Fluxos de automação → Criação de e-mails → Segmentação → Teste A/B → Disparo → Análise de performance → Otimização → Próximo e-mail → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Taxa de abertura: percentual de destinatários que abriram o e-mail. CTR: percentual que clicou em algum link. Lead scoring: pontuação automática de leads por comportamento. LGPD: Lei Geral de Proteção de Dados. Preheader: texto de prévia exibido após o assunto na caixa de entrada.', '<p>Taxa de abertura: percentual de destinatários que abriram o e-mail. CTR: percentual que clicou em algum link. Lead scoring: pontuação automática de leads por comportamento. LGPD: Lei Geral de Proteção de Dados. Preheader: texto de prévia exibido após o assunto na caixa de entrada.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-MKT-009: Tráfego Pago ──
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
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'SEO',
    'tbo-mkt-010-seo',
    'marketing',
    'checklist',
    'Implementar estratégia de SEO para o empreendimento imobiliário, aumentando a visibilidade orgânica nos buscadores para termos relevantes de compra de imóveis na região do produto, gerando tráfego qualificado de custo zero.',
    'Standard Operating Procedure

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

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>SEO</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-010</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Implementar estratégia de SEO para o empreendimento imobiliário, aumentando a visibilidade orgânica nos buscadores para termos relevantes de compra de imóveis na região do produto, gerando tráfego qualificado de custo zero.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Pesquisa de palavras-chave, otimização on-page da landing page e site do empreendimento, SEO local (Google Meu Negócio), link building básico, monitoramento de rankings e tráfego orgânico.</p><p><strong>2.2 Exclusões</strong></p><p>Desenvolvimento de site (TI/BU Criação), produção de conteúdo editorial de blog (escopo separado), SEO técnico de servidor (TI).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Executa pesquisa de palavras-chave e otimizações on-page</p></td><td><p>Rafa / Lucca</p></td><td><p>BU Criação / TI</p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Define estratégia e prioriza ações</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente</p></td></tr><tr><td><p>BU Criação / TI</p></td><td><p>Implementa otimizações técnicas na LP</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Landing page do empreendimento publicada; acesso ao Google Search Console e Google Analytics 4; acesso ao Google Meu Negócio do cliente; Semrush conta ativa.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog (auditoria técnica).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Pesquisa de Palavras-Chave</strong></p><p>Ação: Mapear palavras-chave relevantes: termos de produto (ex.: ''apartamento 2 quartos no Água Verde''), termos de localização, termos de intenção de compra, termos de concorrentes. Priorizar por volume, dificuldade e intenção transacional. Mínimo 30 termos mapeados.</p><p>Responsável: Analista de Marketing</p><p>Output: Planilha de palavras-chave com volume, dificuldade, intenção e prioridade.</p><p>Prazo referência: D+5 após início</p><p><strong>5.2. Auditoria Técnica da Landing Page</strong></p><p>Ação: Auditar LP com Screaming Frog e PageSpeed: velocidade de carregamento (&lt;3s mobile), estrutura de headings (H1 único com palavra-chave principal), meta title e description, alt text em imagens, URL amigável, schema markup de imóvel.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório de auditoria com lista priorizada de correções.</p><p>Prazo referência: D+7</p><p><strong>5.3. Otimização On-Page</strong></p><p>Ação: Implementar (ou briefar TI/Criação): meta title com palavra-chave principal (&lt;60 chars), meta description com CTA (&lt;155 chars), H1 com localização e tipo de produto, conteúdo da LP com palavras-chave naturalmente inseridas, schema markup de RealEstateListing, URLs canônicas.</p><p>Responsável: Analista de Marketing + BU Criação / TI</p><p>Output: LP otimizada com todas as correções implementadas e validadas no Search Console.</p><p>Prazo referência: D+15</p><p><strong>5.4. SEO Local e Google Meu Negócio</strong></p><p>Ação: Otimizar perfil do Google Meu Negócio do incorporador/empreendimento: categorias corretas, fotos do produto, descrição com palavras-chave, horário de atendimento do estande de vendas, posts regulares sobre o empreendimento. Monitorar avaliações.</p><p>Responsável: Analista de Marketing</p><p>Output: Perfil Google Meu Negócio 100% preenchido e postagens ativas.</p><p>Prazo referência: D+10</p><p><strong>5.5. Link Building Básico</strong></p><p>Ação: Obter links relevantes para a LP: portais imobiliários (Zap, VivaReal, OLX Imóveis) com link para o site, assessoria de imprensa local, parcerias com blogs de decoração/arquitetura da região.</p><p>Responsável: Rafa / Lucca</p><p>Output: Mínimo 5 links externos de qualidade apontando para a LP registrados na planilha.</p><p>Prazo referência: D+30</p><p><strong>5.6. Monitoramento Mensal de Performance Orgânica</strong></p><p>Ação: Monitorar mensalmente via Search Console e GA4: posição média das palavras-chave alvo, cliques orgânicos, impressões, taxa de cliques (CTR). Identificar termos com posições 4-10 (oportunidade de push para top 3). Ajustar conteúdo conforme dados.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório mensal de SEO com evolução de rankings e recomendações.</p><p>Prazo referência: Mensal</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>H1 único e com palavra-chave principal; meta title e description em 100% das páginas; PageSpeed &gt;70 no mobile; Google Meu Negócio completo; mínimo 5 links externos; Search Console sem erros críticos.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Múltiplos H1 na mesma página; meta description duplicada; imagens sem alt text; LP sem schema markup de imóvel; não monitorar rankings após otimização.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Pesquisa de palavras-chave: D+5; auditoria técnica: D+7; otimizações on-page: D+15; Google Meu Negócio: D+10; link building inicial: D+30; relatório mensal: todo dia 5.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Pesquisa de palavras-chave → Auditoria técnica → Otimização on-page → SEO Local (GMB) → Link building → Monitoramento mensal → Ajustes → Fim</p><p><strong>  10. Glossário</strong></p><p>SEO: Search Engine Optimization. On-page: otimizações realizadas dentro do próprio site. Schema markup: código estruturado que ajuda o Google a entender o conteúdo. GMB: Google Meu Negócio. Search Console: ferramenta do Google para monitorar performance orgânica. Canonical: tag que indica a URL principal de uma página.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
    9,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-MKT-010
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Implementar estratégia de SEO para o empreendimento imobiliário, aumentando a visibilidade orgânica nos buscadores para termos relevantes de compra de imóveis na região do produto, gerando tráfego qualificado de custo zero.', '<p>Implementar estratégia de SEO para o empreendimento imobiliário, aumentando a visibilidade orgânica nos buscadores para termos relevantes de compra de imóveis na região do produto, gerando tráfego qualificado de custo zero.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Pesquisa de palavras-chave, otimização on-page da landing page e site do empreendimento, SEO local (Google Meu Negócio), link building básico, monitoramento de rankings e tráfego orgânico.', '<p>Pesquisa de palavras-chave, otimização on-page da landing page e site do empreendimento, SEO local (Google Meu Negócio), link building básico, monitoramento de rankings e tráfego orgânico.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Desenvolvimento de site (TI/BU Criação), produção de conteúdo editorial de blog (escopo separado), SEO técnico de servidor (TI).', '<p>Desenvolvimento de site (TI/BU Criação), produção de conteúdo editorial de blog (escopo separado), SEO técnico de servidor (TI).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Analista de Marketing', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Executa pesquisa de palavras-chave e otimizações on-page</p></td><td><p>Rafa / Lucca</p></td><td><p>BU Criação / TI</p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Define estratégia e prioriza ações</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente</p></td></tr><tr><td><p>BU Criação / TI</p></td><td><p>Implementa otimizações técnicas na LP</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Landing page do empreendimento publicada; acesso ao Google Search Console e Google Analytics 4; acesso ao Google Meu Negócio do cliente; Semrush conta ativa.', '<p>Landing page do empreendimento publicada; acesso ao Google Search Console e Google Analytics 4; acesso ao Google Meu Negócio do cliente; Semrush conta ativa.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog (auditoria técnica).', '<p>Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog (auditoria técnica).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Pesquisa de Palavras-Chave', 'Ação: Mapear palavras-chave relevantes: termos de produto (ex.: ''apartamento 2 quartos no Água Verde''), termos de localização, termos de intenção de compra, termos de concorrentes. Priorizar por volume, dificuldade e intenção transacional. Mínimo 30 termos mapeados.

Responsável: Analista de Marketing

Output: Planilha de palavras-chave com volume, dificuldade, intenção e prioridade.

Prazo referência: D+5 após início', '<p>Ação: Mapear palavras-chave relevantes: termos de produto (ex.: ''apartamento 2 quartos no Água Verde''), termos de localização, termos de intenção de compra, termos de concorrentes. Priorizar por volume, dificuldade e intenção transacional. Mínimo 30 termos mapeados.</p><p>Responsável: Analista de Marketing</p><p>Output: Planilha de palavras-chave com volume, dificuldade, intenção e prioridade.</p><p>Prazo referência: D+5 após início</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Auditoria Técnica da Landing Page', 'Ação: Auditar LP com Screaming Frog e PageSpeed: velocidade de carregamento (<3s mobile), estrutura de headings (H1 único com palavra-chave principal), meta title e description, alt text em imagens, URL amigável, schema markup de imóvel.

Responsável: Analista de Marketing

Output: Relatório de auditoria com lista priorizada de correções.

Prazo referência: D+7', '<p>Ação: Auditar LP com Screaming Frog e PageSpeed: velocidade de carregamento (&lt;3s mobile), estrutura de headings (H1 único com palavra-chave principal), meta title e description, alt text em imagens, URL amigável, schema markup de imóvel.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório de auditoria com lista priorizada de correções.</p><p>Prazo referência: D+7</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Otimização On-Page', 'Ação: Implementar (ou briefar TI/Criação): meta title com palavra-chave principal (<60 chars), meta description com CTA (<155 chars), H1 com localização e tipo de produto, conteúdo da LP com palavras-chave naturalmente inseridas, schema markup de RealEstateListing, URLs canônicas.

Responsável: Analista de Marketing + BU Criação / TI

Output: LP otimizada com todas as correções implementadas e validadas no Search Console.

Prazo referência: D+15', '<p>Ação: Implementar (ou briefar TI/Criação): meta title com palavra-chave principal (&lt;60 chars), meta description com CTA (&lt;155 chars), H1 com localização e tipo de produto, conteúdo da LP com palavras-chave naturalmente inseridas, schema markup de RealEstateListing, URLs canônicas.</p><p>Responsável: Analista de Marketing + BU Criação / TI</p><p>Output: LP otimizada com todas as correções implementadas e validadas no Search Console.</p><p>Prazo referência: D+15</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. SEO Local e Google Meu Negócio', 'Ação: Otimizar perfil do Google Meu Negócio do incorporador/empreendimento: categorias corretas, fotos do produto, descrição com palavras-chave, horário de atendimento do estande de vendas, posts regulares sobre o empreendimento. Monitorar avaliações.

Responsável: Analista de Marketing

Output: Perfil Google Meu Negócio 100% preenchido e postagens ativas.

Prazo referência: D+10', '<p>Ação: Otimizar perfil do Google Meu Negócio do incorporador/empreendimento: categorias corretas, fotos do produto, descrição com palavras-chave, horário de atendimento do estande de vendas, posts regulares sobre o empreendimento. Monitorar avaliações.</p><p>Responsável: Analista de Marketing</p><p>Output: Perfil Google Meu Negócio 100% preenchido e postagens ativas.</p><p>Prazo referência: D+10</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Link Building Básico', 'Ação: Obter links relevantes para a LP: portais imobiliários (Zap, VivaReal, OLX Imóveis) com link para o site, assessoria de imprensa local, parcerias com blogs de decoração/arquitetura da região.

Responsável: Rafa / Lucca

Output: Mínimo 5 links externos de qualidade apontando para a LP registrados na planilha.

Prazo referência: D+30', '<p>Ação: Obter links relevantes para a LP: portais imobiliários (Zap, VivaReal, OLX Imóveis) com link para o site, assessoria de imprensa local, parcerias com blogs de decoração/arquitetura da região.</p><p>Responsável: Rafa / Lucca</p><p>Output: Mínimo 5 links externos de qualidade apontando para a LP registrados na planilha.</p><p>Prazo referência: D+30</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Monitoramento Mensal de Performance Orgânica', 'Ação: Monitorar mensalmente via Search Console e GA4: posição média das palavras-chave alvo, cliques orgânicos, impressões, taxa de cliques (CTR). Identificar termos com posições 4-10 (oportunidade de push para top 3). Ajustar conteúdo conforme dados.

Responsável: Analista de Marketing

Output: Relatório mensal de SEO com evolução de rankings e recomendações.

Prazo referência: Mensal', '<p>Ação: Monitorar mensalmente via Search Console e GA4: posição média das palavras-chave alvo, cliques orgânicos, impressões, taxa de cliques (CTR). Identificar termos com posições 4-10 (oportunidade de push para top 3). Ajustar conteúdo conforme dados.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório mensal de SEO com evolução de rankings e recomendações.</p><p>Prazo referência: Mensal</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'H1 único e com palavra-chave principal; meta title e description em 100% das páginas; PageSpeed >70 no mobile; Google Meu Negócio completo; mínimo 5 links externos; Search Console sem erros críticos.', '<p>H1 único e com palavra-chave principal; meta title e description em 100% das páginas; PageSpeed &gt;70 no mobile; Google Meu Negócio completo; mínimo 5 links externos; Search Console sem erros críticos.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Múltiplos H1 na mesma página; meta description duplicada; imagens sem alt text; LP sem schema markup de imóvel; não monitorar rankings após otimização.', '<p>Múltiplos H1 na mesma página; meta description duplicada; imagens sem alt text; LP sem schema markup de imóvel; não monitorar rankings após otimização.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog.', '<p>Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Pesquisa de palavras-chave: D+5; auditoria técnica: D+7; otimizações on-page: D+15; Google Meu Negócio: D+10; link building inicial: D+30; relatório mensal: todo dia 5.', '<p>Pesquisa de palavras-chave: D+5; auditoria técnica: D+7; otimizações on-page: D+15; Google Meu Negócio: D+10; link building inicial: D+30; relatório mensal: todo dia 5.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Pesquisa de palavras-chave → Auditoria técnica → Otimização on-page → SEO Local (GMB) → Link building → Monitoramento mensal → Ajustes → Fim', '<p>Início → Pesquisa de palavras-chave → Auditoria técnica → Otimização on-page → SEO Local (GMB) → Link building → Monitoramento mensal → Ajustes → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'SEO: Search Engine Optimization. On-page: otimizações realizadas dentro do próprio site. Schema markup: código estruturado que ajuda o Google a entender o conteúdo. GMB: Google Meu Negócio. Search Console: ferramenta do Google para monitorar performance orgânica. Canonical: tag que indica a URL principal de uma página.', '<p>SEO: Search Engine Optimization. On-page: otimizações realizadas dentro do próprio site. Schema markup: código estruturado que ajuda o Google a entender o conteúdo. GMB: Google Meu Negócio. Search Console: ferramenta do Google para monitorar performance orgânica. Canonical: tag que indica a URL principal de uma página.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-MKT-011: Gestão de Social Media ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Gestão de Social Media',
    'tbo-mkt-011-gestao-de-social-media',
    'marketing',
    'checklist',
    'Gerenciar a presença orgânica do empreendimento nas redes sociais (Instagram, Facebook e YouTube) ao longo de todo o ciclo de campanha, construindo comunidade, gerando engajamento e alimentando o funil de leads de forma consistente.',
    'Standard Operating Procedure

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

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Social Media</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-011</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Gerenciar a presença orgânica do empreendimento nas redes sociais (Instagram, Facebook e YouTube) ao longo de todo o ciclo de campanha, construindo comunidade, gerando engajamento e alimentando o funil de leads de forma consistente.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Planejamento e criação de calendário de conteúdo, briefing de conteúdo para BU Criação, publicação e agendamento, moderação de comentários e direct, análise de performance e relatório mensal.</p><p><strong>2.2 Exclusões</strong></p><p>Produção de criativos e vídeos (BU Criação), mídia paga de impulsionamento (MKT-09), gestão de WhatsApp Business (BU Comercial).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Opera social media diariamente</p></td><td><p>Rafa / Lucca</p></td><td><p>BU Criação</p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Aprova calendário e estratégia de conteúdo</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente</p></td></tr><tr><td><p>BU Criação</p></td><td><p>Produz criativos conforme briefing do calendário</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Plano de Marketing aprovado (MKT-02) com diretrizes de tom e posicionamento; acesso admin às contas do Instagram, Facebook e YouTube do empreendimento; criativos disponíveis da BU Criação.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Meta Business Suite, Later ou Buffer (agendamento), Google Analytics 4 (rastreamento de cliques em bio), planilha de calendário de conteúdo TBO, Notion.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Calendário Mensal de Conteúdo</strong></p><p>Ação: Elaborar calendário mensal com: frequência de publicação (mínimo 4x/semana no Instagram), mix de formatos (feed, stories, reels, YouTube), temas por semana (produto, lifestyle, bastidores, prova social, conteúdo de valor), e data de briefing para BU Criação (mínimo 10 dias antes da publicação).</p><p>Responsável: Rafa / Lucca</p><p>Output: Calendário mensal aprovado pelo cliente até o dia 25 do mês anterior.</p><p>Prazo referência: Até dia 25 do mês anterior</p><p><strong>5.2. Briefing de Conteúdo para BU Criação</strong></p><p>Ação: Para cada peça do calendário, elaborar briefing com: tema, referências visuais, texto/copy sugerido, formato e dimensões, call-to-action, data de entrega necessária (mínimo 5 dias antes da publicação).</p><p>Responsável: Analista de Marketing</p><p>Output: Briefings individuais entregues à BU Criação conforme prazo do calendário.</p><p>Prazo referência: Mínimo 10 dias antes da publicação</p><p><strong>5.3. Publicação e Agendamento</strong></p><p>Ação: Agendar posts no Later/Buffer com textos revisados, hashtags relevantes (15-25 hashtags por feed post), localização gerada, marcações. Verificar pré-visualização mobile antes de confirmar agendamento. Stories complementares no dia da publicação.</p><p>Responsável: Analista de Marketing</p><p>Output: Posts agendados com 5 dias de antecedência mínima.</p><p>Prazo referência: 5 dias antes da publicação</p><p><strong>5.4. Moderação de Comentários e Direct</strong></p><p>Ação: Responder 100% dos comentários e directs em até 4h (dias úteis). Script de respostas padrão para dúvidas frequentes (preço, disponibilidade, localização, contato do corretor). Escalar para BU Comercial qualquer lead com intenção de compra clara.</p><p>Responsável: Analista de Marketing</p><p>Output: Zero comentários ou directs sem resposta após 4h (dias úteis). Leads com intenção de compra escalados ao CRM.</p><p>Prazo referência: 4h durante dias úteis</p><p><strong>5.5. Monitoramento de Engajamento e Hashtags</strong></p><p>Ação: Monitorar diariamente: comentários, menções, hashtags do produto, perfis de concorrentes. Identificar oportunidades de engajamento espontâneo (compartilhar stories de clientes, responder menções). Registrar na planilha de monitoramento.</p><p>Responsável: Analista de Marketing</p><p>Output: Log diário de monitoramento com ações de engajamento registradas.</p><p>Prazo referência: Diário</p><p><strong>5.6. Relatório Mensal de Social Media</strong></p><p>Ação: Elaborar relatório mensal com: crescimento de seguidores, alcance total, impressões, taxa de engajamento por formato, posts de melhor e pior performance, leads gerados via social (link na bio/stories), aprendizados e ajustes para o próximo mês.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório mensal enviado ao cliente até o dia 5 do mês seguinte.</p><p>Prazo referência: Até dia 5 do mês seguinte</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Calendário aprovado até dia 25 do mês anterior; zero posts sem resposta após 4h nos dias úteis; briefings entregues 10 dias antes da publicação; relatório mensal sem atraso; leads de social escalados ao CRM no mesmo dia.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Publicar sem aprovação do conteúdo; atrasos no calendário que causam impulsionamento de última hora; comentários sem resposta por mais de 24h; relatório apenas com dados sem análise; hashtags genéricas sem relevância ao nicho imobiliário.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Meta Business Suite, Later ou Buffer, Google Analytics 4, planilha de calendário TBO, Notion, Canva (ajustes rápidos de formato).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Calendário mensal: dia 25 do mês anterior; briefings para criação: D-10 da publicação; agendamento: D-5; moderação: 4h dias úteis; relatório: dia 5 do mês seguinte.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Calendário mensal → Briefing BU Criação → Recebimento criativos → Revisão e aprovação → Agendamento → Publicação → Moderação diária → Monitoramento → Relatório mensal → Fim</p><p><strong>  10. Glossário</strong></p><p>Taxa de engajamento: percentual de seguidores que interagem com as publicações. Reels: formato de vídeo curto do Instagram. Stories: publicações efêmeras de 24h. Moderação: resposta e gestão de comentários e mensagens. Reach: número de perfis únicos que viram a publicação.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
    10,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-MKT-011
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Gerenciar a presença orgânica do empreendimento nas redes sociais (Instagram, Facebook e YouTube) ao longo de todo o ciclo de campanha, construindo comunidade, gerando engajamento e alimentando o funil de leads de forma consistente.', '<p>Gerenciar a presença orgânica do empreendimento nas redes sociais (Instagram, Facebook e YouTube) ao longo de todo o ciclo de campanha, construindo comunidade, gerando engajamento e alimentando o funil de leads de forma consistente.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Planejamento e criação de calendário de conteúdo, briefing de conteúdo para BU Criação, publicação e agendamento, moderação de comentários e direct, análise de performance e relatório mensal.', '<p>Planejamento e criação de calendário de conteúdo, briefing de conteúdo para BU Criação, publicação e agendamento, moderação de comentários e direct, análise de performance e relatório mensal.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de criativos e vídeos (BU Criação), mídia paga de impulsionamento (MKT-09), gestão de WhatsApp Business (BU Comercial).', '<p>Produção de criativos e vídeos (BU Criação), mídia paga de impulsionamento (MKT-09), gestão de WhatsApp Business (BU Comercial).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Analista de Marketing', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Opera social media diariamente</p></td><td><p>Rafa / Lucca</p></td><td><p>BU Criação</p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Aprova calendário e estratégia de conteúdo</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente</p></td></tr><tr><td><p>BU Criação</p></td><td><p>Produz criativos conforme briefing do calendário</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plano de Marketing aprovado (MKT-02) com diretrizes de tom e posicionamento; acesso admin às contas do Instagram, Facebook e YouTube do empreendimento; criativos disponíveis da BU Criação.', '<p>Plano de Marketing aprovado (MKT-02) com diretrizes de tom e posicionamento; acesso admin às contas do Instagram, Facebook e YouTube do empreendimento; criativos disponíveis da BU Criação.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Meta Business Suite, Later ou Buffer (agendamento), Google Analytics 4 (rastreamento de cliques em bio), planilha de calendário de conteúdo TBO, Notion.', '<p>Meta Business Suite, Later ou Buffer (agendamento), Google Analytics 4 (rastreamento de cliques em bio), planilha de calendário de conteúdo TBO, Notion.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Calendário Mensal de Conteúdo', 'Ação: Elaborar calendário mensal com: frequência de publicação (mínimo 4x/semana no Instagram), mix de formatos (feed, stories, reels, YouTube), temas por semana (produto, lifestyle, bastidores, prova social, conteúdo de valor), e data de briefing para BU Criação (mínimo 10 dias antes da publicação).

Responsável: Rafa / Lucca

Output: Calendário mensal aprovado pelo cliente até o dia 25 do mês anterior.

Prazo referência: Até dia 25 do mês anterior', '<p>Ação: Elaborar calendário mensal com: frequência de publicação (mínimo 4x/semana no Instagram), mix de formatos (feed, stories, reels, YouTube), temas por semana (produto, lifestyle, bastidores, prova social, conteúdo de valor), e data de briefing para BU Criação (mínimo 10 dias antes da publicação).</p><p>Responsável: Rafa / Lucca</p><p>Output: Calendário mensal aprovado pelo cliente até o dia 25 do mês anterior.</p><p>Prazo referência: Até dia 25 do mês anterior</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Briefing de Conteúdo para BU Criação', 'Ação: Para cada peça do calendário, elaborar briefing com: tema, referências visuais, texto/copy sugerido, formato e dimensões, call-to-action, data de entrega necessária (mínimo 5 dias antes da publicação).

Responsável: Analista de Marketing

Output: Briefings individuais entregues à BU Criação conforme prazo do calendário.

Prazo referência: Mínimo 10 dias antes da publicação', '<p>Ação: Para cada peça do calendário, elaborar briefing com: tema, referências visuais, texto/copy sugerido, formato e dimensões, call-to-action, data de entrega necessária (mínimo 5 dias antes da publicação).</p><p>Responsável: Analista de Marketing</p><p>Output: Briefings individuais entregues à BU Criação conforme prazo do calendário.</p><p>Prazo referência: Mínimo 10 dias antes da publicação</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Publicação e Agendamento', 'Ação: Agendar posts no Later/Buffer com textos revisados, hashtags relevantes (15-25 hashtags por feed post), localização gerada, marcações. Verificar pré-visualização mobile antes de confirmar agendamento. Stories complementares no dia da publicação.

Responsável: Analista de Marketing

Output: Posts agendados com 5 dias de antecedência mínima.

Prazo referência: 5 dias antes da publicação', '<p>Ação: Agendar posts no Later/Buffer com textos revisados, hashtags relevantes (15-25 hashtags por feed post), localização gerada, marcações. Verificar pré-visualização mobile antes de confirmar agendamento. Stories complementares no dia da publicação.</p><p>Responsável: Analista de Marketing</p><p>Output: Posts agendados com 5 dias de antecedência mínima.</p><p>Prazo referência: 5 dias antes da publicação</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Moderação de Comentários e Direct', 'Ação: Responder 100% dos comentários e directs em até 4h (dias úteis). Script de respostas padrão para dúvidas frequentes (preço, disponibilidade, localização, contato do corretor). Escalar para BU Comercial qualquer lead com intenção de compra clara.

Responsável: Analista de Marketing

Output: Zero comentários ou directs sem resposta após 4h (dias úteis). Leads com intenção de compra escalados ao CRM.

Prazo referência: 4h durante dias úteis', '<p>Ação: Responder 100% dos comentários e directs em até 4h (dias úteis). Script de respostas padrão para dúvidas frequentes (preço, disponibilidade, localização, contato do corretor). Escalar para BU Comercial qualquer lead com intenção de compra clara.</p><p>Responsável: Analista de Marketing</p><p>Output: Zero comentários ou directs sem resposta após 4h (dias úteis). Leads com intenção de compra escalados ao CRM.</p><p>Prazo referência: 4h durante dias úteis</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Monitoramento de Engajamento e Hashtags', 'Ação: Monitorar diariamente: comentários, menções, hashtags do produto, perfis de concorrentes. Identificar oportunidades de engajamento espontâneo (compartilhar stories de clientes, responder menções). Registrar na planilha de monitoramento.

Responsável: Analista de Marketing

Output: Log diário de monitoramento com ações de engajamento registradas.

Prazo referência: Diário', '<p>Ação: Monitorar diariamente: comentários, menções, hashtags do produto, perfis de concorrentes. Identificar oportunidades de engajamento espontâneo (compartilhar stories de clientes, responder menções). Registrar na planilha de monitoramento.</p><p>Responsável: Analista de Marketing</p><p>Output: Log diário de monitoramento com ações de engajamento registradas.</p><p>Prazo referência: Diário</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Relatório Mensal de Social Media', 'Ação: Elaborar relatório mensal com: crescimento de seguidores, alcance total, impressões, taxa de engajamento por formato, posts de melhor e pior performance, leads gerados via social (link na bio/stories), aprendizados e ajustes para o próximo mês.

Responsável: Analista de Marketing

Output: Relatório mensal enviado ao cliente até o dia 5 do mês seguinte.

Prazo referência: Até dia 5 do mês seguinte', '<p>Ação: Elaborar relatório mensal com: crescimento de seguidores, alcance total, impressões, taxa de engajamento por formato, posts de melhor e pior performance, leads gerados via social (link na bio/stories), aprendizados e ajustes para o próximo mês.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório mensal enviado ao cliente até o dia 5 do mês seguinte.</p><p>Prazo referência: Até dia 5 do mês seguinte</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Calendário aprovado até dia 25 do mês anterior; zero posts sem resposta após 4h nos dias úteis; briefings entregues 10 dias antes da publicação; relatório mensal sem atraso; leads de social escalados ao CRM no mesmo dia.', '<p>Calendário aprovado até dia 25 do mês anterior; zero posts sem resposta após 4h nos dias úteis; briefings entregues 10 dias antes da publicação; relatório mensal sem atraso; leads de social escalados ao CRM no mesmo dia.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Publicar sem aprovação do conteúdo; atrasos no calendário que causam impulsionamento de última hora; comentários sem resposta por mais de 24h; relatório apenas com dados sem análise; hashtags genéricas sem relevância ao nicho imobiliário.', '<p>Publicar sem aprovação do conteúdo; atrasos no calendário que causam impulsionamento de última hora; comentários sem resposta por mais de 24h; relatório apenas com dados sem análise; hashtags genéricas sem relevância ao nicho imobiliário.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Meta Business Suite, Later ou Buffer, Google Analytics 4, planilha de calendário TBO, Notion, Canva (ajustes rápidos de formato).', '<p>Meta Business Suite, Later ou Buffer, Google Analytics 4, planilha de calendário TBO, Notion, Canva (ajustes rápidos de formato).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Calendário mensal: dia 25 do mês anterior; briefings para criação: D-10 da publicação; agendamento: D-5; moderação: 4h dias úteis; relatório: dia 5 do mês seguinte.', '<p>Calendário mensal: dia 25 do mês anterior; briefings para criação: D-10 da publicação; agendamento: D-5; moderação: 4h dias úteis; relatório: dia 5 do mês seguinte.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Calendário mensal → Briefing BU Criação → Recebimento criativos → Revisão e aprovação → Agendamento → Publicação → Moderação diária → Monitoramento → Relatório mensal → Fim', '<p>Início → Calendário mensal → Briefing BU Criação → Recebimento criativos → Revisão e aprovação → Agendamento → Publicação → Moderação diária → Monitoramento → Relatório mensal → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Taxa de engajamento: percentual de seguidores que interagem com as publicações. Reels: formato de vídeo curto do Instagram. Stories: publicações efêmeras de 24h. Moderação: resposta e gestão de comentários e mensagens. Reach: número de perfis únicos que viram a publicação.', '<p>Taxa de engajamento: percentual de seguidores que interagem com as publicações. Reels: formato de vídeo curto do Instagram. Stories: publicações efêmeras de 24h. Moderação: resposta e gestão de comentários e mensagens. Reach: número de perfis únicos que viram a publicação.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-MKT-012: Reports e Análise de Performance ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Reports e Análise de Performance',
    'tbo-mkt-012-reports-e-analise-de-performance',
    'marketing',
    'checklist',
    'Reports e Análise de Performance',
    'Standard Operating Procedure

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

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Reports e Análise de Performance</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-012</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Compilar, analisar e apresentar os dados de performance de marketing do empreendimento de forma estruturada, garantindo que clientes e stakeholders internos tenham visibilidade clara dos resultados, ROI e recomendações estratégicas a cada ciclo.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Coleta de dados de todos os canais, consolidação em dashboard unificado, análise de funil de conversão, elaboração de relatórios semanais (tráfego), quinzenais (lançamento) e mensais (visão geral), relatório final de campanha.</p><p><strong>2.2 Exclusões</strong></p><p>Análise de dados de vendas (BU Comercial), relatório de resultado financeiro do empreendimento (Incorporadora).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Coleta dados, monta e envia relatórios</p></td><td><p>Rafa / Lucca</p></td><td><p>Especialista em Tráfego</p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Analisa e assina recomendações estratégicas</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprova relatório final de campanha</p></td><td><p>—</p></td><td><p>Cliente, BU Estratégia</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Acesso a todos os canais de dados: Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Social Media Insights, planilha de estoque/vendas da incorporadora.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Looker Studio (dashboard), Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Configuração do Dashboard de Performance</strong></p><p>Ação: Criar dashboard unificado no Google Looker Studio conectando: GA4, Meta Ads, Google Ads, e dados manuais de social/e-mail. Dashboard deve exibir: leads por canal, CPL por canal, funil de conversão (lead→visita→proposta→venda), investimento acumulado vs. budget, alcance e frequência.</p><p>Responsável: Analista de Marketing</p><p>Output: Dashboard ao vivo compartilhado com cliente e gestores internos.</p><p>Prazo referência: D+7 após início da campanha</p><p><strong>5.2. Coleta e Consolidação Semanal de Dados</strong></p><p>Ação: Toda sexta-feira: exportar dados da semana de todos os canais e consolidar na planilha master. Validar consistência: volume de leads no Meta/Google vs. chegada no RD Station (tolerância de 5% de discrepância máxima). Investigar e registrar qualquer anomalia.</p><p>Responsável: Analista de Marketing</p><p>Output: Planilha master atualizada toda sexta-feira com dados consolidados e validados.</p><p>Prazo referência: Toda sexta-feira</p><p><strong>5.3. Relatório Semanal de Tráfego</strong></p><p>Ação: Elaborar relatório semanal (para Rafa/Lucca e cliente): investimento da semana, leads gerados por canal, CPL por canal vs. meta, criativos de melhor e pior performance, frequência, anomalias detectadas e ações tomadas, perspectiva para próxima semana.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório semanal enviado toda segunda-feira via e-mail ao cliente.</p><p>Prazo referência: Toda segunda-feira</p><p><strong>5.4. Relatório Quinzenal de Performance (Fase Lançamento)</strong></p><p>Ação: Na fase de lançamento, elaborar relatório quinzenal com visão mais estratégica: leads acumulados vs. meta da fase, funil completo com taxas de conversão, qualidade de leads (feedback do comercial), ROI parcial estimado, ajustes de estratégia recomendados.</p><p>Responsável: Rafa / Lucca + Analista de Marketing</p><p>Output: Relatório quinzenal apresentado ao cliente em reunião de alinhamento.</p><p>Prazo referência: A cada 15 dias durante a fase de lançamento</p><p><strong>5.5. Relatório Mensal Consolidado</strong></p><p>Ação: Todo mês: consolidar performance mensal de todos os canais com análise de tendência (comparativo mês anterior), análise de qualidade dos leads (taxa de conversão em visitas e propostas), análise de ROI de mídia por canal, ranking de criativos do mês, recomendações para o mês seguinte.</p><p>Responsável: Rafa / Lucca</p><p>Output: Relatório mensal completo enviado até o dia 5 de cada mês.</p><p>Prazo referência: Até dia 5 do mês seguinte</p><p><strong>5.6. Relatório Final de Campanha</strong></p><p>Ação: Ao encerrar o ciclo completo da campanha: compilar relatório final com visão integral da campanha (pré-lançamento + lançamento + sustentação). Incluir: total investido, total de leads gerados, CPL médio por fase, funil de conversão completo, ROI total, 5 principais aprendizados e recomendações para o próximo produto.</p><p>Responsável: Rafa / Lucca + Marco Andolfato</p><p>Output: Relatório final de campanha apresentado ao cliente em reunião de encerramento. Cópia arquivada no Notion.</p><p>Prazo referência: Até 15 dias após encerramento da campanha</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Dashboard ao vivo compartilhado desde a semana 1; relatórios semanais sem atraso; discrepância entre plataformas investigada (máx 5%); relatório final entregue em até 15 dias; aprendizados arquivados no Notion para uso futuro.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Relatórios apenas com dados sem análise e recomendações; inconsistências entre plataformas não investigadas; dashboard não atualizado em tempo real; relatório final sem aprendizados documentados; envio de relatório sem contextualização estratégica.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Looker Studio, Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides, Notion.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Dashboard ao vivo: D+7; relatório semanal: toda segunda-feira; relatório quinzenal: a cada 15 dias (fase lançamento); relatório mensal: dia 5 do mês seguinte; relatório final: 15 dias após encerramento.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Setup dashboard (D+7) → Coleta semanal (sextas) → Relatório semanal (segundas) → Relatório quinzenal (lançamento) → Relatório mensal (dia 5) → Relatório final (até D+15 do encerramento) → Fim</p><p><strong>  10. Glossário</strong></p><p>Looker Studio: ferramenta de visualização de dados do Google (antes Data Studio). Funil de conversão: sequência lead → visita → proposta → venda com taxas de cada etapa. ROI: Return on Investment. CPL médio: média ponderada do custo por lead considerando todos os canais. Benchmark: referência de mercado para comparação de KPIs.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
    11,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-MKT-012
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Compilar, analisar e apresentar os dados de performance de marketing do empreendimento de forma estruturada, garantindo que clientes e stakeholders internos tenham visibilidade clara dos resultados, ROI e recomendações estratégicas a cada ciclo.', '<p>Compilar, analisar e apresentar os dados de performance de marketing do empreendimento de forma estruturada, garantindo que clientes e stakeholders internos tenham visibilidade clara dos resultados, ROI e recomendações estratégicas a cada ciclo.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Coleta de dados de todos os canais, consolidação em dashboard unificado, análise de funil de conversão, elaboração de relatórios semanais (tráfego), quinzenais (lançamento) e mensais (visão geral), relatório final de campanha.', '<p>Coleta de dados de todos os canais, consolidação em dashboard unificado, análise de funil de conversão, elaboração de relatórios semanais (tráfego), quinzenais (lançamento) e mensais (visão geral), relatório final de campanha.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Análise de dados de vendas (BU Comercial), relatório de resultado financeiro do empreendimento (Incorporadora).', '<p>Análise de dados de vendas (BU Comercial), relatório de resultado financeiro do empreendimento (Incorporadora).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Cliente, BU Estratégia', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Coleta dados, monta e envia relatórios</p></td><td><p>Rafa / Lucca</p></td><td><p>Especialista em Tráfego</p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Analisa e assina recomendações estratégicas</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprova relatório final de campanha</p></td><td><p>—</p></td><td><p>Cliente, BU Estratégia</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Acesso a todos os canais de dados: Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Social Media Insights, planilha de estoque/vendas da incorporadora.', '<p>Acesso a todos os canais de dados: Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Social Media Insights, planilha de estoque/vendas da incorporadora.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Looker Studio (dashboard), Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides.', '<p>Google Looker Studio (dashboard), Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Configuração do Dashboard de Performance', 'Ação: Criar dashboard unificado no Google Looker Studio conectando: GA4, Meta Ads, Google Ads, e dados manuais de social/e-mail. Dashboard deve exibir: leads por canal, CPL por canal, funil de conversão (lead→visita→proposta→venda), investimento acumulado vs. budget, alcance e frequência.

Responsável: Analista de Marketing

Output: Dashboard ao vivo compartilhado com cliente e gestores internos.

Prazo referência: D+7 após início da campanha', '<p>Ação: Criar dashboard unificado no Google Looker Studio conectando: GA4, Meta Ads, Google Ads, e dados manuais de social/e-mail. Dashboard deve exibir: leads por canal, CPL por canal, funil de conversão (lead→visita→proposta→venda), investimento acumulado vs. budget, alcance e frequência.</p><p>Responsável: Analista de Marketing</p><p>Output: Dashboard ao vivo compartilhado com cliente e gestores internos.</p><p>Prazo referência: D+7 após início da campanha</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Coleta e Consolidação Semanal de Dados', 'Ação: Toda sexta-feira: exportar dados da semana de todos os canais e consolidar na planilha master. Validar consistência: volume de leads no Meta/Google vs. chegada no RD Station (tolerância de 5% de discrepância máxima). Investigar e registrar qualquer anomalia.

Responsável: Analista de Marketing

Output: Planilha master atualizada toda sexta-feira com dados consolidados e validados.

Prazo referência: Toda sexta-feira', '<p>Ação: Toda sexta-feira: exportar dados da semana de todos os canais e consolidar na planilha master. Validar consistência: volume de leads no Meta/Google vs. chegada no RD Station (tolerância de 5% de discrepância máxima). Investigar e registrar qualquer anomalia.</p><p>Responsável: Analista de Marketing</p><p>Output: Planilha master atualizada toda sexta-feira com dados consolidados e validados.</p><p>Prazo referência: Toda sexta-feira</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Relatório Semanal de Tráfego', 'Ação: Elaborar relatório semanal (para Rafa/Lucca e cliente): investimento da semana, leads gerados por canal, CPL por canal vs. meta, criativos de melhor e pior performance, frequência, anomalias detectadas e ações tomadas, perspectiva para próxima semana.

Responsável: Analista de Marketing

Output: Relatório semanal enviado toda segunda-feira via e-mail ao cliente.

Prazo referência: Toda segunda-feira', '<p>Ação: Elaborar relatório semanal (para Rafa/Lucca e cliente): investimento da semana, leads gerados por canal, CPL por canal vs. meta, criativos de melhor e pior performance, frequência, anomalias detectadas e ações tomadas, perspectiva para próxima semana.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório semanal enviado toda segunda-feira via e-mail ao cliente.</p><p>Prazo referência: Toda segunda-feira</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Relatório Quinzenal de Performance (Fase Lançamento)', 'Ação: Na fase de lançamento, elaborar relatório quinzenal com visão mais estratégica: leads acumulados vs. meta da fase, funil completo com taxas de conversão, qualidade de leads (feedback do comercial), ROI parcial estimado, ajustes de estratégia recomendados.

Responsável: Rafa / Lucca + Analista de Marketing

Output: Relatório quinzenal apresentado ao cliente em reunião de alinhamento.

Prazo referência: A cada 15 dias durante a fase de lançamento', '<p>Ação: Na fase de lançamento, elaborar relatório quinzenal com visão mais estratégica: leads acumulados vs. meta da fase, funil completo com taxas de conversão, qualidade de leads (feedback do comercial), ROI parcial estimado, ajustes de estratégia recomendados.</p><p>Responsável: Rafa / Lucca + Analista de Marketing</p><p>Output: Relatório quinzenal apresentado ao cliente em reunião de alinhamento.</p><p>Prazo referência: A cada 15 dias durante a fase de lançamento</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Relatório Mensal Consolidado', 'Ação: Todo mês: consolidar performance mensal de todos os canais com análise de tendência (comparativo mês anterior), análise de qualidade dos leads (taxa de conversão em visitas e propostas), análise de ROI de mídia por canal, ranking de criativos do mês, recomendações para o mês seguinte.

Responsável: Rafa / Lucca

Output: Relatório mensal completo enviado até o dia 5 de cada mês.

Prazo referência: Até dia 5 do mês seguinte', '<p>Ação: Todo mês: consolidar performance mensal de todos os canais com análise de tendência (comparativo mês anterior), análise de qualidade dos leads (taxa de conversão em visitas e propostas), análise de ROI de mídia por canal, ranking de criativos do mês, recomendações para o mês seguinte.</p><p>Responsável: Rafa / Lucca</p><p>Output: Relatório mensal completo enviado até o dia 5 de cada mês.</p><p>Prazo referência: Até dia 5 do mês seguinte</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Relatório Final de Campanha', 'Ação: Ao encerrar o ciclo completo da campanha: compilar relatório final com visão integral da campanha (pré-lançamento + lançamento + sustentação). Incluir: total investido, total de leads gerados, CPL médio por fase, funil de conversão completo, ROI total, 5 principais aprendizados e recomendações para o próximo produto.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Relatório final de campanha apresentado ao cliente em reunião de encerramento. Cópia arquivada no Notion.

Prazo referência: Até 15 dias após encerramento da campanha', '<p>Ação: Ao encerrar o ciclo completo da campanha: compilar relatório final com visão integral da campanha (pré-lançamento + lançamento + sustentação). Incluir: total investido, total de leads gerados, CPL médio por fase, funil de conversão completo, ROI total, 5 principais aprendizados e recomendações para o próximo produto.</p><p>Responsável: Rafa / Lucca + Marco Andolfato</p><p>Output: Relatório final de campanha apresentado ao cliente em reunião de encerramento. Cópia arquivada no Notion.</p><p>Prazo referência: Até 15 dias após encerramento da campanha</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Dashboard ao vivo compartilhado desde a semana 1; relatórios semanais sem atraso; discrepância entre plataformas investigada (máx 5%); relatório final entregue em até 15 dias; aprendizados arquivados no Notion para uso futuro.', '<p>Dashboard ao vivo compartilhado desde a semana 1; relatórios semanais sem atraso; discrepância entre plataformas investigada (máx 5%); relatório final entregue em até 15 dias; aprendizados arquivados no Notion para uso futuro.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Relatórios apenas com dados sem análise e recomendações; inconsistências entre plataformas não investigadas; dashboard não atualizado em tempo real; relatório final sem aprendizados documentados; envio de relatório sem contextualização estratégica.', '<p>Relatórios apenas com dados sem análise e recomendações; inconsistências entre plataformas não investigadas; dashboard não atualizado em tempo real; relatório final sem aprendizados documentados; envio de relatório sem contextualização estratégica.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Looker Studio, Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides, Notion.', '<p>Google Looker Studio, Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides, Notion.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Dashboard ao vivo: D+7; relatório semanal: toda segunda-feira; relatório quinzenal: a cada 15 dias (fase lançamento); relatório mensal: dia 5 do mês seguinte; relatório final: 15 dias após encerramento.', '<p>Dashboard ao vivo: D+7; relatório semanal: toda segunda-feira; relatório quinzenal: a cada 15 dias (fase lançamento); relatório mensal: dia 5 do mês seguinte; relatório final: 15 dias após encerramento.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Setup dashboard (D+7) → Coleta semanal (sextas) → Relatório semanal (segundas) → Relatório quinzenal (lançamento) → Relatório mensal (dia 5) → Relatório final (até D+15 do encerramento) → Fim', '<p>Início → Setup dashboard (D+7) → Coleta semanal (sextas) → Relatório semanal (segundas) → Relatório quinzenal (lançamento) → Relatório mensal (dia 5) → Relatório final (até D+15 do encerramento) → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Looker Studio: ferramenta de visualização de dados do Google (antes Data Studio). Funil de conversão: sequência lead → visita → proposta → venda com taxas de cada etapa. ROI: Return on Investment. CPL médio: média ponderada do custo por lead considerando todos os canais. Benchmark: referência de mercado para comparação de KPIs.', '<p>Looker Studio: ferramenta de visualização de dados do Google (antes Data Studio). Funil de conversão: sequência lead → visita → proposta → venda com taxas de cada etapa. ROI: Return on Investment. CPL médio: média ponderada do custo por lead considerando todos os canais. Benchmark: referência de mercado para comparação de KPIs.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-AV-001: Teaser de Lançamento ──
END $$;
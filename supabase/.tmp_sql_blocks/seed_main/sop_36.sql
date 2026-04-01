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
END $$;
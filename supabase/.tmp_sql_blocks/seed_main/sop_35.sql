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
    'Gestão de Influenciadores',
    'tbo-mkt-007-gestao-de-influenciadores',
    'marketing',
    'checklist',
    'Selecionar, contratar, briefar e gerenciar influenciadores digitais para amplificar o alcance das campanhas imobiliárias, gerando prova social, expectativa e credibilidade para o empreendimento.',
    'Standard Operating Procedure

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

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Influenciadores</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-007</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Selecionar, contratar, briefar e gerenciar influenciadores digitais para amplificar o alcance das campanhas imobiliárias, gerando prova social, expectativa e credibilidade para o empreendimento.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Prospecção e seleção de influenciadores, negociação e contrato, briefing de conteúdo, aprovação de posts, monitoramento de performance e pagamento.</p><p><strong>2.2 Exclusões</strong></p><p>Produção de criativos institucionais (BU Criação), gestão de mídia paga com impulsionamento de posts de influenciadores (MKT-09).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Lidera seleção, negociação e gestão</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente, Jurídico</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Monitora publicações, engajamento e pagamentos</p></td><td><p>Rafa / Lucca</p></td><td><p>Influenciador</p></td></tr><tr><td><p>Jurídico / Financeiro TBO</p></td><td><p>Valida contrato e processa pagamento</p></td><td><p>Marco Andolfato</p></td><td><p>Rafa / Lucca</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Plano de Marketing aprovado (MKT-02) com budget de influenciadores definido; briefing do produto; personas do empreendimento; calendário de ativação.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Instagram Insights, YouTube Analytics, HypeAuditor (ou similar), planilha de gestão de influenciadores TBO, Notion, contrato-padrão TBO.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Prospecção e Seleção de Influenciadores</strong></p><p>Ação: Mapear influenciadores alinhados às personas do produto: segmento (arquitetura, lifestyle, imóveis, família, luxo), localização geográfica, faixa de seguidores (macro: &gt;100k, micro: 10k-100k, nano: 1k-10k). Analisar taxa de engajamento real, autenticidade de audiência (sem compra de seguidores) e histórico de parcerias.</p><p>Responsável: Rafa / Lucca + Analista de Marketing</p><p>Output: Shortlist de 5-10 influenciadores com análise de métricas e alinhamento à persona.</p><p>Prazo referência: D+5 após aprovação do plano</p><p><strong>5.2. Negociação e Contratação</strong></p><p>Ação: Entrar em contato com influenciadores selecionados (via direct, e-mail ou assessoria). Negociar formato de entrega, número de posts, janela de exclusividade, valor. Formalizar via contrato-padrão TBO com cláusula de aprovação prévia de conteúdo.</p><p>Responsável: Rafa / Lucca</p><p>Output: Contratos assinados com todos os influenciadores da campanha.</p><p>Prazo referência: D+12</p><p><strong>5.3. Briefing de Conteúdo</strong></p><p>Ação: Elaborar briefing por influenciador: mensagens obrigatórias, tom de voz, produtos/cômodos a destacar, hashtags, menções obrigatórias, data de publicação, formato (stories, reels, feed, YouTube). Incluir o que NÃO deve ser comunicado (preço, condições, concorrentes).</p><p>Responsável: Rafa / Lucca</p><p>Output: Briefing individual por influenciador aprovado pelo cliente.</p><p>Prazo referência: D+15</p><p><strong>5.4. Aprovação de Conteúdo Antes da Publicação</strong></p><p>Ação: Receber rascunho/roteiro de cada conteúdo antes da publicação. Revisar aderência ao briefing, mensagens obrigatórias, tom. Solicitar ajustes se necessário. Aprovar formalmente antes de publicar.</p><p>Responsável: Rafa / Lucca</p><p>Output: Conteúdo aprovado documentado por influenciador (print ou e-mail de aprovação).</p><p>Prazo referência: 48h antes da publicação prevista</p><p><strong>5.5. Monitoramento de Publicações e Performance</strong></p><p>Ação: Após publicação: registrar métricas nas primeiras 24h (alcance, impressões, engajamento, cliques no link, stories swipe-up). Solicitar print de insights direto do influenciador. Registrar na planilha de gestão.</p><p>Responsável: Analista de Marketing</p><p>Output: Planilha de performance de influenciadores atualizada por publicação.</p><p>Prazo referência: 24-48h após cada publicação</p><p><strong>5.6. Gestão de Pagamento e Encerramento</strong></p><p>Ação: Após entrega completa e validação das métricas, encaminhar para financeiro para pagamento conforme contrato. Documentar performance final de cada influenciador para base de dados de influenciadores TBO.</p><p>Responsável: Analista de Marketing + Financeiro TBO</p><p>Output: Pagamento processado e ficha do influenciador atualizada no banco de dados TBO.</p><p>Prazo referência: Conforme prazo contratual</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Influenciadores selecionados com análise de autenticidade de audiência; contrato assinado antes de qualquer publicação; briefing individual por influenciador; aprovação prévia de 100% dos conteúdos; métricas coletadas e registradas; pagamento somente após entrega validada.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Selecionar influenciadores por número de seguidores sem analisar engajamento real; publicar sem contrato; não ter aprovação prévia de conteúdo; pagar antes de receber métricas; não registrar performance para base de dados futura.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>HypeAuditor (ou similar para análise de audiência), Instagram Insights, YouTube Analytics, planilha de gestão de influenciadores TBO, contrato-padrão TBO, Notion.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Shortlist: D+5; contratos: D+12; briefings: D+15; aprovação de conteúdo: 48h antes da publicação; métricas: 48h após publicação; pagamento: conforme contrato.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Prospecção e análise → Shortlist → Negociação → Contrato → Briefing → Recebimento de rascunho → Aprovação → Publicação → Coleta de métricas → Validação → Pagamento → Fim</p><p><strong>  10. Glossário</strong></p><p>Micro-influenciador: perfil com 10k-100k seguidores. Taxa de engajamento: percentual de seguidores que interagem com o conteúdo. Swipe-up: ação de arrastar no stories para acessar link. Exclusividade: período em que o influenciador não pode promover concorrentes.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
    6,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-MKT-007
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Selecionar, contratar, briefar e gerenciar influenciadores digitais para amplificar o alcance das campanhas imobiliárias, gerando prova social, expectativa e credibilidade para o empreendimento.', '<p>Selecionar, contratar, briefar e gerenciar influenciadores digitais para amplificar o alcance das campanhas imobiliárias, gerando prova social, expectativa e credibilidade para o empreendimento.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Prospecção e seleção de influenciadores, negociação e contrato, briefing de conteúdo, aprovação de posts, monitoramento de performance e pagamento.', '<p>Prospecção e seleção de influenciadores, negociação e contrato, briefing de conteúdo, aprovação de posts, monitoramento de performance e pagamento.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de criativos institucionais (BU Criação), gestão de mídia paga com impulsionamento de posts de influenciadores (MKT-09).', '<p>Produção de criativos institucionais (BU Criação), gestão de mídia paga com impulsionamento de posts de influenciadores (MKT-09).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Rafa / Lucca', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Lidera seleção, negociação e gestão</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente, Jurídico</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Monitora publicações, engajamento e pagamentos</p></td><td><p>Rafa / Lucca</p></td><td><p>Influenciador</p></td></tr><tr><td><p>Jurídico / Financeiro TBO</p></td><td><p>Valida contrato e processa pagamento</p></td><td><p>Marco Andolfato</p></td><td><p>Rafa / Lucca</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plano de Marketing aprovado (MKT-02) com budget de influenciadores definido; briefing do produto; personas do empreendimento; calendário de ativação.', '<p>Plano de Marketing aprovado (MKT-02) com budget de influenciadores definido; briefing do produto; personas do empreendimento; calendário de ativação.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Instagram Insights, YouTube Analytics, HypeAuditor (ou similar), planilha de gestão de influenciadores TBO, Notion, contrato-padrão TBO.', '<p>Instagram Insights, YouTube Analytics, HypeAuditor (ou similar), planilha de gestão de influenciadores TBO, Notion, contrato-padrão TBO.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Prospecção e Seleção de Influenciadores', 'Ação: Mapear influenciadores alinhados às personas do produto: segmento (arquitetura, lifestyle, imóveis, família, luxo), localização geográfica, faixa de seguidores (macro: >100k, micro: 10k-100k, nano: 1k-10k). Analisar taxa de engajamento real, autenticidade de audiência (sem compra de seguidores) e histórico de parcerias.

Responsável: Rafa / Lucca + Analista de Marketing

Output: Shortlist de 5-10 influenciadores com análise de métricas e alinhamento à persona.

Prazo referência: D+5 após aprovação do plano', '<p>Ação: Mapear influenciadores alinhados às personas do produto: segmento (arquitetura, lifestyle, imóveis, família, luxo), localização geográfica, faixa de seguidores (macro: &gt;100k, micro: 10k-100k, nano: 1k-10k). Analisar taxa de engajamento real, autenticidade de audiência (sem compra de seguidores) e histórico de parcerias.</p><p>Responsável: Rafa / Lucca + Analista de Marketing</p><p>Output: Shortlist de 5-10 influenciadores com análise de métricas e alinhamento à persona.</p><p>Prazo referência: D+5 após aprovação do plano</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Negociação e Contratação', 'Ação: Entrar em contato com influenciadores selecionados (via direct, e-mail ou assessoria). Negociar formato de entrega, número de posts, janela de exclusividade, valor. Formalizar via contrato-padrão TBO com cláusula de aprovação prévia de conteúdo.

Responsável: Rafa / Lucca

Output: Contratos assinados com todos os influenciadores da campanha.

Prazo referência: D+12', '<p>Ação: Entrar em contato com influenciadores selecionados (via direct, e-mail ou assessoria). Negociar formato de entrega, número de posts, janela de exclusividade, valor. Formalizar via contrato-padrão TBO com cláusula de aprovação prévia de conteúdo.</p><p>Responsável: Rafa / Lucca</p><p>Output: Contratos assinados com todos os influenciadores da campanha.</p><p>Prazo referência: D+12</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Briefing de Conteúdo', 'Ação: Elaborar briefing por influenciador: mensagens obrigatórias, tom de voz, produtos/cômodos a destacar, hashtags, menções obrigatórias, data de publicação, formato (stories, reels, feed, YouTube). Incluir o que NÃO deve ser comunicado (preço, condições, concorrentes).

Responsável: Rafa / Lucca

Output: Briefing individual por influenciador aprovado pelo cliente.

Prazo referência: D+15', '<p>Ação: Elaborar briefing por influenciador: mensagens obrigatórias, tom de voz, produtos/cômodos a destacar, hashtags, menções obrigatórias, data de publicação, formato (stories, reels, feed, YouTube). Incluir o que NÃO deve ser comunicado (preço, condições, concorrentes).</p><p>Responsável: Rafa / Lucca</p><p>Output: Briefing individual por influenciador aprovado pelo cliente.</p><p>Prazo referência: D+15</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Aprovação de Conteúdo Antes da Publicação', 'Ação: Receber rascunho/roteiro de cada conteúdo antes da publicação. Revisar aderência ao briefing, mensagens obrigatórias, tom. Solicitar ajustes se necessário. Aprovar formalmente antes de publicar.

Responsável: Rafa / Lucca

Output: Conteúdo aprovado documentado por influenciador (print ou e-mail de aprovação).

Prazo referência: 48h antes da publicação prevista', '<p>Ação: Receber rascunho/roteiro de cada conteúdo antes da publicação. Revisar aderência ao briefing, mensagens obrigatórias, tom. Solicitar ajustes se necessário. Aprovar formalmente antes de publicar.</p><p>Responsável: Rafa / Lucca</p><p>Output: Conteúdo aprovado documentado por influenciador (print ou e-mail de aprovação).</p><p>Prazo referência: 48h antes da publicação prevista</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Monitoramento de Publicações e Performance', 'Ação: Após publicação: registrar métricas nas primeiras 24h (alcance, impressões, engajamento, cliques no link, stories swipe-up). Solicitar print de insights direto do influenciador. Registrar na planilha de gestão.

Responsável: Analista de Marketing

Output: Planilha de performance de influenciadores atualizada por publicação.

Prazo referência: 24-48h após cada publicação', '<p>Ação: Após publicação: registrar métricas nas primeiras 24h (alcance, impressões, engajamento, cliques no link, stories swipe-up). Solicitar print de insights direto do influenciador. Registrar na planilha de gestão.</p><p>Responsável: Analista de Marketing</p><p>Output: Planilha de performance de influenciadores atualizada por publicação.</p><p>Prazo referência: 24-48h após cada publicação</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Gestão de Pagamento e Encerramento', 'Ação: Após entrega completa e validação das métricas, encaminhar para financeiro para pagamento conforme contrato. Documentar performance final de cada influenciador para base de dados de influenciadores TBO.

Responsável: Analista de Marketing + Financeiro TBO

Output: Pagamento processado e ficha do influenciador atualizada no banco de dados TBO.

Prazo referência: Conforme prazo contratual', '<p>Ação: Após entrega completa e validação das métricas, encaminhar para financeiro para pagamento conforme contrato. Documentar performance final de cada influenciador para base de dados de influenciadores TBO.</p><p>Responsável: Analista de Marketing + Financeiro TBO</p><p>Output: Pagamento processado e ficha do influenciador atualizada no banco de dados TBO.</p><p>Prazo referência: Conforme prazo contratual</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Influenciadores selecionados com análise de autenticidade de audiência; contrato assinado antes de qualquer publicação; briefing individual por influenciador; aprovação prévia de 100% dos conteúdos; métricas coletadas e registradas; pagamento somente após entrega validada.', '<p>Influenciadores selecionados com análise de autenticidade de audiência; contrato assinado antes de qualquer publicação; briefing individual por influenciador; aprovação prévia de 100% dos conteúdos; métricas coletadas e registradas; pagamento somente após entrega validada.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Selecionar influenciadores por número de seguidores sem analisar engajamento real; publicar sem contrato; não ter aprovação prévia de conteúdo; pagar antes de receber métricas; não registrar performance para base de dados futura.', '<p>Selecionar influenciadores por número de seguidores sem analisar engajamento real; publicar sem contrato; não ter aprovação prévia de conteúdo; pagar antes de receber métricas; não registrar performance para base de dados futura.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'HypeAuditor (ou similar para análise de audiência), Instagram Insights, YouTube Analytics, planilha de gestão de influenciadores TBO, contrato-padrão TBO, Notion.', '<p>HypeAuditor (ou similar para análise de audiência), Instagram Insights, YouTube Analytics, planilha de gestão de influenciadores TBO, contrato-padrão TBO, Notion.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Shortlist: D+5; contratos: D+12; briefings: D+15; aprovação de conteúdo: 48h antes da publicação; métricas: 48h após publicação; pagamento: conforme contrato.', '<p>Shortlist: D+5; contratos: D+12; briefings: D+15; aprovação de conteúdo: 48h antes da publicação; métricas: 48h após publicação; pagamento: conforme contrato.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Prospecção e análise → Shortlist → Negociação → Contrato → Briefing → Recebimento de rascunho → Aprovação → Publicação → Coleta de métricas → Validação → Pagamento → Fim', '<p>Início → Prospecção e análise → Shortlist → Negociação → Contrato → Briefing → Recebimento de rascunho → Aprovação → Publicação → Coleta de métricas → Validação → Pagamento → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Micro-influenciador: perfil com 10k-100k seguidores. Taxa de engajamento: percentual de seguidores que interagem com o conteúdo. Swipe-up: ação de arrastar no stories para acessar link. Exclusividade: período em que o influenciador não pode promover concorrentes.', '<p>Micro-influenciador: perfil com 10k-100k seguidores. Taxa de engajamento: percentual de seguidores que interagem com o conteúdo. Swipe-up: ação de arrastar no stories para acessar link. Exclusividade: período em que o influenciador não pode promover concorrentes.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-MKT-008: E mail Marketing ──
END $$;
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
END $$;
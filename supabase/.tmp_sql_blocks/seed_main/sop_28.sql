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
    'Gestão de Marca do Cliente',
    'tbo-brd-015-gestao-de-marca-do-cliente',
    'branding',
    'checklist',
    'Gerir de forma contínua a marca da incorporadora e/ou do empreendimento, garantindo consistência visual e de comunicação em todos os pontos de contato ao longo do tempo — da pré-venda ao pós-venda.',
    'Standard Operating Procedure

Gestão de Marca do Cliente

Código

TBO-BRD-015

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Branding

Responsável

Nelson (PO Branding)

Aprovador

Marco Andolfato



  1. Objetivo

Gerir de forma contínua a marca da incorporadora e/ou do empreendimento, garantindo consistência visual e de comunicação em todos os pontos de contato ao longo do tempo — da pré-venda ao pós-venda.

  2. Escopo

2.1 O que está coberto

Guardianismo de marca (brand guardian), auditoria periódica de aplicações, atualização do manual de identidade visual, gestão de solicitações de uso de marca de terceiros, treinamento da equipe do cliente, relatórios de saúde da marca.

2.2 Exclusões

Criação de novos materiais específicos (cobertos por SOPs específicos da BU Branding), gestão de redes sociais (módulo Digital), campanhas de mídia paga.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Nelson (PO Branding)

Brand Guardian — responsável pela consistência da marca do cliente

Responsável



Designer Senior (Branding)

Suporte técnico em auditorias e atualizações

Responsável



Marco Andolfato

Aprovação de decisões estratégicas de marca

Aprovador



Cliente/Incorporadora

Aderência às diretrizes e reporte de novas demandas



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Manual de identidade visual aprovado (BRD-02), histórico de materiais produzidos arquivado no Drive, contrato de gestão de marca ativo, acesso às plataformas e canais do cliente.

4.2 Ferramentas e Acessos

Notion (dashboard de saúde da marca, registro de demandas), Google Drive (repositório de arquivos e histórico), Adobe Creative Suite (produções e revisões), planilha de auditoria de marca TBO.



  5. Procedimento Passo a Passo

5.1. Dashboard de saúde da marca

Ação: Manter no Notion o dashboard de saúde da marca do cliente com: status do manual (última atualização), calendário de auditorias, log de materiais aprovados e reprovados, registro de solicitações de uso da marca por terceiros, alertas de inconsistências identificadas.

Responsável: Nelson (PO Branding)

Output: Dashboard atualizado no Notion, revisado mensalmente

Prazo referência: Atualização mensal (recorrente)

5.2. Auditoria trimestral de aplicações

Ação: A cada trimestre, auditar todas as aplicações da marca nos materiais ativos do cliente: redes sociais, materiais impressos em uso, sinalização, site, apresentações e materiais de terceiros (fornecedores, parceiros). Verificar aderência ao manual. Emitir relatório de auditoria com recomendações.

Responsável: Nelson + Designer Senior

Output: Relatório de auditoria com pontuação de consistência e lista de itens a corrigir

Prazo referência: 5 dias úteis (a cada trimestre)

[DECISÃO] Inconsistências críticas? Sim → acionar cliente e corrigir imediatamente. Não → incluir no próximo ciclo de manutenção.

5.3. Atualização do manual de identidade visual

Ação: Quando surgirem novos contextos de aplicação (nova plataforma, novo tipo de material, novo formato de mídia), atualizar o manual de identidade visual com as novas diretrizes. Documentar a versão, data e o que mudou. Comunicar ao cliente e à equipe interna.

Responsável: Designer Senior + Nelson

Output: Manual atualizado versionado no Drive, comunicado ao cliente

Prazo referência: Conforme necessidade — máx. 5 dias úteis por atualização

[APROVAÇÃO] Marco Andolfato aprova toda atualização de manual antes da comunicação ao cliente

5.4. Gestão de solicitações de uso por terceiros

Ação: Quando o cliente receber solicitação de uso da marca do empreendimento por terceiros (parceiros, fornecedores, imprensa), analisar a solicitação: verificar contexto de uso, mídia, adaptações necessárias. Aprovar, condicionar (com ajustes) ou reprovar. Documentar toda solicitação e decisão.

Responsável: Nelson (PO Branding)

Output: Parecer documentado sobre cada solicitação de uso de marca por terceiros

Prazo referência: 2 dias úteis por solicitação

5.5. Treinamento e capacitação da equipe do cliente

Ação: Realizar treinamento de uso de marca com a equipe de marketing e vendas do cliente ao menos 1x por ano (ou a cada novo lançamento). Formato: apresentação de 60 min + guia de uso rápido (1 página). Registrar participantes e data.

Responsável: Nelson (PO Branding)

Output: Treinamento realizado, lista de presença registrada, guia de uso rápido entregue

Prazo referência: Anual (ou por lançamento)

5.6. Relatório semestral de marca

Ação: A cada 6 meses, produzir relatório executivo de gestão de marca para o cliente: resumo das produções realizadas, índice de consistência da auditoria, solicitações de terceiros e decisões tomadas, recomendações para o próximo semestre, agenda de próximos lançamentos ou revisões.

Responsável: Nelson + Marco Andolfato

Output: Relatório semestral entregue ao cliente em PDF

Prazo referência: 5 dias úteis (a cada semestre)

[APROVAÇÃO] Marco Andolfato aprova relatório antes da entrega ao cliente

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Manual de identidade visual com versão e data de atualização; auditoria trimestral realizada e documentada; todas as solicitações de uso por terceiros com parecer registrado; treinamento anual realizado com lista de presença; dashboard no Notion atualizado mensalmente; relatório semestral entregue dentro do prazo.

6.2 Erros Comuns a Evitar

Aceitar uso da marca por terceiros sem análise e registro formal; manual desatualizado sem data de revisão; auditoria realizada sem relatório escrito; cliente usando materiais de versão reprovada sem que a TBO tenha identificado e corrigido; treinamento realizado sem registro de participantes.

  7. Ferramentas e Templates

Notion (dashboard e registro), Google Drive (repositório e versionamento), Adobe Creative Suite (auditorias e atualizações), Google Slides (treinamento), planilha de auditoria de marca TBO.

  8. SLAs e Prazos

Dashboard: atualização mensal. Auditoria: trimestral (5 dias úteis). Atualização de manual: até 5 dias úteis. Resposta a solicitação de terceiros: 2 dias úteis. Treinamento: anual. Relatório semestral: 5 dias úteis.

  9. Fluxograma

Início (contrato ativo) → Manter dashboard Notion → [AUDITORIA TRIMESTRAL] → Auditar aplicações → [INCONSISTÊNCIAS CRÍTICAS?] → Sim: acionar cliente e corrigir → Não: incluir próximo ciclo → [NOVA PLATAFORMA OU CONTEXTO?] → Sim: Atualizar manual → Marco aprova → Comunicar ao cliente → [SOLICITAÇÃO DE TERCEIROS?] → Analisar → Aprovar/Reprovar/Condicionar → Documentar → [SEMESTRAL] → Relatório executivo → Marco aprova → Entregar ao cliente → [ANUAL] → Treinamento da equipe → Registrar → Continuar ciclo → Fim

  10. Glossário

Brand Guardian: responsável pela integridade e consistência da marca ao longo do tempo. Auditoria de marca: verificação sistemática de todas as aplicações de uma identidade visual para garantir aderência ao manual. Índice de consistência: métrica percentual que indica o grau de conformidade das aplicações com o manual de marca. Guardianismo: prática contínua de proteção e manutenção de uma marca.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Marca do Cliente</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-015</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Gerir de forma contínua a marca da incorporadora e/ou do empreendimento, garantindo consistência visual e de comunicação em todos os pontos de contato ao longo do tempo — da pré-venda ao pós-venda.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Guardianismo de marca (brand guardian), auditoria periódica de aplicações, atualização do manual de identidade visual, gestão de solicitações de uso de marca de terceiros, treinamento da equipe do cliente, relatórios de saúde da marca.</p><p><strong>2.2 Exclusões</strong></p><p>Criação de novos materiais específicos (cobertos por SOPs específicos da BU Branding), gestão de redes sociais (módulo Digital), campanhas de mídia paga.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Brand Guardian — responsável pela consistência da marca do cliente</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Suporte técnico em auditorias e atualizações</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação de decisões estratégicas de marca</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Aderência às diretrizes e reporte de novas demandas</p></td><td></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Manual de identidade visual aprovado (BRD-02), histórico de materiais produzidos arquivado no Drive, contrato de gestão de marca ativo, acesso às plataformas e canais do cliente.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Notion (dashboard de saúde da marca, registro de demandas), Google Drive (repositório de arquivos e histórico), Adobe Creative Suite (produções e revisões), planilha de auditoria de marca TBO.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Dashboard de saúde da marca</strong></p><p>Ação: Manter no Notion o dashboard de saúde da marca do cliente com: status do manual (última atualização), calendário de auditorias, log de materiais aprovados e reprovados, registro de solicitações de uso da marca por terceiros, alertas de inconsistências identificadas.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Dashboard atualizado no Notion, revisado mensalmente</p><p>Prazo referência: Atualização mensal (recorrente)</p><p><strong>5.2. Auditoria trimestral de aplicações</strong></p><p>Ação: A cada trimestre, auditar todas as aplicações da marca nos materiais ativos do cliente: redes sociais, materiais impressos em uso, sinalização, site, apresentações e materiais de terceiros (fornecedores, parceiros). Verificar aderência ao manual. Emitir relatório de auditoria com recomendações.</p><p>Responsável: Nelson + Designer Senior</p><p>Output: Relatório de auditoria com pontuação de consistência e lista de itens a corrigir</p><p>Prazo referência: 5 dias úteis (a cada trimestre)</p><p><strong>[DECISÃO] Inconsistências críticas? Sim → acionar cliente e corrigir imediatamente. Não → incluir no próximo ciclo de manutenção.</strong></p><p><strong>5.3. Atualização do manual de identidade visual</strong></p><p>Ação: Quando surgirem novos contextos de aplicação (nova plataforma, novo tipo de material, novo formato de mídia), atualizar o manual de identidade visual com as novas diretrizes. Documentar a versão, data e o que mudou. Comunicar ao cliente e à equipe interna.</p><p>Responsável: Designer Senior + Nelson</p><p>Output: Manual atualizado versionado no Drive, comunicado ao cliente</p><p>Prazo referência: Conforme necessidade — máx. 5 dias úteis por atualização</p><p><strong>[APROVAÇÃO] Marco Andolfato aprova toda atualização de manual antes da comunicação ao cliente</strong></p><p><strong>5.4. Gestão de solicitações de uso por terceiros</strong></p><p>Ação: Quando o cliente receber solicitação de uso da marca do empreendimento por terceiros (parceiros, fornecedores, imprensa), analisar a solicitação: verificar contexto de uso, mídia, adaptações necessárias. Aprovar, condicionar (com ajustes) ou reprovar. Documentar toda solicitação e decisão.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Parecer documentado sobre cada solicitação de uso de marca por terceiros</p><p>Prazo referência: 2 dias úteis por solicitação</p><p><strong>5.5. Treinamento e capacitação da equipe do cliente</strong></p><p>Ação: Realizar treinamento de uso de marca com a equipe de marketing e vendas do cliente ao menos 1x por ano (ou a cada novo lançamento). Formato: apresentação de 60 min + guia de uso rápido (1 página). Registrar participantes e data.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Treinamento realizado, lista de presença registrada, guia de uso rápido entregue</p><p>Prazo referência: Anual (ou por lançamento)</p><p><strong>5.6. Relatório semestral de marca</strong></p><p>Ação: A cada 6 meses, produzir relatório executivo de gestão de marca para o cliente: resumo das produções realizadas, índice de consistência da auditoria, solicitações de terceiros e decisões tomadas, recomendações para o próximo semestre, agenda de próximos lançamentos ou revisões.</p><p>Responsável: Nelson + Marco Andolfato</p><p>Output: Relatório semestral entregue ao cliente em PDF</p><p>Prazo referência: 5 dias úteis (a cada semestre)</p><p><strong>[APROVAÇÃO] Marco Andolfato aprova relatório antes da entrega ao cliente</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Manual de identidade visual com versão e data de atualização; auditoria trimestral realizada e documentada; todas as solicitações de uso por terceiros com parecer registrado; treinamento anual realizado com lista de presença; dashboard no Notion atualizado mensalmente; relatório semestral entregue dentro do prazo.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Aceitar uso da marca por terceiros sem análise e registro formal; manual desatualizado sem data de revisão; auditoria realizada sem relatório escrito; cliente usando materiais de versão reprovada sem que a TBO tenha identificado e corrigido; treinamento realizado sem registro de participantes.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Notion (dashboard e registro), Google Drive (repositório e versionamento), Adobe Creative Suite (auditorias e atualizações), Google Slides (treinamento), planilha de auditoria de marca TBO.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Dashboard: atualização mensal. Auditoria: trimestral (5 dias úteis). Atualização de manual: até 5 dias úteis. Resposta a solicitação de terceiros: 2 dias úteis. Treinamento: anual. Relatório semestral: 5 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início (contrato ativo) → Manter dashboard Notion → [AUDITORIA TRIMESTRAL] → Auditar aplicações → [INCONSISTÊNCIAS CRÍTICAS?] → Sim: acionar cliente e corrigir → Não: incluir próximo ciclo → [NOVA PLATAFORMA OU CONTEXTO?] → Sim: Atualizar manual → Marco aprova → Comunicar ao cliente → [SOLICITAÇÃO DE TERCEIROS?] → Analisar → Aprovar/Reprovar/Condicionar → Documentar → [SEMESTRAL] → Relatório executivo → Marco aprova → Entregar ao cliente → [ANUAL] → Treinamento da equipe → Registrar → Continuar ciclo → Fim</p><p><strong>  10. Glossário</strong></p><p>Brand Guardian: responsável pela integridade e consistência da marca ao longo do tempo. Auditoria de marca: verificação sistemática de todas as aplicações de uma identidade visual para garantir aderência ao manual. Índice de consistência: métrica percentual que indica o grau de conformidade das aplicações com o manual de marca. Guardianismo: prática contínua de proteção e manutenção de uma marca.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
    13,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-BRD-015
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Gerir de forma contínua a marca da incorporadora e/ou do empreendimento, garantindo consistência visual e de comunicação em todos os pontos de contato ao longo do tempo — da pré-venda ao pós-venda.', '<p>Gerir de forma contínua a marca da incorporadora e/ou do empreendimento, garantindo consistência visual e de comunicação em todos os pontos de contato ao longo do tempo — da pré-venda ao pós-venda.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Guardianismo de marca (brand guardian), auditoria periódica de aplicações, atualização do manual de identidade visual, gestão de solicitações de uso de marca de terceiros, treinamento da equipe do cliente, relatórios de saúde da marca.', '<p>Guardianismo de marca (brand guardian), auditoria periódica de aplicações, atualização do manual de identidade visual, gestão de solicitações de uso de marca de terceiros, treinamento da equipe do cliente, relatórios de saúde da marca.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Criação de novos materiais específicos (cobertos por SOPs específicos da BU Branding), gestão de redes sociais (módulo Digital), campanhas de mídia paga.', '<p>Criação de novos materiais específicos (cobertos por SOPs específicos da BU Branding), gestão de redes sociais (módulo Digital), campanhas de mídia paga.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Nelson (PO Branding)

Brand Guardian — responsável pela consistência da marca do cliente

Responsável

Designer Senior (Branding)

Suporte técnico em auditorias e atualizações

Responsável

Marco Andolfato

Aprovação de decisões estratégicas de marca

Aprovador

Cliente/Incorporadora

Aderência às diretrizes e reporte de novas demandas

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Brand Guardian — responsável pela consistência da marca do cliente</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Suporte técnico em auditorias e atualizações</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação de decisões estratégicas de marca</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Aderência às diretrizes e reporte de novas demandas</p></td><td></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Manual de identidade visual aprovado (BRD-02), histórico de materiais produzidos arquivado no Drive, contrato de gestão de marca ativo, acesso às plataformas e canais do cliente.', '<p>Manual de identidade visual aprovado (BRD-02), histórico de materiais produzidos arquivado no Drive, contrato de gestão de marca ativo, acesso às plataformas e canais do cliente.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Notion (dashboard de saúde da marca, registro de demandas), Google Drive (repositório de arquivos e histórico), Adobe Creative Suite (produções e revisões), planilha de auditoria de marca TBO.', '<p>Notion (dashboard de saúde da marca, registro de demandas), Google Drive (repositório de arquivos e histórico), Adobe Creative Suite (produções e revisões), planilha de auditoria de marca TBO.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Dashboard de saúde da marca', 'Ação: Manter no Notion o dashboard de saúde da marca do cliente com: status do manual (última atualização), calendário de auditorias, log de materiais aprovados e reprovados, registro de solicitações de uso da marca por terceiros, alertas de inconsistências identificadas.

Responsável: Nelson (PO Branding)

Output: Dashboard atualizado no Notion, revisado mensalmente

Prazo referência: Atualização mensal (recorrente)', '<p>Ação: Manter no Notion o dashboard de saúde da marca do cliente com: status do manual (última atualização), calendário de auditorias, log de materiais aprovados e reprovados, registro de solicitações de uso da marca por terceiros, alertas de inconsistências identificadas.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Dashboard atualizado no Notion, revisado mensalmente</p><p>Prazo referência: Atualização mensal (recorrente)</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Auditoria trimestral de aplicações', 'Ação: A cada trimestre, auditar todas as aplicações da marca nos materiais ativos do cliente: redes sociais, materiais impressos em uso, sinalização, site, apresentações e materiais de terceiros (fornecedores, parceiros). Verificar aderência ao manual. Emitir relatório de auditoria com recomendações.

Responsável: Nelson + Designer Senior

Output: Relatório de auditoria com pontuação de consistência e lista de itens a corrigir

Prazo referência: 5 dias úteis (a cada trimestre)

[DECISÃO] Inconsistências críticas? Sim → acionar cliente e corrigir imediatamente. Não → incluir no próximo ciclo de manutenção.', '<p>Ação: A cada trimestre, auditar todas as aplicações da marca nos materiais ativos do cliente: redes sociais, materiais impressos em uso, sinalização, site, apresentações e materiais de terceiros (fornecedores, parceiros). Verificar aderência ao manual. Emitir relatório de auditoria com recomendações.</p><p>Responsável: Nelson + Designer Senior</p><p>Output: Relatório de auditoria com pontuação de consistência e lista de itens a corrigir</p><p>Prazo referência: 5 dias úteis (a cada trimestre)</p><p><strong>[DECISÃO] Inconsistências críticas? Sim → acionar cliente e corrigir imediatamente. Não → incluir no próximo ciclo de manutenção.</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Atualização do manual de identidade visual', 'Ação: Quando surgirem novos contextos de aplicação (nova plataforma, novo tipo de material, novo formato de mídia), atualizar o manual de identidade visual com as novas diretrizes. Documentar a versão, data e o que mudou. Comunicar ao cliente e à equipe interna.

Responsável: Designer Senior + Nelson

Output: Manual atualizado versionado no Drive, comunicado ao cliente

Prazo referência: Conforme necessidade — máx. 5 dias úteis por atualização

[APROVAÇÃO] Marco Andolfato aprova toda atualização de manual antes da comunicação ao cliente', '<p>Ação: Quando surgirem novos contextos de aplicação (nova plataforma, novo tipo de material, novo formato de mídia), atualizar o manual de identidade visual com as novas diretrizes. Documentar a versão, data e o que mudou. Comunicar ao cliente e à equipe interna.</p><p>Responsável: Designer Senior + Nelson</p><p>Output: Manual atualizado versionado no Drive, comunicado ao cliente</p><p>Prazo referência: Conforme necessidade — máx. 5 dias úteis por atualização</p><p><strong>[APROVAÇÃO] Marco Andolfato aprova toda atualização de manual antes da comunicação ao cliente</strong></p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Gestão de solicitações de uso por terceiros', 'Ação: Quando o cliente receber solicitação de uso da marca do empreendimento por terceiros (parceiros, fornecedores, imprensa), analisar a solicitação: verificar contexto de uso, mídia, adaptações necessárias. Aprovar, condicionar (com ajustes) ou reprovar. Documentar toda solicitação e decisão.

Responsável: Nelson (PO Branding)

Output: Parecer documentado sobre cada solicitação de uso de marca por terceiros

Prazo referência: 2 dias úteis por solicitação', '<p>Ação: Quando o cliente receber solicitação de uso da marca do empreendimento por terceiros (parceiros, fornecedores, imprensa), analisar a solicitação: verificar contexto de uso, mídia, adaptações necessárias. Aprovar, condicionar (com ajustes) ou reprovar. Documentar toda solicitação e decisão.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Parecer documentado sobre cada solicitação de uso de marca por terceiros</p><p>Prazo referência: 2 dias úteis por solicitação</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Treinamento e capacitação da equipe do cliente', 'Ação: Realizar treinamento de uso de marca com a equipe de marketing e vendas do cliente ao menos 1x por ano (ou a cada novo lançamento). Formato: apresentação de 60 min + guia de uso rápido (1 página). Registrar participantes e data.

Responsável: Nelson (PO Branding)

Output: Treinamento realizado, lista de presença registrada, guia de uso rápido entregue

Prazo referência: Anual (ou por lançamento)', '<p>Ação: Realizar treinamento de uso de marca com a equipe de marketing e vendas do cliente ao menos 1x por ano (ou a cada novo lançamento). Formato: apresentação de 60 min + guia de uso rápido (1 página). Registrar participantes e data.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Treinamento realizado, lista de presença registrada, guia de uso rápido entregue</p><p>Prazo referência: Anual (ou por lançamento)</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Relatório semestral de marca', 'Ação: A cada 6 meses, produzir relatório executivo de gestão de marca para o cliente: resumo das produções realizadas, índice de consistência da auditoria, solicitações de terceiros e decisões tomadas, recomendações para o próximo semestre, agenda de próximos lançamentos ou revisões.

Responsável: Nelson + Marco Andolfato

Output: Relatório semestral entregue ao cliente em PDF

Prazo referência: 5 dias úteis (a cada semestre)

[APROVAÇÃO] Marco Andolfato aprova relatório antes da entrega ao cliente', '<p>Ação: A cada 6 meses, produzir relatório executivo de gestão de marca para o cliente: resumo das produções realizadas, índice de consistência da auditoria, solicitações de terceiros e decisões tomadas, recomendações para o próximo semestre, agenda de próximos lançamentos ou revisões.</p><p>Responsável: Nelson + Marco Andolfato</p><p>Output: Relatório semestral entregue ao cliente em PDF</p><p>Prazo referência: 5 dias úteis (a cada semestre)</p><p><strong>[APROVAÇÃO] Marco Andolfato aprova relatório antes da entrega ao cliente</strong></p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Manual de identidade visual com versão e data de atualização; auditoria trimestral realizada e documentada; todas as solicitações de uso por terceiros com parecer registrado; treinamento anual realizado com lista de presença; dashboard no Notion atualizado mensalmente; relatório semestral entregue dentro do prazo.', '<p>Manual de identidade visual com versão e data de atualização; auditoria trimestral realizada e documentada; todas as solicitações de uso por terceiros com parecer registrado; treinamento anual realizado com lista de presença; dashboard no Notion atualizado mensalmente; relatório semestral entregue dentro do prazo.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Aceitar uso da marca por terceiros sem análise e registro formal; manual desatualizado sem data de revisão; auditoria realizada sem relatório escrito; cliente usando materiais de versão reprovada sem que a TBO tenha identificado e corrigido; treinamento realizado sem registro de participantes.', '<p>Aceitar uso da marca por terceiros sem análise e registro formal; manual desatualizado sem data de revisão; auditoria realizada sem relatório escrito; cliente usando materiais de versão reprovada sem que a TBO tenha identificado e corrigido; treinamento realizado sem registro de participantes.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Notion (dashboard e registro), Google Drive (repositório e versionamento), Adobe Creative Suite (auditorias e atualizações), Google Slides (treinamento), planilha de auditoria de marca TBO.', '<p>Notion (dashboard e registro), Google Drive (repositório e versionamento), Adobe Creative Suite (auditorias e atualizações), Google Slides (treinamento), planilha de auditoria de marca TBO.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Dashboard: atualização mensal. Auditoria: trimestral (5 dias úteis). Atualização de manual: até 5 dias úteis. Resposta a solicitação de terceiros: 2 dias úteis. Treinamento: anual. Relatório semestral: 5 dias úteis.', '<p>Dashboard: atualização mensal. Auditoria: trimestral (5 dias úteis). Atualização de manual: até 5 dias úteis. Resposta a solicitação de terceiros: 2 dias úteis. Treinamento: anual. Relatório semestral: 5 dias úteis.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início (contrato ativo) → Manter dashboard Notion → [AUDITORIA TRIMESTRAL] → Auditar aplicações → [INCONSISTÊNCIAS CRÍTICAS?] → Sim: acionar cliente e corrigir → Não: incluir próximo ciclo → [NOVA PLATAFORMA OU CONTEXTO?] → Sim: Atualizar manual → Marco aprova → Comunicar ao cliente → [SOLICITAÇÃO DE TERCEIROS?] → Analisar → Aprovar/Reprovar/Condicionar → Documentar → [SEMESTRAL] → Relatório executivo → Marco aprova → Entregar ao cliente → [ANUAL] → Treinamento da equipe → Registrar → Continuar ciclo → Fim', '<p>Início (contrato ativo) → Manter dashboard Notion → [AUDITORIA TRIMESTRAL] → Auditar aplicações → [INCONSISTÊNCIAS CRÍTICAS?] → Sim: acionar cliente e corrigir → Não: incluir próximo ciclo → [NOVA PLATAFORMA OU CONTEXTO?] → Sim: Atualizar manual → Marco aprova → Comunicar ao cliente → [SOLICITAÇÃO DE TERCEIROS?] → Analisar → Aprovar/Reprovar/Condicionar → Documentar → [SEMESTRAL] → Relatório executivo → Marco aprova → Entregar ao cliente → [ANUAL] → Treinamento da equipe → Registrar → Continuar ciclo → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Brand Guardian: responsável pela integridade e consistência da marca ao longo do tempo. Auditoria de marca: verificação sistemática de todas as aplicações de uma identidade visual para garantir aderência ao manual. Índice de consistência: métrica percentual que indica o grau de conformidade das aplicações com o manual de marca. Guardianismo: prática contínua de proteção e manutenção de uma marca.', '<p>Brand Guardian: responsável pela integridade e consistência da marca ao longo do tempo. Auditoria de marca: verificação sistemática de todas as aplicações de uma identidade visual para garantir aderência ao manual. Índice de consistência: métrica percentual que indica o grau de conformidade das aplicações com o manual de marca. Guardianismo: prática contínua de proteção e manutenção de uma marca.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-MKT-001: Diagnóstico de Marketing ──
END $$;
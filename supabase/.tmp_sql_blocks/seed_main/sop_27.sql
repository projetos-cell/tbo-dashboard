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
    'Aprovação e Revisão de Materiais',
    'tbo-brd-014-aprovacao-e-revisao-de-materiais',
    'branding',
    'checklist',
    'Aprovação e Revisão de Materiais',
    'Standard Operating Procedure

Aprovação e Revisão de Materiais

Código

TBO-BRD-014

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

Garantir que todos os materiais produzidos pela BU Branding passem por um processo estruturado de revisão interna e aprovação formal do cliente antes de qualquer finalização, impressão ou publicação.

  2. Escopo

2.1 O que está coberto

Fluxo de revisão interna (Designer → Nelson → Marco Andolfato), processo de envio e aprovação com o cliente, controle de versões, registro de feedbacks e aprovações formais.

2.2 Exclusões

Aprovação jurídica de materiais (responsabilidade do jurídico da incorporadora), revisão de conteúdo gerado por terceiros (renderizações, fotos), aprovação de campanhas de mídia paga.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Designer (Branding)

Produzir versão de revisão e aplicar ajustes

Responsável



Nelson (PO Branding)

Revisão criativa e de identidade visual — 1ª aprovação interna

Aprovador



Marco Andolfato

Aprovação estratégica final interna — 2ª aprovação antes do cliente

Aprovador



Atendimento/Gestor de Conta

Envio ao cliente e gestão do processo de aprovação

Responsável



Cliente/Incorporadora

Aprovação de conteúdo, dados e design



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Material produzido pelo designer em versão de revisão (não arte final), briefing original, versões anteriores aprovadas (para comparação em revisões), checklist de qualidade específico do tipo de material.

4.2 Ferramentas e Acessos

Notion (registro de versões e feedbacks), Google Drive (versionamento de arquivos), e-mail (aprovação formal), formulário de feedback padronizado TBO.



  5. Procedimento Passo a Passo

5.1. Checklist de qualidade pelo designer

Ação: Antes de enviar para revisão interna, o designer aplica o checklist de qualidade específico do tipo de material (tapume, book, folder, etc.). Verificar: aderência ao briefing, consistência com identidade visual, dados corretos, resolução adequada, nomenclatura de arquivo correta.

Responsável: Designer

Output: Checklist de qualidade preenchido e arquivado junto ao arquivo de revisão

Prazo referência: 0,5 dia útil por material

5.2. Revisão criativa — Nelson (PO Branding)

Ação: Nelson revisa o material com foco em: coerência com a identidade visual, hierarquia de informação, qualidade criativa, alinhamento com o posicionamento estratégico do empreendimento. Documentar todos os apontamentos em lista numerada no Notion. Não devolver para o designer sem lista consolidada.

Responsável: Nelson (PO Branding)

Output: Lista de apontamentos numerada no Notion (ou aprovação direta)

Prazo referência: 4 horas a 1 dia útil

[DECISÃO] Aprovado? Sim → Marco Andolfato. Não → lista de ajustes ao designer.

5.3. Revisão estratégica — Marco Andolfato

Ação: Marco Andolfato revisa o material já validado por Nelson com foco em: alinhamento estratégico, posicionamento de marca, qualidade de entrega TBO. Aprovar ou adicionar apontamentos. NUNCA enviar material ao cliente sem a aprovação de Marco.

Responsável: Marco Andolfato

Output: Aprovação interna registrada no Notion, ou lista de ajustes adicionais

Prazo referência: 4 horas a 1 dia útil

[APROVAÇÃO] Obrigatório — nenhum material vai ao cliente sem aprovação de Marco Andolfato

5.4. Envio ao cliente e gestão de feedback

Ação: Atendimento envia o material ao cliente via e-mail com formulário de feedback padronizado (ou formulário em Notion). O e-mail deve incluir: link para o arquivo (PDF ou Drive), prazo de resposta esperado (máx. 3 dias úteis), instrução de como deixar feedback (link, comentário no PDF ou formulário).

Responsável: Atendimento/Gestor de Conta

Output: E-mail de revisão enviado, prazo confirmado, feedback do cliente recebido e registrado

Prazo referência: Envio imediato; aguardar resposta máx. 3 dias úteis

5.5. Aplicação de ajustes e controle de versões

Ação: Designer aplica os ajustes do cliente. Versionar o arquivo (v1, v2, v3) no Google Drive. Nunca sobrescrever versão anterior. Limitar a 2 rodadas de revisão incluídas no escopo. A partir da 3ª rodada, emitir aditivo de horas. Documentar cada versão no Notion.

Responsável: Designer + Atendimento

Output: Arquivo revisado versionado no Drive, registro no Notion atualizado

Prazo referência: 1–2 dias úteis por rodada

[DECISÃO] 3ª rodada? Sim → emitir aditivo e informar o cliente. Não → continuar normalmente.

5.6. Aprovação final e liberação para produção

Ação: Cliente aprova a versão final por e-mail (resposta explícita: ''Aprovado'' ou assinatura em documento). Registrar aprovação no Notion. Apenas após aprovação formal o material é liberado para arte final e envio à gráfica ou publicação.

Responsável: Atendimento + Nelson

Output: Aprovação formal registrada, material liberado para produção ou publicação

Prazo referência: 0,5 dia útil

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Checklist específico do tipo de material preenchido antes da revisão interna; nenhum material enviado ao cliente sem aprovação de Marco Andolfato; todas as versões salvas com nomenclatura (v1, v2...) no Drive; feedbacks documentados por escrito (não verbal/WhatsApp informalmente); aprovação final do cliente registrada antes da liberação; máximo de 2 rodadas de revisão dentro do escopo.

6.2 Erros Comuns a Evitar

Enviar material ao cliente diretamente sem revisão de Nelson ou Marco; aceitar aprovação verbal por WhatsApp sem confirmação por e-mail; sobrescrever versões anteriores no Drive; não documentar apontamentos (dificulta rastreabilidade); iniciar arte final sem aprovação formal registrada.

  7. Ferramentas e Templates

Notion (gestão do fluxo e registro de versões), Google Drive (versionamento de arquivos), e-mail corporativo (aprovação formal), Adobe Acrobat (comentários em PDF), formulário TBO de feedback.

  8. SLAs e Prazos

Revisão Nelson: até 1 dia útil. Revisão Marco: até 1 dia útil. Envio ao cliente: imediato após aprovação interna. Prazo de resposta do cliente: máx. 3 dias úteis. Ajuste e nova versão: 1–2 dias úteis. Total por rodada: 3–5 dias úteis.

  9. Fluxograma

Início → Designer conclui material → Checklist de qualidade preenchido → Nelson revisa → [NELSON APROVA?] → Não: ajustes ao designer → Sim: Marco Andolfato revisa → [MARCO APROVA?] → Não: ajustes → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: [É 3ª RODADA?] → Sim: emitir aditivo → Não: aplicar ajustes → versionar no Drive → Sim: Registrar aprovação formal → Liberar para produção/publicação → Fim

  10. Glossário

Rodada de revisão: ciclo de feedback e ajuste de um material. Aditivo: instrumento contratual para cobrar horas além do escopo original. Versionamento: prática de salvar cada iteração de um arquivo com identificação de versão (v1, v2). Arte final: versão definitiva de um arquivo preparada para impressão ou publicação.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Aprovação e Revisão de Materiais</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-014</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Garantir que todos os materiais produzidos pela BU Branding passem por um processo estruturado de revisão interna e aprovação formal do cliente antes de qualquer finalização, impressão ou publicação.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Fluxo de revisão interna (Designer → Nelson → Marco Andolfato), processo de envio e aprovação com o cliente, controle de versões, registro de feedbacks e aprovações formais.</p><p><strong>2.2 Exclusões</strong></p><p>Aprovação jurídica de materiais (responsabilidade do jurídico da incorporadora), revisão de conteúdo gerado por terceiros (renderizações, fotos), aprovação de campanhas de mídia paga.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer (Branding)</p></td><td><p>Produzir versão de revisão e aplicar ajustes</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Revisão criativa e de identidade visual — 1ª aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação estratégica final interna — 2ª aprovação antes do cliente</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Atendimento/Gestor de Conta</p></td><td><p>Envio ao cliente e gestão do processo de aprovação</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Aprovação de conteúdo, dados e design</p></td><td></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Material produzido pelo designer em versão de revisão (não arte final), briefing original, versões anteriores aprovadas (para comparação em revisões), checklist de qualidade específico do tipo de material.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Notion (registro de versões e feedbacks), Google Drive (versionamento de arquivos), e-mail (aprovação formal), formulário de feedback padronizado TBO.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Checklist de qualidade pelo designer</strong></p><p>Ação: Antes de enviar para revisão interna, o designer aplica o checklist de qualidade específico do tipo de material (tapume, book, folder, etc.). Verificar: aderência ao briefing, consistência com identidade visual, dados corretos, resolução adequada, nomenclatura de arquivo correta.</p><p>Responsável: Designer</p><p>Output: Checklist de qualidade preenchido e arquivado junto ao arquivo de revisão</p><p>Prazo referência: 0,5 dia útil por material</p><p><strong>5.2. Revisão criativa — Nelson (PO Branding)</strong></p><p>Ação: Nelson revisa o material com foco em: coerência com a identidade visual, hierarquia de informação, qualidade criativa, alinhamento com o posicionamento estratégico do empreendimento. Documentar todos os apontamentos em lista numerada no Notion. Não devolver para o designer sem lista consolidada.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Lista de apontamentos numerada no Notion (ou aprovação direta)</p><p>Prazo referência: 4 horas a 1 dia útil</p><p><strong>[DECISÃO] Aprovado? Sim → Marco Andolfato. Não → lista de ajustes ao designer.</strong></p><p><strong>5.3. Revisão estratégica — Marco Andolfato</strong></p><p>Ação: Marco Andolfato revisa o material já validado por Nelson com foco em: alinhamento estratégico, posicionamento de marca, qualidade de entrega TBO. Aprovar ou adicionar apontamentos. NUNCA enviar material ao cliente sem a aprovação de Marco.</p><p>Responsável: Marco Andolfato</p><p>Output: Aprovação interna registrada no Notion, ou lista de ajustes adicionais</p><p>Prazo referência: 4 horas a 1 dia útil</p><p><strong>[APROVAÇÃO] Obrigatório — nenhum material vai ao cliente sem aprovação de Marco Andolfato</strong></p><p><strong>5.4. Envio ao cliente e gestão de feedback</strong></p><p>Ação: Atendimento envia o material ao cliente via e-mail com formulário de feedback padronizado (ou formulário em Notion). O e-mail deve incluir: link para o arquivo (PDF ou Drive), prazo de resposta esperado (máx. 3 dias úteis), instrução de como deixar feedback (link, comentário no PDF ou formulário).</p><p>Responsável: Atendimento/Gestor de Conta</p><p>Output: E-mail de revisão enviado, prazo confirmado, feedback do cliente recebido e registrado</p><p>Prazo referência: Envio imediato; aguardar resposta máx. 3 dias úteis</p><p><strong>5.5. Aplicação de ajustes e controle de versões</strong></p><p>Ação: Designer aplica os ajustes do cliente. Versionar o arquivo (v1, v2, v3) no Google Drive. Nunca sobrescrever versão anterior. Limitar a 2 rodadas de revisão incluídas no escopo. A partir da 3ª rodada, emitir aditivo de horas. Documentar cada versão no Notion.</p><p>Responsável: Designer + Atendimento</p><p>Output: Arquivo revisado versionado no Drive, registro no Notion atualizado</p><p>Prazo referência: 1–2 dias úteis por rodada</p><p><strong>[DECISÃO] 3ª rodada? Sim → emitir aditivo e informar o cliente. Não → continuar normalmente.</strong></p><p><strong>5.6. Aprovação final e liberação para produção</strong></p><p>Ação: Cliente aprova a versão final por e-mail (resposta explícita: ''Aprovado'' ou assinatura em documento). Registrar aprovação no Notion. Apenas após aprovação formal o material é liberado para arte final e envio à gráfica ou publicação.</p><p>Responsável: Atendimento + Nelson</p><p>Output: Aprovação formal registrada, material liberado para produção ou publicação</p><p>Prazo referência: 0,5 dia útil</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Checklist específico do tipo de material preenchido antes da revisão interna; nenhum material enviado ao cliente sem aprovação de Marco Andolfato; todas as versões salvas com nomenclatura (v1, v2...) no Drive; feedbacks documentados por escrito (não verbal/WhatsApp informalmente); aprovação final do cliente registrada antes da liberação; máximo de 2 rodadas de revisão dentro do escopo.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Enviar material ao cliente diretamente sem revisão de Nelson ou Marco; aceitar aprovação verbal por WhatsApp sem confirmação por e-mail; sobrescrever versões anteriores no Drive; não documentar apontamentos (dificulta rastreabilidade); iniciar arte final sem aprovação formal registrada.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Notion (gestão do fluxo e registro de versões), Google Drive (versionamento de arquivos), e-mail corporativo (aprovação formal), Adobe Acrobat (comentários em PDF), formulário TBO de feedback.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Revisão Nelson: até 1 dia útil. Revisão Marco: até 1 dia útil. Envio ao cliente: imediato após aprovação interna. Prazo de resposta do cliente: máx. 3 dias úteis. Ajuste e nova versão: 1–2 dias úteis. Total por rodada: 3–5 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Designer conclui material → Checklist de qualidade preenchido → Nelson revisa → [NELSON APROVA?] → Não: ajustes ao designer → Sim: Marco Andolfato revisa → [MARCO APROVA?] → Não: ajustes → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: [É 3ª RODADA?] → Sim: emitir aditivo → Não: aplicar ajustes → versionar no Drive → Sim: Registrar aprovação formal → Liberar para produção/publicação → Fim</p><p><strong>  10. Glossário</strong></p><p>Rodada de revisão: ciclo de feedback e ajuste de um material. Aditivo: instrumento contratual para cobrar horas além do escopo original. Versionamento: prática de salvar cada iteração de um arquivo com identificação de versão (v1, v2). Arte final: versão definitiva de um arquivo preparada para impressão ou publicação.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'high',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
    12,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-BRD-014
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que todos os materiais produzidos pela BU Branding passem por um processo estruturado de revisão interna e aprovação formal do cliente antes de qualquer finalização, impressão ou publicação.', '<p>Garantir que todos os materiais produzidos pela BU Branding passem por um processo estruturado de revisão interna e aprovação formal do cliente antes de qualquer finalização, impressão ou publicação.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Fluxo de revisão interna (Designer → Nelson → Marco Andolfato), processo de envio e aprovação com o cliente, controle de versões, registro de feedbacks e aprovações formais.', '<p>Fluxo de revisão interna (Designer → Nelson → Marco Andolfato), processo de envio e aprovação com o cliente, controle de versões, registro de feedbacks e aprovações formais.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Aprovação jurídica de materiais (responsabilidade do jurídico da incorporadora), revisão de conteúdo gerado por terceiros (renderizações, fotos), aprovação de campanhas de mídia paga.', '<p>Aprovação jurídica de materiais (responsabilidade do jurídico da incorporadora), revisão de conteúdo gerado por terceiros (renderizações, fotos), aprovação de campanhas de mídia paga.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Designer (Branding)

Produzir versão de revisão e aplicar ajustes

Responsável

Nelson (PO Branding)

Revisão criativa e de identidade visual — 1ª aprovação interna

Aprovador

Marco Andolfato

Aprovação estratégica final interna — 2ª aprovação antes do cliente

Aprovador

Atendimento/Gestor de Conta

Envio ao cliente e gestão do processo de aprovação

Responsável

Cliente/Incorporadora

Aprovação de conteúdo, dados e design

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer (Branding)</p></td><td><p>Produzir versão de revisão e aplicar ajustes</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Revisão criativa e de identidade visual — 1ª aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação estratégica final interna — 2ª aprovação antes do cliente</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Atendimento/Gestor de Conta</p></td><td><p>Envio ao cliente e gestão do processo de aprovação</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Aprovação de conteúdo, dados e design</p></td><td></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Material produzido pelo designer em versão de revisão (não arte final), briefing original, versões anteriores aprovadas (para comparação em revisões), checklist de qualidade específico do tipo de material.', '<p>Material produzido pelo designer em versão de revisão (não arte final), briefing original, versões anteriores aprovadas (para comparação em revisões), checklist de qualidade específico do tipo de material.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Notion (registro de versões e feedbacks), Google Drive (versionamento de arquivos), e-mail (aprovação formal), formulário de feedback padronizado TBO.', '<p>Notion (registro de versões e feedbacks), Google Drive (versionamento de arquivos), e-mail (aprovação formal), formulário de feedback padronizado TBO.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Checklist de qualidade pelo designer', 'Ação: Antes de enviar para revisão interna, o designer aplica o checklist de qualidade específico do tipo de material (tapume, book, folder, etc.). Verificar: aderência ao briefing, consistência com identidade visual, dados corretos, resolução adequada, nomenclatura de arquivo correta.

Responsável: Designer

Output: Checklist de qualidade preenchido e arquivado junto ao arquivo de revisão

Prazo referência: 0,5 dia útil por material', '<p>Ação: Antes de enviar para revisão interna, o designer aplica o checklist de qualidade específico do tipo de material (tapume, book, folder, etc.). Verificar: aderência ao briefing, consistência com identidade visual, dados corretos, resolução adequada, nomenclatura de arquivo correta.</p><p>Responsável: Designer</p><p>Output: Checklist de qualidade preenchido e arquivado junto ao arquivo de revisão</p><p>Prazo referência: 0,5 dia útil por material</p>', 6, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Revisão criativa — Nelson (PO Branding)', 'Ação: Nelson revisa o material com foco em: coerência com a identidade visual, hierarquia de informação, qualidade criativa, alinhamento com o posicionamento estratégico do empreendimento. Documentar todos os apontamentos em lista numerada no Notion. Não devolver para o designer sem lista consolidada.

Responsável: Nelson (PO Branding)

Output: Lista de apontamentos numerada no Notion (ou aprovação direta)

Prazo referência: 4 horas a 1 dia útil

[DECISÃO] Aprovado? Sim → Marco Andolfato. Não → lista de ajustes ao designer.', '<p>Ação: Nelson revisa o material com foco em: coerência com a identidade visual, hierarquia de informação, qualidade criativa, alinhamento com o posicionamento estratégico do empreendimento. Documentar todos os apontamentos em lista numerada no Notion. Não devolver para o designer sem lista consolidada.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Lista de apontamentos numerada no Notion (ou aprovação direta)</p><p>Prazo referência: 4 horas a 1 dia útil</p><p><strong>[DECISÃO] Aprovado? Sim → Marco Andolfato. Não → lista de ajustes ao designer.</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Revisão estratégica — Marco Andolfato', 'Ação: Marco Andolfato revisa o material já validado por Nelson com foco em: alinhamento estratégico, posicionamento de marca, qualidade de entrega TBO. Aprovar ou adicionar apontamentos. NUNCA enviar material ao cliente sem a aprovação de Marco.

Responsável: Marco Andolfato

Output: Aprovação interna registrada no Notion, ou lista de ajustes adicionais

Prazo referência: 4 horas a 1 dia útil

[APROVAÇÃO] Obrigatório — nenhum material vai ao cliente sem aprovação de Marco Andolfato', '<p>Ação: Marco Andolfato revisa o material já validado por Nelson com foco em: alinhamento estratégico, posicionamento de marca, qualidade de entrega TBO. Aprovar ou adicionar apontamentos. NUNCA enviar material ao cliente sem a aprovação de Marco.</p><p>Responsável: Marco Andolfato</p><p>Output: Aprovação interna registrada no Notion, ou lista de ajustes adicionais</p><p>Prazo referência: 4 horas a 1 dia útil</p><p><strong>[APROVAÇÃO] Obrigatório — nenhum material vai ao cliente sem aprovação de Marco Andolfato</strong></p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Envio ao cliente e gestão de feedback', 'Ação: Atendimento envia o material ao cliente via e-mail com formulário de feedback padronizado (ou formulário em Notion). O e-mail deve incluir: link para o arquivo (PDF ou Drive), prazo de resposta esperado (máx. 3 dias úteis), instrução de como deixar feedback (link, comentário no PDF ou formulário).

Responsável: Atendimento/Gestor de Conta

Output: E-mail de revisão enviado, prazo confirmado, feedback do cliente recebido e registrado

Prazo referência: Envio imediato; aguardar resposta máx. 3 dias úteis', '<p>Ação: Atendimento envia o material ao cliente via e-mail com formulário de feedback padronizado (ou formulário em Notion). O e-mail deve incluir: link para o arquivo (PDF ou Drive), prazo de resposta esperado (máx. 3 dias úteis), instrução de como deixar feedback (link, comentário no PDF ou formulário).</p><p>Responsável: Atendimento/Gestor de Conta</p><p>Output: E-mail de revisão enviado, prazo confirmado, feedback do cliente recebido e registrado</p><p>Prazo referência: Envio imediato; aguardar resposta máx. 3 dias úteis</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Aplicação de ajustes e controle de versões', 'Ação: Designer aplica os ajustes do cliente. Versionar o arquivo (v1, v2, v3) no Google Drive. Nunca sobrescrever versão anterior. Limitar a 2 rodadas de revisão incluídas no escopo. A partir da 3ª rodada, emitir aditivo de horas. Documentar cada versão no Notion.

Responsável: Designer + Atendimento

Output: Arquivo revisado versionado no Drive, registro no Notion atualizado

Prazo referência: 1–2 dias úteis por rodada

[DECISÃO] 3ª rodada? Sim → emitir aditivo e informar o cliente. Não → continuar normalmente.', '<p>Ação: Designer aplica os ajustes do cliente. Versionar o arquivo (v1, v2, v3) no Google Drive. Nunca sobrescrever versão anterior. Limitar a 2 rodadas de revisão incluídas no escopo. A partir da 3ª rodada, emitir aditivo de horas. Documentar cada versão no Notion.</p><p>Responsável: Designer + Atendimento</p><p>Output: Arquivo revisado versionado no Drive, registro no Notion atualizado</p><p>Prazo referência: 1–2 dias úteis por rodada</p><p><strong>[DECISÃO] 3ª rodada? Sim → emitir aditivo e informar o cliente. Não → continuar normalmente.</strong></p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Aprovação final e liberação para produção', 'Ação: Cliente aprova a versão final por e-mail (resposta explícita: ''Aprovado'' ou assinatura em documento). Registrar aprovação no Notion. Apenas após aprovação formal o material é liberado para arte final e envio à gráfica ou publicação.

Responsável: Atendimento + Nelson

Output: Aprovação formal registrada, material liberado para produção ou publicação

Prazo referência: 0,5 dia útil', '<p>Ação: Cliente aprova a versão final por e-mail (resposta explícita: ''Aprovado'' ou assinatura em documento). Registrar aprovação no Notion. Apenas após aprovação formal o material é liberado para arte final e envio à gráfica ou publicação.</p><p>Responsável: Atendimento + Nelson</p><p>Output: Aprovação formal registrada, material liberado para produção ou publicação</p><p>Prazo referência: 0,5 dia útil</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Checklist específico do tipo de material preenchido antes da revisão interna; nenhum material enviado ao cliente sem aprovação de Marco Andolfato; todas as versões salvas com nomenclatura (v1, v2...) no Drive; feedbacks documentados por escrito (não verbal/WhatsApp informalmente); aprovação final do cliente registrada antes da liberação; máximo de 2 rodadas de revisão dentro do escopo.', '<p>Checklist específico do tipo de material preenchido antes da revisão interna; nenhum material enviado ao cliente sem aprovação de Marco Andolfato; todas as versões salvas com nomenclatura (v1, v2...) no Drive; feedbacks documentados por escrito (não verbal/WhatsApp informalmente); aprovação final do cliente registrada antes da liberação; máximo de 2 rodadas de revisão dentro do escopo.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Enviar material ao cliente diretamente sem revisão de Nelson ou Marco; aceitar aprovação verbal por WhatsApp sem confirmação por e-mail; sobrescrever versões anteriores no Drive; não documentar apontamentos (dificulta rastreabilidade); iniciar arte final sem aprovação formal registrada.', '<p>Enviar material ao cliente diretamente sem revisão de Nelson ou Marco; aceitar aprovação verbal por WhatsApp sem confirmação por e-mail; sobrescrever versões anteriores no Drive; não documentar apontamentos (dificulta rastreabilidade); iniciar arte final sem aprovação formal registrada.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Notion (gestão do fluxo e registro de versões), Google Drive (versionamento de arquivos), e-mail corporativo (aprovação formal), Adobe Acrobat (comentários em PDF), formulário TBO de feedback.', '<p>Notion (gestão do fluxo e registro de versões), Google Drive (versionamento de arquivos), e-mail corporativo (aprovação formal), Adobe Acrobat (comentários em PDF), formulário TBO de feedback.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Revisão Nelson: até 1 dia útil. Revisão Marco: até 1 dia útil. Envio ao cliente: imediato após aprovação interna. Prazo de resposta do cliente: máx. 3 dias úteis. Ajuste e nova versão: 1–2 dias úteis. Total por rodada: 3–5 dias úteis.', '<p>Revisão Nelson: até 1 dia útil. Revisão Marco: até 1 dia útil. Envio ao cliente: imediato após aprovação interna. Prazo de resposta do cliente: máx. 3 dias úteis. Ajuste e nova versão: 1–2 dias úteis. Total por rodada: 3–5 dias úteis.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Designer conclui material → Checklist de qualidade preenchido → Nelson revisa → [NELSON APROVA?] → Não: ajustes ao designer → Sim: Marco Andolfato revisa → [MARCO APROVA?] → Não: ajustes → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: [É 3ª RODADA?] → Sim: emitir aditivo → Não: aplicar ajustes → versionar no Drive → Sim: Registrar aprovação formal → Liberar para produção/publicação → Fim', '<p>Início → Designer conclui material → Checklist de qualidade preenchido → Nelson revisa → [NELSON APROVA?] → Não: ajustes ao designer → Sim: Marco Andolfato revisa → [MARCO APROVA?] → Não: ajustes → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: [É 3ª RODADA?] → Sim: emitir aditivo → Não: aplicar ajustes → versionar no Drive → Sim: Registrar aprovação formal → Liberar para produção/publicação → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Rodada de revisão: ciclo de feedback e ajuste de um material. Aditivo: instrumento contratual para cobrar horas além do escopo original. Versionamento: prática de salvar cada iteração de um arquivo com identificação de versão (v1, v2). Arte final: versão definitiva de um arquivo preparada para impressão ou publicação.', '<p>Rodada de revisão: ciclo de feedback e ajuste de um material. Aditivo: instrumento contratual para cobrar horas além do escopo original. Versionamento: prática de salvar cada iteração de um arquivo com identificação de versão (v1, v2). Arte final: versão definitiva de um arquivo preparada para impressão ou publicação.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-BRD-015: Gestão de Marca do Cliente ──
END $$;
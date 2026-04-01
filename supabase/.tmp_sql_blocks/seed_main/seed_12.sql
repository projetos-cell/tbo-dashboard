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
    'Encerramento e Pós entrega',
    'tbo-ops-008-encerramento-e-pos-entrega',
    'operacoes',
    'checklist',
    'Carol (Coordenadora de Operações)',
    'Standard Operating Procedure

Encerramento e Pós-entrega

Código

TBO-OPS-008

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Operações

Responsável

Carol (Coordenadora de Operações)

Aprovador

Marco Andolfato



  1. Objetivo

Garantir que todo projeto seja formalmente encerrado com aceite do cliente, arquivamento completo dos arquivos, coleta de feedback estruturado, registro de aprendizados e ações de relacionamento pós-entrega.

  2. Escopo

2.1 O que está coberto

Processo de encerramento formal após aprovação final do cliente: aceite, arquivamento, pesquisa de satisfação, reunião de retrospectiva interna e ação de relacionamento.

2.2 Exclusões

Suporte e manutenção pós-entrega (definidos no contrato separadamente), renovação ou novo escopo (inicia novo SOP OPS-03).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar encerramento, arquivamento, pesquisa de satisfação

Executor

—

Marco Andolfato

Conduzir retrospectiva interna, aprovar aprendizados

Aprovador

—

Responsável de BU

Participar da retrospectiva, arquivar projeto técnico

Executor

—

Cliente

Assinar aceite, responder pesquisa de satisfação

Consultado

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Aprovação final do cliente documentada (e-mail ou assinatura); todos os arquivos finais entregues e confirmados; histórico de tasks no Asana concluído.

4.2 Ferramentas e Acessos

Google Drive (estrutura de arquivamento), Asana, Google Forms (pesquisa de NPS), planilha de histórico de projetos TBO, Gmail.



  5. Procedimento Passo a Passo

5.1. Confirmação de Aceite Final

Ação: Carol confirma com o cliente por escrito (e-mail) que todos os entregáveis foram recebidos, aprovados e não há pendências; solicita resposta de aceite formal. Registrar data de aceite no Asana e planilha de projetos.

Responsável: Carol (Ops) + Cliente

Output: Aceite formal registrado

Prazo referência: Até 2 dias após última entrega aprovada

5.2. Arquivamento Completo

Ação: Responsável de BU organiza pasta final do projeto no Drive: /entregas (arquivos finais aprovados), /projeto (arquivos de trabalho: Premiere, Unreal, Figma etc.), /aprovações (histórico de aprovações do cliente), /financeiro (NFs emitidas); confirmar com Carol.

Responsável: Responsável de BU + Carol (Ops)

Output: Projeto arquivado com estrutura completa

Prazo referência: Até 3 dias após aceite

5.3. Pesquisa de Satisfação (NPS)

Ação: Carol envia Google Forms de NPS ao cliente (10 perguntas: qualidade, prazo, comunicação, relação custo-benefício, recomendaria a TBO, comentário livre); aguardar resposta por 5 dias; registrar resultado na planilha de NPS.

Responsável: Carol (Ops)

Output: NPS registrado

Prazo referência: Enviado no dia do aceite, aguardar 5 dias

5.4. Retrospectiva Interna

Ação: Marco conduz reunião de retrospectiva de 45min com a equipe do projeto: o que funcionou bem, o que pode melhorar, gargalos identificados, aprendizados técnicos. Carol registra no documento de aprendizados TBO (Drive).

Responsável: Marco Andolfato + Equipe do Projeto

Output: Documento de aprendizados registrado

Prazo referência: Até 5 dias após aceite

5.5. Ação de Relacionamento Pós-entrega

Ação: Marco ou Carol realiza contato de follow-up 30 dias após entrega: verificar se a entrega está performando bem (vídeo gerando leads, app funcionando no stand), oferecer próximos passos (novas pílulas, atualização de disponibilidade, segunda fase). Registrar no CRM.

Responsável: Marco Andolfato + Carol (Ops)

Output: Follow-up 30 dias realizado e registrado

Prazo referência: 30 dias após aceite

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Aceite formal recebido por escrito; [ ] Pasta do Drive com todos os arquivos organizados; [ ] NPS enviado e resultado registrado; [ ] Retrospectiva realizada com documento de aprendizados; [ ] Projeto marcado como concluído no Asana; [ ] Follow-up 30 dias agendado no momento do aceite.

6.2 Erros Comuns a Evitar

Projeto encerrado sem aceite formal → cliente reabre demandas como se fossem do mesmo projeto. Arquivos desorganizados → impossibilidade de reutilizar assets em futuros projetos. Sem retrospectiva → mesmos erros se repetem nos próximos projetos. Follow-up não realizado → oportunidade de renovação perdida.

  7. Ferramentas e Templates

Google Drive, Asana, Google Forms, Gmail, planilha de NPS, planilha de histórico de projetos.

  8. SLAs e Prazos

Aceite formal: 2 dias após última entrega. Arquivamento: 3 dias após aceite. NPS enviado: no dia do aceite. Retrospectiva: até 5 dias após aceite. Follow-up 30 dias: agendado no momento do aceite.

  9. Fluxograma

Início → Aprovação Final do Cliente → Aceite Formal (e-mail) → Arquivamento Completo → NPS Enviado → Retrospectiva Interna → Documento de Aprendizados → Projeto Concluído no Asana → Follow-up 30 dias → Fim

  10. Glossário

NPS: Net Promoter Score — métrica de satisfação e lealdade do cliente (0–10). Aceite formal: confirmação escrita pelo cliente de que a entrega está completa e aprovada. Retrospectiva: reunião estruturada de revisão do projeto para gerar aprendizados. Follow-up pós-entrega: contato proativo após entrega para verificar resultado e identificar oportunidades.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Encerramento e Pós-entrega</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-OPS-008</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Operações</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Garantir que todo projeto seja formalmente encerrado com aceite do cliente, arquivamento completo dos arquivos, coleta de feedback estruturado, registro de aprendizados e ações de relacionamento pós-entrega.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Processo de encerramento formal após aprovação final do cliente: aceite, arquivamento, pesquisa de satisfação, reunião de retrospectiva interna e ação de relacionamento.</p><p><strong>2.2 Exclusões</strong></p><p>Suporte e manutenção pós-entrega (definidos no contrato separadamente), renovação ou novo escopo (inicia novo SOP OPS-03).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coordenar encerramento, arquivamento, pesquisa de satisfação</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Conduzir retrospectiva interna, aprovar aprendizados</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Responsável de BU</p></td><td><p>Participar da retrospectiva, arquivar projeto técnico</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente</p></td><td><p>Assinar aceite, responder pesquisa de satisfação</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Aprovação final do cliente documentada (e-mail ou assinatura); todos os arquivos finais entregues e confirmados; histórico de tasks no Asana concluído.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Drive (estrutura de arquivamento), Asana, Google Forms (pesquisa de NPS), planilha de histórico de projetos TBO, Gmail.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Confirmação de Aceite Final</strong></p><p>Ação: Carol confirma com o cliente por escrito (e-mail) que todos os entregáveis foram recebidos, aprovados e não há pendências; solicita resposta de aceite formal. Registrar data de aceite no Asana e planilha de projetos.</p><p>Responsável: Carol (Ops) + Cliente</p><p>Output: Aceite formal registrado</p><p>Prazo referência: Até 2 dias após última entrega aprovada</p><p><strong>5.2. Arquivamento Completo</strong></p><p>Ação: Responsável de BU organiza pasta final do projeto no Drive: /entregas (arquivos finais aprovados), /projeto (arquivos de trabalho: Premiere, Unreal, Figma etc.), /aprovações (histórico de aprovações do cliente), /financeiro (NFs emitidas); confirmar com Carol.</p><p>Responsável: Responsável de BU + Carol (Ops)</p><p>Output: Projeto arquivado com estrutura completa</p><p>Prazo referência: Até 3 dias após aceite</p><p><strong>5.3. Pesquisa de Satisfação (NPS)</strong></p><p>Ação: Carol envia Google Forms de NPS ao cliente (10 perguntas: qualidade, prazo, comunicação, relação custo-benefício, recomendaria a TBO, comentário livre); aguardar resposta por 5 dias; registrar resultado na planilha de NPS.</p><p>Responsável: Carol (Ops)</p><p>Output: NPS registrado</p><p>Prazo referência: Enviado no dia do aceite, aguardar 5 dias</p><p><strong>5.4. Retrospectiva Interna</strong></p><p>Ação: Marco conduz reunião de retrospectiva de 45min com a equipe do projeto: o que funcionou bem, o que pode melhorar, gargalos identificados, aprendizados técnicos. Carol registra no documento de aprendizados TBO (Drive).</p><p>Responsável: Marco Andolfato + Equipe do Projeto</p><p>Output: Documento de aprendizados registrado</p><p>Prazo referência: Até 5 dias após aceite</p><p><strong>5.5. Ação de Relacionamento Pós-entrega</strong></p><p>Ação: Marco ou Carol realiza contato de follow-up 30 dias após entrega: verificar se a entrega está performando bem (vídeo gerando leads, app funcionando no stand), oferecer próximos passos (novas pílulas, atualização de disponibilidade, segunda fase). Registrar no CRM.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Follow-up 30 dias realizado e registrado</p><p>Prazo referência: 30 dias após aceite</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Aceite formal recebido por escrito; [ ] Pasta do Drive com todos os arquivos organizados; [ ] NPS enviado e resultado registrado; [ ] Retrospectiva realizada com documento de aprendizados; [ ] Projeto marcado como concluído no Asana; [ ] Follow-up 30 dias agendado no momento do aceite.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Projeto encerrado sem aceite formal → cliente reabre demandas como se fossem do mesmo projeto. Arquivos desorganizados → impossibilidade de reutilizar assets em futuros projetos. Sem retrospectiva → mesmos erros se repetem nos próximos projetos. Follow-up não realizado → oportunidade de renovação perdida.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Drive, Asana, Google Forms, Gmail, planilha de NPS, planilha de histórico de projetos.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Aceite formal: 2 dias após última entrega. Arquivamento: 3 dias após aceite. NPS enviado: no dia do aceite. Retrospectiva: até 5 dias após aceite. Follow-up 30 dias: agendado no momento do aceite.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Aprovação Final do Cliente → Aceite Formal (e-mail) → Arquivamento Completo → NPS Enviado → Retrospectiva Interna → Documento de Aprendizados → Projeto Concluído no Asana → Follow-up 30 dias → Fim</p><p><strong>  10. Glossário</strong></p><p>NPS: Net Promoter Score — métrica de satisfação e lealdade do cliente (0–10). Aceite formal: confirmação escrita pelo cliente de que a entrega está completa e aprovada. Retrospectiva: reunião estruturada de revisão do projeto para gerar aprendizados. Follow-up pós-entrega: contato proativo após entrega para verificar resultado e identificar oportunidades.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'high',
    ARRAY['operacoes','processo','gestao','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-OPS-008
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que todo projeto seja formalmente encerrado com aceite do cliente, arquivamento completo dos arquivos, coleta de feedback estruturado, registro de aprendizados e ações de relacionamento pós-entrega.', '<p>Garantir que todo projeto seja formalmente encerrado com aceite do cliente, arquivamento completo dos arquivos, coleta de feedback estruturado, registro de aprendizados e ações de relacionamento pós-entrega.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Processo de encerramento formal após aprovação final do cliente: aceite, arquivamento, pesquisa de satisfação, reunião de retrospectiva interna e ação de relacionamento.', '<p>Processo de encerramento formal após aprovação final do cliente: aceite, arquivamento, pesquisa de satisfação, reunião de retrospectiva interna e ação de relacionamento.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Suporte e manutenção pós-entrega (definidos no contrato separadamente), renovação ou novo escopo (inicia novo SOP OPS-03).', '<p>Suporte e manutenção pós-entrega (definidos no contrato separadamente), renovação ou novo escopo (inicia novo SOP OPS-03).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar encerramento, arquivamento, pesquisa de satisfação

Executor

—

Marco Andolfato

Conduzir retrospectiva interna, aprovar aprendizados

Aprovador

—

Responsável de BU

Participar da retrospectiva, arquivar projeto técnico

Executor

—

Cliente

Assinar aceite, responder pesquisa de satisfação

Consultado

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coordenar encerramento, arquivamento, pesquisa de satisfação</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Conduzir retrospectiva interna, aprovar aprendizados</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Responsável de BU</p></td><td><p>Participar da retrospectiva, arquivar projeto técnico</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente</p></td><td><p>Assinar aceite, responder pesquisa de satisfação</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Aprovação final do cliente documentada (e-mail ou assinatura); todos os arquivos finais entregues e confirmados; histórico de tasks no Asana concluído.', '<p>Aprovação final do cliente documentada (e-mail ou assinatura); todos os arquivos finais entregues e confirmados; histórico de tasks no Asana concluído.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Drive (estrutura de arquivamento), Asana, Google Forms (pesquisa de NPS), planilha de histórico de projetos TBO, Gmail.', '<p>Google Drive (estrutura de arquivamento), Asana, Google Forms (pesquisa de NPS), planilha de histórico de projetos TBO, Gmail.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Confirmação de Aceite Final', 'Ação: Carol confirma com o cliente por escrito (e-mail) que todos os entregáveis foram recebidos, aprovados e não há pendências; solicita resposta de aceite formal. Registrar data de aceite no Asana e planilha de projetos.

Responsável: Carol (Ops) + Cliente

Output: Aceite formal registrado

Prazo referência: Até 2 dias após última entrega aprovada', '<p>Ação: Carol confirma com o cliente por escrito (e-mail) que todos os entregáveis foram recebidos, aprovados e não há pendências; solicita resposta de aceite formal. Registrar data de aceite no Asana e planilha de projetos.</p><p>Responsável: Carol (Ops) + Cliente</p><p>Output: Aceite formal registrado</p><p>Prazo referência: Até 2 dias após última entrega aprovada</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Arquivamento Completo', 'Ação: Responsável de BU organiza pasta final do projeto no Drive: /entregas (arquivos finais aprovados), /projeto (arquivos de trabalho: Premiere, Unreal, Figma etc.), /aprovações (histórico de aprovações do cliente), /financeiro (NFs emitidas); confirmar com Carol.

Responsável: Responsável de BU + Carol (Ops)

Output: Projeto arquivado com estrutura completa

Prazo referência: Até 3 dias após aceite', '<p>Ação: Responsável de BU organiza pasta final do projeto no Drive: /entregas (arquivos finais aprovados), /projeto (arquivos de trabalho: Premiere, Unreal, Figma etc.), /aprovações (histórico de aprovações do cliente), /financeiro (NFs emitidas); confirmar com Carol.</p><p>Responsável: Responsável de BU + Carol (Ops)</p><p>Output: Projeto arquivado com estrutura completa</p><p>Prazo referência: Até 3 dias após aceite</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Pesquisa de Satisfação (NPS)', 'Ação: Carol envia Google Forms de NPS ao cliente (10 perguntas: qualidade, prazo, comunicação, relação custo-benefício, recomendaria a TBO, comentário livre); aguardar resposta por 5 dias; registrar resultado na planilha de NPS.

Responsável: Carol (Ops)

Output: NPS registrado

Prazo referência: Enviado no dia do aceite, aguardar 5 dias', '<p>Ação: Carol envia Google Forms de NPS ao cliente (10 perguntas: qualidade, prazo, comunicação, relação custo-benefício, recomendaria a TBO, comentário livre); aguardar resposta por 5 dias; registrar resultado na planilha de NPS.</p><p>Responsável: Carol (Ops)</p><p>Output: NPS registrado</p><p>Prazo referência: Enviado no dia do aceite, aguardar 5 dias</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Retrospectiva Interna', 'Ação: Marco conduz reunião de retrospectiva de 45min com a equipe do projeto: o que funcionou bem, o que pode melhorar, gargalos identificados, aprendizados técnicos. Carol registra no documento de aprendizados TBO (Drive).

Responsável: Marco Andolfato + Equipe do Projeto

Output: Documento de aprendizados registrado

Prazo referência: Até 5 dias após aceite', '<p>Ação: Marco conduz reunião de retrospectiva de 45min com a equipe do projeto: o que funcionou bem, o que pode melhorar, gargalos identificados, aprendizados técnicos. Carol registra no documento de aprendizados TBO (Drive).</p><p>Responsável: Marco Andolfato + Equipe do Projeto</p><p>Output: Documento de aprendizados registrado</p><p>Prazo referência: Até 5 dias após aceite</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Ação de Relacionamento Pós-entrega', 'Ação: Marco ou Carol realiza contato de follow-up 30 dias após entrega: verificar se a entrega está performando bem (vídeo gerando leads, app funcionando no stand), oferecer próximos passos (novas pílulas, atualização de disponibilidade, segunda fase). Registrar no CRM.

Responsável: Marco Andolfato + Carol (Ops)

Output: Follow-up 30 dias realizado e registrado

Prazo referência: 30 dias após aceite', '<p>Ação: Marco ou Carol realiza contato de follow-up 30 dias após entrega: verificar se a entrega está performando bem (vídeo gerando leads, app funcionando no stand), oferecer próximos passos (novas pílulas, atualização de disponibilidade, segunda fase). Registrar no CRM.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Follow-up 30 dias realizado e registrado</p><p>Prazo referência: 30 dias após aceite</p>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Aceite formal recebido por escrito; [ ] Pasta do Drive com todos os arquivos organizados; [ ] NPS enviado e resultado registrado; [ ] Retrospectiva realizada com documento de aprendizados; [ ] Projeto marcado como concluído no Asana; [ ] Follow-up 30 dias agendado no momento do aceite.', '<p>[ ] Aceite formal recebido por escrito; [ ] Pasta do Drive com todos os arquivos organizados; [ ] NPS enviado e resultado registrado; [ ] Retrospectiva realizada com documento de aprendizados; [ ] Projeto marcado como concluído no Asana; [ ] Follow-up 30 dias agendado no momento do aceite.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Projeto encerrado sem aceite formal → cliente reabre demandas como se fossem do mesmo projeto. Arquivos desorganizados → impossibilidade de reutilizar assets em futuros projetos. Sem retrospectiva → mesmos erros se repetem nos próximos projetos. Follow-up não realizado → oportunidade de renovação perdida.', '<p>Projeto encerrado sem aceite formal → cliente reabre demandas como se fossem do mesmo projeto. Arquivos desorganizados → impossibilidade de reutilizar assets em futuros projetos. Sem retrospectiva → mesmos erros se repetem nos próximos projetos. Follow-up não realizado → oportunidade de renovação perdida.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Drive, Asana, Google Forms, Gmail, planilha de NPS, planilha de histórico de projetos.', '<p>Google Drive, Asana, Google Forms, Gmail, planilha de NPS, planilha de histórico de projetos.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Aceite formal: 2 dias após última entrega. Arquivamento: 3 dias após aceite. NPS enviado: no dia do aceite. Retrospectiva: até 5 dias após aceite. Follow-up 30 dias: agendado no momento do aceite.', '<p>Aceite formal: 2 dias após última entrega. Arquivamento: 3 dias após aceite. NPS enviado: no dia do aceite. Retrospectiva: até 5 dias após aceite. Follow-up 30 dias: agendado no momento do aceite.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Aprovação Final do Cliente → Aceite Formal (e-mail) → Arquivamento Completo → NPS Enviado → Retrospectiva Interna → Documento de Aprendizados → Projeto Concluído no Asana → Follow-up 30 dias → Fim', '<p>Início → Aprovação Final do Cliente → Aceite Formal (e-mail) → Arquivamento Completo → NPS Enviado → Retrospectiva Interna → Documento de Aprendizados → Projeto Concluído no Asana → Follow-up 30 dias → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'NPS: Net Promoter Score — métrica de satisfação e lealdade do cliente (0–10). Aceite formal: confirmação escrita pelo cliente de que a entrega está completa e aprovada. Retrospectiva: reunião estruturada de revisão do projeto para gerar aprendizados. Follow-up pós-entrega: contato proativo após entrega para verificar resultado e identificar oportunidades.', '<p>NPS: Net Promoter Score — métrica de satisfação e lealdade do cliente (0–10). Aceite formal: confirmação escrita pelo cliente de que a entrega está completa e aprovada. Retrospectiva: reunião estruturada de revisão do projeto para gerar aprendizados. Follow-up pós-entrega: contato proativo após entrega para verificar resultado e identificar oportunidades.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-ATD-001: Onboarding de Cliente ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Onboarding de Cliente',
    'tbo-atd-001-onboarding-de-cliente',
    'atendimento',
    'checklist',
    'Carol (Coordenadora de Operações)',
    'Standard Operating Procedure

Onboarding de Cliente

Código

TBO-ATD-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Atendimento (Customer Success)

Responsável

Carol (Coordenadora de Operações)

Aprovador

Marco Andolfato



1. Objetivo

Padronizar o processo de integração de novos clientes após assinatura de contrato, garantindo que o projeto seja configurado no TBO OS, que o cliente compreenda os rituais de acompanhamento e que a equipe interna esteja alinhada sobre escopo, prazos e responsáveis.

2. Escopo

2.1 O que está coberto

Todo o fluxo desde a confirmação de pagamento até o início efetivo da produção: setup no TBO OS, kickoff interno, kickoff com cliente, cobrança de materiais e ativação do projeto.

2.2 Exclusões

Processo comercial e negociação (SOP-COM), produção técnica das BUs (SOPs de cada BU), gestão financeira de parcelas (SOP-FIN).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar setup, kickoffs e cobrança de materiais

Executor

---

Marco Andolfato

Validar cronograma e escopo operacional

Aprovador

---

POs de BU

Participar do kickoff interno e confirmar disponibilidade

Executor

---

Cliente

Fornecer materiais e participar do kickoff

Informado

---



4. Pré-requisitos

4.1 Inputs necessários

Contrato assinado via ClickSign; confirmação de pagamento da primeira parcela; briefing comercial preenchido por Ruy; dados do empreendimento (nome, tipologias, localização, público-alvo).

4.2 Ferramentas e Acessos

TBO OS, Google Meet, Google Drive, WhatsApp Business, E-mail corporativo.

5. Procedimento Passo a Passo

5.1. Setup Interno (D+0 a D+1)

Ação: Carol cria o projeto no TBO OS com dados do contrato (cliente, empreendimento, escopo, valor, prazos). Atribui POs de cada BU envolvida. Cria canal de Chat do projeto. Configura cronograma macro com milestones.

Responsável: Carol (Ops)

Output: Projeto ativo no TBO OS com POs atribuídos e cronograma configurado

Prazo referência: Até 1 dia útil após confirmação de pagamento

5.2. Kickoff Interno (D+1 a D+2)

Ação: Carol convoca reunião interna de alinhamento com POs envolvidos. Pauta: escopo detalhado, cronograma, riscos, dependências do cliente. Resultado: ata registrada no TBO OS com responsáveis e datas.

Responsável: Carol (Ops) + POs de BU

Output: Ata de kickoff interno registrada no TBO OS

Prazo referência: Até 2 dias úteis

5.3. Kickoff com Cliente (D+2 a D+5)

Ação: Carol agenda reunião de kickoff via Google Meet. Pauta padrão: apresentação da equipe, cronograma, rituais de status, canais de comunicação, política de revisões, materiais pendentes. Envio de e-mail de boas-vindas com resumo.

Responsável: Carol (Ops) + Marco (quando estratégico)

Output: E-mail de boas-vindas enviado com resumo do kickoff

Prazo referência: Até 5 dias úteis

5.4. Cobrança de Materiais (D+5 a D+10)

Ação: Carol envia checklist de materiais necessários (projetos arquitetônicos, referências visuais, briefing de marketing, assets de marca). Follow-up a cada 48h até recebimento completo. Registro no TBO OS: status de cada material.

Responsável: Carol (Ops)

Output: Checklist de materiais 100% recebido e registrado

Prazo referência: Até 10 dias úteis

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Projeto criado no TBO OS com todos os campos preenchidos

[ ] POs atribuídos e notificados

[ ] Kickoff interno realizado com ata registrada

[ ] Kickoff com cliente realizado

[ ] E-mail de boas-vindas enviado

[ ] Checklist de materiais enviado e rastreado

[ ] Primeira tarefa de produção em andamento

6.2 Erros Comuns a Evitar

Iniciar produção sem materiais essenciais do cliente → retrabalho e atraso em cadeia

Não registrar o kickoff → equipe sem alinhamento, escopo vira telefone sem fio

Pular o kickoff com cliente → expectativas desalinhadas desde o início

7. Ferramentas e Templates

TBO OS (projeto, chat, cronograma), Google Meet (kickoffs), Google Drive (materiais), WhatsApp Business (follow-up), E-mail (boas-vindas e status).

8. SLAs e Prazos

Setup no TBO OS: até D+1 após confirmação de pagamento

Kickoff interno: até D+2

Kickoff com cliente: até D+5

Materiais completos recebidos: até D+10 (com follow-up ativo)

9. Fluxograma

Contrato Assinado + Pagamento Confirmado → Setup TBO OS (D+0) → Kickoff Interno (D+1–2) → Kickoff com Cliente (D+2–5) → Cobrança de Materiais (D+5–10) → Materiais Recebidos → Produção Inicia → Fim

10. Glossário

Kickoff: reunião de alinhamento inicial que define escopo, prazos e responsáveis.

Milestone: marco de entrega dentro do cronograma do projeto.

PO (Product Owner): líder responsável pela entrega de uma BU específica.

Handoff: passagem formal de entregáveis entre BUs ou entre TBO e cliente.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Onboarding de Cliente</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-ATD-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Atendimento (Customer Success)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Padronizar o processo de integração de novos clientes após assinatura de contrato, garantindo que o projeto seja configurado no TBO OS, que o cliente compreenda os rituais de acompanhamento e que a equipe interna esteja alinhada sobre escopo, prazos e responsáveis.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Todo o fluxo desde a confirmação de pagamento até o início efetivo da produção: setup no TBO OS, kickoff interno, kickoff com cliente, cobrança de materiais e ativação do projeto.</p><p><strong>2.2 Exclusões</strong></p><p>Processo comercial e negociação (SOP-COM), produção técnica das BUs (SOPs de cada BU), gestão financeira de parcelas (SOP-FIN).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Coordenar setup, kickoffs e cobrança de materiais</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco Andolfato</strong></p></td><td><p>Validar cronograma e escopo operacional</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>POs de BU</strong></p></td><td><p>Participar do kickoff interno e confirmar disponibilidade</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Cliente</strong></p></td><td><p>Fornecer materiais e participar do kickoff</p></td><td><p>Informado</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contrato assinado via ClickSign; confirmação de pagamento da primeira parcela; briefing comercial preenchido por Ruy; dados do empreendimento (nome, tipologias, localização, público-alvo).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS, Google Meet, Google Drive, WhatsApp Business, E-mail corporativo.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Setup Interno (D+0 a D+1)</strong></p><p>Ação: Carol cria o projeto no TBO OS com dados do contrato (cliente, empreendimento, escopo, valor, prazos). Atribui POs de cada BU envolvida. Cria canal de Chat do projeto. Configura cronograma macro com milestones.</p><p>Responsável: Carol (Ops)</p><p>Output: Projeto ativo no TBO OS com POs atribuídos e cronograma configurado</p><p>Prazo referência: Até 1 dia útil após confirmação de pagamento</p><p><strong>5.2. Kickoff Interno (D+1 a D+2)</strong></p><p>Ação: Carol convoca reunião interna de alinhamento com POs envolvidos. Pauta: escopo detalhado, cronograma, riscos, dependências do cliente. Resultado: ata registrada no TBO OS com responsáveis e datas.</p><p>Responsável: Carol (Ops) + POs de BU</p><p>Output: Ata de kickoff interno registrada no TBO OS</p><p>Prazo referência: Até 2 dias úteis</p><p><strong>5.3. Kickoff com Cliente (D+2 a D+5)</strong></p><p>Ação: Carol agenda reunião de kickoff via Google Meet. Pauta padrão: apresentação da equipe, cronograma, rituais de status, canais de comunicação, política de revisões, materiais pendentes. Envio de e-mail de boas-vindas com resumo.</p><p>Responsável: Carol (Ops) + Marco (quando estratégico)</p><p>Output: E-mail de boas-vindas enviado com resumo do kickoff</p><p>Prazo referência: Até 5 dias úteis</p><p><strong>5.4. Cobrança de Materiais (D+5 a D+10)</strong></p><p>Ação: Carol envia checklist de materiais necessários (projetos arquitetônicos, referências visuais, briefing de marketing, assets de marca). Follow-up a cada 48h até recebimento completo. Registro no TBO OS: status de cada material.</p><p>Responsável: Carol (Ops)</p><p>Output: Checklist de materiais 100% recebido e registrado</p><p>Prazo referência: Até 10 dias úteis</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Projeto criado no TBO OS com todos os campos preenchidos</li><li>[ ] POs atribuídos e notificados</li><li>[ ] Kickoff interno realizado com ata registrada</li><li>[ ] Kickoff com cliente realizado</li><li>[ ] E-mail de boas-vindas enviado</li><li>[ ] Checklist de materiais enviado e rastreado</li><li>[ ] Primeira tarefa de produção em andamento</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Iniciar produção sem materiais essenciais do cliente → retrabalho e atraso em cadeia</li><li>Não registrar o kickoff → equipe sem alinhamento, escopo vira telefone sem fio</li><li>Pular o kickoff com cliente → expectativas desalinhadas desde o início</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (projeto, chat, cronograma), Google Meet (kickoffs), Google Drive (materiais), WhatsApp Business (follow-up), E-mail (boas-vindas e status).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Setup no TBO OS: até D+1 após confirmação de pagamento</li><li>Kickoff interno: até D+2</li><li>Kickoff com cliente: até D+5</li><li>Materiais completos recebidos: até D+10 (com follow-up ativo)</li></ul><p><strong>9. Fluxograma</strong></p><p>Contrato Assinado + Pagamento Confirmado → Setup TBO OS (D+0) → Kickoff Interno (D+1–2) → Kickoff com Cliente (D+2–5) → Cobrança de Materiais (D+5–10) → Materiais Recebidos → Produção Inicia → Fim</p><p><strong>10. Glossário</strong></p><p>Kickoff: reunião de alinhamento inicial que define escopo, prazos e responsáveis.</p><p>Milestone: marco de entrega dentro do cronograma do projeto.</p><p>PO (Product Owner): líder responsável pela entrega de uma BU específica.</p><p>Handoff: passagem formal de entregáveis entre BUs ou entre TBO e cliente.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['atendimento','cliente','entrega','qualidade']::TEXT[],
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

  -- Steps for TBO-ATD-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Padronizar o processo de integração de novos clientes após assinatura de contrato, garantindo que o projeto seja configurado no TBO OS, que o cliente compreenda os rituais de acompanhamento e que a equipe interna esteja alinhada sobre escopo, prazos e responsáveis.', '<p>Padronizar o processo de integração de novos clientes após assinatura de contrato, garantindo que o projeto seja configurado no TBO OS, que o cliente compreenda os rituais de acompanhamento e que a equipe interna esteja alinhada sobre escopo, prazos e responsáveis.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Todo o fluxo desde a confirmação de pagamento até o início efetivo da produção: setup no TBO OS, kickoff interno, kickoff com cliente, cobrança de materiais e ativação do projeto.', '<p>Todo o fluxo desde a confirmação de pagamento até o início efetivo da produção: setup no TBO OS, kickoff interno, kickoff com cliente, cobrança de materiais e ativação do projeto.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Processo comercial e negociação (SOP-COM), produção técnica das BUs (SOPs de cada BU), gestão financeira de parcelas (SOP-FIN).', '<p>Processo comercial e negociação (SOP-COM), produção técnica das BUs (SOPs de cada BU), gestão financeira de parcelas (SOP-FIN).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar setup, kickoffs e cobrança de materiais

Executor

---

Marco Andolfato

Validar cronograma e escopo operacional

Aprovador

---

POs de BU

Participar do kickoff interno e confirmar disponibilidade

Executor

---

Cliente

Fornecer materiais e participar do kickoff

Informado

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Coordenar setup, kickoffs e cobrança de materiais</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco Andolfato</strong></p></td><td><p>Validar cronograma e escopo operacional</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>POs de BU</strong></p></td><td><p>Participar do kickoff interno e confirmar disponibilidade</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Cliente</strong></p></td><td><p>Fornecer materiais e participar do kickoff</p></td><td><p>Informado</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado via ClickSign; confirmação de pagamento da primeira parcela; briefing comercial preenchido por Ruy; dados do empreendimento (nome, tipologias, localização, público-alvo).', '<p>Contrato assinado via ClickSign; confirmação de pagamento da primeira parcela; briefing comercial preenchido por Ruy; dados do empreendimento (nome, tipologias, localização, público-alvo).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS, Google Meet, Google Drive, WhatsApp Business, E-mail corporativo.', '<p>TBO OS, Google Meet, Google Drive, WhatsApp Business, E-mail corporativo.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Setup Interno (D+0 a D+1)', 'Ação: Carol cria o projeto no TBO OS com dados do contrato (cliente, empreendimento, escopo, valor, prazos). Atribui POs de cada BU envolvida. Cria canal de Chat do projeto. Configura cronograma macro com milestones.

Responsável: Carol (Ops)

Output: Projeto ativo no TBO OS com POs atribuídos e cronograma configurado

Prazo referência: Até 1 dia útil após confirmação de pagamento', '<p>Ação: Carol cria o projeto no TBO OS com dados do contrato (cliente, empreendimento, escopo, valor, prazos). Atribui POs de cada BU envolvida. Cria canal de Chat do projeto. Configura cronograma macro com milestones.</p><p>Responsável: Carol (Ops)</p><p>Output: Projeto ativo no TBO OS com POs atribuídos e cronograma configurado</p><p>Prazo referência: Até 1 dia útil após confirmação de pagamento</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Kickoff Interno (D+1 a D+2)', 'Ação: Carol convoca reunião interna de alinhamento com POs envolvidos. Pauta: escopo detalhado, cronograma, riscos, dependências do cliente. Resultado: ata registrada no TBO OS com responsáveis e datas.

Responsável: Carol (Ops) + POs de BU

Output: Ata de kickoff interno registrada no TBO OS

Prazo referência: Até 2 dias úteis', '<p>Ação: Carol convoca reunião interna de alinhamento com POs envolvidos. Pauta: escopo detalhado, cronograma, riscos, dependências do cliente. Resultado: ata registrada no TBO OS com responsáveis e datas.</p><p>Responsável: Carol (Ops) + POs de BU</p><p>Output: Ata de kickoff interno registrada no TBO OS</p><p>Prazo referência: Até 2 dias úteis</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Kickoff com Cliente (D+2 a D+5)', 'Ação: Carol agenda reunião de kickoff via Google Meet. Pauta padrão: apresentação da equipe, cronograma, rituais de status, canais de comunicação, política de revisões, materiais pendentes. Envio de e-mail de boas-vindas com resumo.

Responsável: Carol (Ops) + Marco (quando estratégico)

Output: E-mail de boas-vindas enviado com resumo do kickoff

Prazo referência: Até 5 dias úteis', '<p>Ação: Carol agenda reunião de kickoff via Google Meet. Pauta padrão: apresentação da equipe, cronograma, rituais de status, canais de comunicação, política de revisões, materiais pendentes. Envio de e-mail de boas-vindas com resumo.</p><p>Responsável: Carol (Ops) + Marco (quando estratégico)</p><p>Output: E-mail de boas-vindas enviado com resumo do kickoff</p><p>Prazo referência: Até 5 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Cobrança de Materiais (D+5 a D+10)', 'Ação: Carol envia checklist de materiais necessários (projetos arquitetônicos, referências visuais, briefing de marketing, assets de marca). Follow-up a cada 48h até recebimento completo. Registro no TBO OS: status de cada material.

Responsável: Carol (Ops)

Output: Checklist de materiais 100% recebido e registrado

Prazo referência: Até 10 dias úteis', '<p>Ação: Carol envia checklist de materiais necessários (projetos arquitetônicos, referências visuais, briefing de marketing, assets de marca). Follow-up a cada 48h até recebimento completo. Registro no TBO OS: status de cada material.</p><p>Responsável: Carol (Ops)</p><p>Output: Checklist de materiais 100% recebido e registrado</p><p>Prazo referência: Até 10 dias úteis</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Projeto criado no TBO OS com todos os campos preenchidos

[ ] POs atribuídos e notificados

[ ] Kickoff interno realizado com ata registrada

[ ] Kickoff com cliente realizado

[ ] E-mail de boas-vindas enviado

[ ] Checklist de materiais enviado e rastreado

[ ] Primeira tarefa de produção em andamento', '<ul><li>[ ] Projeto criado no TBO OS com todos os campos preenchidos</li><li>[ ] POs atribuídos e notificados</li><li>[ ] Kickoff interno realizado com ata registrada</li><li>[ ] Kickoff com cliente realizado</li><li>[ ] E-mail de boas-vindas enviado</li><li>[ ] Checklist de materiais enviado e rastreado</li><li>[ ] Primeira tarefa de produção em andamento</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Iniciar produção sem materiais essenciais do cliente → retrabalho e atraso em cadeia

Não registrar o kickoff → equipe sem alinhamento, escopo vira telefone sem fio

Pular o kickoff com cliente → expectativas desalinhadas desde o início', '<ul><li>Iniciar produção sem materiais essenciais do cliente → retrabalho e atraso em cadeia</li><li>Não registrar o kickoff → equipe sem alinhamento, escopo vira telefone sem fio</li><li>Pular o kickoff com cliente → expectativas desalinhadas desde o início</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (projeto, chat, cronograma), Google Meet (kickoffs), Google Drive (materiais), WhatsApp Business (follow-up), E-mail (boas-vindas e status).', '<p>TBO OS (projeto, chat, cronograma), Google Meet (kickoffs), Google Drive (materiais), WhatsApp Business (follow-up), E-mail (boas-vindas e status).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Setup no TBO OS: até D+1 após confirmação de pagamento

Kickoff interno: até D+2

Kickoff com cliente: até D+5

Materiais completos recebidos: até D+10 (com follow-up ativo)', '<ul><li>Setup no TBO OS: até D+1 após confirmação de pagamento</li><li>Kickoff interno: até D+2</li><li>Kickoff com cliente: até D+5</li><li>Materiais completos recebidos: até D+10 (com follow-up ativo)</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Contrato Assinado + Pagamento Confirmado → Setup TBO OS (D+0) → Kickoff Interno (D+1–2) → Kickoff com Cliente (D+2–5) → Cobrança de Materiais (D+5–10) → Materiais Recebidos → Produção Inicia → Fim', '<p>Contrato Assinado + Pagamento Confirmado → Setup TBO OS (D+0) → Kickoff Interno (D+1–2) → Kickoff com Cliente (D+2–5) → Cobrança de Materiais (D+5–10) → Materiais Recebidos → Produção Inicia → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Kickoff: reunião de alinhamento inicial que define escopo, prazos e responsáveis.

Milestone: marco de entrega dentro do cronograma do projeto.

PO (Product Owner): líder responsável pela entrega de uma BU específica.

Handoff: passagem formal de entregáveis entre BUs ou entre TBO e cliente.', '<p>Kickoff: reunião de alinhamento inicial que define escopo, prazos e responsáveis.</p><p>Milestone: marco de entrega dentro do cronograma do projeto.</p><p>PO (Product Owner): líder responsável pela entrega de uma BU específica.</p><p>Handoff: passagem formal de entregáveis entre BUs ou entre TBO e cliente.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-ATD-002: Rituais de Acompanhamento de Projeto ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Rituais de Acompanhamento de Projeto',
    'tbo-atd-002-rituais-de-acompanhamento-de-projeto',
    'atendimento',
    'checklist',
    'Rituais de Acompanhamento de Projeto',
    'Standard Operating Procedure

Rituais de Acompanhamento de Projeto

Código

TBO-ATD-002

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Atendimento (Customer Success)

Responsável

Carol (Coordenadora de Operações)

Aprovador

Marco Andolfato



1. Objetivo

Definir a cadência e o formato de comunicação com clientes ativos, evitando tanto o silêncio excessivo quanto o micro-gerenciamento por parte do cliente, mantendo previsibilidade e confiança.

2. Escopo

2.1 O que está coberto

Status semanal por e-mail, calls quinzenais de progresso, relatórios mensais de gestão contínua e regras de escalonamento para pendências.

2.2 Exclusões

Comunicação comercial pré-contrato (SOP-COM), reports de performance de marketing (SOP-MKT-012), feedbacks criativos específicos (SOP de cada BU).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Preparar e enviar status, agendar calls, consolidar andamento

Executor

---

POs de BU

Atualizar status de tarefas no TBO OS

Consultor

---

Marco/Ruy

Intervir em escalonamentos e validar comunicações estratégicas

Aprovador

---

Cliente

Receber status e responder pendências

Informado

---



4. Pré-requisitos

4.1 Inputs necessários

Projeto ativo no TBO OS com tarefas e status atualizados pelos POs; template de e-mail de status configurado; agenda de calls recorrentes no Google Calendar.

4.2 Ferramentas e Acessos

TBO OS, Google Meet, Google Calendar, E-mail corporativo.

5. Procedimento Passo a Passo

5.1. Preparação do Status Semanal (toda segunda-feira)

Ação: Carol coleta andamento de cada PO via TBO OS. Consolida em template de e-mail padrão com seções: Concluído, Em andamento, Pendente do cliente, Próximas entregas.

Responsável: Carol (Ops)

Output: E-mail de status preparado

Prazo referência: Toda segunda-feira até 12h

5.2. Envio e Registro

Ação: Envio do e-mail com CC para Marco (ou Ruy conforme o projeto). Registro da comunicação no TBO OS (campo de notas do projeto).

Responsável: Carol (Ops)

Output: Status enviado e registrado

Prazo referência: Segunda-feira até 14h

5.3. Call Quinzenal (projetos de escopo grande)

Ação: Reunião de 30 min via Google Meet para apresentação visual do progresso. Carol compartilha tela com TBO OS e materiais em produção. Resultado: ata curta registrada.

Responsável: Carol (Ops) + PO da BU principal

Output: Ata de call registrada no TBO OS

Prazo referência: Quinzenal, conforme agenda

5.4. Escalonamento de Pendências

Ação: Se o cliente não responde a materiais pendentes após 2 follow-ups (4 dias úteis), Carol escalona para Marco/Ruy que fazem contato direto. Se há risco de atraso, registro inclui nova data estimada.

Responsável: Carol (Ops) → Marco/Ruy

Output: Pendência resolvida ou prazo renegociado

Prazo referência: Até 48h após escalonamento

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] E-mail de status enviado toda segunda-feira

[ ] Call quinzenal realizada (projetos de escopo grande)

[ ] Pendências do cliente rastreadas com datas de follow-up

[ ] Escalonamentos registrados no TBO OS

[ ] Nenhum projeto ficou mais de 7 dias úteis sem comunicação

6.2 Erros Comuns a Evitar

Enviar status sem conferir com POs → informação incorreta destrói credibilidade

Não escalonar pendência a tempo → atraso silencioso que estoura no deadline

Silêncio por mais de 7 dias úteis → cliente perde confiança e começa a micro-gerenciar

7. Ferramentas e Templates

TBO OS (status, notas), Google Meet (calls), Google Calendar (recorrências), E-mail (status semanal).

8. SLAs e Prazos

Status semanal: toda segunda-feira até 14h

Resposta a pendência do cliente: até 4h úteis (acknowledgement)

Escalonamento: após 2 follow-ups sem resposta (4 dias úteis)

Regra de ouro: nenhum projeto fica mais de 7 dias úteis sem comunicação formal

9. Fluxograma

Início da Semana → Carol coleta status dos POs → Consolida e-mail → Envia ao cliente → Pendência? → Sim: Follow-up 48h → Sem resposta? → Escalonamento → Fim / Não: Próxima semana → Fim

10. Glossário

Status semanal: e-mail padronizado com andamento do projeto enviado toda segunda.

Escalonamento: transferência de uma pendência para nível hierárquico superior.

Follow-up: contato de acompanhamento para cobrar resposta ou ação pendente.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Rituais de Acompanhamento de Projeto</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-ATD-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Atendimento (Customer Success)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Definir a cadência e o formato de comunicação com clientes ativos, evitando tanto o silêncio excessivo quanto o micro-gerenciamento por parte do cliente, mantendo previsibilidade e confiança.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Status semanal por e-mail, calls quinzenais de progresso, relatórios mensais de gestão contínua e regras de escalonamento para pendências.</p><p><strong>2.2 Exclusões</strong></p><p>Comunicação comercial pré-contrato (SOP-COM), reports de performance de marketing (SOP-MKT-012), feedbacks criativos específicos (SOP de cada BU).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Preparar e enviar status, agendar calls, consolidar andamento</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>POs de BU</strong></p></td><td><p>Atualizar status de tarefas no TBO OS</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco/Ruy</strong></p></td><td><p>Intervir em escalonamentos e validar comunicações estratégicas</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Cliente</strong></p></td><td><p>Receber status e responder pendências</p></td><td><p>Informado</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Projeto ativo no TBO OS com tarefas e status atualizados pelos POs; template de e-mail de status configurado; agenda de calls recorrentes no Google Calendar.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS, Google Meet, Google Calendar, E-mail corporativo.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Preparação do Status Semanal (toda segunda-feira)</strong></p><p>Ação: Carol coleta andamento de cada PO via TBO OS. Consolida em template de e-mail padrão com seções: Concluído, Em andamento, Pendente do cliente, Próximas entregas.</p><p>Responsável: Carol (Ops)</p><p>Output: E-mail de status preparado</p><p>Prazo referência: Toda segunda-feira até 12h</p><p><strong>5.2. Envio e Registro</strong></p><p>Ação: Envio do e-mail com CC para Marco (ou Ruy conforme o projeto). Registro da comunicação no TBO OS (campo de notas do projeto).</p><p>Responsável: Carol (Ops)</p><p>Output: Status enviado e registrado</p><p>Prazo referência: Segunda-feira até 14h</p><p><strong>5.3. Call Quinzenal (projetos de escopo grande)</strong></p><p>Ação: Reunião de 30 min via Google Meet para apresentação visual do progresso. Carol compartilha tela com TBO OS e materiais em produção. Resultado: ata curta registrada.</p><p>Responsável: Carol (Ops) + PO da BU principal</p><p>Output: Ata de call registrada no TBO OS</p><p>Prazo referência: Quinzenal, conforme agenda</p><p><strong>5.4. Escalonamento de Pendências</strong></p><p>Ação: Se o cliente não responde a materiais pendentes após 2 follow-ups (4 dias úteis), Carol escalona para Marco/Ruy que fazem contato direto. Se há risco de atraso, registro inclui nova data estimada.</p><p>Responsável: Carol (Ops) → Marco/Ruy</p><p>Output: Pendência resolvida ou prazo renegociado</p><p>Prazo referência: Até 48h após escalonamento</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] E-mail de status enviado toda segunda-feira</li><li>[ ] Call quinzenal realizada (projetos de escopo grande)</li><li>[ ] Pendências do cliente rastreadas com datas de follow-up</li><li>[ ] Escalonamentos registrados no TBO OS</li><li>[ ] Nenhum projeto ficou mais de 7 dias úteis sem comunicação</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Enviar status sem conferir com POs → informação incorreta destrói credibilidade</li><li>Não escalonar pendência a tempo → atraso silencioso que estoura no deadline</li><li>Silêncio por mais de 7 dias úteis → cliente perde confiança e começa a micro-gerenciar</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (status, notas), Google Meet (calls), Google Calendar (recorrências), E-mail (status semanal).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Status semanal: toda segunda-feira até 14h</li><li>Resposta a pendência do cliente: até 4h úteis (acknowledgement)</li><li>Escalonamento: após 2 follow-ups sem resposta (4 dias úteis)</li><li>Regra de ouro: nenhum projeto fica mais de 7 dias úteis sem comunicação formal</li></ul><p><strong>9. Fluxograma</strong></p><p>Início da Semana → Carol coleta status dos POs → Consolida e-mail → Envia ao cliente → Pendência? → Sim: Follow-up 48h → Sem resposta? → Escalonamento → Fim / Não: Próxima semana → Fim</p><p><strong>10. Glossário</strong></p><p>Status semanal: e-mail padronizado com andamento do projeto enviado toda segunda.</p><p>Escalonamento: transferência de uma pendência para nível hierárquico superior.</p><p>Follow-up: contato de acompanhamento para cobrar resposta ou ação pendente.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['atendimento','cliente','entrega','qualidade']::TEXT[],
    1,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-ATD-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Definir a cadência e o formato de comunicação com clientes ativos, evitando tanto o silêncio excessivo quanto o micro-gerenciamento por parte do cliente, mantendo previsibilidade e confiança.', '<p>Definir a cadência e o formato de comunicação com clientes ativos, evitando tanto o silêncio excessivo quanto o micro-gerenciamento por parte do cliente, mantendo previsibilidade e confiança.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Status semanal por e-mail, calls quinzenais de progresso, relatórios mensais de gestão contínua e regras de escalonamento para pendências.', '<p>Status semanal por e-mail, calls quinzenais de progresso, relatórios mensais de gestão contínua e regras de escalonamento para pendências.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Comunicação comercial pré-contrato (SOP-COM), reports de performance de marketing (SOP-MKT-012), feedbacks criativos específicos (SOP de cada BU).', '<p>Comunicação comercial pré-contrato (SOP-COM), reports de performance de marketing (SOP-MKT-012), feedbacks criativos específicos (SOP de cada BU).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Preparar e enviar status, agendar calls, consolidar andamento

Executor

---

POs de BU

Atualizar status de tarefas no TBO OS

Consultor

---

Marco/Ruy

Intervir em escalonamentos e validar comunicações estratégicas

Aprovador

---

Cliente

Receber status e responder pendências

Informado

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Preparar e enviar status, agendar calls, consolidar andamento</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>POs de BU</strong></p></td><td><p>Atualizar status de tarefas no TBO OS</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco/Ruy</strong></p></td><td><p>Intervir em escalonamentos e validar comunicações estratégicas</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Cliente</strong></p></td><td><p>Receber status e responder pendências</p></td><td><p>Informado</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Projeto ativo no TBO OS com tarefas e status atualizados pelos POs; template de e-mail de status configurado; agenda de calls recorrentes no Google Calendar.', '<p>Projeto ativo no TBO OS com tarefas e status atualizados pelos POs; template de e-mail de status configurado; agenda de calls recorrentes no Google Calendar.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS, Google Meet, Google Calendar, E-mail corporativo.', '<p>TBO OS, Google Meet, Google Calendar, E-mail corporativo.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Preparação do Status Semanal (toda segunda-feira)', 'Ação: Carol coleta andamento de cada PO via TBO OS. Consolida em template de e-mail padrão com seções: Concluído, Em andamento, Pendente do cliente, Próximas entregas.

Responsável: Carol (Ops)

Output: E-mail de status preparado

Prazo referência: Toda segunda-feira até 12h', '<p>Ação: Carol coleta andamento de cada PO via TBO OS. Consolida em template de e-mail padrão com seções: Concluído, Em andamento, Pendente do cliente, Próximas entregas.</p><p>Responsável: Carol (Ops)</p><p>Output: E-mail de status preparado</p><p>Prazo referência: Toda segunda-feira até 12h</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Envio e Registro', 'Ação: Envio do e-mail com CC para Marco (ou Ruy conforme o projeto). Registro da comunicação no TBO OS (campo de notas do projeto).

Responsável: Carol (Ops)

Output: Status enviado e registrado

Prazo referência: Segunda-feira até 14h', '<p>Ação: Envio do e-mail com CC para Marco (ou Ruy conforme o projeto). Registro da comunicação no TBO OS (campo de notas do projeto).</p><p>Responsável: Carol (Ops)</p><p>Output: Status enviado e registrado</p><p>Prazo referência: Segunda-feira até 14h</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Call Quinzenal (projetos de escopo grande)', 'Ação: Reunião de 30 min via Google Meet para apresentação visual do progresso. Carol compartilha tela com TBO OS e materiais em produção. Resultado: ata curta registrada.

Responsável: Carol (Ops) + PO da BU principal

Output: Ata de call registrada no TBO OS

Prazo referência: Quinzenal, conforme agenda', '<p>Ação: Reunião de 30 min via Google Meet para apresentação visual do progresso. Carol compartilha tela com TBO OS e materiais em produção. Resultado: ata curta registrada.</p><p>Responsável: Carol (Ops) + PO da BU principal</p><p>Output: Ata de call registrada no TBO OS</p><p>Prazo referência: Quinzenal, conforme agenda</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Escalonamento de Pendências', 'Ação: Se o cliente não responde a materiais pendentes após 2 follow-ups (4 dias úteis), Carol escalona para Marco/Ruy que fazem contato direto. Se há risco de atraso, registro inclui nova data estimada.

Responsável: Carol (Ops) → Marco/Ruy

Output: Pendência resolvida ou prazo renegociado

Prazo referência: Até 48h após escalonamento', '<p>Ação: Se o cliente não responde a materiais pendentes após 2 follow-ups (4 dias úteis), Carol escalona para Marco/Ruy que fazem contato direto. Se há risco de atraso, registro inclui nova data estimada.</p><p>Responsável: Carol (Ops) → Marco/Ruy</p><p>Output: Pendência resolvida ou prazo renegociado</p><p>Prazo referência: Até 48h após escalonamento</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] E-mail de status enviado toda segunda-feira

[ ] Call quinzenal realizada (projetos de escopo grande)

[ ] Pendências do cliente rastreadas com datas de follow-up

[ ] Escalonamentos registrados no TBO OS

[ ] Nenhum projeto ficou mais de 7 dias úteis sem comunicação', '<ul><li>[ ] E-mail de status enviado toda segunda-feira</li><li>[ ] Call quinzenal realizada (projetos de escopo grande)</li><li>[ ] Pendências do cliente rastreadas com datas de follow-up</li><li>[ ] Escalonamentos registrados no TBO OS</li><li>[ ] Nenhum projeto ficou mais de 7 dias úteis sem comunicação</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Enviar status sem conferir com POs → informação incorreta destrói credibilidade

Não escalonar pendência a tempo → atraso silencioso que estoura no deadline

Silêncio por mais de 7 dias úteis → cliente perde confiança e começa a micro-gerenciar', '<ul><li>Enviar status sem conferir com POs → informação incorreta destrói credibilidade</li><li>Não escalonar pendência a tempo → atraso silencioso que estoura no deadline</li><li>Silêncio por mais de 7 dias úteis → cliente perde confiança e começa a micro-gerenciar</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (status, notas), Google Meet (calls), Google Calendar (recorrências), E-mail (status semanal).', '<p>TBO OS (status, notas), Google Meet (calls), Google Calendar (recorrências), E-mail (status semanal).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Status semanal: toda segunda-feira até 14h

Resposta a pendência do cliente: até 4h úteis (acknowledgement)

Escalonamento: após 2 follow-ups sem resposta (4 dias úteis)

Regra de ouro: nenhum projeto fica mais de 7 dias úteis sem comunicação formal', '<ul><li>Status semanal: toda segunda-feira até 14h</li><li>Resposta a pendência do cliente: até 4h úteis (acknowledgement)</li><li>Escalonamento: após 2 follow-ups sem resposta (4 dias úteis)</li><li>Regra de ouro: nenhum projeto fica mais de 7 dias úteis sem comunicação formal</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início da Semana → Carol coleta status dos POs → Consolida e-mail → Envia ao cliente → Pendência? → Sim: Follow-up 48h → Sem resposta? → Escalonamento → Fim / Não: Próxima semana → Fim', '<p>Início da Semana → Carol coleta status dos POs → Consolida e-mail → Envia ao cliente → Pendência? → Sim: Follow-up 48h → Sem resposta? → Escalonamento → Fim / Não: Próxima semana → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Status semanal: e-mail padronizado com andamento do projeto enviado toda segunda.

Escalonamento: transferência de uma pendência para nível hierárquico superior.

Follow-up: contato de acompanhamento para cobrar resposta ou ação pendente.', '<p>Status semanal: e-mail padronizado com andamento do projeto enviado toda segunda.</p><p>Escalonamento: transferência de uma pendência para nível hierárquico superior.</p><p>Follow-up: contato de acompanhamento para cobrar resposta ou ação pendente.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-ATD-003: Gestao de Reclamacoes e Feedbacks ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Gestao de Reclamacoes e Feedbacks',
    'tbo-atd-003-gestao-de-reclamacoes-e-feedbacks',
    'atendimento',
    'checklist',
    'Gestão de Reclamações e Feedbacks',
    'Standard Operating Procedure

Gestão de Reclamações e Feedbacks

Código

TBO-ATD-003

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Atendimento (Customer Success)

Responsável

Carol (Coordenadora de Operações)

Aprovador

Marco Andolfato



1. Objetivo

Estabelecer um fluxo estruturado para receber, classificar, tratar e resolver reclamações de clientes, garantindo que cada feedback gere aprendizado e melhoria contínua de processos.

2. Escopo

2.1 O que está coberto

Registro, classificação (3 níveis), tratamento, resolução e análise de padrões de reclamações de clientes ativos.

2.2 Exclusões

Feedbacks internos entre colaboradores (SOP-RH), avaliações de fornecedores (SOP-REL), disputas contratuais formais (jurídico).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Registrar, classificar e coordenar resolução

Executor

---

PO da BU

Investigar causa e propor solução técnica

Consultor

---

Marco

Tratar reclamações Nível 2 e participar de Nível 3

Aprovador

---

Ruy

Tratar reclamações Nível 3 (relacional)

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

Reclamação recebida por qualquer canal (e-mail, call, WhatsApp); projeto ativo no TBO OS; histórico de entregas do projeto.

4.2 Ferramentas e Acessos

TBO OS (registro e rastreamento), Google Meet, WhatsApp Business, E-mail.

5. Procedimento Passo a Passo

5.1. Registro da Reclamação

Ação: Carol registra toda reclamação no TBO OS incluindo: data, canal de recebimento, descrição detalhada, classificação de nível e responsável pela resolução.

Responsável: Carol (Ops)

Output: Reclamação registrada com classificação

Prazo referência: Até 2h após recebimento

5.2. Classificação por Nível

Ação: Nível 1 (Operacional): atraso pontual, arquivo em formato errado, falha de comunicação — resolução pela Carol. Nível 2 (Qualidade): insatisfação com resultado criativo, retrabalho além do contratado — PO + Marco. Nível 3 (Relacional): quebra de confiança, ameaça de cancelamento — Marco + Ruy.

Responsável: Carol (Ops)

Output: Nível classificado e responsável notificado

Prazo referência: Imediato após registro

5.3. Resposta Inicial ao Cliente

Ação: Enviar acknowledgement ao cliente confirmando recebimento e prazo estimado de resolução. Não é necessário ter a solução — é necessário confirmar que está sendo tratada.

Responsável: Carol (Ops)

Output: Resposta de acknowledgement enviada

Prazo referência: Até 4h úteis

5.4. Resolução

Ação: Nível 1: resolução em até 24h úteis. Nível 2: proposta de solução em até 48h (pode envolver call de alinhamento). Nível 3: reunião com sócios em até 48h. Todas as resoluções são registradas no TBO OS.

Responsável: Conforme nível

Output: Reclamação resolvida e registrada

Prazo referência: Conforme SLA por nível

5.5. Análise de Padrões (semanal)

Ação: Carol apresenta reclamações da semana na reunião interna. Se o mesmo tipo ocorre 3 vezes em 90 dias, é obrigatória revisão do SOP relacionado.

Responsável: Carol (Ops) + Marco

Output: Ações preventivas definidas quando aplicável

Prazo referência: Reunião semanal interna

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Reclamação registrada no TBO OS com todos os campos

[ ] Nível classificado corretamente

[ ] Resposta de acknowledgement enviada dentro de 4h úteis

[ ] Resolução concluída dentro do SLA do nível

[ ] Análise semanal realizada com identificação de padrões

6.2 Erros Comuns a Evitar

Não registrar reclamação → problema se repete e ninguém percebe o padrão

Demorar mais de 4h para responder → cliente sente que foi ignorado

Resolver sem registrar → aprendizado perdido, erro se repete

7. Ferramentas e Templates

TBO OS (registro e rastreamento), Google Meet (calls de resolução), E-mail (comunicação formal), WhatsApp Business (urgências).

8. SLAs e Prazos

Registro: até 2h após recebimento

Acknowledgement ao cliente: até 4h úteis

Resolução Nível 1: até 24h úteis

Resolução Nível 2: proposta em até 48h úteis

Resolução Nível 3: reunião com sócios em até 48h úteis

Regra: 3 reclamações iguais em 90 dias → revisão obrigatória do SOP relacionado

9. Fluxograma

Reclamação Recebida → Registro no TBO OS → Classificação (N1/N2/N3) → Acknowledgement ao Cliente (4h) → Resolução conforme nível → Registro da Resolução → Análise Semanal → Padrão identificado? → Sim: Revisão de SOP → Fim / Não: Fim

10. Glossário

Acknowledgement: resposta inicial confirmando recebimento, sem necessidade de solução.

Nível 1: reclamação operacional de resolução rápida e baixo impacto.

Nível 2: reclamação de qualidade que envolve insatisfação com entregas criativas.

Nível 3: reclamação relacional que ameaça a continuidade da parceria.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Reclamações e Feedbacks</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-ATD-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Atendimento (Customer Success)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Estabelecer um fluxo estruturado para receber, classificar, tratar e resolver reclamações de clientes, garantindo que cada feedback gere aprendizado e melhoria contínua de processos.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Registro, classificação (3 níveis), tratamento, resolução e análise de padrões de reclamações de clientes ativos.</p><p><strong>2.2 Exclusões</strong></p><p>Feedbacks internos entre colaboradores (SOP-RH), avaliações de fornecedores (SOP-REL), disputas contratuais formais (jurídico).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Registrar, classificar e coordenar resolução</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Investigar causa e propor solução técnica</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Tratar reclamações Nível 2 e participar de Nível 3</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Tratar reclamações Nível 3 (relacional)</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Reclamação recebida por qualquer canal (e-mail, call, WhatsApp); projeto ativo no TBO OS; histórico de entregas do projeto.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS (registro e rastreamento), Google Meet, WhatsApp Business, E-mail.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Registro da Reclamação</strong></p><p>Ação: Carol registra toda reclamação no TBO OS incluindo: data, canal de recebimento, descrição detalhada, classificação de nível e responsável pela resolução.</p><p>Responsável: Carol (Ops)</p><p>Output: Reclamação registrada com classificação</p><p>Prazo referência: Até 2h após recebimento</p><p><strong>5.2. Classificação por Nível</strong></p><p>Ação: Nível 1 (Operacional): atraso pontual, arquivo em formato errado, falha de comunicação — resolução pela Carol. Nível 2 (Qualidade): insatisfação com resultado criativo, retrabalho além do contratado — PO + Marco. Nível 3 (Relacional): quebra de confiança, ameaça de cancelamento — Marco + Ruy.</p><p>Responsável: Carol (Ops)</p><p>Output: Nível classificado e responsável notificado</p><p>Prazo referência: Imediato após registro</p><p><strong>5.3. Resposta Inicial ao Cliente</strong></p><p>Ação: Enviar acknowledgement ao cliente confirmando recebimento e prazo estimado de resolução. Não é necessário ter a solução — é necessário confirmar que está sendo tratada.</p><p>Responsável: Carol (Ops)</p><p>Output: Resposta de acknowledgement enviada</p><p>Prazo referência: Até 4h úteis</p><p><strong>5.4. Resolução</strong></p><p>Ação: Nível 1: resolução em até 24h úteis. Nível 2: proposta de solução em até 48h (pode envolver call de alinhamento). Nível 3: reunião com sócios em até 48h. Todas as resoluções são registradas no TBO OS.</p><p>Responsável: Conforme nível</p><p>Output: Reclamação resolvida e registrada</p><p>Prazo referência: Conforme SLA por nível</p><p><strong>5.5. Análise de Padrões (semanal)</strong></p><p>Ação: Carol apresenta reclamações da semana na reunião interna. Se o mesmo tipo ocorre 3 vezes em 90 dias, é obrigatória revisão do SOP relacionado.</p><p>Responsável: Carol (Ops) + Marco</p><p>Output: Ações preventivas definidas quando aplicável</p><p>Prazo referência: Reunião semanal interna</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Reclamação registrada no TBO OS com todos os campos</li><li>[ ] Nível classificado corretamente</li><li>[ ] Resposta de acknowledgement enviada dentro de 4h úteis</li><li>[ ] Resolução concluída dentro do SLA do nível</li><li>[ ] Análise semanal realizada com identificação de padrões</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Não registrar reclamação → problema se repete e ninguém percebe o padrão</li><li>Demorar mais de 4h para responder → cliente sente que foi ignorado</li><li>Resolver sem registrar → aprendizado perdido, erro se repete</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (registro e rastreamento), Google Meet (calls de resolução), E-mail (comunicação formal), WhatsApp Business (urgências).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Registro: até 2h após recebimento</li><li>Acknowledgement ao cliente: até 4h úteis</li><li>Resolução Nível 1: até 24h úteis</li><li>Resolução Nível 2: proposta em até 48h úteis</li><li>Resolução Nível 3: reunião com sócios em até 48h úteis</li><li>Regra: 3 reclamações iguais em 90 dias → revisão obrigatória do SOP relacionado</li></ul><p><strong>9. Fluxograma</strong></p><p>Reclamação Recebida → Registro no TBO OS → Classificação (N1/N2/N3) → Acknowledgement ao Cliente (4h) → Resolução conforme nível → Registro da Resolução → Análise Semanal → Padrão identificado? → Sim: Revisão de SOP → Fim / Não: Fim</p><p><strong>10. Glossário</strong></p><p>Acknowledgement: resposta inicial confirmando recebimento, sem necessidade de solução.</p><p>Nível 1: reclamação operacional de resolução rápida e baixo impacto.</p><p>Nível 2: reclamação de qualidade que envolve insatisfação com entregas criativas.</p><p>Nível 3: reclamação relacional que ameaça a continuidade da parceria.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['atendimento','cliente','entrega','qualidade','aprovacao']::TEXT[],
    2,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-ATD-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Estabelecer um fluxo estruturado para receber, classificar, tratar e resolver reclamações de clientes, garantindo que cada feedback gere aprendizado e melhoria contínua de processos.', '<p>Estabelecer um fluxo estruturado para receber, classificar, tratar e resolver reclamações de clientes, garantindo que cada feedback gere aprendizado e melhoria contínua de processos.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Registro, classificação (3 níveis), tratamento, resolução e análise de padrões de reclamações de clientes ativos.', '<p>Registro, classificação (3 níveis), tratamento, resolução e análise de padrões de reclamações de clientes ativos.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Feedbacks internos entre colaboradores (SOP-RH), avaliações de fornecedores (SOP-REL), disputas contratuais formais (jurídico).', '<p>Feedbacks internos entre colaboradores (SOP-RH), avaliações de fornecedores (SOP-REL), disputas contratuais formais (jurídico).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Registrar, classificar e coordenar resolução

Executor

---

PO da BU

Investigar causa e propor solução técnica

Consultor

---

Marco

Tratar reclamações Nível 2 e participar de Nível 3

Aprovador

---

Ruy

Tratar reclamações Nível 3 (relacional)

Aprovador

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Registrar, classificar e coordenar resolução</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Investigar causa e propor solução técnica</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Tratar reclamações Nível 2 e participar de Nível 3</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Tratar reclamações Nível 3 (relacional)</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Reclamação recebida por qualquer canal (e-mail, call, WhatsApp); projeto ativo no TBO OS; histórico de entregas do projeto.', '<p>Reclamação recebida por qualquer canal (e-mail, call, WhatsApp); projeto ativo no TBO OS; histórico de entregas do projeto.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (registro e rastreamento), Google Meet, WhatsApp Business, E-mail.', '<p>TBO OS (registro e rastreamento), Google Meet, WhatsApp Business, E-mail.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Registro da Reclamação', 'Ação: Carol registra toda reclamação no TBO OS incluindo: data, canal de recebimento, descrição detalhada, classificação de nível e responsável pela resolução.

Responsável: Carol (Ops)

Output: Reclamação registrada com classificação

Prazo referência: Até 2h após recebimento', '<p>Ação: Carol registra toda reclamação no TBO OS incluindo: data, canal de recebimento, descrição detalhada, classificação de nível e responsável pela resolução.</p><p>Responsável: Carol (Ops)</p><p>Output: Reclamação registrada com classificação</p><p>Prazo referência: Até 2h após recebimento</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Classificação por Nível', 'Ação: Nível 1 (Operacional): atraso pontual, arquivo em formato errado, falha de comunicação — resolução pela Carol. Nível 2 (Qualidade): insatisfação com resultado criativo, retrabalho além do contratado — PO + Marco. Nível 3 (Relacional): quebra de confiança, ameaça de cancelamento — Marco + Ruy.

Responsável: Carol (Ops)

Output: Nível classificado e responsável notificado

Prazo referência: Imediato após registro', '<p>Ação: Nível 1 (Operacional): atraso pontual, arquivo em formato errado, falha de comunicação — resolução pela Carol. Nível 2 (Qualidade): insatisfação com resultado criativo, retrabalho além do contratado — PO + Marco. Nível 3 (Relacional): quebra de confiança, ameaça de cancelamento — Marco + Ruy.</p><p>Responsável: Carol (Ops)</p><p>Output: Nível classificado e responsável notificado</p><p>Prazo referência: Imediato após registro</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Resposta Inicial ao Cliente', 'Ação: Enviar acknowledgement ao cliente confirmando recebimento e prazo estimado de resolução. Não é necessário ter a solução — é necessário confirmar que está sendo tratada.

Responsável: Carol (Ops)

Output: Resposta de acknowledgement enviada

Prazo referência: Até 4h úteis', '<p>Ação: Enviar acknowledgement ao cliente confirmando recebimento e prazo estimado de resolução. Não é necessário ter a solução — é necessário confirmar que está sendo tratada.</p><p>Responsável: Carol (Ops)</p><p>Output: Resposta de acknowledgement enviada</p><p>Prazo referência: Até 4h úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Resolução', 'Ação: Nível 1: resolução em até 24h úteis. Nível 2: proposta de solução em até 48h (pode envolver call de alinhamento). Nível 3: reunião com sócios em até 48h. Todas as resoluções são registradas no TBO OS.

Responsável: Conforme nível

Output: Reclamação resolvida e registrada

Prazo referência: Conforme SLA por nível', '<p>Ação: Nível 1: resolução em até 24h úteis. Nível 2: proposta de solução em até 48h (pode envolver call de alinhamento). Nível 3: reunião com sócios em até 48h. Todas as resoluções são registradas no TBO OS.</p><p>Responsável: Conforme nível</p><p>Output: Reclamação resolvida e registrada</p><p>Prazo referência: Conforme SLA por nível</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Análise de Padrões (semanal)', 'Ação: Carol apresenta reclamações da semana na reunião interna. Se o mesmo tipo ocorre 3 vezes em 90 dias, é obrigatória revisão do SOP relacionado.

Responsável: Carol (Ops) + Marco

Output: Ações preventivas definidas quando aplicável

Prazo referência: Reunião semanal interna', '<p>Ação: Carol apresenta reclamações da semana na reunião interna. Se o mesmo tipo ocorre 3 vezes em 90 dias, é obrigatória revisão do SOP relacionado.</p><p>Responsável: Carol (Ops) + Marco</p><p>Output: Ações preventivas definidas quando aplicável</p><p>Prazo referência: Reunião semanal interna</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Reclamação registrada no TBO OS com todos os campos

[ ] Nível classificado corretamente

[ ] Resposta de acknowledgement enviada dentro de 4h úteis

[ ] Resolução concluída dentro do SLA do nível

[ ] Análise semanal realizada com identificação de padrões', '<ul><li>[ ] Reclamação registrada no TBO OS com todos os campos</li><li>[ ] Nível classificado corretamente</li><li>[ ] Resposta de acknowledgement enviada dentro de 4h úteis</li><li>[ ] Resolução concluída dentro do SLA do nível</li><li>[ ] Análise semanal realizada com identificação de padrões</li></ul>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Não registrar reclamação → problema se repete e ninguém percebe o padrão

Demorar mais de 4h para responder → cliente sente que foi ignorado

Resolver sem registrar → aprendizado perdido, erro se repete', '<ul><li>Não registrar reclamação → problema se repete e ninguém percebe o padrão</li><li>Demorar mais de 4h para responder → cliente sente que foi ignorado</li><li>Resolver sem registrar → aprendizado perdido, erro se repete</li></ul>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (registro e rastreamento), Google Meet (calls de resolução), E-mail (comunicação formal), WhatsApp Business (urgências).', '<p>TBO OS (registro e rastreamento), Google Meet (calls de resolução), E-mail (comunicação formal), WhatsApp Business (urgências).</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Registro: até 2h após recebimento

Acknowledgement ao cliente: até 4h úteis

Resolução Nível 1: até 24h úteis

Resolução Nível 2: proposta em até 48h úteis

Resolução Nível 3: reunião com sócios em até 48h úteis

Regra: 3 reclamações iguais em 90 dias → revisão obrigatória do SOP relacionado', '<ul><li>Registro: até 2h após recebimento</li><li>Acknowledgement ao cliente: até 4h úteis</li><li>Resolução Nível 1: até 24h úteis</li><li>Resolução Nível 2: proposta em até 48h úteis</li><li>Resolução Nível 3: reunião com sócios em até 48h úteis</li><li>Regra: 3 reclamações iguais em 90 dias → revisão obrigatória do SOP relacionado</li></ul>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Reclamação Recebida → Registro no TBO OS → Classificação (N1/N2/N3) → Acknowledgement ao Cliente (4h) → Resolução conforme nível → Registro da Resolução → Análise Semanal → Padrão identificado? → Sim: Revisão de SOP → Fim / Não: Fim', '<p>Reclamação Recebida → Registro no TBO OS → Classificação (N1/N2/N3) → Acknowledgement ao Cliente (4h) → Resolução conforme nível → Registro da Resolução → Análise Semanal → Padrão identificado? → Sim: Revisão de SOP → Fim / Não: Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Acknowledgement: resposta inicial confirmando recebimento, sem necessidade de solução.

Nível 1: reclamação operacional de resolução rápida e baixo impacto.

Nível 2: reclamação de qualidade que envolve insatisfação com entregas criativas.

Nível 3: reclamação relacional que ameaça a continuidade da parceria.', '<p>Acknowledgement: resposta inicial confirmando recebimento, sem necessidade de solução.</p><p>Nível 1: reclamação operacional de resolução rápida e baixo impacto.</p><p>Nível 2: reclamação de qualidade que envolve insatisfação com entregas criativas.</p><p>Nível 3: reclamação relacional que ameaça a continuidade da parceria.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-ATD-004: Handoff entre BUs ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Handoff entre BUs',
    'tbo-atd-004-handoff-entre-bus',
    'atendimento',
    'checklist',
    'Carol (Coordenadora de Operações)',
    'Standard Operating Procedure

Handoff entre BUs

Código

TBO-ATD-004

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Atendimento (Customer Success)

Responsável

Carol (Coordenadora de Operações)

Aprovador

Marco Andolfato



1. Objetivo

Padronizar a passagem de bastão entre as BUs da TBO (Digital 3D, Branding, Marketing, Audiovisual, Gamificação), garantindo que nenhuma informação se perca e que o cliente perceba continuidade na experiência.

2. Escopo

2.1 O que está coberto

Checklist de handoff, reunião entre POs quando necessário, comunicação ao cliente sobre transição de fase, e registro formal de aceite.

2.2 Exclusões

Handoff final ao cliente (SOP-OPS-008), gestão de fornecedores externos (SOP-REL-001), processo de QA interno de cada BU (SOPs de BU).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar o handoff, garantir checklist e comunicar cliente

Executor

---

PO da BU que entrega

Preencher checklist, organizar arquivos e briefing

Executor

---

PO da BU que recebe

Validar recebimento e confirmar aceite

Executor

---

Marco

Autorizar exceções ao fluxo padrão

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

Entrega da BU anterior aprovada pelo cliente; arquivos finais nomeados conforme padrão TBO; briefing e feedbacks consolidados.

4.2 Ferramentas e Acessos

TBO OS (checklist de handoff, registro de aceite), Google Drive (arquivos), Google Meet (reunião entre POs).

5. Procedimento Passo a Passo

5.1. Preenchimento do Checklist de Handoff

Ação: PO da BU que entrega preenche no TBO OS: arquivos finais entregues (links, nomenclatura, resolução), briefing e referências que orientaram a produção, feedbacks do cliente consolidados, pontos de atenção ou exceções.

Responsável: PO da BU que entrega

Output: Checklist preenchido no TBO OS

Prazo referência: Até 24h após aprovação do cliente na etapa anterior

5.2. Reunião de Handoff (projetos de alta complexidade)

Ação: Carol agenda reunião de 15 min entre POs das BUs envolvidas. Resultado: registro de aceite no TBO OS.

Responsável: Carol (Ops)

Output: Ata de handoff registrada

Prazo referência: Até 48h após checklist preenchido

5.3. Comunicação ao Cliente

Ação: Carol informa o cliente sobre a transição de fase, apresenta o novo ponto focal (se houver mudança) e confirma a próxima milestone.

Responsável: Carol (Ops)

Output: E-mail ou mensagem de transição enviada ao cliente

Prazo referência: No mesmo dia da reunião de handoff

5.4. Aceite da BU Receptora

Ação: PO da BU que recebe confirma aceite formal no TBO OS após verificar que tem todos os insumos para iniciar a produção.

Responsável: PO da BU que recebe

Output: Aceite registrado no TBO OS

Prazo referência: Até 24h após reunião de handoff

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Checklist de handoff preenchido com todos os campos

[ ] Arquivos finais organizados e nomeados conforme padrão

[ ] Feedbacks do cliente consolidados e acessíveis

[ ] Reunião de handoff realizada (se projeto complexo)

[ ] Comunicação ao cliente sobre transição enviada

[ ] Aceite formal da BU receptora registrado no TBO OS

6.2 Erros Comuns a Evitar

BU receptora inicia sem checklist → retrabalho por falta de contexto

Arquivos sem nomenclatura padrão → perda de tempo procurando versão correta

Não comunicar o cliente → sensação de descontinuidade e perda de confiança

7. Ferramentas e Templates

TBO OS (checklist, aceite, registro), Google Drive (arquivos), Google Meet (reunião de handoff), E-mail (comunicação ao cliente).

8. SLAs e Prazos

Checklist de handoff: até 24h após aprovação da etapa anterior

Reunião de handoff: até 48h (projetos complexos)

Comunicação ao cliente: no mesmo dia

Aceite da BU receptora: até 24h após reunião

Regra: nenhuma BU inicia sem checklist preenchido — exceções requerem aprovação de Marco

9. Fluxograma

Entrega da BU Anterior Aprovada → PO preenche Checklist de Handoff → Projeto Complexo? → Sim: Reunião de Handoff (15min) → Comunicação ao Cliente → Aceite da BU Receptora → Produção Inicia → Fim / Não: Comunicação ao Cliente → Aceite → Produção → Fim

10. Glossário

Handoff: passagem formal de entregáveis e contexto de uma BU para outra.

Checklist de handoff: formulário padronizado no TBO OS que documenta tudo o que a BU receptora precisa para iniciar.

Aceite: confirmação formal de que a BU receptora tem condições de iniciar o trabalho.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Handoff entre BUs</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-ATD-004</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Atendimento (Customer Success)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Padronizar a passagem de bastão entre as BUs da TBO (Digital 3D, Branding, Marketing, Audiovisual, Gamificação), garantindo que nenhuma informação se perca e que o cliente perceba continuidade na experiência.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Checklist de handoff, reunião entre POs quando necessário, comunicação ao cliente sobre transição de fase, e registro formal de aceite.</p><p><strong>2.2 Exclusões</strong></p><p>Handoff final ao cliente (SOP-OPS-008), gestão de fornecedores externos (SOP-REL-001), processo de QA interno de cada BU (SOPs de BU).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Coordenar o handoff, garantir checklist e comunicar cliente</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU que entrega</strong></p></td><td><p>Preencher checklist, organizar arquivos e briefing</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU que recebe</strong></p></td><td><p>Validar recebimento e confirmar aceite</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Autorizar exceções ao fluxo padrão</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Entrega da BU anterior aprovada pelo cliente; arquivos finais nomeados conforme padrão TBO; briefing e feedbacks consolidados.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS (checklist de handoff, registro de aceite), Google Drive (arquivos), Google Meet (reunião entre POs).</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Preenchimento do Checklist de Handoff</strong></p><p>Ação: PO da BU que entrega preenche no TBO OS: arquivos finais entregues (links, nomenclatura, resolução), briefing e referências que orientaram a produção, feedbacks do cliente consolidados, pontos de atenção ou exceções.</p><p>Responsável: PO da BU que entrega</p><p>Output: Checklist preenchido no TBO OS</p><p>Prazo referência: Até 24h após aprovação do cliente na etapa anterior</p><p><strong>5.2. Reunião de Handoff (projetos de alta complexidade)</strong></p><p>Ação: Carol agenda reunião de 15 min entre POs das BUs envolvidas. Resultado: registro de aceite no TBO OS.</p><p>Responsável: Carol (Ops)</p><p>Output: Ata de handoff registrada</p><p>Prazo referência: Até 48h após checklist preenchido</p><p><strong>5.3. Comunicação ao Cliente</strong></p><p>Ação: Carol informa o cliente sobre a transição de fase, apresenta o novo ponto focal (se houver mudança) e confirma a próxima milestone.</p><p>Responsável: Carol (Ops)</p><p>Output: E-mail ou mensagem de transição enviada ao cliente</p><p>Prazo referência: No mesmo dia da reunião de handoff</p><p><strong>5.4. Aceite da BU Receptora</strong></p><p>Ação: PO da BU que recebe confirma aceite formal no TBO OS após verificar que tem todos os insumos para iniciar a produção.</p><p>Responsável: PO da BU que recebe</p><p>Output: Aceite registrado no TBO OS</p><p>Prazo referência: Até 24h após reunião de handoff</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Checklist de handoff preenchido com todos os campos</li><li>[ ] Arquivos finais organizados e nomeados conforme padrão</li><li>[ ] Feedbacks do cliente consolidados e acessíveis</li><li>[ ] Reunião de handoff realizada (se projeto complexo)</li><li>[ ] Comunicação ao cliente sobre transição enviada</li><li>[ ] Aceite formal da BU receptora registrado no TBO OS</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>BU receptora inicia sem checklist → retrabalho por falta de contexto</li><li>Arquivos sem nomenclatura padrão → perda de tempo procurando versão correta</li><li>Não comunicar o cliente → sensação de descontinuidade e perda de confiança</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (checklist, aceite, registro), Google Drive (arquivos), Google Meet (reunião de handoff), E-mail (comunicação ao cliente).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Checklist de handoff: até 24h após aprovação da etapa anterior</li><li>Reunião de handoff: até 48h (projetos complexos)</li><li>Comunicação ao cliente: no mesmo dia</li><li>Aceite da BU receptora: até 24h após reunião</li><li>Regra: nenhuma BU inicia sem checklist preenchido — exceções requerem aprovação de Marco</li></ul><p><strong>9. Fluxograma</strong></p><p>Entrega da BU Anterior Aprovada → PO preenche Checklist de Handoff → Projeto Complexo? → Sim: Reunião de Handoff (15min) → Comunicação ao Cliente → Aceite da BU Receptora → Produção Inicia → Fim / Não: Comunicação ao Cliente → Aceite → Produção → Fim</p><p><strong>10. Glossário</strong></p><p>Handoff: passagem formal de entregáveis e contexto de uma BU para outra.</p><p>Checklist de handoff: formulário padronizado no TBO OS que documenta tudo o que a BU receptora precisa para iniciar.</p><p>Aceite: confirmação formal de que a BU receptora tem condições de iniciar o trabalho.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['atendimento','cliente','entrega','qualidade','aprovacao']::TEXT[],
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

  -- Steps for TBO-ATD-004
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Padronizar a passagem de bastão entre as BUs da TBO (Digital 3D, Branding, Marketing, Audiovisual, Gamificação), garantindo que nenhuma informação se perca e que o cliente perceba continuidade na experiência.', '<p>Padronizar a passagem de bastão entre as BUs da TBO (Digital 3D, Branding, Marketing, Audiovisual, Gamificação), garantindo que nenhuma informação se perca e que o cliente perceba continuidade na experiência.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Checklist de handoff, reunião entre POs quando necessário, comunicação ao cliente sobre transição de fase, e registro formal de aceite.', '<p>Checklist de handoff, reunião entre POs quando necessário, comunicação ao cliente sobre transição de fase, e registro formal de aceite.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Handoff final ao cliente (SOP-OPS-008), gestão de fornecedores externos (SOP-REL-001), processo de QA interno de cada BU (SOPs de BU).', '<p>Handoff final ao cliente (SOP-OPS-008), gestão de fornecedores externos (SOP-REL-001), processo de QA interno de cada BU (SOPs de BU).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar o handoff, garantir checklist e comunicar cliente

Executor

---

PO da BU que entrega

Preencher checklist, organizar arquivos e briefing

Executor

---

PO da BU que recebe

Validar recebimento e confirmar aceite

Executor

---

Marco

Autorizar exceções ao fluxo padrão

Aprovador

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Coordenar o handoff, garantir checklist e comunicar cliente</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU que entrega</strong></p></td><td><p>Preencher checklist, organizar arquivos e briefing</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU que recebe</strong></p></td><td><p>Validar recebimento e confirmar aceite</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Autorizar exceções ao fluxo padrão</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Entrega da BU anterior aprovada pelo cliente; arquivos finais nomeados conforme padrão TBO; briefing e feedbacks consolidados.', '<p>Entrega da BU anterior aprovada pelo cliente; arquivos finais nomeados conforme padrão TBO; briefing e feedbacks consolidados.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (checklist de handoff, registro de aceite), Google Drive (arquivos), Google Meet (reunião entre POs).', '<p>TBO OS (checklist de handoff, registro de aceite), Google Drive (arquivos), Google Meet (reunião entre POs).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Preenchimento do Checklist de Handoff', 'Ação: PO da BU que entrega preenche no TBO OS: arquivos finais entregues (links, nomenclatura, resolução), briefing e referências que orientaram a produção, feedbacks do cliente consolidados, pontos de atenção ou exceções.

Responsável: PO da BU que entrega

Output: Checklist preenchido no TBO OS

Prazo referência: Até 24h após aprovação do cliente na etapa anterior', '<p>Ação: PO da BU que entrega preenche no TBO OS: arquivos finais entregues (links, nomenclatura, resolução), briefing e referências que orientaram a produção, feedbacks do cliente consolidados, pontos de atenção ou exceções.</p><p>Responsável: PO da BU que entrega</p><p>Output: Checklist preenchido no TBO OS</p><p>Prazo referência: Até 24h após aprovação do cliente na etapa anterior</p>', 6, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Reunião de Handoff (projetos de alta complexidade)', 'Ação: Carol agenda reunião de 15 min entre POs das BUs envolvidas. Resultado: registro de aceite no TBO OS.

Responsável: Carol (Ops)

Output: Ata de handoff registrada

Prazo referência: Até 48h após checklist preenchido', '<p>Ação: Carol agenda reunião de 15 min entre POs das BUs envolvidas. Resultado: registro de aceite no TBO OS.</p><p>Responsável: Carol (Ops)</p><p>Output: Ata de handoff registrada</p><p>Prazo referência: Até 48h após checklist preenchido</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Comunicação ao Cliente', 'Ação: Carol informa o cliente sobre a transição de fase, apresenta o novo ponto focal (se houver mudança) e confirma a próxima milestone.

Responsável: Carol (Ops)

Output: E-mail ou mensagem de transição enviada ao cliente

Prazo referência: No mesmo dia da reunião de handoff', '<p>Ação: Carol informa o cliente sobre a transição de fase, apresenta o novo ponto focal (se houver mudança) e confirma a próxima milestone.</p><p>Responsável: Carol (Ops)</p><p>Output: E-mail ou mensagem de transição enviada ao cliente</p><p>Prazo referência: No mesmo dia da reunião de handoff</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Aceite da BU Receptora', 'Ação: PO da BU que recebe confirma aceite formal no TBO OS após verificar que tem todos os insumos para iniciar a produção.

Responsável: PO da BU que recebe

Output: Aceite registrado no TBO OS

Prazo referência: Até 24h após reunião de handoff', '<p>Ação: PO da BU que recebe confirma aceite formal no TBO OS após verificar que tem todos os insumos para iniciar a produção.</p><p>Responsável: PO da BU que recebe</p><p>Output: Aceite registrado no TBO OS</p><p>Prazo referência: Até 24h após reunião de handoff</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Checklist de handoff preenchido com todos os campos

[ ] Arquivos finais organizados e nomeados conforme padrão

[ ] Feedbacks do cliente consolidados e acessíveis

[ ] Reunião de handoff realizada (se projeto complexo)

[ ] Comunicação ao cliente sobre transição enviada

[ ] Aceite formal da BU receptora registrado no TBO OS', '<ul><li>[ ] Checklist de handoff preenchido com todos os campos</li><li>[ ] Arquivos finais organizados e nomeados conforme padrão</li><li>[ ] Feedbacks do cliente consolidados e acessíveis</li><li>[ ] Reunião de handoff realizada (se projeto complexo)</li><li>[ ] Comunicação ao cliente sobre transição enviada</li><li>[ ] Aceite formal da BU receptora registrado no TBO OS</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'BU receptora inicia sem checklist → retrabalho por falta de contexto

Arquivos sem nomenclatura padrão → perda de tempo procurando versão correta

Não comunicar o cliente → sensação de descontinuidade e perda de confiança', '<ul><li>BU receptora inicia sem checklist → retrabalho por falta de contexto</li><li>Arquivos sem nomenclatura padrão → perda de tempo procurando versão correta</li><li>Não comunicar o cliente → sensação de descontinuidade e perda de confiança</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (checklist, aceite, registro), Google Drive (arquivos), Google Meet (reunião de handoff), E-mail (comunicação ao cliente).', '<p>TBO OS (checklist, aceite, registro), Google Drive (arquivos), Google Meet (reunião de handoff), E-mail (comunicação ao cliente).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Checklist de handoff: até 24h após aprovação da etapa anterior

Reunião de handoff: até 48h (projetos complexos)

Comunicação ao cliente: no mesmo dia

Aceite da BU receptora: até 24h após reunião

Regra: nenhuma BU inicia sem checklist preenchido — exceções requerem aprovação de Marco', '<ul><li>Checklist de handoff: até 24h após aprovação da etapa anterior</li><li>Reunião de handoff: até 48h (projetos complexos)</li><li>Comunicação ao cliente: no mesmo dia</li><li>Aceite da BU receptora: até 24h após reunião</li><li>Regra: nenhuma BU inicia sem checklist preenchido — exceções requerem aprovação de Marco</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Entrega da BU Anterior Aprovada → PO preenche Checklist de Handoff → Projeto Complexo? → Sim: Reunião de Handoff (15min) → Comunicação ao Cliente → Aceite da BU Receptora → Produção Inicia → Fim / Não: Comunicação ao Cliente → Aceite → Produção → Fim', '<p>Entrega da BU Anterior Aprovada → PO preenche Checklist de Handoff → Projeto Complexo? → Sim: Reunião de Handoff (15min) → Comunicação ao Cliente → Aceite da BU Receptora → Produção Inicia → Fim / Não: Comunicação ao Cliente → Aceite → Produção → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Handoff: passagem formal de entregáveis e contexto de uma BU para outra.

Checklist de handoff: formulário padronizado no TBO OS que documenta tudo o que a BU receptora precisa para iniciar.

Aceite: confirmação formal de que a BU receptora tem condições de iniciar o trabalho.', '<p>Handoff: passagem formal de entregáveis e contexto de uma BU para outra.</p><p>Checklist de handoff: formulário padronizado no TBO OS que documenta tudo o que a BU receptora precisa para iniciar.</p><p>Aceite: confirmação formal de que a BU receptora tem condições de iniciar o trabalho.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-COM-001: Prospeccao e Qualificacao de Leads ──
END $$;
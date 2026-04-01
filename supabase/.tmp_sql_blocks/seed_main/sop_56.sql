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
END $$;
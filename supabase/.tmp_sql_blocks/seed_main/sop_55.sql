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
    'Controle de Qualidade Geral QA Cross BU',
    'tbo-ops-007-controle-de-qualidade-geral-qa-cross-bu',
    'operacoes',
    'checklist',
    'Controle de Qualidade Geral (QA Cross-BU)',
    'Standard Operating Procedure

Controle de Qualidade Geral (QA Cross-BU)

Código

TBO-OPS-007

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

Garantir que toda entrega ao cliente passe por revisão de qualidade padronizada antes do envio, independentemente da BU de origem, reduzindo retrabalho pós-entrega e protegendo a reputação da TBO.

  2. Escopo

2.1 O que está coberto

Revisão de qualidade de entregas de Audiovisual, Gamificação e Operações antes do envio ao cliente; checklist por tipo de entrega; registro de não conformidades e fluxo de correção.

2.2 Exclusões

Revisões técnicas de engenharia (estrutural, elétrica), revisões jurídicas de contrato, auditorias externas.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar o processo de QA, aplicar checklist, registrar não conformidades

Executor

—

Marco Andolfato

Revisão criativa final (vídeos, peças visuais, aplicações 3D)

Aprovador

—

Responsável de BU

Corrigir não conformidades identificadas no QA

Executor

—

Cliente

Aprovação final após QA interno aprovado

Informado

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Entrega técnica concluída pelo responsável de BU; checklist de QA por tipo de entrega (AV, GAM, OPS); acesso ao material (Drive, frame.io, build de aplicação).

4.2 Ferramentas e Acessos

Google Sheets (checklists de QA), frame.io (comentários em vídeo), Asana (task de QA em cada projeto), Google Drive.



  5. Procedimento Passo a Passo

5.1. Sinalização de Prontidão para QA

Ação: Responsável de BU move task para coluna ''Revisão Interna'' no Asana e notifica Carol; disponibiliza o material no local correto (frame.io para vídeos, Drive para documentos, link de build para apps); descreve o que foi produzido e pontos de atenção.

Responsável: Responsável de BU

Output: Material disponível para QA com contexto

Prazo referência: Antes do envio ao cliente

5.2. Aplicação do Checklist de QA

Ação: Carol aplica checklist específico por tipo: AV (formatos, legenda, logo, grading), GAM (framerate, fluxo, dados corretos, responsividade), OPS (dados do cliente corretos, links ativos, formatação). Registra itens aprovados e não conformidades.

Responsável: Carol (Ops)

Output: Checklist de QA preenchido com resultado

Prazo referência: Até 1 dia útil após sinalização

5.3. Revisão Criativa por Marco (entregas AV e GAM)

Ação: Para entregas de Audiovisual e Gamificação, Marco realiza revisão criativa paralela: avalia identidade visual, nível de acabamento, narrativa, movimento de câmera ou experiência do usuário; registra pontos de ajuste no frame.io ou documento.

Responsável: Marco Andolfato

Output: Pontos de ajuste criativos registrados

Prazo referência: Até 1 dia útil após checklist de Carol

5.4. Correção de Não Conformidades

Ação: Responsável de BU corrige todos os itens sinalizados no QA (checklist + revisão de Marco); notifica Carol após correção; Carol re-verifica itens críticos.

Responsável: Responsável de BU + Carol (Ops)

Output: Não conformidades corrigidas e verificadas

Prazo referência: Conforme urgência do projeto (geralmente 1–2 dias)

5.5. Liberação para Envio ao Cliente

Ação: Carol atualiza checklist de QA com status ''Aprovado''; move task para ''Aguardando Cliente'' no Asana; envia entrega ao cliente com mensagem padronizada de encaminhamento e prazo de feedback (48–72h).

Responsável: Carol (Ops)

Output: Entrega enviada ao cliente com QA aprovado

Prazo referência: Após aprovação do QA

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Nenhuma entrega ao cliente sem checklist de QA preenchido; [ ] Revisão criativa de Marco realizada em 100% das entregas AV e GAM; [ ] Não conformidades corrigidas antes do envio; [ ] Task no Asana em ''Aguardando Cliente'' antes do envio; [ ] Registro de não conformidades mantido para análise de padrão.

6.2 Erros Comuns a Evitar

Envio ao cliente sem QA → erros chegam ao cliente, desgaste da relação. QA feito de forma superficial → não conformidades passam despercebidas. Não conformidade corrigida sem re-verificação → problema persiste. Sem histórico de QA → impossível identificar padrões de erro por BU.

  7. Ferramentas e Templates

Google Sheets (checklists), frame.io, Asana, Google Drive.

  8. SLAs e Prazos

QA (checklist Carol): até 1 dia útil após sinalização. Revisão criativa Marco: até 1 dia útil. Correção de não conformidades: 1–2 dias úteis. Liberação para cliente: após QA 100% aprovado.

  9. Fluxograma

Início → BU sinaliza prontidão (Asana) → Carol aplica checklist QA → Marco revisão criativa (AV/GAM) → Não conformidades? → Sim: BU corrige → re-verificação → Não: Aprovado → Envio ao Cliente → Feedback → Fim

  10. Glossário

QA: Quality Assurance — processo de verificação de qualidade antes da entrega. Não conformidade: item que não atende ao padrão esperado. Checklist: lista de verificação com critérios binários (ok / não ok). Cross-BU: processo que atravessa todas as unidades de negócio.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Controle de Qualidade Geral (QA Cross-BU)</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-OPS-007</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Operações</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Garantir que toda entrega ao cliente passe por revisão de qualidade padronizada antes do envio, independentemente da BU de origem, reduzindo retrabalho pós-entrega e protegendo a reputação da TBO.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Revisão de qualidade de entregas de Audiovisual, Gamificação e Operações antes do envio ao cliente; checklist por tipo de entrega; registro de não conformidades e fluxo de correção.</p><p><strong>2.2 Exclusões</strong></p><p>Revisões técnicas de engenharia (estrutural, elétrica), revisões jurídicas de contrato, auditorias externas.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coordenar o processo de QA, aplicar checklist, registrar não conformidades</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Revisão criativa final (vídeos, peças visuais, aplicações 3D)</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Responsável de BU</p></td><td><p>Corrigir não conformidades identificadas no QA</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente</p></td><td><p>Aprovação final após QA interno aprovado</p></td><td><p>Informado</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Entrega técnica concluída pelo responsável de BU; checklist de QA por tipo de entrega (AV, GAM, OPS); acesso ao material (Drive, frame.io, build de aplicação).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Sheets (checklists de QA), frame.io (comentários em vídeo), Asana (task de QA em cada projeto), Google Drive.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Sinalização de Prontidão para QA</strong></p><p>Ação: Responsável de BU move task para coluna ''Revisão Interna'' no Asana e notifica Carol; disponibiliza o material no local correto (frame.io para vídeos, Drive para documentos, link de build para apps); descreve o que foi produzido e pontos de atenção.</p><p>Responsável: Responsável de BU</p><p>Output: Material disponível para QA com contexto</p><p>Prazo referência: Antes do envio ao cliente</p><p><strong>5.2. Aplicação do Checklist de QA</strong></p><p>Ação: Carol aplica checklist específico por tipo: AV (formatos, legenda, logo, grading), GAM (framerate, fluxo, dados corretos, responsividade), OPS (dados do cliente corretos, links ativos, formatação). Registra itens aprovados e não conformidades.</p><p>Responsável: Carol (Ops)</p><p>Output: Checklist de QA preenchido com resultado</p><p>Prazo referência: Até 1 dia útil após sinalização</p><p><strong>5.3. Revisão Criativa por Marco (entregas AV e GAM)</strong></p><p>Ação: Para entregas de Audiovisual e Gamificação, Marco realiza revisão criativa paralela: avalia identidade visual, nível de acabamento, narrativa, movimento de câmera ou experiência do usuário; registra pontos de ajuste no frame.io ou documento.</p><p>Responsável: Marco Andolfato</p><p>Output: Pontos de ajuste criativos registrados</p><p>Prazo referência: Até 1 dia útil após checklist de Carol</p><p><strong>5.4. Correção de Não Conformidades</strong></p><p>Ação: Responsável de BU corrige todos os itens sinalizados no QA (checklist + revisão de Marco); notifica Carol após correção; Carol re-verifica itens críticos.</p><p>Responsável: Responsável de BU + Carol (Ops)</p><p>Output: Não conformidades corrigidas e verificadas</p><p>Prazo referência: Conforme urgência do projeto (geralmente 1–2 dias)</p><p><strong>5.5. Liberação para Envio ao Cliente</strong></p><p>Ação: Carol atualiza checklist de QA com status ''Aprovado''; move task para ''Aguardando Cliente'' no Asana; envia entrega ao cliente com mensagem padronizada de encaminhamento e prazo de feedback (48–72h).</p><p>Responsável: Carol (Ops)</p><p>Output: Entrega enviada ao cliente com QA aprovado</p><p>Prazo referência: Após aprovação do QA</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Nenhuma entrega ao cliente sem checklist de QA preenchido; [ ] Revisão criativa de Marco realizada em 100% das entregas AV e GAM; [ ] Não conformidades corrigidas antes do envio; [ ] Task no Asana em ''Aguardando Cliente'' antes do envio; [ ] Registro de não conformidades mantido para análise de padrão.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Envio ao cliente sem QA → erros chegam ao cliente, desgaste da relação. QA feito de forma superficial → não conformidades passam despercebidas. Não conformidade corrigida sem re-verificação → problema persiste. Sem histórico de QA → impossível identificar padrões de erro por BU.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Sheets (checklists), frame.io, Asana, Google Drive.</p><p><strong>  8. SLAs e Prazos</strong></p><p>QA (checklist Carol): até 1 dia útil após sinalização. Revisão criativa Marco: até 1 dia útil. Correção de não conformidades: 1–2 dias úteis. Liberação para cliente: após QA 100% aprovado.</p><p><strong>  9. Fluxograma</strong></p><p>Início → BU sinaliza prontidão (Asana) → Carol aplica checklist QA → Marco revisão criativa (AV/GAM) → Não conformidades? → Sim: BU corrige → re-verificação → Não: Aprovado → Envio ao Cliente → Feedback → Fim</p><p><strong>  10. Glossário</strong></p><p>QA: Quality Assurance — processo de verificação de qualidade antes da entrega. Não conformidade: item que não atende ao padrão esperado. Checklist: lista de verificação com critérios binários (ok / não ok). Cross-BU: processo que atravessa todas as unidades de negócio.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'critical',
    ARRAY['operacoes','processo','gestao','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-OPS-007
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que toda entrega ao cliente passe por revisão de qualidade padronizada antes do envio, independentemente da BU de origem, reduzindo retrabalho pós-entrega e protegendo a reputação da TBO.', '<p>Garantir que toda entrega ao cliente passe por revisão de qualidade padronizada antes do envio, independentemente da BU de origem, reduzindo retrabalho pós-entrega e protegendo a reputação da TBO.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Revisão de qualidade de entregas de Audiovisual, Gamificação e Operações antes do envio ao cliente; checklist por tipo de entrega; registro de não conformidades e fluxo de correção.', '<p>Revisão de qualidade de entregas de Audiovisual, Gamificação e Operações antes do envio ao cliente; checklist por tipo de entrega; registro de não conformidades e fluxo de correção.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Revisões técnicas de engenharia (estrutural, elétrica), revisões jurídicas de contrato, auditorias externas.', '<p>Revisões técnicas de engenharia (estrutural, elétrica), revisões jurídicas de contrato, auditorias externas.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar o processo de QA, aplicar checklist, registrar não conformidades

Executor

—

Marco Andolfato

Revisão criativa final (vídeos, peças visuais, aplicações 3D)

Aprovador

—

Responsável de BU

Corrigir não conformidades identificadas no QA

Executor

—

Cliente

Aprovação final após QA interno aprovado

Informado

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coordenar o processo de QA, aplicar checklist, registrar não conformidades</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Revisão criativa final (vídeos, peças visuais, aplicações 3D)</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Responsável de BU</p></td><td><p>Corrigir não conformidades identificadas no QA</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente</p></td><td><p>Aprovação final após QA interno aprovado</p></td><td><p>Informado</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Entrega técnica concluída pelo responsável de BU; checklist de QA por tipo de entrega (AV, GAM, OPS); acesso ao material (Drive, frame.io, build de aplicação).', '<p>Entrega técnica concluída pelo responsável de BU; checklist de QA por tipo de entrega (AV, GAM, OPS); acesso ao material (Drive, frame.io, build de aplicação).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Sheets (checklists de QA), frame.io (comentários em vídeo), Asana (task de QA em cada projeto), Google Drive.', '<p>Google Sheets (checklists de QA), frame.io (comentários em vídeo), Asana (task de QA em cada projeto), Google Drive.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Sinalização de Prontidão para QA', 'Ação: Responsável de BU move task para coluna ''Revisão Interna'' no Asana e notifica Carol; disponibiliza o material no local correto (frame.io para vídeos, Drive para documentos, link de build para apps); descreve o que foi produzido e pontos de atenção.

Responsável: Responsável de BU

Output: Material disponível para QA com contexto

Prazo referência: Antes do envio ao cliente', '<p>Ação: Responsável de BU move task para coluna ''Revisão Interna'' no Asana e notifica Carol; disponibiliza o material no local correto (frame.io para vídeos, Drive para documentos, link de build para apps); descreve o que foi produzido e pontos de atenção.</p><p>Responsável: Responsável de BU</p><p>Output: Material disponível para QA com contexto</p><p>Prazo referência: Antes do envio ao cliente</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Aplicação do Checklist de QA', 'Ação: Carol aplica checklist específico por tipo: AV (formatos, legenda, logo, grading), GAM (framerate, fluxo, dados corretos, responsividade), OPS (dados do cliente corretos, links ativos, formatação). Registra itens aprovados e não conformidades.

Responsável: Carol (Ops)

Output: Checklist de QA preenchido com resultado

Prazo referência: Até 1 dia útil após sinalização', '<p>Ação: Carol aplica checklist específico por tipo: AV (formatos, legenda, logo, grading), GAM (framerate, fluxo, dados corretos, responsividade), OPS (dados do cliente corretos, links ativos, formatação). Registra itens aprovados e não conformidades.</p><p>Responsável: Carol (Ops)</p><p>Output: Checklist de QA preenchido com resultado</p><p>Prazo referência: Até 1 dia útil após sinalização</p>', 7, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Revisão Criativa por Marco (entregas AV e GAM)', 'Ação: Para entregas de Audiovisual e Gamificação, Marco realiza revisão criativa paralela: avalia identidade visual, nível de acabamento, narrativa, movimento de câmera ou experiência do usuário; registra pontos de ajuste no frame.io ou documento.

Responsável: Marco Andolfato

Output: Pontos de ajuste criativos registrados

Prazo referência: Até 1 dia útil após checklist de Carol', '<p>Ação: Para entregas de Audiovisual e Gamificação, Marco realiza revisão criativa paralela: avalia identidade visual, nível de acabamento, narrativa, movimento de câmera ou experiência do usuário; registra pontos de ajuste no frame.io ou documento.</p><p>Responsável: Marco Andolfato</p><p>Output: Pontos de ajuste criativos registrados</p><p>Prazo referência: Até 1 dia útil após checklist de Carol</p>', 8, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Correção de Não Conformidades', 'Ação: Responsável de BU corrige todos os itens sinalizados no QA (checklist + revisão de Marco); notifica Carol após correção; Carol re-verifica itens críticos.

Responsável: Responsável de BU + Carol (Ops)

Output: Não conformidades corrigidas e verificadas

Prazo referência: Conforme urgência do projeto (geralmente 1–2 dias)', '<p>Ação: Responsável de BU corrige todos os itens sinalizados no QA (checklist + revisão de Marco); notifica Carol após correção; Carol re-verifica itens críticos.</p><p>Responsável: Responsável de BU + Carol (Ops)</p><p>Output: Não conformidades corrigidas e verificadas</p><p>Prazo referência: Conforme urgência do projeto (geralmente 1–2 dias)</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Liberação para Envio ao Cliente', 'Ação: Carol atualiza checklist de QA com status ''Aprovado''; move task para ''Aguardando Cliente'' no Asana; envia entrega ao cliente com mensagem padronizada de encaminhamento e prazo de feedback (48–72h).

Responsável: Carol (Ops)

Output: Entrega enviada ao cliente com QA aprovado

Prazo referência: Após aprovação do QA', '<p>Ação: Carol atualiza checklist de QA com status ''Aprovado''; move task para ''Aguardando Cliente'' no Asana; envia entrega ao cliente com mensagem padronizada de encaminhamento e prazo de feedback (48–72h).</p><p>Responsável: Carol (Ops)</p><p>Output: Entrega enviada ao cliente com QA aprovado</p><p>Prazo referência: Após aprovação do QA</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Nenhuma entrega ao cliente sem checklist de QA preenchido; [ ] Revisão criativa de Marco realizada em 100% das entregas AV e GAM; [ ] Não conformidades corrigidas antes do envio; [ ] Task no Asana em ''Aguardando Cliente'' antes do envio; [ ] Registro de não conformidades mantido para análise de padrão.', '<p>[ ] Nenhuma entrega ao cliente sem checklist de QA preenchido; [ ] Revisão criativa de Marco realizada em 100% das entregas AV e GAM; [ ] Não conformidades corrigidas antes do envio; [ ] Task no Asana em ''Aguardando Cliente'' antes do envio; [ ] Registro de não conformidades mantido para análise de padrão.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Envio ao cliente sem QA → erros chegam ao cliente, desgaste da relação. QA feito de forma superficial → não conformidades passam despercebidas. Não conformidade corrigida sem re-verificação → problema persiste. Sem histórico de QA → impossível identificar padrões de erro por BU.', '<p>Envio ao cliente sem QA → erros chegam ao cliente, desgaste da relação. QA feito de forma superficial → não conformidades passam despercebidas. Não conformidade corrigida sem re-verificação → problema persiste. Sem histórico de QA → impossível identificar padrões de erro por BU.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Sheets (checklists), frame.io, Asana, Google Drive.', '<p>Google Sheets (checklists), frame.io, Asana, Google Drive.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'QA (checklist Carol): até 1 dia útil após sinalização. Revisão criativa Marco: até 1 dia útil. Correção de não conformidades: 1–2 dias úteis. Liberação para cliente: após QA 100% aprovado.', '<p>QA (checklist Carol): até 1 dia útil após sinalização. Revisão criativa Marco: até 1 dia útil. Correção de não conformidades: 1–2 dias úteis. Liberação para cliente: após QA 100% aprovado.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → BU sinaliza prontidão (Asana) → Carol aplica checklist QA → Marco revisão criativa (AV/GAM) → Não conformidades? → Sim: BU corrige → re-verificação → Não: Aprovado → Envio ao Cliente → Feedback → Fim', '<p>Início → BU sinaliza prontidão (Asana) → Carol aplica checklist QA → Marco revisão criativa (AV/GAM) → Não conformidades? → Sim: BU corrige → re-verificação → Não: Aprovado → Envio ao Cliente → Feedback → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'QA: Quality Assurance — processo de verificação de qualidade antes da entrega. Não conformidade: item que não atende ao padrão esperado. Checklist: lista de verificação com critérios binários (ok / não ok). Cross-BU: processo que atravessa todas as unidades de negócio.', '<p>QA: Quality Assurance — processo de verificação de qualidade antes da entrega. Não conformidade: item que não atende ao padrão esperado. Checklist: lista de verificação com critérios binários (ok / não ok). Cross-BU: processo que atravessa todas as unidades de negócio.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-OPS-008: Encerramento e Pós entrega ──
END $$;
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
    'Animações 3D Pré produção',
    'tbo-3d-009-animacoes-3d-pre-producao',
    'digital-3d',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Animações 3D — Pré-produção

Código

TBO-3D-009

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Digital 3D

Responsável

Marco Andolfato (Diretor Criativo)

Aprovador

Marco Andolfato



  1. Objetivo

Estruturar e documentar todo o planejamento criativo e técnico de uma animação 3D antes do início da produção, garantindo alinhamento com o cliente, viabilidade técnica e cronograma realista.

  2. Escopo

2.1 O que está coberto

Briefing detalhado de animação; criação de roteiro e storyboard; definição técnica (duração, resolução, FPS, estilo visual, trilha sonora); aprovação do storyboard pelo cliente; planejamento de câmeras e cenas; cronograma de produção.

2.2 Exclusões

Modelagem e texturização (cobertos pelo SOP 02); animação e render de cenas (cobertos pelo SOP 10); edição e trilha sonora (cobertos pelo SOP 11).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Diretor Criativo (Marco Andolfato)

Liderar briefing criativo, validar roteiro e aprovar storyboard

Aprovador

—

Visualizador 3D Sênior

Desenvolver storyboard técnico e validar viabilidade de produção

Responsável

—

Gerente de Projetos

Conduzir reunião de briefing com cliente, documentar e distribuir

Responsável

Informado

Cliente / Incorporadora

Aprovar roteiro, storyboard e cronograma antes do início da produção

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Contrato assinado com escopo de animação definido; modelos 3D do empreendimento finalizados ou em produção; referências de animações de arquitetura fornecidas pelo cliente; logomarca e identidade visual do empreendimento.

4.2 Ferramentas e Acessos

Google Slides ou Keynote (apresentação do storyboard); Adobe Illustrator ou Photoshop (frames do storyboard); frame.io ou Loom (apresentação remota ao cliente); TBO OS (gestão de tarefas e aprovações); Shotcut ou Premiere Pro (para animatic de referência).



  5. Procedimento Passo a Passo

5.1. Reunião de briefing de animação

Ação: Conduzir reunião de briefing com o cliente (presencial ou remota); levantar: objetivo da animação, público-alvo, duração desejada, ambientes a mostrar, pontos de destaque do empreendimento, trilha sonora (animação com voice-over, música ambiente, sem áudio), prazo de entrega e aprovações.

Responsável: Gerente de Projetos + Dir. Criativo

Output: Briefing de animação documentado e assinado pelo cliente

Prazo referência: 1–2 h (reunião) + 30 min (documentação)

5.2. Desenvolvimento do roteiro

Ação: Com base no briefing, escrever roteiro descritivo da animação: sequência de cenas, duração estimada de cada cena, movimentos de câmera, o que é destacado em cada momento, transições; incluir texto de voice-over ou legenda se aplicável.

Responsável: Diretor Criativo

Output: Roteiro de animação aprovado internamente

Prazo referência: 1 dia útil

[DECISÃO] Roteiro aprovado pelo Dir. Criativo? Sim → storyboard. Não → revisar narrativa.

5.3. Criação do storyboard

Ação: Criar storyboard frame a frame (mínimo 1 frame por cena): desenhos ou renders de preview mostrando composição, ângulo de câmera, foco e movimento; indicar direção de movimento com setas; indicar duração de cada cena; montar apresentação visual para o cliente.

Responsável: Visualizador 3D Sênior

Output: Storyboard completo em apresentação (PDF ou Slides)

Prazo referência: 1–2 dias úteis

5.4. Aprovação do storyboard pelo cliente

Ação: Apresentar storyboard ao cliente (reunião ou envio via TBO OS); coletar feedback; realizar ajustes (máx. 2 rodadas inclusas no escopo); obter aprovação formal por escrito (e-mail ou assinatura na plataforma) antes de iniciar produção.

Responsável: Gerente de Projetos

Output: Storyboard aprovado formalmente pelo cliente

Prazo referência: 3–5 dias úteis (incluindo ciclo de revisão)

[DECISÃO] Cliente aprovou storyboard? Sim → definição técnica e cronograma. Não → ajustar e reapresentar (máx. 2x).

5.5. Definição técnica e cronograma de produção

Ação: Definir especificações finais: resolução (1920×1080 ou 4K), FPS (25 ou 30), duração total, número de cenas; listar todas as cenas com estimativa de horas de produção; criar cronograma detalhado no TBO OS com responsáveis e datas; comunicar ao time de produção.

Responsável: Gerente de Projetos + Visualizador 3D Sênior

Output: Documento técnico e cronograma de produção criados e distribuídos

Prazo referência: 4 h

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Briefing documentado e validado pelo cliente. [ ] Roteiro com sequência lógica de cenas (fachada → acesso → ambientes comuns → unidade tipo). [ ] Storyboard com todos os ângulos de câmera especificados. [ ] Duração total coerente com escopo (animação padrão: 2–4 min). [ ] Aprovação formal do cliente registrada. [ ] Cronograma criado no TBO OS com marcos e datas. [ ] Especificações técnicas documentadas.

6.2 Erros Comuns a Evitar

Briefing incompleto: usar formulário padrão de briefing TBO para garantir que todas as informações sejam coletadas. Storyboard não aprovado antes do início da produção: NUNCA iniciar produção sem aprovação formal — retrabalho em animação é extremamente custoso. Cronograma irreal: consultar Visualizador Sênior para estimar horas antes de comunicar prazo ao cliente.

  7. Ferramentas e Templates

Google Slides (storyboard); Notion ou TBO OS (documentação e aprovações); Miro (mapeamento de cenas colaborativo); Loom (apresentação assíncrona para cliente); Adobe Illustrator (frames do storyboard em vetor).

  8. SLAs e Prazos

Entrega do briefing documentado: 24 h após reunião. Desenvolvimento do roteiro: 1 dia útil. Criação do storyboard: 2 dias úteis. Ciclo de aprovação do cliente: até 5 dias úteis. Entrega do cronograma de produção: 1 dia útil após aprovação do storyboard.

  9. Fluxograma

Início → Reunião de briefing → Documentação do briefing → Desenvolvimento do roteiro → [Roteiro aprovado internamente?] → Não: Revisar → Sim: Criação do storyboard → Apresentação ao cliente → [Cliente aprova storyboard?] → Não: Ajustes (max 2x) → Sim: Definição técnica + cronograma → Início da Produção (SOP 10) → Fim

  10. Glossário

Storyboard: sequência de frames ilustrados que representam visualmente cada cena da animação. Animatic: versão simplificada da animação com storyboard em movimento, para validar ritmo e timing. Voice-over: narração em áudio sobreposta à animação. FPS: Frames Per Second, taxa de quadros por segundo (25 para cinema BR; 30 para digital). Roteiro descritivo: documento textual que descreve cada cena da animação em linguagem não técnica.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Animações 3D — Pré-produção</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-009</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Estruturar e documentar todo o planejamento criativo e técnico de uma animação 3D antes do início da produção, garantindo alinhamento com o cliente, viabilidade técnica e cronograma realista.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Briefing detalhado de animação; criação de roteiro e storyboard; definição técnica (duração, resolução, FPS, estilo visual, trilha sonora); aprovação do storyboard pelo cliente; planejamento de câmeras e cenas; cronograma de produção.</p><p><strong>2.2 Exclusões</strong></p><p>Modelagem e texturização (cobertos pelo SOP 02); animação e render de cenas (cobertos pelo SOP 10); edição e trilha sonora (cobertos pelo SOP 11).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Liderar briefing criativo, validar roteiro e aprovar storyboard</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Desenvolver storyboard técnico e validar viabilidade de produção</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Conduzir reunião de briefing com cliente, documentar e distribuir</p></td><td><p>Responsável</p></td><td><p>Informado</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Aprovar roteiro, storyboard e cronograma antes do início da produção</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contrato assinado com escopo de animação definido; modelos 3D do empreendimento finalizados ou em produção; referências de animações de arquitetura fornecidas pelo cliente; logomarca e identidade visual do empreendimento.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Slides ou Keynote (apresentação do storyboard); Adobe Illustrator ou Photoshop (frames do storyboard); frame.io ou Loom (apresentação remota ao cliente); TBO OS (gestão de tarefas e aprovações); Shotcut ou Premiere Pro (para animatic de referência).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Reunião de briefing de animação</strong></p><p>Ação: Conduzir reunião de briefing com o cliente (presencial ou remota); levantar: objetivo da animação, público-alvo, duração desejada, ambientes a mostrar, pontos de destaque do empreendimento, trilha sonora (animação com voice-over, música ambiente, sem áudio), prazo de entrega e aprovações.</p><p>Responsável: Gerente de Projetos + Dir. Criativo</p><p>Output: Briefing de animação documentado e assinado pelo cliente</p><p>Prazo referência: 1–2 h (reunião) + 30 min (documentação)</p><p><strong>5.2. Desenvolvimento do roteiro</strong></p><p>Ação: Com base no briefing, escrever roteiro descritivo da animação: sequência de cenas, duração estimada de cada cena, movimentos de câmera, o que é destacado em cada momento, transições; incluir texto de voice-over ou legenda se aplicável.</p><p>Responsável: Diretor Criativo</p><p>Output: Roteiro de animação aprovado internamente</p><p>Prazo referência: 1 dia útil</p><p><strong>[DECISÃO] Roteiro aprovado pelo Dir. Criativo? Sim → storyboard. Não → revisar narrativa.</strong></p><p><strong>5.3. Criação do storyboard</strong></p><p>Ação: Criar storyboard frame a frame (mínimo 1 frame por cena): desenhos ou renders de preview mostrando composição, ângulo de câmera, foco e movimento; indicar direção de movimento com setas; indicar duração de cada cena; montar apresentação visual para o cliente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Storyboard completo em apresentação (PDF ou Slides)</p><p>Prazo referência: 1–2 dias úteis</p><p><strong>5.4. Aprovação do storyboard pelo cliente</strong></p><p>Ação: Apresentar storyboard ao cliente (reunião ou envio via TBO OS); coletar feedback; realizar ajustes (máx. 2 rodadas inclusas no escopo); obter aprovação formal por escrito (e-mail ou assinatura na plataforma) antes de iniciar produção.</p><p>Responsável: Gerente de Projetos</p><p>Output: Storyboard aprovado formalmente pelo cliente</p><p>Prazo referência: 3–5 dias úteis (incluindo ciclo de revisão)</p><p><strong>[DECISÃO] Cliente aprovou storyboard? Sim → definição técnica e cronograma. Não → ajustar e reapresentar (máx. 2x).</strong></p><p><strong>5.5. Definição técnica e cronograma de produção</strong></p><p>Ação: Definir especificações finais: resolução (1920×1080 ou 4K), FPS (25 ou 30), duração total, número de cenas; listar todas as cenas com estimativa de horas de produção; criar cronograma detalhado no TBO OS com responsáveis e datas; comunicar ao time de produção.</p><p>Responsável: Gerente de Projetos + Visualizador 3D Sênior</p><p>Output: Documento técnico e cronograma de produção criados e distribuídos</p><p>Prazo referência: 4 h</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Briefing documentado e validado pelo cliente. [ ] Roteiro com sequência lógica de cenas (fachada → acesso → ambientes comuns → unidade tipo). [ ] Storyboard com todos os ângulos de câmera especificados. [ ] Duração total coerente com escopo (animação padrão: 2–4 min). [ ] Aprovação formal do cliente registrada. [ ] Cronograma criado no TBO OS com marcos e datas. [ ] Especificações técnicas documentadas.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Briefing incompleto: usar formulário padrão de briefing TBO para garantir que todas as informações sejam coletadas. Storyboard não aprovado antes do início da produção: NUNCA iniciar produção sem aprovação formal — retrabalho em animação é extremamente custoso. Cronograma irreal: consultar Visualizador Sênior para estimar horas antes de comunicar prazo ao cliente.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Slides (storyboard); Notion ou TBO OS (documentação e aprovações); Miro (mapeamento de cenas colaborativo); Loom (apresentação assíncrona para cliente); Adobe Illustrator (frames do storyboard em vetor).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Entrega do briefing documentado: 24 h após reunião. Desenvolvimento do roteiro: 1 dia útil. Criação do storyboard: 2 dias úteis. Ciclo de aprovação do cliente: até 5 dias úteis. Entrega do cronograma de produção: 1 dia útil após aprovação do storyboard.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Reunião de briefing → Documentação do briefing → Desenvolvimento do roteiro → [Roteiro aprovado internamente?] → Não: Revisar → Sim: Criação do storyboard → Apresentação ao cliente → [Cliente aprova storyboard?] → Não: Ajustes (max 2x) → Sim: Definição técnica + cronograma → Início da Produção (SOP 10) → Fim</p><p><strong>  10. Glossário</strong></p><p>Storyboard: sequência de frames ilustrados que representam visualmente cada cena da animação. Animatic: versão simplificada da animação com storyboard em movimento, para validar ritmo e timing. Voice-over: narração em áudio sobreposta à animação. FPS: Frames Per Second, taxa de quadros por segundo (25 para cinema BR; 30 para digital). Roteiro descritivo: documento textual que descreve cada cena da animação em linguagem não técnica.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-3D-009
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Estruturar e documentar todo o planejamento criativo e técnico de uma animação 3D antes do início da produção, garantindo alinhamento com o cliente, viabilidade técnica e cronograma realista.', '<p>Estruturar e documentar todo o planejamento criativo e técnico de uma animação 3D antes do início da produção, garantindo alinhamento com o cliente, viabilidade técnica e cronograma realista.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Briefing detalhado de animação; criação de roteiro e storyboard; definição técnica (duração, resolução, FPS, estilo visual, trilha sonora); aprovação do storyboard pelo cliente; planejamento de câmeras e cenas; cronograma de produção.', '<p>Briefing detalhado de animação; criação de roteiro e storyboard; definição técnica (duração, resolução, FPS, estilo visual, trilha sonora); aprovação do storyboard pelo cliente; planejamento de câmeras e cenas; cronograma de produção.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Modelagem e texturização (cobertos pelo SOP 02); animação e render de cenas (cobertos pelo SOP 10); edição e trilha sonora (cobertos pelo SOP 11).', '<p>Modelagem e texturização (cobertos pelo SOP 02); animação e render de cenas (cobertos pelo SOP 10); edição e trilha sonora (cobertos pelo SOP 11).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Diretor Criativo (Marco Andolfato)

Liderar briefing criativo, validar roteiro e aprovar storyboard

Aprovador

—

Visualizador 3D Sênior

Desenvolver storyboard técnico e validar viabilidade de produção

Responsável

—

Gerente de Projetos

Conduzir reunião de briefing com cliente, documentar e distribuir

Responsável

Informado

Cliente / Incorporadora

Aprovar roteiro, storyboard e cronograma antes do início da produção

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Liderar briefing criativo, validar roteiro e aprovar storyboard</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Desenvolver storyboard técnico e validar viabilidade de produção</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Conduzir reunião de briefing com cliente, documentar e distribuir</p></td><td><p>Responsável</p></td><td><p>Informado</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Aprovar roteiro, storyboard e cronograma antes do início da produção</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado com escopo de animação definido; modelos 3D do empreendimento finalizados ou em produção; referências de animações de arquitetura fornecidas pelo cliente; logomarca e identidade visual do empreendimento.', '<p>Contrato assinado com escopo de animação definido; modelos 3D do empreendimento finalizados ou em produção; referências de animações de arquitetura fornecidas pelo cliente; logomarca e identidade visual do empreendimento.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Slides ou Keynote (apresentação do storyboard); Adobe Illustrator ou Photoshop (frames do storyboard); frame.io ou Loom (apresentação remota ao cliente); TBO OS (gestão de tarefas e aprovações); Shotcut ou Premiere Pro (para animatic de referência).', '<p>Google Slides ou Keynote (apresentação do storyboard); Adobe Illustrator ou Photoshop (frames do storyboard); frame.io ou Loom (apresentação remota ao cliente); TBO OS (gestão de tarefas e aprovações); Shotcut ou Premiere Pro (para animatic de referência).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Reunião de briefing de animação', 'Ação: Conduzir reunião de briefing com o cliente (presencial ou remota); levantar: objetivo da animação, público-alvo, duração desejada, ambientes a mostrar, pontos de destaque do empreendimento, trilha sonora (animação com voice-over, música ambiente, sem áudio), prazo de entrega e aprovações.

Responsável: Gerente de Projetos + Dir. Criativo

Output: Briefing de animação documentado e assinado pelo cliente

Prazo referência: 1–2 h (reunião) + 30 min (documentação)', '<p>Ação: Conduzir reunião de briefing com o cliente (presencial ou remota); levantar: objetivo da animação, público-alvo, duração desejada, ambientes a mostrar, pontos de destaque do empreendimento, trilha sonora (animação com voice-over, música ambiente, sem áudio), prazo de entrega e aprovações.</p><p>Responsável: Gerente de Projetos + Dir. Criativo</p><p>Output: Briefing de animação documentado e assinado pelo cliente</p><p>Prazo referência: 1–2 h (reunião) + 30 min (documentação)</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Desenvolvimento do roteiro', 'Ação: Com base no briefing, escrever roteiro descritivo da animação: sequência de cenas, duração estimada de cada cena, movimentos de câmera, o que é destacado em cada momento, transições; incluir texto de voice-over ou legenda se aplicável.

Responsável: Diretor Criativo

Output: Roteiro de animação aprovado internamente

Prazo referência: 1 dia útil

[DECISÃO] Roteiro aprovado pelo Dir. Criativo? Sim → storyboard. Não → revisar narrativa.', '<p>Ação: Com base no briefing, escrever roteiro descritivo da animação: sequência de cenas, duração estimada de cada cena, movimentos de câmera, o que é destacado em cada momento, transições; incluir texto de voice-over ou legenda se aplicável.</p><p>Responsável: Diretor Criativo</p><p>Output: Roteiro de animação aprovado internamente</p><p>Prazo referência: 1 dia útil</p><p><strong>[DECISÃO] Roteiro aprovado pelo Dir. Criativo? Sim → storyboard. Não → revisar narrativa.</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Criação do storyboard', 'Ação: Criar storyboard frame a frame (mínimo 1 frame por cena): desenhos ou renders de preview mostrando composição, ângulo de câmera, foco e movimento; indicar direção de movimento com setas; indicar duração de cada cena; montar apresentação visual para o cliente.

Responsável: Visualizador 3D Sênior

Output: Storyboard completo em apresentação (PDF ou Slides)

Prazo referência: 1–2 dias úteis', '<p>Ação: Criar storyboard frame a frame (mínimo 1 frame por cena): desenhos ou renders de preview mostrando composição, ângulo de câmera, foco e movimento; indicar direção de movimento com setas; indicar duração de cada cena; montar apresentação visual para o cliente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Storyboard completo em apresentação (PDF ou Slides)</p><p>Prazo referência: 1–2 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Aprovação do storyboard pelo cliente', 'Ação: Apresentar storyboard ao cliente (reunião ou envio via TBO OS); coletar feedback; realizar ajustes (máx. 2 rodadas inclusas no escopo); obter aprovação formal por escrito (e-mail ou assinatura na plataforma) antes de iniciar produção.

Responsável: Gerente de Projetos

Output: Storyboard aprovado formalmente pelo cliente

Prazo referência: 3–5 dias úteis (incluindo ciclo de revisão)

[DECISÃO] Cliente aprovou storyboard? Sim → definição técnica e cronograma. Não → ajustar e reapresentar (máx. 2x).', '<p>Ação: Apresentar storyboard ao cliente (reunião ou envio via TBO OS); coletar feedback; realizar ajustes (máx. 2 rodadas inclusas no escopo); obter aprovação formal por escrito (e-mail ou assinatura na plataforma) antes de iniciar produção.</p><p>Responsável: Gerente de Projetos</p><p>Output: Storyboard aprovado formalmente pelo cliente</p><p>Prazo referência: 3–5 dias úteis (incluindo ciclo de revisão)</p><p><strong>[DECISÃO] Cliente aprovou storyboard? Sim → definição técnica e cronograma. Não → ajustar e reapresentar (máx. 2x).</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Definição técnica e cronograma de produção', 'Ação: Definir especificações finais: resolução (1920×1080 ou 4K), FPS (25 ou 30), duração total, número de cenas; listar todas as cenas com estimativa de horas de produção; criar cronograma detalhado no TBO OS com responsáveis e datas; comunicar ao time de produção.

Responsável: Gerente de Projetos + Visualizador 3D Sênior

Output: Documento técnico e cronograma de produção criados e distribuídos

Prazo referência: 4 h', '<p>Ação: Definir especificações finais: resolução (1920×1080 ou 4K), FPS (25 ou 30), duração total, número de cenas; listar todas as cenas com estimativa de horas de produção; criar cronograma detalhado no TBO OS com responsáveis e datas; comunicar ao time de produção.</p><p>Responsável: Gerente de Projetos + Visualizador 3D Sênior</p><p>Output: Documento técnico e cronograma de produção criados e distribuídos</p><p>Prazo referência: 4 h</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Briefing documentado e validado pelo cliente. [ ] Roteiro com sequência lógica de cenas (fachada → acesso → ambientes comuns → unidade tipo). [ ] Storyboard com todos os ângulos de câmera especificados. [ ] Duração total coerente com escopo (animação padrão: 2–4 min). [ ] Aprovação formal do cliente registrada. [ ] Cronograma criado no TBO OS com marcos e datas. [ ] Especificações técnicas documentadas.', '<p>[ ] Briefing documentado e validado pelo cliente. [ ] Roteiro com sequência lógica de cenas (fachada → acesso → ambientes comuns → unidade tipo). [ ] Storyboard com todos os ângulos de câmera especificados. [ ] Duração total coerente com escopo (animação padrão: 2–4 min). [ ] Aprovação formal do cliente registrada. [ ] Cronograma criado no TBO OS com marcos e datas. [ ] Especificações técnicas documentadas.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Briefing incompleto: usar formulário padrão de briefing TBO para garantir que todas as informações sejam coletadas. Storyboard não aprovado antes do início da produção: NUNCA iniciar produção sem aprovação formal — retrabalho em animação é extremamente custoso. Cronograma irreal: consultar Visualizador Sênior para estimar horas antes de comunicar prazo ao cliente.', '<p>Briefing incompleto: usar formulário padrão de briefing TBO para garantir que todas as informações sejam coletadas. Storyboard não aprovado antes do início da produção: NUNCA iniciar produção sem aprovação formal — retrabalho em animação é extremamente custoso. Cronograma irreal: consultar Visualizador Sênior para estimar horas antes de comunicar prazo ao cliente.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Slides (storyboard); Notion ou TBO OS (documentação e aprovações); Miro (mapeamento de cenas colaborativo); Loom (apresentação assíncrona para cliente); Adobe Illustrator (frames do storyboard em vetor).', '<p>Google Slides (storyboard); Notion ou TBO OS (documentação e aprovações); Miro (mapeamento de cenas colaborativo); Loom (apresentação assíncrona para cliente); Adobe Illustrator (frames do storyboard em vetor).</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Entrega do briefing documentado: 24 h após reunião. Desenvolvimento do roteiro: 1 dia útil. Criação do storyboard: 2 dias úteis. Ciclo de aprovação do cliente: até 5 dias úteis. Entrega do cronograma de produção: 1 dia útil após aprovação do storyboard.', '<p>Entrega do briefing documentado: 24 h após reunião. Desenvolvimento do roteiro: 1 dia útil. Criação do storyboard: 2 dias úteis. Ciclo de aprovação do cliente: até 5 dias úteis. Entrega do cronograma de produção: 1 dia útil após aprovação do storyboard.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Reunião de briefing → Documentação do briefing → Desenvolvimento do roteiro → [Roteiro aprovado internamente?] → Não: Revisar → Sim: Criação do storyboard → Apresentação ao cliente → [Cliente aprova storyboard?] → Não: Ajustes (max 2x) → Sim: Definição técnica + cronograma → Início da Produção (SOP 10) → Fim', '<p>Início → Reunião de briefing → Documentação do briefing → Desenvolvimento do roteiro → [Roteiro aprovado internamente?] → Não: Revisar → Sim: Criação do storyboard → Apresentação ao cliente → [Cliente aprova storyboard?] → Não: Ajustes (max 2x) → Sim: Definição técnica + cronograma → Início da Produção (SOP 10) → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Storyboard: sequência de frames ilustrados que representam visualmente cada cena da animação. Animatic: versão simplificada da animação com storyboard em movimento, para validar ritmo e timing. Voice-over: narração em áudio sobreposta à animação. FPS: Frames Per Second, taxa de quadros por segundo (25 para cinema BR; 30 para digital). Roteiro descritivo: documento textual que descreve cada cena da animação em linguagem não técnica.', '<p>Storyboard: sequência de frames ilustrados que representam visualmente cada cena da animação. Animatic: versão simplificada da animação com storyboard em movimento, para validar ritmo e timing. Voice-over: narração em áudio sobreposta à animação. FPS: Frames Per Second, taxa de quadros por segundo (25 para cinema BR; 30 para digital). Roteiro descritivo: documento textual que descreve cada cena da animação em linguagem não técnica.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-3D-010: Animações 3D Produção ──
END $$;
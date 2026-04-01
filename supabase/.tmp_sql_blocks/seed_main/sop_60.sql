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
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
    'Precificação e Proposta Comercial',
    'tbo-ops-006-precificacao-e-proposta-comercial',
    'operacoes',
    'checklist',
    'Precificação e Proposta Comercial',
    'Standard Operating Procedure

Precificação e Proposta Comercial

Código

TBO-OPS-006

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

Garantir que toda proposta comercial da TBO seja elaborada com precificação consistente, margem adequada por BU, apresentação profissional e aprovação interna de Marco antes do envio ao cliente.

  2. Escopo

2.1 O que está coberto

Recebimento de solicitação comercial, estimativa de esforço por BU, cálculo de preço com base em tabela interna, elaboração do documento de proposta e envio ao cliente.

2.2 Exclusões

Negociação de contratos e aspectos jurídicos (assessoria jurídica), onboarding do cliente após aceite (SOP OPS-02), execução dos projetos (SOPs de BU).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coletar informações, calcular estimativa, montar documento de proposta

Executor

—

Marco Andolfato

Validar escopo, aprovar precificação, assinar proposta final

Aprovador

—

Líder de BU

Estimar esforço técnico e prazo realista por tipo de entrega

Consultado

—

Cliente / Prospect

Fornecer briefing comercial, receber e analisar proposta

Informado

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Briefing comercial do cliente (tipo de projeto, escopo desejado, prazo, volume); tabela de precificação interna TBO atualizada; disponibilidade de equipe para o período.

4.2 Ferramentas e Acessos

Planilha de precificação TBO (Google Sheets), template de proposta (Google Slides ou Canva), Google Drive, e-mail corporativo.



  5. Procedimento Passo a Passo

5.1. Recebimento e Análise do Briefing Comercial

Ação: Carol recebe demanda comercial (via indicação, inbound ou prospecção ativa); realiza call de 30min com prospect para entender escopo, prazo, volume e expectativa de investimento; registra no CRM/planilha.

Responsável: Carol (Ops) + Marco Andolfato

Output: Briefing comercial registrado

Prazo referência: Dia 1

5.2. Estimativa de Esforço por BU

Ação: Carol consulta líderes de BU envolvidos para estimar horas/dias de trabalho por fase; verificar disponibilidade de equipe e câmeras/equipamentos para o prazo solicitado; registrar estimativas na planilha.

Responsável: Carol (Ops) + Líderes de BU

Output: Estimativa de esforço por BU validada

Prazo referência: Dia 2

5.3. Cálculo de Preço

Ação: Carol aplica tabela de precificação interna: custo por hora/entregável por BU, custos diretos (locações, atores, equipamentos externos, licenças de trilha), overhead e margem alvo. Marco revisa e ajusta conforme estratégia de precificação (cliente novo, volume, urgência).

Responsável: Carol (Ops) + Marco Andolfato

Output: Preço calculado e aprovado por Marco

Prazo referência: Dia 2–3

5.4. Elaboração da Proposta

Ação: Carol monta documento de proposta no template TBO: apresentação da agência (1 slide), compreensão do briefing, escopo detalhado por entregável, investimento por item e total, prazo de execução, condições de pagamento, validade da proposta (15 dias).

Responsável: Carol (Ops)

Output: Proposta elaborada em PDF

Prazo referência: Dia 3–4

5.5. Aprovação Interna e Envio

Ação: Marco revisa proposta final: checagem de escopo, preço, prazo e linguagem; assina digitalmente ou aprova por e-mail interno; Carol envia ao prospect com e-mail de encaminhamento personalizado e agenda follow-up em 48h.

Responsável: Marco Andolfato + Carol (Ops)

Output: Proposta enviada ao cliente

Prazo referência: Dia 4–5

5.6. Follow-up e Fechamento

Ação: Carol realiza follow-up em 48h após envio; registra resposta no CRM; se aceita: inicia SOP OPS-02 (Onboarding de Cliente); se negada: registrar motivo para análise; se negociação: escalar para Marco.

Responsável: Carol (Ops) + Marco Andolfato

Output: Proposta aceita → contrato iniciado / Negada → motivo registrado

Prazo referência: Dia 7 (2 dias após envio)

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Briefing comercial documentado antes de qualquer cálculo; [ ] Margem mínima por BU respeitada; [ ] Proposta aprovada por Marco antes do envio; [ ] Template de proposta TBO utilizado (sem versões genéricas); [ ] Prazo de validade de 15 dias incluído; [ ] Follow-up agendado no momento do envio.

6.2 Erros Comuns a Evitar

Proposta enviada sem aprovação de Marco → preço abaixo da margem mínima. Estimativa de esforço sem consultar BU → prazo inexequível. Proposta genérica sem customização → taxa de conversão baixa. Follow-up não realizado → perda de venda por inércia.

  7. Ferramentas e Templates

Google Sheets (precificação), Google Slides / Canva (template proposta), Google Drive, Gmail, CRM (planilha ou ferramenta).

  8. SLAs e Prazos

Proposta enviada: até 5 dias úteis após briefing comercial. Follow-up: 48h após envio. Validade da proposta: 15 dias corridos.

  9. Fluxograma

Início → Briefing Comercial → Estimativa de Esforço (BUs) → Cálculo de Preço → Marco Aprova → Elaboração da Proposta → Marco Revisa e Aprova → Envio ao Cliente → Follow-up 48h → Aceite → Onboarding (SOP OPS-02) / Negada → Registro → Fim

  10. Glossário

Margem: diferença percentual entre receita e custos diretos+overhead. Overhead: custos indiretos da agência (aluguel, software, admin). Follow-up: contato proativo para verificar decisão do cliente. Validade da proposta: período durante o qual os valores são garantidos.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Precificação e Proposta Comercial</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-OPS-006</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Operações</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Garantir que toda proposta comercial da TBO seja elaborada com precificação consistente, margem adequada por BU, apresentação profissional e aprovação interna de Marco antes do envio ao cliente.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Recebimento de solicitação comercial, estimativa de esforço por BU, cálculo de preço com base em tabela interna, elaboração do documento de proposta e envio ao cliente.</p><p><strong>2.2 Exclusões</strong></p><p>Negociação de contratos e aspectos jurídicos (assessoria jurídica), onboarding do cliente após aceite (SOP OPS-02), execução dos projetos (SOPs de BU).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coletar informações, calcular estimativa, montar documento de proposta</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Validar escopo, aprovar precificação, assinar proposta final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Líder de BU</p></td><td><p>Estimar esforço técnico e prazo realista por tipo de entrega</p></td><td><p>Consultado</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Prospect</p></td><td><p>Fornecer briefing comercial, receber e analisar proposta</p></td><td><p>Informado</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Briefing comercial do cliente (tipo de projeto, escopo desejado, prazo, volume); tabela de precificação interna TBO atualizada; disponibilidade de equipe para o período.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Planilha de precificação TBO (Google Sheets), template de proposta (Google Slides ou Canva), Google Drive, e-mail corporativo.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Recebimento e Análise do Briefing Comercial</strong></p><p>Ação: Carol recebe demanda comercial (via indicação, inbound ou prospecção ativa); realiza call de 30min com prospect para entender escopo, prazo, volume e expectativa de investimento; registra no CRM/planilha.</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Briefing comercial registrado</p><p>Prazo referência: Dia 1</p><p><strong>5.2. Estimativa de Esforço por BU</strong></p><p>Ação: Carol consulta líderes de BU envolvidos para estimar horas/dias de trabalho por fase; verificar disponibilidade de equipe e câmeras/equipamentos para o prazo solicitado; registrar estimativas na planilha.</p><p>Responsável: Carol (Ops) + Líderes de BU</p><p>Output: Estimativa de esforço por BU validada</p><p>Prazo referência: Dia 2</p><p><strong>5.3. Cálculo de Preço</strong></p><p>Ação: Carol aplica tabela de precificação interna: custo por hora/entregável por BU, custos diretos (locações, atores, equipamentos externos, licenças de trilha), overhead e margem alvo. Marco revisa e ajusta conforme estratégia de precificação (cliente novo, volume, urgência).</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Preço calculado e aprovado por Marco</p><p>Prazo referência: Dia 2–3</p><p><strong>5.4. Elaboração da Proposta</strong></p><p>Ação: Carol monta documento de proposta no template TBO: apresentação da agência (1 slide), compreensão do briefing, escopo detalhado por entregável, investimento por item e total, prazo de execução, condições de pagamento, validade da proposta (15 dias).</p><p>Responsável: Carol (Ops)</p><p>Output: Proposta elaborada em PDF</p><p>Prazo referência: Dia 3–4</p><p><strong>5.5. Aprovação Interna e Envio</strong></p><p>Ação: Marco revisa proposta final: checagem de escopo, preço, prazo e linguagem; assina digitalmente ou aprova por e-mail interno; Carol envia ao prospect com e-mail de encaminhamento personalizado e agenda follow-up em 48h.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Proposta enviada ao cliente</p><p>Prazo referência: Dia 4–5</p><p><strong>5.6. Follow-up e Fechamento</strong></p><p>Ação: Carol realiza follow-up em 48h após envio; registra resposta no CRM; se aceita: inicia SOP OPS-02 (Onboarding de Cliente); se negada: registrar motivo para análise; se negociação: escalar para Marco.</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Proposta aceita → contrato iniciado / Negada → motivo registrado</p><p>Prazo referência: Dia 7 (2 dias após envio)</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Briefing comercial documentado antes de qualquer cálculo; [ ] Margem mínima por BU respeitada; [ ] Proposta aprovada por Marco antes do envio; [ ] Template de proposta TBO utilizado (sem versões genéricas); [ ] Prazo de validade de 15 dias incluído; [ ] Follow-up agendado no momento do envio.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Proposta enviada sem aprovação de Marco → preço abaixo da margem mínima. Estimativa de esforço sem consultar BU → prazo inexequível. Proposta genérica sem customização → taxa de conversão baixa. Follow-up não realizado → perda de venda por inércia.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Sheets (precificação), Google Slides / Canva (template proposta), Google Drive, Gmail, CRM (planilha ou ferramenta).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Proposta enviada: até 5 dias úteis após briefing comercial. Follow-up: 48h após envio. Validade da proposta: 15 dias corridos.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing Comercial → Estimativa de Esforço (BUs) → Cálculo de Preço → Marco Aprova → Elaboração da Proposta → Marco Revisa e Aprova → Envio ao Cliente → Follow-up 48h → Aceite → Onboarding (SOP OPS-02) / Negada → Registro → Fim</p><p><strong>  10. Glossário</strong></p><p>Margem: diferença percentual entre receita e custos diretos+overhead. Overhead: custos indiretos da agência (aluguel, software, admin). Follow-up: contato proativo para verificar decisão do cliente. Validade da proposta: período durante o qual os valores são garantidos.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['operacoes','processo','gestao','entrega','qualidade','cliente']::TEXT[],
    5,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-OPS-006
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que toda proposta comercial da TBO seja elaborada com precificação consistente, margem adequada por BU, apresentação profissional e aprovação interna de Marco antes do envio ao cliente.', '<p>Garantir que toda proposta comercial da TBO seja elaborada com precificação consistente, margem adequada por BU, apresentação profissional e aprovação interna de Marco antes do envio ao cliente.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Recebimento de solicitação comercial, estimativa de esforço por BU, cálculo de preço com base em tabela interna, elaboração do documento de proposta e envio ao cliente.', '<p>Recebimento de solicitação comercial, estimativa de esforço por BU, cálculo de preço com base em tabela interna, elaboração do documento de proposta e envio ao cliente.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Negociação de contratos e aspectos jurídicos (assessoria jurídica), onboarding do cliente após aceite (SOP OPS-02), execução dos projetos (SOPs de BU).', '<p>Negociação de contratos e aspectos jurídicos (assessoria jurídica), onboarding do cliente após aceite (SOP OPS-02), execução dos projetos (SOPs de BU).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coletar informações, calcular estimativa, montar documento de proposta

Executor

—

Marco Andolfato

Validar escopo, aprovar precificação, assinar proposta final

Aprovador

—

Líder de BU

Estimar esforço técnico e prazo realista por tipo de entrega

Consultado

—

Cliente / Prospect

Fornecer briefing comercial, receber e analisar proposta

Informado

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coletar informações, calcular estimativa, montar documento de proposta</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Validar escopo, aprovar precificação, assinar proposta final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Líder de BU</p></td><td><p>Estimar esforço técnico e prazo realista por tipo de entrega</p></td><td><p>Consultado</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Prospect</p></td><td><p>Fornecer briefing comercial, receber e analisar proposta</p></td><td><p>Informado</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Briefing comercial do cliente (tipo de projeto, escopo desejado, prazo, volume); tabela de precificação interna TBO atualizada; disponibilidade de equipe para o período.', '<p>Briefing comercial do cliente (tipo de projeto, escopo desejado, prazo, volume); tabela de precificação interna TBO atualizada; disponibilidade de equipe para o período.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Planilha de precificação TBO (Google Sheets), template de proposta (Google Slides ou Canva), Google Drive, e-mail corporativo.', '<p>Planilha de precificação TBO (Google Sheets), template de proposta (Google Slides ou Canva), Google Drive, e-mail corporativo.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Recebimento e Análise do Briefing Comercial', 'Ação: Carol recebe demanda comercial (via indicação, inbound ou prospecção ativa); realiza call de 30min com prospect para entender escopo, prazo, volume e expectativa de investimento; registra no CRM/planilha.

Responsável: Carol (Ops) + Marco Andolfato

Output: Briefing comercial registrado

Prazo referência: Dia 1', '<p>Ação: Carol recebe demanda comercial (via indicação, inbound ou prospecção ativa); realiza call de 30min com prospect para entender escopo, prazo, volume e expectativa de investimento; registra no CRM/planilha.</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Briefing comercial registrado</p><p>Prazo referência: Dia 1</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Estimativa de Esforço por BU', 'Ação: Carol consulta líderes de BU envolvidos para estimar horas/dias de trabalho por fase; verificar disponibilidade de equipe e câmeras/equipamentos para o prazo solicitado; registrar estimativas na planilha.

Responsável: Carol (Ops) + Líderes de BU

Output: Estimativa de esforço por BU validada

Prazo referência: Dia 2', '<p>Ação: Carol consulta líderes de BU envolvidos para estimar horas/dias de trabalho por fase; verificar disponibilidade de equipe e câmeras/equipamentos para o prazo solicitado; registrar estimativas na planilha.</p><p>Responsável: Carol (Ops) + Líderes de BU</p><p>Output: Estimativa de esforço por BU validada</p><p>Prazo referência: Dia 2</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Cálculo de Preço', 'Ação: Carol aplica tabela de precificação interna: custo por hora/entregável por BU, custos diretos (locações, atores, equipamentos externos, licenças de trilha), overhead e margem alvo. Marco revisa e ajusta conforme estratégia de precificação (cliente novo, volume, urgência).

Responsável: Carol (Ops) + Marco Andolfato

Output: Preço calculado e aprovado por Marco

Prazo referência: Dia 2–3', '<p>Ação: Carol aplica tabela de precificação interna: custo por hora/entregável por BU, custos diretos (locações, atores, equipamentos externos, licenças de trilha), overhead e margem alvo. Marco revisa e ajusta conforme estratégia de precificação (cliente novo, volume, urgência).</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Preço calculado e aprovado por Marco</p><p>Prazo referência: Dia 2–3</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Elaboração da Proposta', 'Ação: Carol monta documento de proposta no template TBO: apresentação da agência (1 slide), compreensão do briefing, escopo detalhado por entregável, investimento por item e total, prazo de execução, condições de pagamento, validade da proposta (15 dias).

Responsável: Carol (Ops)

Output: Proposta elaborada em PDF

Prazo referência: Dia 3–4', '<p>Ação: Carol monta documento de proposta no template TBO: apresentação da agência (1 slide), compreensão do briefing, escopo detalhado por entregável, investimento por item e total, prazo de execução, condições de pagamento, validade da proposta (15 dias).</p><p>Responsável: Carol (Ops)</p><p>Output: Proposta elaborada em PDF</p><p>Prazo referência: Dia 3–4</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Aprovação Interna e Envio', 'Ação: Marco revisa proposta final: checagem de escopo, preço, prazo e linguagem; assina digitalmente ou aprova por e-mail interno; Carol envia ao prospect com e-mail de encaminhamento personalizado e agenda follow-up em 48h.

Responsável: Marco Andolfato + Carol (Ops)

Output: Proposta enviada ao cliente

Prazo referência: Dia 4–5', '<p>Ação: Marco revisa proposta final: checagem de escopo, preço, prazo e linguagem; assina digitalmente ou aprova por e-mail interno; Carol envia ao prospect com e-mail de encaminhamento personalizado e agenda follow-up em 48h.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Proposta enviada ao cliente</p><p>Prazo referência: Dia 4–5</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Follow-up e Fechamento', 'Ação: Carol realiza follow-up em 48h após envio; registra resposta no CRM; se aceita: inicia SOP OPS-02 (Onboarding de Cliente); se negada: registrar motivo para análise; se negociação: escalar para Marco.

Responsável: Carol (Ops) + Marco Andolfato

Output: Proposta aceita → contrato iniciado / Negada → motivo registrado

Prazo referência: Dia 7 (2 dias após envio)', '<p>Ação: Carol realiza follow-up em 48h após envio; registra resposta no CRM; se aceita: inicia SOP OPS-02 (Onboarding de Cliente); se negada: registrar motivo para análise; se negociação: escalar para Marco.</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Proposta aceita → contrato iniciado / Negada → motivo registrado</p><p>Prazo referência: Dia 7 (2 dias após envio)</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Briefing comercial documentado antes de qualquer cálculo; [ ] Margem mínima por BU respeitada; [ ] Proposta aprovada por Marco antes do envio; [ ] Template de proposta TBO utilizado (sem versões genéricas); [ ] Prazo de validade de 15 dias incluído; [ ] Follow-up agendado no momento do envio.', '<p>[ ] Briefing comercial documentado antes de qualquer cálculo; [ ] Margem mínima por BU respeitada; [ ] Proposta aprovada por Marco antes do envio; [ ] Template de proposta TBO utilizado (sem versões genéricas); [ ] Prazo de validade de 15 dias incluído; [ ] Follow-up agendado no momento do envio.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Proposta enviada sem aprovação de Marco → preço abaixo da margem mínima. Estimativa de esforço sem consultar BU → prazo inexequível. Proposta genérica sem customização → taxa de conversão baixa. Follow-up não realizado → perda de venda por inércia.', '<p>Proposta enviada sem aprovação de Marco → preço abaixo da margem mínima. Estimativa de esforço sem consultar BU → prazo inexequível. Proposta genérica sem customização → taxa de conversão baixa. Follow-up não realizado → perda de venda por inércia.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Sheets (precificação), Google Slides / Canva (template proposta), Google Drive, Gmail, CRM (planilha ou ferramenta).', '<p>Google Sheets (precificação), Google Slides / Canva (template proposta), Google Drive, Gmail, CRM (planilha ou ferramenta).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Proposta enviada: até 5 dias úteis após briefing comercial. Follow-up: 48h após envio. Validade da proposta: 15 dias corridos.', '<p>Proposta enviada: até 5 dias úteis após briefing comercial. Follow-up: 48h após envio. Validade da proposta: 15 dias corridos.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing Comercial → Estimativa de Esforço (BUs) → Cálculo de Preço → Marco Aprova → Elaboração da Proposta → Marco Revisa e Aprova → Envio ao Cliente → Follow-up 48h → Aceite → Onboarding (SOP OPS-02) / Negada → Registro → Fim', '<p>Início → Briefing Comercial → Estimativa de Esforço (BUs) → Cálculo de Preço → Marco Aprova → Elaboração da Proposta → Marco Revisa e Aprova → Envio ao Cliente → Follow-up 48h → Aceite → Onboarding (SOP OPS-02) / Negada → Registro → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Margem: diferença percentual entre receita e custos diretos+overhead. Overhead: custos indiretos da agência (aluguel, software, admin). Follow-up: contato proativo para verificar decisão do cliente. Validade da proposta: período durante o qual os valores são garantidos.', '<p>Margem: diferença percentual entre receita e custos diretos+overhead. Overhead: custos indiretos da agência (aluguel, software, admin). Follow-up: contato proativo para verificar decisão do cliente. Validade da proposta: período durante o qual os valores são garantidos.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-OPS-007: Controle de Qualidade Geral QA Cross BU ──
END $$;
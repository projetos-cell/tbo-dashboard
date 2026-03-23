-- Seed: relacionamentos (3 SOPs)
DO $$
DECLARE v_sop_id UUID;
BEGIN

  -- TBO-REL-001
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Gestao de Fornecedores', 'tbo-rel-001-gestao-de-fornecedores', 'relacionamentos', 'checklist', 'Marco Andolfato (Dir. Operações)', 'Standard Operating Procedure

Gestão de Fornecedores

Código

TBO-REL-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Relacionamentos (Stakeholders)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Garantir que a TBO trabalhe com fornecedores qualificados, com termos claros, avaliação contínua e backup para serviços críticos.

2. Escopo

2.1 O que está coberto

Cadastro, qualificação, avaliação de performance pós-projeto, revisão trimestral e manutenção de backup.

2.2 Exclusões

Contratação de colaboradores (SOP-RH), parcerias estratégicas (SOP-REL-002), negociação de contratos de clientes (SOP-COM).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco

Consolidar avaliações, decidir manutenção/substituição

Executor

---

PO da BU

Avaliar fornecedor ao final de cada projeto

Executor

---

Carol (Ops)

Manter cadastro atualizado no TBO OS

Consultor

---



4. Pré-requisitos

4.1 Inputs necessários

Lista de fornecedores ativos; critérios de avaliação definidos; histórico de projetos com fornecedores.

4.2 Ferramentas e Acessos

TBO OS (cadastro e avaliação), Google Drive (contratos e SLAs), E-mail.

5. Procedimento Passo a Passo

5.1. Cadastro e Qualificação

Ação: Todo fornecedor recorrente é cadastrado no TBO OS com: razão social, CNPJ, contato, tipo de serviço, condições comerciais, portfólio/referências. Novos fornecedores passam por projeto-piloto antes de receberem escopo > R$ 10.000.

Responsável: Carol (Ops)

Output: Fornecedor cadastrado e qualificado

Prazo referência: Antes do primeiro projeto

5.2. Avaliação Pós-Projeto

Ação: PO da BU avalia ao final de cada projeto: qualidade (1–5), prazo (1–5), comunicação (1–5), custo-benefício (1–5). Registra no TBO OS.

Responsável: PO da BU

Output: Avaliação registrada

Prazo referência: Até 5 dias após entrega

5.3. Revisão Trimestral

Ação: Marco consolida avaliações e decide: manter, renegociar condições ou buscar alternativa. Fornecedores com média < 3.0 entram em observação.

Responsável: Marco

Output: Decisão registrada, ações definidas

Prazo referência: Trimestral

5.4. Manutenção de Backup

Ação: Para cada serviço crítico (render farm, produtora, gráfica, fotógrafo), manter mínimo 2 fornecedores qualificados e testados.

Responsável: Marco + POs

Output: Lista de backup atualizada

Prazo referência: Contínuo

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Fornecedor cadastrado com dados completos no TBO OS

[ ] Avaliação pós-projeto registrada

[ ] Revisão trimestral realizada

[ ] Backup de fornecedores críticos mantido (mín. 2)

6.2 Erros Comuns a Evitar

Fornecedor sem avaliação → decisão baseada em percepção, não em dados

Dependência de fornecedor único → risco operacional alto

Novo fornecedor sem piloto → qualidade desconhecida em projeto real

7. Ferramentas e Templates

TBO OS (cadastro, avaliação), Google Drive (contratos), E-mail.

8. SLAs e Prazos

Cadastro: antes do primeiro projeto

Avaliação: até 5 dias após entrega

Revisão trimestral: a cada 3 meses

Regra: fornecedor novo não recebe projeto > R$ 10k sem piloto

9. Fluxograma

Novo Fornecedor → Cadastro no TBO OS → Projeto-piloto (se > R$ 10k) → Avaliação Pós-Projeto → Média ≥ 3.0? → Sim: Manter → Revisão Trimestral → Fim / Não: Observação → Buscar Alternativa → Fim

10. Glossário

Projeto-piloto: primeiro trabalho de baixo risco com um fornecedor novo.

SLA: Service Level Agreement — acordo de nível de serviço.

Backup: fornecedor alternativo qualificado para substituição em caso de indisponibilidade.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

', 'published', 'medium', ARRAY['relacionamento']::TEXT[], 0, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Garantir que a TBO trabalhe com fornecedores qualificados, com termos claros, avaliação contínua e backup para serviços críticos.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Cadastro, qualificação, avaliação de performance pós-projeto, revisão trimestral e manutenção de backup.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Contratação de colaboradores (SOP-RH), parcerias estratégicas (SOP-REL-002), negociação de contratos de clientes (SOP-COM).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco

Consolidar avaliações, decidir manutenção/substituição

Executor

---

PO da BU

Avaliar fornecedor ao final de cada projeto

Executor

---

Carol (Ops)

Manter cadastro atualizado no TBO OS

Consultor

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Lista de fornecedores ativos; critérios de avaliação definidos; histórico de projetos com fornecedores.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (cadastro e avaliação), Google Drive (contratos e SLAs), E-mail.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Cadastro e Qualificação', 'Ação: Todo fornecedor recorrente é cadastrado no TBO OS com: razão social, CNPJ, contato, tipo de serviço, condições comerciais, portfólio/referências. Novos fornecedores passam por projeto-piloto antes de receberem escopo > R$ 10.000.

Responsável: Carol (Ops)

Output: Fornecedor cadastrado e qualificado

Prazo referência: Antes do primeiro projeto', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Avaliação Pós-Projeto', 'Ação: PO da BU avalia ao final de cada projeto: qualidade (1–5), prazo (1–5), comunicação (1–5), custo-benefício (1–5). Registra no TBO OS.

Responsável: PO da BU

Output: Avaliação registrada

Prazo referência: Até 5 dias após entrega', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Revisão Trimestral', 'Ação: Marco consolida avaliações e decide: manter, renegociar condições ou buscar alternativa. Fornecedores com média < 3.0 entram em observação.

Responsável: Marco

Output: Decisão registrada, ações definidas

Prazo referência: Trimestral', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Manutenção de Backup', 'Ação: Para cada serviço crítico (render farm, produtora, gráfica, fotógrafo), manter mínimo 2 fornecedores qualificados e testados.

Responsável: Marco + POs

Output: Lista de backup atualizada

Prazo referência: Contínuo', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Fornecedor cadastrado com dados completos no TBO OS

[ ] Avaliação pós-projeto registrada

[ ] Revisão trimestral realizada

[ ] Backup de fornecedores críticos mantido (mín. 2)', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Fornecedor sem avaliação → decisão baseada em percepção, não em dados

Dependência de fornecedor único → risco operacional alto

Novo fornecedor sem piloto → qualidade desconhecida em projeto real', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (cadastro, avaliação), Google Drive (contratos), E-mail.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Cadastro: antes do primeiro projeto

Avaliação: até 5 dias após entrega

Revisão trimestral: a cada 3 meses

Regra: fornecedor novo não recebe projeto > R$ 10k sem piloto', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Novo Fornecedor → Cadastro no TBO OS → Projeto-piloto (se > R$ 10k) → Avaliação Pós-Projeto → Média ≥ 3.0? → Sim: Manter → Revisão Trimestral → Fim / Não: Observação → Buscar Alternativa → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Projeto-piloto: primeiro trabalho de baixo risco com um fornecedor novo.

SLA: Service Level Agreement — acordo de nível de serviço.

Backup: fornecedor alternativo qualificado para substituição em caso de indisponibilidade.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

  -- TBO-REL-002
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Parcerias Estrategicas', 'tbo-rel-002-parcerias-estrategicas', 'relacionamentos', 'checklist', 'Estruturar o desenvolvimento de parcerias que ampliem alcance, capacidade e posicionamento da TBO no mercado imobiliário.', 'Standard Operating Procedure

Parcerias Estratégicas

Código

TBO-REL-002

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Relacionamentos (Stakeholders)

Responsável

Ruy Lima (CEO/CMO)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Estruturar o desenvolvimento de parcerias que ampliem alcance, capacidade e posicionamento da TBO no mercado imobiliário.

2. Escopo

2.1 O que está coberto

Identificação de oportunidades, abordagem, formalização e nutrição de parcerias complementares, tecnológicas, institucionais e educacionais.

2.2 Exclusões

Gestão de fornecedores operacionais (SOP-REL-001), prospecção de clientes (SOP-COM-001), gestão de reputação (SOP-REL-003).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Ruy

Identificar, abordar e nutrir parcerias

Executor

---

Marco

Co-avaliar oportunidades e aprovar termos

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

Mapa de stakeholders do setor imobiliário; calendário de eventos; posicionamento estratégico da TBO.

4.2 Ferramentas e Acessos

LinkedIn, Google Meet, TBO OS (registro), E-mail, ClickSign (termos de parceria).

5. Procedimento Passo a Passo

5.1. Identificação (trimestral)

Ação: Ruy e Marco mapeiam oportunidades de parceria. Tipos: complementar (arquitetura, interiores, consultoria de vendas), tecnológica (plataformas, SaaS), institucional (ADEMI, Sinduscon), educacional (universidades, TBO Academy). Critérios: alinhamento de público, complementaridade, reputação, potencial de leads.

Responsável: Ruy + Marco

Output: Lista de oportunidades priorizada

Prazo referência: Trimestral

5.2. Abordagem

Ação: Ruy lidera abordagem via LinkedIn, evento ou indicação. Primeira reunião com pauta: apresentação mútua, oportunidades conjuntas, modelo de colaboração.

Responsável: Ruy

Output: Primeira reunião realizada

Prazo referência: Conforme oportunidade

5.3. Formalização

Ação: Parcerias com implicação financeira (comissão, co-branding, divisão de receita) formalizadas via termo escrito (ClickSign). Parcerias informais registradas no TBO OS.

Responsável: Ruy + Marco

Output: Parceria formalizada ou registrada

Prazo referência: Antes do primeiro projeto conjunto

5.4. Nutrição

Ação: Ruy mantém contato com parceiros-chave a cada 60 dias. Resultados avaliados semestralmente. Se sem geração de valor em 12 meses, reclassificar.

Responsável: Ruy

Output: Parceria ativa e gerando valor

Prazo referência: Contínuo (check a cada 60 dias)

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Mapa de parcerias atualizado trimestralmente

[ ] Parcerias financeiras formalizadas por escrito

[ ] Contato com parceiros-chave a cada 60 dias

[ ] Avaliação semestral de resultados

6.2 Erros Comuns a Evitar

Parceria sem termo escrito → desentendimento sobre comissão ou co-branding

Não nutrir relacionamento → parceria esfria e morre

Muitas parcerias sem foco → dispersão sem resultado

7. Ferramentas e Templates

LinkedIn, Google Meet, TBO OS, ClickSign, E-mail.

8. SLAs e Prazos

Mapeamento: trimestral

Nutrição: contato a cada 60 dias

Avaliação: semestral

Regra: toda parceria com divisão de receita requer termo escrito

9. Fluxograma

Mapeamento Trimestral → Oportunidade Priorizada → Abordagem (Ruy) → Interesse Mútuo? → Sim: Formalização → Nutrição a cada 60d → Avaliação Semestral → Gerando valor? → Sim: Manter / Não: Reclassificar → Fim

10. Glossário

Parceria complementar: empresa que oferece serviço adjacente ao da TBO.

Co-branding: uso conjunto das marcas em ação ou material.

Nutrição: manutenção ativa do relacionamento ao longo do tempo.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

', 'published', 'medium', ARRAY['relacionamento']::TEXT[], 1, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Estruturar o desenvolvimento de parcerias que ampliem alcance, capacidade e posicionamento da TBO no mercado imobiliário.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Identificação de oportunidades, abordagem, formalização e nutrição de parcerias complementares, tecnológicas, institucionais e educacionais.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Gestão de fornecedores operacionais (SOP-REL-001), prospecção de clientes (SOP-COM-001), gestão de reputação (SOP-REL-003).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Ruy

Identificar, abordar e nutrir parcerias

Executor

---

Marco

Co-avaliar oportunidades e aprovar termos

Aprovador

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Mapa de stakeholders do setor imobiliário; calendário de eventos; posicionamento estratégico da TBO.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'LinkedIn, Google Meet, TBO OS (registro), E-mail, ClickSign (termos de parceria).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Identificação (trimestral)', 'Ação: Ruy e Marco mapeiam oportunidades de parceria. Tipos: complementar (arquitetura, interiores, consultoria de vendas), tecnológica (plataformas, SaaS), institucional (ADEMI, Sinduscon), educacional (universidades, TBO Academy). Critérios: alinhamento de público, complementaridade, reputação, potencial de leads.

Responsável: Ruy + Marco

Output: Lista de oportunidades priorizada

Prazo referência: Trimestral', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Abordagem', 'Ação: Ruy lidera abordagem via LinkedIn, evento ou indicação. Primeira reunião com pauta: apresentação mútua, oportunidades conjuntas, modelo de colaboração.

Responsável: Ruy

Output: Primeira reunião realizada

Prazo referência: Conforme oportunidade', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Formalização', 'Ação: Parcerias com implicação financeira (comissão, co-branding, divisão de receita) formalizadas via termo escrito (ClickSign). Parcerias informais registradas no TBO OS.

Responsável: Ruy + Marco

Output: Parceria formalizada ou registrada

Prazo referência: Antes do primeiro projeto conjunto', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Nutrição', 'Ação: Ruy mantém contato com parceiros-chave a cada 60 dias. Resultados avaliados semestralmente. Se sem geração de valor em 12 meses, reclassificar.

Responsável: Ruy

Output: Parceria ativa e gerando valor

Prazo referência: Contínuo (check a cada 60 dias)', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Mapa de parcerias atualizado trimestralmente

[ ] Parcerias financeiras formalizadas por escrito

[ ] Contato com parceiros-chave a cada 60 dias

[ ] Avaliação semestral de resultados', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Parceria sem termo escrito → desentendimento sobre comissão ou co-branding

Não nutrir relacionamento → parceria esfria e morre

Muitas parcerias sem foco → dispersão sem resultado', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'LinkedIn, Google Meet, TBO OS, ClickSign, E-mail.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Mapeamento: trimestral

Nutrição: contato a cada 60 dias

Avaliação: semestral

Regra: toda parceria com divisão de receita requer termo escrito', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Mapeamento Trimestral → Oportunidade Priorizada → Abordagem (Ruy) → Interesse Mútuo? → Sim: Formalização → Nutrição a cada 60d → Avaliação Semestral → Gerando valor? → Sim: Manter / Não: Reclassificar → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Parceria complementar: empresa que oferece serviço adjacente ao da TBO.

Co-branding: uso conjunto das marcas em ação ou material.

Nutrição: manutenção ativa do relacionamento ao longo do tempo.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

  -- TBO-REL-003
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Gestao de Reputacao e Presenca Institucional', 'tbo-rel-003-gestao-de-reputacao-e-presenca-institucional', 'relacionamentos', 'checklist', 'Gestão de Reputação e Presença Institucional', 'Standard Operating Procedure

Gestão de Reputação e Presença Institucional

Código

TBO-REL-003

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Relacionamentos (Stakeholders)

Responsável

Ruy Lima (CEO/CMO)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Manter a presença institucional da TBO ativa e estratégica, posicionando a marca como referência em branding imobiliário.

2. Escopo

2.1 O que está coberto

LinkedIn dos sócios, Instagram @weare.tbo, participação em eventos/palestras e documentação de cases de sucesso.

2.2 Exclusões

Gestão de social media de clientes (SOP-MKT-011), produção de conteúdo de campanha (SOP-BRD-013), lead magnets comerciais (SOP-COM).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Ruy

Conteúdo LinkedIn semanal, avaliação de eventos

Executor

---

Marco

Conteúdo LinkedIn quinzenal (creative direction), documentação de cases

Executor

---

Nelson (PO Branding)

Gestão do Instagram @weare.tbo

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Calendário editorial definido; projetos concluídos para cases; convites de eventos avaliados.

4.2 Ferramentas e Acessos

LinkedIn, Instagram, Google Drive (cases), TBO OS.

5. Procedimento Passo a Passo

5.1. LinkedIn dos Sócios

Ação: Ruy publica semanalmente seguindo calendário editorial. Marco publica quinzenalmente com foco em creative direction e bastidores. Estilo: parágrafos densos, tom consultivo, sem chatgptização.

Responsável: Ruy + Marco

Output: Posts publicados conforme calendário

Prazo referência: Semanal (Ruy), quinzenal (Marco)

5.2. Instagram @weare.tbo

Ação: Nelson gerencia feed com cronograma mensal. Conteúdo: projetos entregues, bastidores, insights. Grid cronológico (1→6, inferior direito ao superior esquerdo). Aprovação de pelo menos um sócio antes de publicar.

Responsável: Nelson (PO Branding)

Output: Feed atualizado conforme cronograma

Prazo referência: Conforme calendário mensal

5.3. Eventos e Palestras

Ação: Ruy e Marco avaliam convites. Critérios: público relevante (decisores de incorporadoras), visibilidade, potencial de leads. Máximo 1 evento por mês para não dispersar.

Responsável: Ruy + Marco

Output: Participação em eventos estratégicos

Prazo referência: Conforme convites

5.4. Cases de Sucesso

Ação: Ao final de cada projeto relevante, Marco documenta: desafio, solução, resultados. Requer autorização escrita do cliente. Publicação em LinkedIn, site e propostas.

Responsável: Marco

Output: Case documentado e publicado

Prazo referência: Até 30 dias após entrega final

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] LinkedIn de Ruy: post semanal publicado

[ ] LinkedIn de Marco: post quinzenal publicado

[ ] Instagram: feed atualizado conforme cronograma mensal

[ ] Cases documentados com autorização do cliente

[ ] Eventos avaliados e participação decidida

6.2 Erros Comuns a Evitar

Publicar sem aprovação de sócio → risco de mensagem desalinhada

Case sem autorização do cliente → violação de confiança

Aceitar muitos eventos → dispersão sem retorno

7. Ferramentas e Templates

LinkedIn, Instagram, Google Drive, TBO OS.

8. SLAs e Prazos

LinkedIn Ruy: semanal

LinkedIn Marco: quinzenal

Instagram: conforme calendário mensal

Cases: até 30 dias após entrega

Regra: nenhum conteúdo institucional sem aprovação de sócio; cases requerem autorização escrita do cliente

9. Fluxograma

Calendário Editorial → Produção de Conteúdo → Aprovação de Sócio → Publicação (LinkedIn/Instagram) → Projeto Entregue? → Sim: Documentar Case → Autorização do Cliente → Publicar Case → Fim

10. Glossário

Case de sucesso: documentação estruturada de um projeto mostrando desafio, solução e resultado.

Calendário editorial: planejamento mensal de conteúdo para redes sociais e LinkedIn.

Grid cronológico: ordem de publicação do feed Instagram (1→6, inferior direito ao superior esquerdo).

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

', 'published', 'medium', ARRAY['relacionamento']::TEXT[], 2, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Manter a presença institucional da TBO ativa e estratégica, posicionando a marca como referência em branding imobiliário.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'LinkedIn dos sócios, Instagram @weare.tbo, participação em eventos/palestras e documentação de cases de sucesso.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Gestão de social media de clientes (SOP-MKT-011), produção de conteúdo de campanha (SOP-BRD-013), lead magnets comerciais (SOP-COM).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Ruy

Conteúdo LinkedIn semanal, avaliação de eventos

Executor

---

Marco

Conteúdo LinkedIn quinzenal (creative direction), documentação de cases

Executor

---

Nelson (PO Branding)

Gestão do Instagram @weare.tbo

Executor

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Calendário editorial definido; projetos concluídos para cases; convites de eventos avaliados.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'LinkedIn, Instagram, Google Drive (cases), TBO OS.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. LinkedIn dos Sócios', 'Ação: Ruy publica semanalmente seguindo calendário editorial. Marco publica quinzenalmente com foco em creative direction e bastidores. Estilo: parágrafos densos, tom consultivo, sem chatgptização.

Responsável: Ruy + Marco

Output: Posts publicados conforme calendário

Prazo referência: Semanal (Ruy), quinzenal (Marco)', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Instagram @weare.tbo', 'Ação: Nelson gerencia feed com cronograma mensal. Conteúdo: projetos entregues, bastidores, insights. Grid cronológico (1→6, inferior direito ao superior esquerdo). Aprovação de pelo menos um sócio antes de publicar.

Responsável: Nelson (PO Branding)

Output: Feed atualizado conforme cronograma

Prazo referência: Conforme calendário mensal', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Eventos e Palestras', 'Ação: Ruy e Marco avaliam convites. Critérios: público relevante (decisores de incorporadoras), visibilidade, potencial de leads. Máximo 1 evento por mês para não dispersar.

Responsável: Ruy + Marco

Output: Participação em eventos estratégicos

Prazo referência: Conforme convites', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Cases de Sucesso', 'Ação: Ao final de cada projeto relevante, Marco documenta: desafio, solução, resultados. Requer autorização escrita do cliente. Publicação em LinkedIn, site e propostas.

Responsável: Marco

Output: Case documentado e publicado

Prazo referência: Até 30 dias após entrega final', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] LinkedIn de Ruy: post semanal publicado

[ ] LinkedIn de Marco: post quinzenal publicado

[ ] Instagram: feed atualizado conforme cronograma mensal

[ ] Cases documentados com autorização do cliente

[ ] Eventos avaliados e participação decidida', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Publicar sem aprovação de sócio → risco de mensagem desalinhada

Case sem autorização do cliente → violação de confiança

Aceitar muitos eventos → dispersão sem retorno', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'LinkedIn, Instagram, Google Drive, TBO OS.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'LinkedIn Ruy: semanal

LinkedIn Marco: quinzenal

Instagram: conforme calendário mensal

Cases: até 30 dias após entrega

Regra: nenhum conteúdo institucional sem aprovação de sócio; cases requerem autorização escrita do cliente', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Calendário Editorial → Produção de Conteúdo → Aprovação de Sócio → Publicação (LinkedIn/Instagram) → Projeto Entregue? → Sim: Documentar Case → Autorização do Cliente → Publicar Case → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Case de sucesso: documentação estruturada de um projeto mostrando desafio, solução e resultado.

Calendário editorial: planejamento mensal de conteúdo para redes sociais e LinkedIn.

Grid cronológico: ordem de publicação do feed Instagram (1→6, inferior direito ao superior esquerdo).', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

END $$;

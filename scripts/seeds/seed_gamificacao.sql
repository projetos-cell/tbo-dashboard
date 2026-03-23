-- Seed: gamificacao (2 SOPs)
DO $$
DECLARE v_sop_id UUID;
BEGIN

  -- TBO-GAM-001
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Maquete Interativa para Vendas', 'tbo-gam-001-maquete-interativa-para-vendas', 'gamificacao', 'checklist', 'Marco Andolfato (Diretor Criativo)', 'Standard Operating Procedure

Maquete Interativa para Vendas

Código

TBO-GAM-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Gamificação

Responsável

Marco Andolfato (Diretor Criativo)

Aprovador

Marco Andolfato



  1. Objetivo

Desenvolver aplicação interativa em tempo real (totem, mesa touch ou web) que permite ao corretor e comprador explorar o empreendimento em 3D, consultar disponibilidade de unidades, visualizar plantas e personalizar acabamentos no stand de vendas.

  2. Escopo

2.1 O que está coberto

Modelagem 3D do empreendimento e entorno, desenvolvimento da aplicação interativa (Unreal Engine ou Three.js/WebGL), integração com tabela de disponibilidade, testes em hardware do stand, entrega e treinamento.

2.2 Exclusões

Fornecimento de hardware (totem, mesa touch) — responsabilidade da incorporadora, integração em tempo real com sistema de CRM para fechamento de venda, manutenção pós-entrega sem contrato de suporte.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção criativa, arquitetura da solução, aprovação final

Aprovador

—

Dev 3D / Artista Técnico

Modelagem, texturização, desenvolvimento da aplicação

Executor

—

Cliente / Incorporadora

Plantas, tabelas de disponibilidade, aprovações

Consultado

Informado

Carol (Ops)

Cronograma, entrega de assets, aceite formal

Executor

—

  4. Pré-requisitos

4.1 Inputs necessários

Plantas completas do empreendimento (DWG ou PDF vetorial); renders aprovados como referência estética; tabela de unidades (bloco, andar, tipologia, metragem, status); identidade visual; especificações do hardware alvo (totem/mesa touch/PC).

4.2 Ferramentas e Acessos

Unreal Engine 5 (preferencial para alto realismo) ou Three.js + WebGL (para aplicação web sem instalação), Blender/3ds Max para modelagem, Adobe Substance Painter para texturas, Git (controle de versão do projeto), Asana.



  5. Procedimento Passo a Passo

5.1. Discovery Técnico e Briefing

Ação: Reunião técnica com cliente: levantar plantas, definir hardware alvo, número de unidades, fluxo de interação desejado (navegar por blocos → andar → unidade → planta → personalização). Marco define arquitetura técnica da solução.

Responsável: Marco Andolfato + Cliente

Output: Documento de escopo técnico aprovado

Prazo referência: Dia 1–3

5.2. Modelagem 3D do Empreendimento

Ação: Modelar maquete 3D do empreendimento (fachada, implantação, apartamentos-tipo por tipologia) a partir das plantas DWG; aplicar texturas realistas e iluminação de dia/noite.

Responsável: Dev 3D

Output: Modelos 3D aprovados esteticamente por Marco

Prazo referência: Dia 4–15

5.3. Desenvolvimento da Aplicação Interativa

Ação: Desenvolver a aplicação no engine definido: navegação 3D, seleção de unidade por andar, popup de informações (metragem, preço, status), visualização de planta, módulo de personalização de acabamento (paletas de revestimento).

Responsável: Dev 3D + Marco

Output: Build alpha funcional para testes internos

Prazo referência: Dia 16–30

5.4. Integração da Tabela de Disponibilidade

Ação: Conectar a aplicação à tabela de unidades (JSON/CSV ou API REST); implementar lógica de status (disponível/reservado/vendido) com atualização manual ou automática; testar fluxo completo.

Responsável: Dev 3D

Output: Disponibilidade integrada e testada

Prazo referência: Dia 28–33

5.5. Testes em Hardware Real e Ajustes de Performance

Ação: Instalar build no hardware do stand; medir framerate (meta: ≥30fps constante), responsividade do touch, fluxo de navegação com corretor real; ajustar LOD, iluminação e UX conforme achados.

Responsável: Dev 3D + Marco

Output: Build beta aprovada em hardware real

Prazo referência: Dia 34–38

5.6. Treinamento e Entrega

Ação: Treinar equipe de corretores e atendentes do stand (1–2h); entregar documentação de operação e guia de atualização da tabela; entregar build final + código-fonte ao cliente; fechar projeto no Asana.

Responsável: Marco Andolfato + Carol (Ops)

Output: Stand operacional, equipe treinada, aceite assinado

Prazo referência: Dia 39–40

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Todas as tipologias de unidade modeladas e testadas; [ ] Tabela de disponibilidade sem unidades com status incorreto; [ ] Framerate ≥30fps no hardware de produção; [ ] Touch/mouse responsivo sem lag perceptível; [ ] Fluxo completo testado por um corretor real antes da entrega; [ ] Documentação de operação entregue.

6.2 Erros Comuns a Evitar

Plantas DWG recebidas com erros → modelagem incorreta, necessidade de retrabalho. Performance insuficiente no hardware → experiência ruim no stand. Tabela de disponibilidade desatualizada → corretor apresenta unidade já vendida (problema grave). Falta de treinamento → equipe não usa a ferramenta.

  7. Ferramentas e Templates

Unreal Engine 5, Blender, 3ds Max, Adobe Substance Painter, Three.js, WebGL, Git, Asana, Google Drive.

  8. SLAs e Prazos

Escopo técnico aprovado: 3 dias. Build alpha: 30 dias úteis. Entrega final: 40 dias úteis pós-início. Inclui: 2 rodadas de revisão estética e 1 sessão de treinamento.

  9. Fluxograma

Início → Discovery Técnico → Escopo Aprovado → Modelagem 3D → Aprovação Estética → Desenvolvimento da Aplicação → Integração de Disponibilidade → Build Alpha (testes internos) → Testes em Hardware Real → Ajustes de Performance → Build Beta Aprovada → Treinamento → Entrega Final → Aceite Formal → Fim

  10. Glossário

LOD: Level of Detail — técnica de otimização que reduz complexidade de modelos distantes. Framerate: quadros por segundo renderizados (FPS). Build: versão compilada e executável da aplicação. Touch: interação por toque em tela sensível. Tipologia: categoria de unidade por número de quartos/área.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['interativo']::TEXT[], 0, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Desenvolver aplicação interativa em tempo real (totem, mesa touch ou web) que permite ao corretor e comprador explorar o empreendimento em 3D, consultar disponibilidade de unidades, visualizar plantas e personalizar acabamentos no stand de vendas.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Modelagem 3D do empreendimento e entorno, desenvolvimento da aplicação interativa (Unreal Engine ou Three.js/WebGL), integração com tabela de disponibilidade, testes em hardware do stand, entrega e treinamento.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Fornecimento de hardware (totem, mesa touch) — responsabilidade da incorporadora, integração em tempo real com sistema de CRM para fechamento de venda, manutenção pós-entrega sem contrato de suporte.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção criativa, arquitetura da solução, aprovação final

Aprovador

—

Dev 3D / Artista Técnico

Modelagem, texturização, desenvolvimento da aplicação

Executor

—

Cliente / Incorporadora

Plantas, tabelas de disponibilidade, aprovações

Consultado

Informado

Carol (Ops)

Cronograma, entrega de assets, aceite formal

Executor

—', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plantas completas do empreendimento (DWG ou PDF vetorial); renders aprovados como referência estética; tabela de unidades (bloco, andar, tipologia, metragem, status); identidade visual; especificações do hardware alvo (totem/mesa touch/PC).', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Unreal Engine 5 (preferencial para alto realismo) ou Three.js + WebGL (para aplicação web sem instalação), Blender/3ds Max para modelagem, Adobe Substance Painter para texturas, Git (controle de versão do projeto), Asana.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Discovery Técnico e Briefing', 'Ação: Reunião técnica com cliente: levantar plantas, definir hardware alvo, número de unidades, fluxo de interação desejado (navegar por blocos → andar → unidade → planta → personalização). Marco define arquitetura técnica da solução.

Responsável: Marco Andolfato + Cliente

Output: Documento de escopo técnico aprovado

Prazo referência: Dia 1–3', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Modelagem 3D do Empreendimento', 'Ação: Modelar maquete 3D do empreendimento (fachada, implantação, apartamentos-tipo por tipologia) a partir das plantas DWG; aplicar texturas realistas e iluminação de dia/noite.

Responsável: Dev 3D

Output: Modelos 3D aprovados esteticamente por Marco

Prazo referência: Dia 4–15', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Desenvolvimento da Aplicação Interativa', 'Ação: Desenvolver a aplicação no engine definido: navegação 3D, seleção de unidade por andar, popup de informações (metragem, preço, status), visualização de planta, módulo de personalização de acabamento (paletas de revestimento).

Responsável: Dev 3D + Marco

Output: Build alpha funcional para testes internos

Prazo referência: Dia 16–30', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Integração da Tabela de Disponibilidade', 'Ação: Conectar a aplicação à tabela de unidades (JSON/CSV ou API REST); implementar lógica de status (disponível/reservado/vendido) com atualização manual ou automática; testar fluxo completo.

Responsável: Dev 3D

Output: Disponibilidade integrada e testada

Prazo referência: Dia 28–33', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Testes em Hardware Real e Ajustes de Performance', 'Ação: Instalar build no hardware do stand; medir framerate (meta: ≥30fps constante), responsividade do touch, fluxo de navegação com corretor real; ajustar LOD, iluminação e UX conforme achados.

Responsável: Dev 3D + Marco

Output: Build beta aprovada em hardware real

Prazo referência: Dia 34–38', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Treinamento e Entrega', 'Ação: Treinar equipe de corretores e atendentes do stand (1–2h); entregar documentação de operação e guia de atualização da tabela; entregar build final + código-fonte ao cliente; fechar projeto no Asana.

Responsável: Marco Andolfato + Carol (Ops)

Output: Stand operacional, equipe treinada, aceite assinado

Prazo referência: Dia 39–40', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todas as tipologias de unidade modeladas e testadas; [ ] Tabela de disponibilidade sem unidades com status incorreto; [ ] Framerate ≥30fps no hardware de produção; [ ] Touch/mouse responsivo sem lag perceptível; [ ] Fluxo completo testado por um corretor real antes da entrega; [ ] Documentação de operação entregue.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Plantas DWG recebidas com erros → modelagem incorreta, necessidade de retrabalho. Performance insuficiente no hardware → experiência ruim no stand. Tabela de disponibilidade desatualizada → corretor apresenta unidade já vendida (problema grave). Falta de treinamento → equipe não usa a ferramenta.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Unreal Engine 5, Blender, 3ds Max, Adobe Substance Painter, Three.js, WebGL, Git, Asana, Google Drive.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Escopo técnico aprovado: 3 dias. Build alpha: 30 dias úteis. Entrega final: 40 dias úteis pós-início. Inclui: 2 rodadas de revisão estética e 1 sessão de treinamento.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Discovery Técnico → Escopo Aprovado → Modelagem 3D → Aprovação Estética → Desenvolvimento da Aplicação → Integração de Disponibilidade → Build Alpha (testes internos) → Testes em Hardware Real → Ajustes de Performance → Build Beta Aprovada → Treinamento → Entrega Final → Aceite Formal → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'LOD: Level of Detail — técnica de otimização que reduz complexidade de modelos distantes. Framerate: quadros por segundo renderizados (FPS). Build: versão compilada e executável da aplicação. Touch: interação por toque em tela sensível. Tipologia: categoria de unidade por número de quartos/área.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-GAM-002
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Plataforma de Personalização de Unidades', 'tbo-gam-002-plataforma-de-personalizacao-de-unidades', 'gamificacao', 'checklist', 'Plataforma de Personalização de Unidades', 'Standard Operating Procedure

Plataforma de Personalização de Unidades

Código

TBO-GAM-002

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Gamificação

Responsável

Marco Andolfato (Diretor Criativo)

Aprovador

Marco Andolfato



  1. Objetivo

Desenvolver plataforma web ou aplicação (WebGL/Three.js) que permite ao comprador personalizar acabamentos, móveis e materiais da sua unidade em tempo real, gerando PDF de escolhas para formalização com a incorporadora.

  2. Escopo

2.1 O que está coberto

Modelagem 3D dos ambientes personalizáveis, desenvolvimento da plataforma com múltiplos pacotes de acabamento, lógica de preço diferencial por pacote, geração de PDF/relatório de escolha, testes e entrega.

2.2 Exclusões

Integração com ERP para pedido de compra automático (demanda de integração separada), personalização estrutural (mudança de paredes), aplicativo nativo iOS/Android (escopo desta entrega é web).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção criativa, arquitetura da solução

Aprovador

—

Dev 3D / Frontend

Desenvolvimento da plataforma web

Executor

—

Arquiteto / Incorporadora

Definição de pacotes, materiais, preços e restrições

Consultado

Informado

Carol (Ops)

Cronograma, testes com usuários reais, entrega

Executor

—

  4. Pré-requisitos

4.1 Inputs necessários

Plantas dos ambientes personalizáveis (sala, cozinha, quartos); catálogo completo de materiais (piso, parede, bancada, louças) com fotos/renders e preços por pacote; identidade visual da incorporadora; briefing de UX (fluxo de personalização desejado pelo cliente).

4.2 Ferramentas e Acessos

Three.js + React (para plataforma web), Blender para modelagem de ambientes, Adobe Substance Painter para materiais PBR, Figma para protótipo UX, jsPDF ou Puppeteer para geração de PDF, Git, Asana.



  5. Procedimento Passo a Passo

5.1. Discovery de Produto e UX

Ação: Workshop com cliente (incorporadora + arquiteto): mapear ambientes personalizáveis, pacotes disponíveis, lógica de preço diferencial, restrições de combinação e fluxo de escolha do comprador. Marco prototipa fluxo no Figma.

Responsável: Marco Andolfato + Cliente

Output: Protótipo de UX aprovado no Figma

Prazo referência: Dia 1–5

5.2. Modelagem 3D dos Ambientes

Ação: Modelar cada ambiente personalizável com todos os materiais mapeados como camadas independentes (piso, parede, bancada); texturizar materiais PBR para realismo; otimizar para web.

Responsável: Dev 3D

Output: Modelos 3D otimizados para web, aprovados esteticamente

Prazo referência: Dia 6–18

5.3. Desenvolvimento do Engine de Personalização

Ação: Implementar visualizador 3D em Three.js com troca de materiais em tempo real; criar painel de seleção de pacotes; implementar lógica de preço cumulativo e validação de combinações inválidas.

Responsável: Dev 3D + Dev Frontend

Output: Engine de personalização funcional

Prazo referência: Dia 19–35

5.4. Geração de PDF e Resumo de Escolhas

Ação: Implementar módulo de exportação: capturar screenshot de cada ambiente personalizado; gerar PDF com resumo de escolhas (ambiente, material, código, preço por pacote, valor total diferencial); incluir assinatura digital ou código de confirmação.

Responsável: Dev Frontend

Output: PDF de escolhas gerado automaticamente

Prazo referência: Dia 33–38

5.5. Testes com Usuários e Ajustes

Ação: Realizar sessão de testes com 3–5 compradores reais ou corretores; observar pontos de confusão; ajustar UX, performance e fluxo de confirmação; teste de stress em diferentes dispositivos (desktop, tablet, mobile).

Responsável: Carol (Ops) + Marco

Output: Plataforma aprovada em testes com usuários

Prazo referência: Dia 39–43

5.6. Entrega, Deploy e Treinamento

Ação: Realizar deploy em ambiente de produção (Vercel ou servidor do cliente); configurar domínio; treinar equipe da incorporadora para gerenciar catálogo de materiais; entregar código-fonte e documentação técnica.

Responsável: Marco Andolfato + Carol (Ops)

Output: Plataforma no ar, equipe treinada, aceite formal assinado

Prazo referência: Dia 44–45

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Todos os pacotes de material com foto + código + preço corretos; [ ] Troca de material em tempo real sem travamento visível; [ ] PDF gerado com todas as escolhas e valor total; [ ] Plataforma funcional em desktop e tablet; [ ] Nenhuma combinação inválida permitida pelo sistema; [ ] Deploy testado no domínio de produção antes da entrega.

6.2 Erros Comuns a Evitar

Catálogo de materiais incompleto no início → retrabalho de modelagem e dados. Performance lenta na web → frustração do comprador e abandono. PDF com dados errados → problema jurídico com a incorporadora. Combinações sem validação → comprador escolhe opção não disponível.

  7. Ferramentas e Templates

Three.js, React, Blender, Adobe Substance Painter, Figma, jsPDF, Puppeteer, Git, Vercel, Asana.

  8. SLAs e Prazos

Protótipo UX: 5 dias. Plataforma funcional (alpha): 35 dias úteis. Entrega final: 45 dias úteis pós-início. Inclui: 2 rodadas de ajuste de UX e 1 sessão de treinamento.

  9. Fluxograma

Início → Discovery UX → Protótipo Figma Aprovado → Modelagem 3D → Engine de Personalização → Geração de PDF → Alpha Interna → Testes com Usuários Reais → Ajustes → Deploy em Produção → Treinamento → Aceite Formal → Fim

  10. Glossário

PBR: Physically Based Rendering — sistema de texturização que simula comportamento real da luz sobre materiais. Engine: motor de renderização e lógica da aplicação. Deploy: publicação da aplicação em ambiente de produção acessível ao usuário final. Pacote de acabamento: conjunto pré-definido de materiais com preço diferencial.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['interativo']::TEXT[], 1, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Desenvolver plataforma web ou aplicação (WebGL/Three.js) que permite ao comprador personalizar acabamentos, móveis e materiais da sua unidade em tempo real, gerando PDF de escolhas para formalização com a incorporadora.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Modelagem 3D dos ambientes personalizáveis, desenvolvimento da plataforma com múltiplos pacotes de acabamento, lógica de preço diferencial por pacote, geração de PDF/relatório de escolha, testes e entrega.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Integração com ERP para pedido de compra automático (demanda de integração separada), personalização estrutural (mudança de paredes), aplicativo nativo iOS/Android (escopo desta entrega é web).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção criativa, arquitetura da solução

Aprovador

—

Dev 3D / Frontend

Desenvolvimento da plataforma web

Executor

—

Arquiteto / Incorporadora

Definição de pacotes, materiais, preços e restrições

Consultado

Informado

Carol (Ops)

Cronograma, testes com usuários reais, entrega

Executor

—', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plantas dos ambientes personalizáveis (sala, cozinha, quartos); catálogo completo de materiais (piso, parede, bancada, louças) com fotos/renders e preços por pacote; identidade visual da incorporadora; briefing de UX (fluxo de personalização desejado pelo cliente).', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Three.js + React (para plataforma web), Blender para modelagem de ambientes, Adobe Substance Painter para materiais PBR, Figma para protótipo UX, jsPDF ou Puppeteer para geração de PDF, Git, Asana.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Discovery de Produto e UX', 'Ação: Workshop com cliente (incorporadora + arquiteto): mapear ambientes personalizáveis, pacotes disponíveis, lógica de preço diferencial, restrições de combinação e fluxo de escolha do comprador. Marco prototipa fluxo no Figma.

Responsável: Marco Andolfato + Cliente

Output: Protótipo de UX aprovado no Figma

Prazo referência: Dia 1–5', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Modelagem 3D dos Ambientes', 'Ação: Modelar cada ambiente personalizável com todos os materiais mapeados como camadas independentes (piso, parede, bancada); texturizar materiais PBR para realismo; otimizar para web.

Responsável: Dev 3D

Output: Modelos 3D otimizados para web, aprovados esteticamente

Prazo referência: Dia 6–18', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Desenvolvimento do Engine de Personalização', 'Ação: Implementar visualizador 3D em Three.js com troca de materiais em tempo real; criar painel de seleção de pacotes; implementar lógica de preço cumulativo e validação de combinações inválidas.

Responsável: Dev 3D + Dev Frontend

Output: Engine de personalização funcional

Prazo referência: Dia 19–35', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Geração de PDF e Resumo de Escolhas', 'Ação: Implementar módulo de exportação: capturar screenshot de cada ambiente personalizado; gerar PDF com resumo de escolhas (ambiente, material, código, preço por pacote, valor total diferencial); incluir assinatura digital ou código de confirmação.

Responsável: Dev Frontend

Output: PDF de escolhas gerado automaticamente

Prazo referência: Dia 33–38', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Testes com Usuários e Ajustes', 'Ação: Realizar sessão de testes com 3–5 compradores reais ou corretores; observar pontos de confusão; ajustar UX, performance e fluxo de confirmação; teste de stress em diferentes dispositivos (desktop, tablet, mobile).

Responsável: Carol (Ops) + Marco

Output: Plataforma aprovada em testes com usuários

Prazo referência: Dia 39–43', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Entrega, Deploy e Treinamento', 'Ação: Realizar deploy em ambiente de produção (Vercel ou servidor do cliente); configurar domínio; treinar equipe da incorporadora para gerenciar catálogo de materiais; entregar código-fonte e documentação técnica.

Responsável: Marco Andolfato + Carol (Ops)

Output: Plataforma no ar, equipe treinada, aceite formal assinado

Prazo referência: Dia 44–45', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todos os pacotes de material com foto + código + preço corretos; [ ] Troca de material em tempo real sem travamento visível; [ ] PDF gerado com todas as escolhas e valor total; [ ] Plataforma funcional em desktop e tablet; [ ] Nenhuma combinação inválida permitida pelo sistema; [ ] Deploy testado no domínio de produção antes da entrega.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Catálogo de materiais incompleto no início → retrabalho de modelagem e dados. Performance lenta na web → frustração do comprador e abandono. PDF com dados errados → problema jurídico com a incorporadora. Combinações sem validação → comprador escolhe opção não disponível.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Three.js, React, Blender, Adobe Substance Painter, Figma, jsPDF, Puppeteer, Git, Vercel, Asana.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Protótipo UX: 5 dias. Plataforma funcional (alpha): 35 dias úteis. Entrega final: 45 dias úteis pós-início. Inclui: 2 rodadas de ajuste de UX e 1 sessão de treinamento.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Discovery UX → Protótipo Figma Aprovado → Modelagem 3D → Engine de Personalização → Geração de PDF → Alpha Interna → Testes com Usuários Reais → Ajustes → Deploy em Produção → Treinamento → Aceite Formal → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'PBR: Physically Based Rendering — sistema de texturização que simula comportamento real da luz sobre materiais. Engine: motor de renderização e lógica da aplicação. Deploy: publicação da aplicação em ambiente de produção acessível ao usuário final. Pacote de acabamento: conjunto pré-definido de materiais com preço diferencial.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

END $$;

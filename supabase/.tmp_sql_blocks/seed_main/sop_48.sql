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
    'Plataforma de Personalização de Unidades',
    'tbo-gam-002-plataforma-de-personalizacao-de-unidades',
    'gamificacao',
    'checklist',
    'Plataforma de Personalização de Unidades',
    'Standard Operating Procedure

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

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Plataforma de Personalização de Unidades</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-GAM-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Gamificação</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Desenvolver plataforma web ou aplicação (WebGL/Three.js) que permite ao comprador personalizar acabamentos, móveis e materiais da sua unidade em tempo real, gerando PDF de escolhas para formalização com a incorporadora.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Modelagem 3D dos ambientes personalizáveis, desenvolvimento da plataforma com múltiplos pacotes de acabamento, lógica de preço diferencial por pacote, geração de PDF/relatório de escolha, testes e entrega.</p><p><strong>2.2 Exclusões</strong></p><p>Integração com ERP para pedido de compra automático (demanda de integração separada), personalização estrutural (mudança de paredes), aplicativo nativo iOS/Android (escopo desta entrega é web).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Direção criativa, arquitetura da solução</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Dev 3D / Frontend</p></td><td><p>Desenvolvimento da plataforma web</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Arquiteto / Incorporadora</p></td><td><p>Definição de pacotes, materiais, preços e restrições</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Cronograma, testes com usuários reais, entrega</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Plantas dos ambientes personalizáveis (sala, cozinha, quartos); catálogo completo de materiais (piso, parede, bancada, louças) com fotos/renders e preços por pacote; identidade visual da incorporadora; briefing de UX (fluxo de personalização desejado pelo cliente).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Three.js + React (para plataforma web), Blender para modelagem de ambientes, Adobe Substance Painter para materiais PBR, Figma para protótipo UX, jsPDF ou Puppeteer para geração de PDF, Git, Asana.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Discovery de Produto e UX</strong></p><p>Ação: Workshop com cliente (incorporadora + arquiteto): mapear ambientes personalizáveis, pacotes disponíveis, lógica de preço diferencial, restrições de combinação e fluxo de escolha do comprador. Marco prototipa fluxo no Figma.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Protótipo de UX aprovado no Figma</p><p>Prazo referência: Dia 1–5</p><p><strong>5.2. Modelagem 3D dos Ambientes</strong></p><p>Ação: Modelar cada ambiente personalizável com todos os materiais mapeados como camadas independentes (piso, parede, bancada); texturizar materiais PBR para realismo; otimizar para web.</p><p>Responsável: Dev 3D</p><p>Output: Modelos 3D otimizados para web, aprovados esteticamente</p><p>Prazo referência: Dia 6–18</p><p><strong>5.3. Desenvolvimento do Engine de Personalização</strong></p><p>Ação: Implementar visualizador 3D em Three.js com troca de materiais em tempo real; criar painel de seleção de pacotes; implementar lógica de preço cumulativo e validação de combinações inválidas.</p><p>Responsável: Dev 3D + Dev Frontend</p><p>Output: Engine de personalização funcional</p><p>Prazo referência: Dia 19–35</p><p><strong>5.4. Geração de PDF e Resumo de Escolhas</strong></p><p>Ação: Implementar módulo de exportação: capturar screenshot de cada ambiente personalizado; gerar PDF com resumo de escolhas (ambiente, material, código, preço por pacote, valor total diferencial); incluir assinatura digital ou código de confirmação.</p><p>Responsável: Dev Frontend</p><p>Output: PDF de escolhas gerado automaticamente</p><p>Prazo referência: Dia 33–38</p><p><strong>5.5. Testes com Usuários e Ajustes</strong></p><p>Ação: Realizar sessão de testes com 3–5 compradores reais ou corretores; observar pontos de confusão; ajustar UX, performance e fluxo de confirmação; teste de stress em diferentes dispositivos (desktop, tablet, mobile).</p><p>Responsável: Carol (Ops) + Marco</p><p>Output: Plataforma aprovada em testes com usuários</p><p>Prazo referência: Dia 39–43</p><p><strong>5.6. Entrega, Deploy e Treinamento</strong></p><p>Ação: Realizar deploy em ambiente de produção (Vercel ou servidor do cliente); configurar domínio; treinar equipe da incorporadora para gerenciar catálogo de materiais; entregar código-fonte e documentação técnica.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Plataforma no ar, equipe treinada, aceite formal assinado</p><p>Prazo referência: Dia 44–45</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Todos os pacotes de material com foto + código + preço corretos; [ ] Troca de material em tempo real sem travamento visível; [ ] PDF gerado com todas as escolhas e valor total; [ ] Plataforma funcional em desktop e tablet; [ ] Nenhuma combinação inválida permitida pelo sistema; [ ] Deploy testado no domínio de produção antes da entrega.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Catálogo de materiais incompleto no início → retrabalho de modelagem e dados. Performance lenta na web → frustração do comprador e abandono. PDF com dados errados → problema jurídico com a incorporadora. Combinações sem validação → comprador escolhe opção não disponível.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Three.js, React, Blender, Adobe Substance Painter, Figma, jsPDF, Puppeteer, Git, Vercel, Asana.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Protótipo UX: 5 dias. Plataforma funcional (alpha): 35 dias úteis. Entrega final: 45 dias úteis pós-início. Inclui: 2 rodadas de ajuste de UX e 1 sessão de treinamento.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Discovery UX → Protótipo Figma Aprovado → Modelagem 3D → Engine de Personalização → Geração de PDF → Alpha Interna → Testes com Usuários Reais → Ajustes → Deploy em Produção → Treinamento → Aceite Formal → Fim</p><p><strong>  10. Glossário</strong></p><p>PBR: Physically Based Rendering — sistema de texturização que simula comportamento real da luz sobre materiais. Engine: motor de renderização e lógica da aplicação. Deploy: publicação da aplicação em ambiente de produção acessível ao usuário final. Pacote de acabamento: conjunto pré-definido de materiais com preço diferencial.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['interativo','gamificacao','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-GAM-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Desenvolver plataforma web ou aplicação (WebGL/Three.js) que permite ao comprador personalizar acabamentos, móveis e materiais da sua unidade em tempo real, gerando PDF de escolhas para formalização com a incorporadora.', '<p>Desenvolver plataforma web ou aplicação (WebGL/Three.js) que permite ao comprador personalizar acabamentos, móveis e materiais da sua unidade em tempo real, gerando PDF de escolhas para formalização com a incorporadora.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Modelagem 3D dos ambientes personalizáveis, desenvolvimento da plataforma com múltiplos pacotes de acabamento, lógica de preço diferencial por pacote, geração de PDF/relatório de escolha, testes e entrega.', '<p>Modelagem 3D dos ambientes personalizáveis, desenvolvimento da plataforma com múltiplos pacotes de acabamento, lógica de preço diferencial por pacote, geração de PDF/relatório de escolha, testes e entrega.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Integração com ERP para pedido de compra automático (demanda de integração separada), personalização estrutural (mudança de paredes), aplicativo nativo iOS/Android (escopo desta entrega é web).', '<p>Integração com ERP para pedido de compra automático (demanda de integração separada), personalização estrutural (mudança de paredes), aplicativo nativo iOS/Android (escopo desta entrega é web).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

—', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Direção criativa, arquitetura da solução</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Dev 3D / Frontend</p></td><td><p>Desenvolvimento da plataforma web</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Arquiteto / Incorporadora</p></td><td><p>Definição de pacotes, materiais, preços e restrições</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Cronograma, testes com usuários reais, entrega</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plantas dos ambientes personalizáveis (sala, cozinha, quartos); catálogo completo de materiais (piso, parede, bancada, louças) com fotos/renders e preços por pacote; identidade visual da incorporadora; briefing de UX (fluxo de personalização desejado pelo cliente).', '<p>Plantas dos ambientes personalizáveis (sala, cozinha, quartos); catálogo completo de materiais (piso, parede, bancada, louças) com fotos/renders e preços por pacote; identidade visual da incorporadora; briefing de UX (fluxo de personalização desejado pelo cliente).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Three.js + React (para plataforma web), Blender para modelagem de ambientes, Adobe Substance Painter para materiais PBR, Figma para protótipo UX, jsPDF ou Puppeteer para geração de PDF, Git, Asana.', '<p>Three.js + React (para plataforma web), Blender para modelagem de ambientes, Adobe Substance Painter para materiais PBR, Figma para protótipo UX, jsPDF ou Puppeteer para geração de PDF, Git, Asana.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Discovery de Produto e UX', 'Ação: Workshop com cliente (incorporadora + arquiteto): mapear ambientes personalizáveis, pacotes disponíveis, lógica de preço diferencial, restrições de combinação e fluxo de escolha do comprador. Marco prototipa fluxo no Figma.

Responsável: Marco Andolfato + Cliente

Output: Protótipo de UX aprovado no Figma

Prazo referência: Dia 1–5', '<p>Ação: Workshop com cliente (incorporadora + arquiteto): mapear ambientes personalizáveis, pacotes disponíveis, lógica de preço diferencial, restrições de combinação e fluxo de escolha do comprador. Marco prototipa fluxo no Figma.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Protótipo de UX aprovado no Figma</p><p>Prazo referência: Dia 1–5</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Modelagem 3D dos Ambientes', 'Ação: Modelar cada ambiente personalizável com todos os materiais mapeados como camadas independentes (piso, parede, bancada); texturizar materiais PBR para realismo; otimizar para web.

Responsável: Dev 3D

Output: Modelos 3D otimizados para web, aprovados esteticamente

Prazo referência: Dia 6–18', '<p>Ação: Modelar cada ambiente personalizável com todos os materiais mapeados como camadas independentes (piso, parede, bancada); texturizar materiais PBR para realismo; otimizar para web.</p><p>Responsável: Dev 3D</p><p>Output: Modelos 3D otimizados para web, aprovados esteticamente</p><p>Prazo referência: Dia 6–18</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Desenvolvimento do Engine de Personalização', 'Ação: Implementar visualizador 3D em Three.js com troca de materiais em tempo real; criar painel de seleção de pacotes; implementar lógica de preço cumulativo e validação de combinações inválidas.

Responsável: Dev 3D + Dev Frontend

Output: Engine de personalização funcional

Prazo referência: Dia 19–35', '<p>Ação: Implementar visualizador 3D em Three.js com troca de materiais em tempo real; criar painel de seleção de pacotes; implementar lógica de preço cumulativo e validação de combinações inválidas.</p><p>Responsável: Dev 3D + Dev Frontend</p><p>Output: Engine de personalização funcional</p><p>Prazo referência: Dia 19–35</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Geração de PDF e Resumo de Escolhas', 'Ação: Implementar módulo de exportação: capturar screenshot de cada ambiente personalizado; gerar PDF com resumo de escolhas (ambiente, material, código, preço por pacote, valor total diferencial); incluir assinatura digital ou código de confirmação.

Responsável: Dev Frontend

Output: PDF de escolhas gerado automaticamente

Prazo referência: Dia 33–38', '<p>Ação: Implementar módulo de exportação: capturar screenshot de cada ambiente personalizado; gerar PDF com resumo de escolhas (ambiente, material, código, preço por pacote, valor total diferencial); incluir assinatura digital ou código de confirmação.</p><p>Responsável: Dev Frontend</p><p>Output: PDF de escolhas gerado automaticamente</p><p>Prazo referência: Dia 33–38</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Testes com Usuários e Ajustes', 'Ação: Realizar sessão de testes com 3–5 compradores reais ou corretores; observar pontos de confusão; ajustar UX, performance e fluxo de confirmação; teste de stress em diferentes dispositivos (desktop, tablet, mobile).

Responsável: Carol (Ops) + Marco

Output: Plataforma aprovada em testes com usuários

Prazo referência: Dia 39–43', '<p>Ação: Realizar sessão de testes com 3–5 compradores reais ou corretores; observar pontos de confusão; ajustar UX, performance e fluxo de confirmação; teste de stress em diferentes dispositivos (desktop, tablet, mobile).</p><p>Responsável: Carol (Ops) + Marco</p><p>Output: Plataforma aprovada em testes com usuários</p><p>Prazo referência: Dia 39–43</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Entrega, Deploy e Treinamento', 'Ação: Realizar deploy em ambiente de produção (Vercel ou servidor do cliente); configurar domínio; treinar equipe da incorporadora para gerenciar catálogo de materiais; entregar código-fonte e documentação técnica.

Responsável: Marco Andolfato + Carol (Ops)

Output: Plataforma no ar, equipe treinada, aceite formal assinado

Prazo referência: Dia 44–45', '<p>Ação: Realizar deploy em ambiente de produção (Vercel ou servidor do cliente); configurar domínio; treinar equipe da incorporadora para gerenciar catálogo de materiais; entregar código-fonte e documentação técnica.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Plataforma no ar, equipe treinada, aceite formal assinado</p><p>Prazo referência: Dia 44–45</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todos os pacotes de material com foto + código + preço corretos; [ ] Troca de material em tempo real sem travamento visível; [ ] PDF gerado com todas as escolhas e valor total; [ ] Plataforma funcional em desktop e tablet; [ ] Nenhuma combinação inválida permitida pelo sistema; [ ] Deploy testado no domínio de produção antes da entrega.', '<p>[ ] Todos os pacotes de material com foto + código + preço corretos; [ ] Troca de material em tempo real sem travamento visível; [ ] PDF gerado com todas as escolhas e valor total; [ ] Plataforma funcional em desktop e tablet; [ ] Nenhuma combinação inválida permitida pelo sistema; [ ] Deploy testado no domínio de produção antes da entrega.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Catálogo de materiais incompleto no início → retrabalho de modelagem e dados. Performance lenta na web → frustração do comprador e abandono. PDF com dados errados → problema jurídico com a incorporadora. Combinações sem validação → comprador escolhe opção não disponível.', '<p>Catálogo de materiais incompleto no início → retrabalho de modelagem e dados. Performance lenta na web → frustração do comprador e abandono. PDF com dados errados → problema jurídico com a incorporadora. Combinações sem validação → comprador escolhe opção não disponível.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Three.js, React, Blender, Adobe Substance Painter, Figma, jsPDF, Puppeteer, Git, Vercel, Asana.', '<p>Three.js, React, Blender, Adobe Substance Painter, Figma, jsPDF, Puppeteer, Git, Vercel, Asana.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Protótipo UX: 5 dias. Plataforma funcional (alpha): 35 dias úteis. Entrega final: 45 dias úteis pós-início. Inclui: 2 rodadas de ajuste de UX e 1 sessão de treinamento.', '<p>Protótipo UX: 5 dias. Plataforma funcional (alpha): 35 dias úteis. Entrega final: 45 dias úteis pós-início. Inclui: 2 rodadas de ajuste de UX e 1 sessão de treinamento.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Discovery UX → Protótipo Figma Aprovado → Modelagem 3D → Engine de Personalização → Geração de PDF → Alpha Interna → Testes com Usuários Reais → Ajustes → Deploy em Produção → Treinamento → Aceite Formal → Fim', '<p>Início → Discovery UX → Protótipo Figma Aprovado → Modelagem 3D → Engine de Personalização → Geração de PDF → Alpha Interna → Testes com Usuários Reais → Ajustes → Deploy em Produção → Treinamento → Aceite Formal → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'PBR: Physically Based Rendering — sistema de texturização que simula comportamento real da luz sobre materiais. Engine: motor de renderização e lógica da aplicação. Deploy: publicação da aplicação em ambiente de produção acessível ao usuário final. Pacote de acabamento: conjunto pré-definido de materiais com preço diferencial.', '<p>PBR: Physically Based Rendering — sistema de texturização que simula comportamento real da luz sobre materiais. Engine: motor de renderização e lógica da aplicação. Deploy: publicação da aplicação em ambiente de produção acessível ao usuário final. Pacote de acabamento: conjunto pré-definido de materiais com preço diferencial.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-OPS-001: Onboarding de Novo Colaborador ──
END $$;
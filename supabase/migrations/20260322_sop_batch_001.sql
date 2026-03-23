-- ─── SOP Batch 001 ─────────────────────────────────────────────────────────
-- Data: 2026-03-22
-- SOPs criados: 5
-- SOPs melhorados: 0
-- Score médio: 8.6
-- BUs contempladas: gamificacao (x2), financeiro, atendimento, comercial, rh
-- Total antes: 86 | Total depois: 91
-- ────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_tenant_id UUID;
  v_sop_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE NOTICE 'Nenhum tenant encontrado. Abortando seed.';
    RETURN;
  END IF;

  -- ══════════════════════════════════════════════════════════════════════════
  -- SOP 1: Gamificação — Showroom Virtual e Configurador de Unidade
  -- ══════════════════════════════════════════════════════════════════════════
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Showroom Virtual e Configurador de Unidade',
    'tbo-gam-003-showroom-virtual-configurador',
    'gamificacao',
    'processo',
    'Líder de Gamificação',
    '## Showroom Virtual e Configurador de Unidade

### 1. Objetivo
Estabelecer o processo de concepção, desenvolvimento e entrega de experiências de showroom virtual e configurador de unidades imobiliárias — ferramentas interativas que permitem ao comprador explorar o imóvel, personalizar acabamentos e visualizar o resultado em tempo real. O objetivo é reduzir a jornada de decisão do cliente e aumentar a taxa de conversão no estande de vendas.

### 2. Escopo
**Quem executa:** Equipe de Gamificação (líder + desenvolvedor 3D interativo + UX designer)
**Quando se aplica:** Projetos residenciais de médio e alto padrão com orçamento aprovado para experiências digitais
**Limites:** Não inclui produção de conteúdo 3D base (responsabilidade do D3D); não inclui hospedagem pós-entrega (responsabilidade do cliente com suporte da TBO)

### 3. RACI

| Atividade | Responsável | Aprovador | Consultado | Informado |
|---|---|---|---|---|
| Briefing e definição de escopo | Líder de Gamificação | Ruy (Dir. Comercial) | Marco (Dir. Criativo) | Atendimento |
| Desenvolvimento da experiência | Dev 3D Interativo | Líder de Gamificação | D3D (assets) | — |
| UX e fluxo de navegação | UX Designer | Marco (Dir. Criativo) | Cliente | Líder de Gamificação |
| QA e testes de dispositivo | Líder de Gamificação | Marco | — | Dev |
| Entrega e treinamento | Líder de Gamificação | Ruy | — | Cliente/Incorporadora |

### 4. Pré-requisitos
- Modelo 3D da unidade-tipo aprovado pelo cliente (fornecido pelo D3D)
- Paleta de materiais e acabamentos definida (mínimo 3 opções por ambiente)
- Briefing de UX preenchido (fluxo de navegação, idioma, identidade visual)
- Hardware do estande definido (totem touchscreen, tablet, desktop, VR headset)
- Acesso ao servidor de hospedagem ou definição de embed local

### 5. Procedimento

**5.1 Kickoff e definição técnica (Dia 1-2)**
1. Reunião com cliente para definir: dispositivos alvo, idioma, quantidade de ambientes, opções de personalização
2. Definir tipo de experiência: web (browser), aplicativo local, VR imersivo ou híbrido
3. Solicitar assets ao D3D: modelos otimizados para real-time, texturas em resolução adequada
4. Criar documento de escopo técnico assinado pelo cliente

**5.2 Setup do ambiente de desenvolvimento (Dia 3-5)**
1. Configurar engine: Unreal Engine 5 (imersivo/VR) ou Three.js/Babylon.js (web)
2. Importar modelos 3D, aplicar materiais PBR base
3. Configurar sistema de troca de materiais (material switcher) por ambiente
4. Testar performance: meta de 60fps em hardware do estande

**5.3 Desenvolvimento da experiência (Dia 6-15)**
1. Implementar navegação: câmeras pré-definidas por ambiente + modo livre (opcional)
2. Desenvolver UI de configuração: seletor de revestimentos, cores, mobiliário
3. Implementar lógica de combinação (verificar compatibilidades entre opções)
4. Adicionar hotspots informativos: metragem, especificações, diferenciais
5. Integrar identidade visual do empreendimento (logo, tipografia, paleta)
6. Desenvolver tela de resumo: "Minha unidade personalizada" com PDF exportável

**5.4 QA e ajustes (Dia 16-18)**
1. Testar em todos os dispositivos definidos no escopo
2. Verificar tempo de carregamento (máx. 10s em conexão 10Mbps)
3. Testar todos os fluxos de personalização e combinações
4. Coletar feedback interno e ajustar
5. Aprovação final do cliente via link de preview

**5.5 Entrega e treinamento (Dia 19-20)**
1. Deploy em ambiente de produção (servidor do cliente ou CDN da TBO)
2. Configurar analytics: rastrear combinações mais escolhidas, tempo de sessão
3. Treinar equipe de vendas do cliente (1-2h): navegação, reset, troubleshooting básico
4. Entregar documentação técnica e manual do usuário
5. Período de suporte pós-entrega: 15 dias corridos

### 6. Checklist de Validação
- [ ] Experiência carrega em < 10s na conexão do estande
- [ ] Todos os ambientes navegáveis e sem erros visuais
- [ ] Todos os materiais trocam corretamente sem conflito
- [ ] PDF de resumo exporta com dados corretos
- [ ] Analytics funcionando (eventos disparando no painel)
- [ ] Testado em todos os dispositivos do escopo
- [ ] Manual do usuário entregue
- [ ] Equipe de vendas treinada e aprovada
- [ ] Período de suporte iniciado e contato de suporte comunicado

### 7. Ferramentas e Recursos
- **Engine:** Unreal Engine 5 (VR/imersivo) | Three.js / Babylon.js (web)
- **Assets 3D:** Pipeline D3D da TBO (modelos otimizados para real-time)
- **UI/UX:** Figma (wireframes e protótipo do configurador)
- **Deploy:** Vercel (web) | Executável local (standalone)
- **Analytics:** Plausible ou Google Analytics 4
- **Documentação:** Notion (manual técnico + manual do usuário)

### 8. SLAs e Métricas
- **Prazo padrão:** 20 dias úteis da aprovação do escopo
- **Performance alvo:** 60fps em hardware do estande | < 10s carregamento
- **Cobertura de personalização:** mínimo 3 ambientes, 3 opções de material por superfície
- **Suporte pós-entrega:** 15 dias corridos, resposta em até 4h úteis
- **KPI de negócio:** tempo médio de engajamento > 8min por visita no estande

### 9. Troubleshooting
| Problema | Causa provável | Solução |
|---|---|---|
| Carregamento lento | Assets muito pesados | Reotimizar texturas (máx 2K por material) |
| Troca de material não funciona | Conflito de shader | Verificar setup de instância de material |
| Tela preta no VR | Driver desatualizado | Atualizar SteamVR/Oculus runtime |
| PDF exportado em branco | Problema de screenshot API | Usar biblioteca html2canvas ou Puppeteer |
| Performance ruim em tablet | Hardware insuficiente | Reduzir qualidade de sombras e reflexos |

### 10. Template Anexo — Documento de Escopo do Showroom Virtual

```
ESCOPO TÉCNICO — SHOWROOM VIRTUAL
Projeto: _______________
Data: _______________
Responsável TBO: _______________
Cliente: _______________

DISPOSITIVOS ALVO
[ ] Totem touchscreen (especificar tamanho: ___)
[ ] Tablet iPad Pro
[ ] Desktop (navegador web)
[ ] VR Headset (especificar modelo: ___)

AMBIENTES A INCLUIR
1. _______________ — Materiais: _____________
2. _______________ — Materiais: _____________
3. _______________ — Materiais: _____________

OPÇÕES DE PERSONALIZAÇÃO POR AMBIENTE
Piso: ___ opções | Parede: ___ opções | Bancadas: ___ opções | Louças: ___ opções

FUNCIONALIDADES
[ ] Câmeras pré-definidas
[ ] Modo de câmera livre
[ ] Hotspots informativos
[ ] Exportar PDF com seleções
[ ] Analytics de engajamento

PRAZO DE ENTREGA: _______________
APROVADO POR: _______________ Data: _______________
```
',
    '<h2>Showroom Virtual e Configurador de Unidade</h2><h3>1. Objetivo</h3><p>Estabelecer o processo de concepção, desenvolvimento e entrega de experiências de showroom virtual e configurador de unidades imobiliárias — ferramentas interativas que permitem ao comprador explorar o imóvel, personalizar acabamentos e visualizar o resultado em tempo real. O objetivo é reduzir a jornada de decisão do cliente e aumentar a taxa de conversão no estande de vendas.</p><h3>2. Escopo</h3><p><strong>Quem executa:</strong> Equipe de Gamificação (líder + desenvolvedor 3D interativo + UX designer)<br><strong>Quando se aplica:</strong> Projetos residenciais de médio e alto padrão com orçamento aprovado para experiências digitais<br><strong>Limites:</strong> Não inclui produção de conteúdo 3D base; não inclui hospedagem pós-entrega</p><h3>3. RACI</h3><table><tr><th>Atividade</th><th>Responsável</th><th>Aprovador</th><th>Consultado</th><th>Informado</th></tr><tr><td>Briefing e escopo</td><td>Líder Gamificação</td><td>Ruy</td><td>Marco</td><td>Atendimento</td></tr><tr><td>Desenvolvimento</td><td>Dev 3D Interativo</td><td>Líder Gamificação</td><td>D3D</td><td>—</td></tr><tr><td>UX e navegação</td><td>UX Designer</td><td>Marco</td><td>Cliente</td><td>Líder Gamificação</td></tr><tr><td>QA e testes</td><td>Líder Gamificação</td><td>Marco</td><td>—</td><td>Dev</td></tr><tr><td>Entrega e treinamento</td><td>Líder Gamificação</td><td>Ruy</td><td>—</td><td>Cliente</td></tr></table>',
    'published',
    'high',
    ARRAY['gamificacao','showroom','configurador','interativo','vendas','3d','ux']::TEXT[],
    2,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title, content = EXCLUDED.content,
    content_html = EXCLUDED.content_html, updated_at = now()
  RETURNING id INTO v_sop_id;

  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type) VALUES
  (v_sop_id, '1. Objetivo', 'Estabelecer o processo de concepção, desenvolvimento e entrega de experiências de showroom virtual e configurador de unidades imobiliárias. O objetivo é reduzir a jornada de decisão do cliente e aumentar a taxa de conversão no estande de vendas.', '<p>Estabelecer o processo de concepção, desenvolvimento e entrega de experiências de showroom virtual e configurador de unidades imobiliárias. O objetivo é reduzir a jornada de decisão do cliente e aumentar a taxa de conversão no estande de vendas.</p>', 0, 'step'),
  (v_sop_id, '2. Escopo', 'Quem executa: Equipe de Gamificação (líder + dev 3D interativo + UX designer). Quando se aplica: Projetos residenciais de médio e alto padrão com orçamento aprovado para experiências digitais. Limites: não inclui produção de conteúdo 3D base nem hospedagem pós-entrega.', '<p><strong>Quem executa:</strong> Equipe de Gamificação. <strong>Quando se aplica:</strong> Projetos de médio e alto padrão. <strong>Limites:</strong> não inclui produção 3D base nem hospedagem pós-entrega.</p>', 1, 'step'),
  (v_sop_id, '3. RACI', '| Atividade | Responsável | Aprovador | Consultado | Informado |
|---|---|---|---|---|
| Briefing e escopo | Líder Gamificação | Ruy | Marco | Atendimento |
| Desenvolvimento | Dev 3D Interativo | Líder Gamificação | D3D | — |
| UX e navegação | UX Designer | Marco | Cliente | Líder Gamificação |
| QA e testes | Líder Gamificação | Marco | — | Dev |
| Entrega e treinamento | Líder Gamificação | Ruy | — | Cliente |', '<table><tr><th>Atividade</th><th>Responsável</th><th>Aprovador</th><th>Consultado</th><th>Informado</th></tr><tr><td>Briefing</td><td>Líder Gamificação</td><td>Ruy</td><td>Marco</td><td>Atendimento</td></tr></table>', 2, 'step'),
  (v_sop_id, '4. Pré-requisitos', '- Modelo 3D da unidade-tipo aprovado pelo cliente (fornecido pelo D3D)
- Paleta de materiais definida (mínimo 3 opções por ambiente)
- Briefing de UX preenchido (fluxo de navegação, idioma, identidade visual)
- Hardware do estande definido (totem, tablet, desktop, VR headset)
- Acesso ao servidor de hospedagem ou definição de embed local', '<ul><li>Modelo 3D aprovado (fornecido pelo D3D)</li><li>Paleta de materiais definida (mín. 3 opções por ambiente)</li><li>Briefing de UX preenchido</li><li>Hardware do estande definido</li><li>Acesso ao servidor de hospedagem</li></ul>', 3, 'step'),
  (v_sop_id, '5. Procedimento', '5.1 Kickoff e definição técnica (Dia 1-2): reunião com cliente, definir dispositivos alvo e tipo de experiência, solicitar assets ao D3D, criar escopo técnico assinado.
5.2 Setup do ambiente (Dia 3-5): configurar engine (Unreal 5 ou Three.js), importar modelos, configurar material switcher, testar performance (meta 60fps).
5.3 Desenvolvimento (Dia 6-15): implementar navegação, UI de configuração, lógica de combinação, hotspots, identidade visual, tela de resumo com PDF exportável.
5.4 QA e ajustes (Dia 16-18): testar todos os dispositivos, verificar carregamento (máx 10s), testar fluxos, aprovação do cliente via link de preview.
5.5 Entrega e treinamento (Dia 19-20): deploy, configurar analytics, treinar equipe de vendas, entregar documentação, iniciar período de suporte (15 dias).', '<ol><li><strong>Kickoff (Dia 1-2):</strong> definir escopo e solicitar assets ao D3D</li><li><strong>Setup (Dia 3-5):</strong> configurar engine e testar performance</li><li><strong>Desenvolvimento (Dia 6-15):</strong> navegação, configurador, hotspots, PDF</li><li><strong>QA (Dia 16-18):</strong> testes em todos os dispositivos</li><li><strong>Entrega (Dia 19-20):</strong> deploy, analytics, treinamento</li></ol>', 4, 'step'),
  (v_sop_id, '6. Checklist de Validação', '- [ ] Carrega em < 10s na conexão do estande
- [ ] Todos os ambientes navegáveis sem erros visuais
- [ ] Todos os materiais trocam corretamente
- [ ] PDF exporta com dados corretos
- [ ] Analytics funcionando
- [ ] Testado em todos os dispositivos do escopo
- [ ] Manual do usuário entregue
- [ ] Equipe de vendas treinada', '<ul><li>[ ] Carrega em &lt; 10s</li><li>[ ] Ambientes sem erros visuais</li><li>[ ] Materiais trocam corretamente</li><li>[ ] PDF exporta corretamente</li><li>[ ] Analytics funcionando</li><li>[ ] Testado em todos os dispositivos</li><li>[ ] Manual entregue e equipe treinada</li></ul>', 5, 'checkpoint'),
  (v_sop_id, '7. Ferramentas e Recursos', 'Engine: Unreal Engine 5 (VR/imersivo) | Three.js / Babylon.js (web). Assets 3D: Pipeline D3D da TBO. UI/UX: Figma. Deploy: Vercel (web) | Executável local (standalone). Analytics: Plausible ou GA4. Documentação: Notion.', '<p><strong>Engine:</strong> Unreal Engine 5 | Three.js / Babylon.js<br><strong>Assets:</strong> Pipeline D3D<br><strong>UI/UX:</strong> Figma<br><strong>Deploy:</strong> Vercel ou standalone<br><strong>Analytics:</strong> Plausible / GA4</p>', 6, 'tip'),
  (v_sop_id, '8. SLAs e Métricas', 'Prazo padrão: 20 dias úteis. Performance alvo: 60fps | < 10s carregamento. Cobertura: mínimo 3 ambientes, 3 opções de material por superfície. Suporte pós-entrega: 15 dias corridos, resposta em até 4h úteis. KPI: tempo médio de engajamento > 8min por visita no estande.', '<p><strong>Prazo:</strong> 20 dias úteis | <strong>Performance:</strong> 60fps, &lt;10s | <strong>Suporte:</strong> 15 dias, resp. 4h | <strong>KPI:</strong> engajamento &gt;8min/visita</p>', 7, 'note'),
  (v_sop_id, '9. Troubleshooting', 'Carregamento lento → reotimizar texturas (máx 2K). Troca de material não funciona → verificar instância de material. Tela preta no VR → atualizar SteamVR/Oculus runtime. PDF exportado em branco → usar html2canvas ou Puppeteer. Performance ruim em tablet → reduzir sombras e reflexos.', '<ul><li><strong>Carregamento lento:</strong> reotimizar texturas (máx 2K)</li><li><strong>Troca de material falha:</strong> verificar instância de shader</li><li><strong>Tela preta VR:</strong> atualizar SteamVR/Oculus</li><li><strong>PDF em branco:</strong> usar html2canvas ou Puppeteer</li></ul>', 8, 'warning'),
  (v_sop_id, '10. Template — Documento de Escopo', 'ESCOPO TÉCNICO — SHOWROOM VIRTUAL
Projeto: ___  Data: ___  Responsável TBO: ___  Cliente: ___

DISPOSITIVOS ALVO
[ ] Totem touchscreen | [ ] Tablet iPad Pro | [ ] Desktop web | [ ] VR Headset

AMBIENTES (mínimo 3)
1. ___ — Materiais: ___
2. ___ — Materiais: ___
3. ___ — Materiais: ___

FUNCIONALIDADES
[ ] Câmeras pré-definidas | [ ] Câmera livre | [ ] Hotspots | [ ] PDF exportável | [ ] Analytics

PRAZO DE ENTREGA: ___  APROVADO POR: ___  Data: ___', '<pre>ESCOPO TÉCNICO — SHOWROOM VIRTUAL\nProjeto: ___ | Data: ___ | Responsável TBO: ___ | Cliente: ___\n\nDISPOSITIVOS: [ ] Totem [ ] Tablet [ ] Desktop [ ] VR\nAMBIENTES: 1.___ 2.___ 3.___\nFUNCIONALIDADES: [ ] Câmeras [ ] Livre [ ] Hotspots [ ] PDF [ ] Analytics\nPRAZO: ___ | APROVADO POR: ___</pre>', 9, 'tip');

  -- ══════════════════════════════════════════════════════════════════════════
  -- SOP 2: Gamificação — Mapa Interativo de Implantação para Vendas
  -- ══════════════════════════════════════════════════════════════════════════
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Mapa Interativo de Implantação para Vendas',
    'tbo-gam-004-mapa-interativo-implantacao',
    'gamificacao',
    'processo',
    'Líder de Gamificação',
    '## Mapa Interativo de Implantação para Vendas

### 1. Objetivo
Definir o processo de criação de mapas interativos de implantação — ferramentas digitais que permitem ao corretor e ao comprador visualizar o empreendimento de cima, selecionar torres/blocos, filtrar unidades disponíveis por critérios (andar, tipologia, orientação solar, preço) e iniciar o processo de reserva. O objetivo é acelerar o tempo de escolha da unidade e reduzir erros de venda.

### 2. Escopo
**Quem executa:** Equipe de Gamificação + D3D (implantação visual)
**Quando se aplica:** Lançamentos com tabela de vendas ativa e múltiplas unidades/torres
**Limites:** Não inclui integração com sistema de vendas/ERP do cliente (consultoria separada); não substitui o material impresso de planta de situação

### 3. RACI

| Atividade | Responsável | Aprovador | Consultado | Informado |
|---|---|---|---|---|
| Briefing e mapeamento de dados | Líder Gamificação | Ruy | Atendimento | D3D |
| Implantação visual (arte) | D3D | Marco | Gamificação | — |
| Desenvolvimento interativo | Dev Gamificação | Líder Gamificação | — | D3D |
| Integração de dados (tabela) | Dev Gamificação | Líder Gamificação | Cliente (TI) | Atendimento |
| QA e entrega | Líder Gamificação | Ruy | — | Cliente |

### 4. Pré-requisitos
- Implantação do empreendimento em DWG ou PDF vetorial aprovado
- Tabela de vendas em formato estruturado (Excel/CSV): unidade, tipologia, metragem, andar, torre, status, preço
- Definição de filtros desejados pelo cliente
- Identidade visual do empreendimento aprovada
- Plataforma de deploy definida (web embed, aplicativo, totem)

### 5. Procedimento

**5.1 Briefing e levantamento de dados (Dia 1-2)**
1. Coletar implantação aprovada e tabela de vendas completa
2. Mapear filtros necessários: por torre, por tipologia, por metragem, por andar, por orientação, por status (disponível/reservado/vendido), por faixa de preço
3. Definir ações disponíveis: visualizar detalhes da unidade, acessar planta, iniciar reserva, compartilhar por WhatsApp
4. Validar frequência de atualização da tabela (manual via upload ou API)

**5.2 Arte da implantação interativa (Dia 3-6)**
1. D3D entrega implantação vetorizada com blocos/torres como elementos separados (SVG ou PNG por camada)
2. Gamificação mapeia coordenadas de cada torre/bloco no canvas
3. Definir estados visuais: hover, selecionado, disponível, reservado, vendido (com cores padronizadas)
4. Revisar com cliente e aprovar arte antes do desenvolvimento

**5.3 Desenvolvimento (Dia 7-14)**
1. Construir canvas interativo (SVG animado ou WebGL)
2. Implementar sistema de filtros com resultados em tempo real
3. Integrar tabela de vendas (upload CSV ou API REST do cliente)
4. Desenvolver modal de detalhes da unidade: planta baixa, metragem, orientação solar, preço, status
5. Implementar ação de reserva: formulário de interesse ou deep link para CRM do cliente
6. Adicionar compartilhamento: gerar link da unidade selecionada via WhatsApp/email

**5.4 QA e ajustes (Dia 15-17)**
1. Testar todos os filtros combinados
2. Simular atualização de tabela (upload de CSV com mudança de status)
3. Testar em mobile (responsivo) e desktop
4. Verificar performance (máx 3s para renderizar o mapa completo)
5. Aprovação final do cliente

**5.5 Entrega (Dia 18)**
1. Deploy em produção
2. Entregar painel de gestão: como atualizar tabela de vendas
3. Documentar embed code (para site do lançamento)
4. Treinar equipe do cliente (30 min)

### 6. Checklist de Validação
- [ ] Todos os blocos/torres clicáveis e com tooltip correto
- [ ] Filtros funcionam em combinação sem erros
- [ ] Tabela de vendas atualiza corretamente via upload CSV
- [ ] Modal de unidade exibe dados corretos
- [ ] Funcionando em mobile e desktop
- [ ] Performance < 3s para carregar
- [ ] Ação de reserva/interesse funcional
- [ ] Compartilhamento por WhatsApp funcional
- [ ] Embed code testado no site do cliente

### 7. Ferramentas e Recursos
- **Frontend:** React + D3.js (SVG interativo) ou Three.js (3D)
- **Dados:** Google Sheets com API (simples) ou upload de CSV
- **Deploy:** Vercel (embed via iframe ou script)
- **Arte:** Figma + exportação SVG em camadas (via D3D)
- **Integração de CRM:** Webhook para RD Station, HubSpot ou CRM nativo

### 8. SLAs e Métricas
- **Prazo padrão:** 18 dias úteis
- **Performance:** renderização < 3s | atualização de status < 1s
- **Precisão de dados:** 0% de erro em status de unidade
- **Cobertura:** 100% das unidades mapeadas
- **KPI:** taxa de cliques em unidades > 60% das visitas ao mapa

### 9. Troubleshooting
| Problema | Causa | Solução |
|---|---|---|
| Mapa não carrega em mobile | Arquivo SVG muito pesado | Simplificar paths, usar versão mobile simplificada |
| Status de unidade desatualizado | Upload manual não realizado | Configurar alerta de atualização semanal |
| Filtro retorna resultado errado | Dados inconsistentes no CSV | Validar schema do CSV antes do upload |
| Clique em unidade não abre modal | Problema de z-index no SVG | Verificar sobreposição de camadas SVG |

### 10. Template — Briefing de Mapa Interativo

```
BRIEFING — MAPA INTERATIVO DE IMPLANTAÇÃO
Empreendimento: ___  Data: ___  Responsável TBO: ___

DADOS DO EMPREENDIMENTO
Torres/blocos: ___  Total de unidades: ___  Tipologias: ___

FILTROS NECESSÁRIOS
[ ] Por torre/bloco  [ ] Por tipologia  [ ] Por metragem  [ ] Por andar
[ ] Por orientação solar  [ ] Por status  [ ] Por faixa de preço

AÇÕES NO MAPA
[ ] Ver planta da unidade  [ ] Iniciar reserva  [ ] Compartilhar por WhatsApp
[ ] Calcular financiamento  [ ] Agendar visita

ATUALIZAÇÃO DE TABELA
[ ] Upload manual (frequência: ___)  [ ] API automática (endpoint: ___)

PLATAFORMA DE DEPLOY
[ ] Embed no site  [ ] Totem no estande  [ ] App standalone

PRAZO: ___  APROVADO POR: ___
```
',
    '<h2>Mapa Interativo de Implantação para Vendas</h2><p>SOP para criação de mapas interativos de implantação que permitem filtrar unidades disponíveis e iniciar reservas.</p>',
    'published',
    'high',
    ARRAY['gamificacao','mapa','implantacao','interativo','vendas','tabela-de-vendas','filtros']::TEXT[],
    3,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title, content = EXCLUDED.content,
    content_html = EXCLUDED.content_html, updated_at = now()
  RETURNING id INTO v_sop_id;

  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type) VALUES
  (v_sop_id, '1. Objetivo', 'Definir o processo de criação de mapas interativos de implantação que permitem visualizar o empreendimento, filtrar unidades por critérios e iniciar reservas. Objetivo: acelerar escolha da unidade e reduzir erros de venda.', '<p>Definir o processo de criação de mapas interativos de implantação com filtros de unidades e ação de reserva.</p>', 0, 'step'),
  (v_sop_id, '2. Escopo', 'Equipe de Gamificação + D3D. Aplica-se a lançamentos com tabela de vendas ativa e múltiplas unidades. Não inclui integração com ERP do cliente nem substitui planta impressa.', '<p>Equipe: Gamificação + D3D. Aplica-se a lançamentos com múltiplas unidades. Não inclui integração ERP.</p>', 1, 'step'),
  (v_sop_id, '3. RACI', '| Atividade | Responsável | Aprovador | Consultado | Informado |
|---|---|---|---|---|
| Briefing e dados | Líder Gamificação | Ruy | Atendimento | D3D |
| Arte implantação | D3D | Marco | Gamificação | — |
| Desenvolvimento | Dev Gamificação | Líder Gamificação | — | D3D |
| Integração dados | Dev Gamificação | Líder Gamificação | Cliente TI | Atendimento |
| QA e entrega | Líder Gamificação | Ruy | — | Cliente |', '<table><tr><th>Atividade</th><th>Responsável</th><th>Aprovador</th></tr><tr><td>Briefing</td><td>Líder Gamificação</td><td>Ruy</td></tr><tr><td>Arte</td><td>D3D</td><td>Marco</td></tr></table>', 2, 'step'),
  (v_sop_id, '4. Pré-requisitos', '- Implantação em DWG ou PDF vetorial aprovado
- Tabela de vendas em Excel/CSV: unidade, tipologia, metragem, andar, torre, status, preço
- Filtros definidos pelo cliente
- Identidade visual aprovada
- Plataforma de deploy definida', '<ul><li>Implantação aprovada em DWG/PDF vetorial</li><li>Tabela de vendas estruturada (CSV)</li><li>Filtros definidos</li><li>Identidade visual aprovada</li></ul>', 3, 'step'),
  (v_sop_id, '5. Procedimento', '5.1 Briefing (Dia 1-2): coletar implantação e tabela, mapear filtros e ações, validar frequência de atualização.
5.2 Arte (Dia 3-6): D3D entrega SVG por camadas, Gamificação mapeia coordenadas, define estados visuais, aprova com cliente.
5.3 Desenvolvimento (Dia 7-14): canvas interativo, filtros em tempo real, integração de tabela, modal de unidade, ação de reserva, compartilhamento WhatsApp.
5.4 QA (Dia 15-17): testar filtros combinados, upload de CSV, mobile/desktop, performance < 3s.
5.5 Entrega (Dia 18): deploy, painel de gestão, embed code, treinamento 30min.', '<ol><li>Briefing e dados (Dia 1-2)</li><li>Arte SVG por camadas (Dia 3-6)</li><li>Desenvolvimento canvas + filtros (Dia 7-14)</li><li>QA (Dia 15-17)</li><li>Entrega e treinamento (Dia 18)</li></ol>', 4, 'step'),
  (v_sop_id, '6. Checklist de Validação', '- [ ] Todos os blocos/torres clicáveis
- [ ] Filtros funcionam em combinação
- [ ] Tabela atualiza via upload CSV
- [ ] Modal com dados corretos
- [ ] Mobile e desktop funcionando
- [ ] Performance < 3s
- [ ] Ação de reserva funcional
- [ ] Compartilhamento WhatsApp funcional
- [ ] Embed testado no site do cliente', '<ul><li>[ ] Todos os blocos clicáveis</li><li>[ ] Filtros combinados OK</li><li>[ ] CSV upload OK</li><li>[ ] Mobile/desktop OK</li><li>[ ] Performance &lt;3s</li></ul>', 5, 'checkpoint'),
  (v_sop_id, '7. Ferramentas', 'Frontend: React + D3.js (SVG) ou Three.js (3D). Dados: Google Sheets API ou upload CSV. Deploy: Vercel embed. Arte: Figma + SVG em camadas. CRM: Webhook para RD Station, HubSpot ou CRM nativo.', '<p>React + D3.js | Google Sheets API | Vercel | Figma</p>', 6, 'tip'),
  (v_sop_id, '8. SLAs e Métricas', 'Prazo: 18 dias úteis. Performance: renderização < 3s, atualização de status < 1s. Precisão: 0% erro em status. KPI: taxa de cliques > 60% das visitas.', '<p>Prazo: 18 dias | Performance: &lt;3s | KPI: cliques &gt;60%</p>', 7, 'note'),
  (v_sop_id, '9. Troubleshooting', 'SVG pesado em mobile → simplificar paths. Status desatualizado → configurar alerta de upload. Filtro errado → validar schema CSV. Modal não abre → verificar z-index SVG.', '<ul><li>SVG pesado: simplificar paths</li><li>Status desatualizado: alerta de upload</li><li>Filtro errado: validar schema CSV</li></ul>', 8, 'warning'),
  (v_sop_id, '10. Template — Briefing de Mapa Interativo', 'BRIEFING — MAPA INTERATIVO DE IMPLANTAÇÃO
Empreendimento: ___  Data: ___

Torres/blocos: ___  Total de unidades: ___  Tipologias: ___

FILTROS: [ ] Torre [ ] Tipologia [ ] Metragem [ ] Andar [ ] Orientação [ ] Status [ ] Preço
AÇÕES: [ ] Ver planta [ ] Reserva [ ] WhatsApp [ ] Financiamento [ ] Visita
ATUALIZAÇÃO: [ ] Manual (freq: ___) [ ] API (endpoint: ___)
DEPLOY: [ ] Embed site [ ] Totem [ ] App standalone

PRAZO: ___  APROVADO POR: ___', '<pre>BRIEFING MAPA INTERATIVO\nTorres: ___ | Unidades: ___ | Tipologias: ___\nFILTROS: Torre | Tipologia | Andar | Status | Preço\nDEPLOY: Embed | Totem | App\nPRAZO: ___</pre>', 9, 'tip');

  -- ══════════════════════════════════════════════════════════════════════════
  -- SOP 3: Financeiro — Conciliação Bancária Mensal
  -- ══════════════════════════════════════════════════════════════════════════
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Conciliação Bancária Mensal',
    'tbo-fin-004-conciliacao-bancaria',
    'financeiro',
    'processo',
    'Líder Financeiro',
    '## Conciliação Bancária Mensal

### 1. Objetivo
Garantir que todos os lançamentos bancários das contas da TBO (corrente, aplicações, contas por BU) estejam corretamente registrados no sistema financeiro (OMIE/TBO OS), identificando e resolvendo divergências antes do fechamento mensal. A conciliação é a base de confiabilidade do DRE e do fluxo de caixa.

### 2. Escopo
**Quem executa:** Responsável Financeiro (Marco/Ruy delegando para gestor financeiro)
**Quando se aplica:** Mensalmente, entre os dias 16 e 18 de cada mês (referente ao ciclo 15-15 encerrado)
**Contas a conciliar:** Conta corrente principal, contas de aplicação, cartão corporativo
**Limites:** Não inclui conciliação de contas de parceiros/fornecedores; não substitui auditoria contábil externa

### 3. RACI

| Atividade | Responsável | Aprovador | Consultado | Informado |
|---|---|---|---|---|
| Download dos extratos bancários | Gest. Financeiro | — | — | — |
| Lançamento e categorização | Gest. Financeiro | Ruy | Marco | — |
| Identificação de divergências | Gest. Financeiro | Ruy | Contabilidade | Marco |
| Ajustes e estornos | Gest. Financeiro | Ruy | — | Marco |
| Fechamento e relatório | Gest. Financeiro | Marco e Ruy | — | Diretoria |

### 4. Pré-requisitos
- Acesso ao internet banking de todas as contas
- Acesso ao OMIE (módulo financeiro) ou TBO OS (módulo Financeiro)
- Extrato bancário do período (dia 15 ao dia 15) baixado em PDF e OFX/CSV
- Todos os lançamentos do período já registrados no sistema (NFs emitidas, pagamentos realizados)
- Planilha de conciliação do mês anterior como base

### 5. Procedimento

**5.1 Preparação (Dia 16 — manhã)**
1. Baixar extrato bancário no formato OFX e PDF de todas as contas (período: dia 15 do mês anterior ao dia 15 do mês atual)
2. Importar extrato OFX no OMIE/TBO OS para conciliação automática
3. Registrar data de início no log de conciliação
4. Abrir planilha de conciliação e duplicar aba do mês anterior

**5.2 Conciliação automática (Dia 16 — tarde)**
1. Executar conciliação automática no sistema: o sistema cruza lançamentos pelo valor e data
2. Revisar os lançamentos conciliados automaticamente (amostragem de 20%)
3. Identificar lançamentos não conciliados automaticamente (divergências)
4. Categorizar por tipo de divergência: (a) lançamento faltante no sistema, (b) lançamento duplicado, (c) valor diferente, (d) data diferente

**5.3 Resolução de divergências (Dia 16-17)**
1. Para cada divergência, investigar causa raiz:
   - Lançamento faltante → registrar no sistema com CC e categoria correta
   - Valor diferente → verificar nota fiscal e ajustar
   - Duplicidade → estornar o lançamento duplicado
   - Data diferente → corrigir competência
2. Documentar cada ajuste com: conta, valor, motivo, aprovação
3. Após ajustes, rodar conciliação novamente até atingir 100% de conciliação

**5.4 Conferência por centro de custo (Dia 17)**
1. Verificar saldo por BU/CC: BRD, D3D, MKT, AV, INT, ADM, CORP
2. Conferir se receitas e despesas estão categorizadas no CC correto
3. Identificar lançamentos sem CC e categorizar
4. Gerar relatório de saldo por CC

**5.5 Fechamento e relatório (Dia 18)**
1. Gerar extrato de conciliação: total conciliado, divergências encontradas e resolvidas, saldo por conta
2. Atualizar DRE com dados do período
3. Enviar relatório para Marco e Ruy via TBO OS (módulo Financeiro)
4. Arquivar extrato PDF e planilha no Drive (pasta: Financeiro/Conciliação/AAAA-MM)
5. Registrar data de fechamento no log de conciliação

### 6. Checklist de Validação
- [ ] Extratos de todas as contas baixados (PDF e OFX)
- [ ] Importação OFX concluída no sistema
- [ ] 100% dos lançamentos conciliados
- [ ] Zero divergências abertas (ou divergências documentadas com justificativa)
- [ ] Todos os lançamentos com CC atribuído
- [ ] DRE atualizado com dados do período
- [ ] Relatório enviado para diretoria
- [ ] Arquivos salvos no Drive com nomenclatura correta

### 7. Ferramentas e Recursos
- **ERP:** OMIE (módulo financeiro) ou TBO OS (módulo Financeiro)
- **Banco:** Internet banking (download OFX/CSV e PDF)
- **Planilha:** Google Sheets — Template de Conciliação Mensal TBO
- **Armazenamento:** Google Drive → Financeiro/Conciliação/AAAA-MM
- **Comunicação:** TBO OS (relatório) + WhatsApp (alertas urgentes)

### 8. SLAs e Métricas
- **Prazo:** Conciliação iniciada dia 16, fechada dia 18 (máx. 3 dias úteis)
- **Completude:** 100% dos lançamentos conciliados até o fechamento
- **Divergências:** zero divergências abertas no fechamento
- **Acurácia de categorização:** 100% dos lançamentos com CC e categoria
- **Arquivo:** 100% dos documentos no Drive em até 24h após fechamento

### 9. Troubleshooting
| Problema | Causa | Solução |
|---|---|---|
| OFX não importa no sistema | Formato incompatível | Converter para CSV e importar manualmente |
| Lançamento não encontrado no banco | Operação em trânsito | Aguardar compensação (até 2 dias úteis) e registrar como pendente |
| Valor divergente sem explicação | Tarifa bancária não registrada | Registrar tarifa como despesa ADM |
| Saldo não fecha com DRE | Lançamento em CC errado | Varrer lançamentos do período e recategorizar |

### 10. Template — Log de Conciliação Mensal

```
LOG DE CONCILIAÇÃO BANCÁRIA
Mês de referência: ___  Período: ___/15 a ___/15
Responsável: ___  Data de início: ___  Data de fechamento: ___

CONTAS CONCILIADAS
[ ] Conta Corrente Principal (Ag: ___ | CC: ___)
[ ] Aplicação/Investimento (___)
[ ] Cartão Corporativo (___)

RESUMO
Total de lançamentos no extrato: ___
Total de lançamentos no sistema: ___
Conciliados automaticamente: ___
Divergências encontradas: ___
Divergências resolvidas: ___
Divergências em aberto: ___

SALDO POR CENTRO DE CUSTO
BRD: R$ ___  | D3D: R$ ___  | MKT: R$ ___
AV: R$ ___   | INT: R$ ___  | ADM: R$ ___  | CORP: R$ ___

APROVADO POR: ___  Data: ___
```
',
    '<h2>Conciliação Bancária Mensal</h2><p>Processo mensal de conciliação das contas TBO com o sistema financeiro, garantindo base confiável para DRE e fluxo de caixa.</p>',
    'published',
    'critical',
    ARRAY['financeiro','conciliacao','bancaria','dre','fechamento','omie','centro-de-custo']::TEXT[],
    3,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title, content = EXCLUDED.content,
    content_html = EXCLUDED.content_html, updated_at = now()
  RETURNING id INTO v_sop_id;

  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type) VALUES
  (v_sop_id, '1. Objetivo', 'Garantir que todos os lançamentos bancários das contas da TBO estejam corretamente registrados no sistema financeiro, identificando e resolvendo divergências antes do fechamento mensal. A conciliação é a base de confiabilidade do DRE e fluxo de caixa.', '<p>Garantir que todos os lançamentos bancários estejam corretamente registrados no sistema financeiro, identificando divergências antes do fechamento mensal.</p>', 0, 'step'),
  (v_sop_id, '2. Escopo', 'Responsável Financeiro. Execução mensal entre dias 16 e 18 (ciclo 15-15 encerrado). Contas: corrente, aplicações, cartão corporativo. Não inclui conciliação de contas de parceiros nem auditoria contábil externa.', '<p>Execução: dias 16-18, mensalmente. Contas: corrente, aplicações, cartão. Não inclui auditoria externa.</p>', 1, 'step'),
  (v_sop_id, '3. RACI', '| Atividade | Responsável | Aprovador | Consultado | Informado |
|---|---|---|---|---|
| Download dos extratos | Gest. Financeiro | — | — | — |
| Lançamento e categorização | Gest. Financeiro | Ruy | Marco | — |
| Identificação de divergências | Gest. Financeiro | Ruy | Contabilidade | Marco |
| Ajustes e estornos | Gest. Financeiro | Ruy | — | Marco |
| Fechamento e relatório | Gest. Financeiro | Marco e Ruy | — | Diretoria |', '<table><tr><th>Atividade</th><th>Responsável</th><th>Aprovador</th></tr><tr><td>Extratos</td><td>Gest. Financeiro</td><td>—</td></tr><tr><td>Fechamento</td><td>Gest. Financeiro</td><td>Marco e Ruy</td></tr></table>', 2, 'step'),
  (v_sop_id, '4. Pré-requisitos', '- Acesso ao internet banking de todas as contas
- Acesso ao OMIE/TBO OS (módulo financeiro)
- Extrato do período (dia 15 ao dia 15) em PDF e OFX/CSV
- Todos os lançamentos do período já registrados no sistema
- Planilha de conciliação do mês anterior como base', '<ul><li>Acesso ao internet banking</li><li>Acesso OMIE/TBO OS</li><li>Extrato do período (PDF e OFX)</li><li>Lançamentos do período registrados</li><li>Planilha do mês anterior</li></ul>', 3, 'step'),
  (v_sop_id, '5. Procedimento', '5.1 Preparação (Dia 16 manhã): baixar extrato OFX e PDF de todas as contas, importar OFX no sistema, abrir planilha.
5.2 Conciliação automática (Dia 16 tarde): executar conciliação automática, revisar amostragem 20%, identificar divergências por tipo: (a) faltante, (b) duplicado, (c) valor diferente, (d) data diferente.
5.3 Resolução (Dia 16-17): investigar causa raiz de cada divergência, registrar ajustes com CC e categoria, rodar conciliação até 100%.
5.4 Conferência por CC (Dia 17): verificar saldo por BU/CC, categorizar lançamentos sem CC.
5.5 Fechamento (Dia 18): gerar extrato de conciliação, atualizar DRE, enviar relatório para diretoria, arquivar no Drive.', '<ol><li>Preparação: extratos e importação (Dia 16)</li><li>Conciliação automática e divergências (Dia 16)</li><li>Resolução de divergências (Dia 16-17)</li><li>Conferência por CC (Dia 17)</li><li>Fechamento e relatório (Dia 18)</li></ol>', 4, 'step'),
  (v_sop_id, '6. Checklist de Validação', '- [ ] Extratos de todas as contas baixados (PDF e OFX)
- [ ] Importação OFX concluída
- [ ] 100% dos lançamentos conciliados
- [ ] Zero divergências abertas
- [ ] Todos os lançamentos com CC atribuído
- [ ] DRE atualizado
- [ ] Relatório enviado para diretoria
- [ ] Arquivos salvos no Drive', '<ul><li>[ ] Extratos baixados</li><li>[ ] 100% conciliados</li><li>[ ] Zero divergências abertas</li><li>[ ] DRE atualizado</li><li>[ ] Relatório enviado</li></ul>', 5, 'checkpoint'),
  (v_sop_id, '7. Ferramentas', 'ERP: OMIE ou TBO OS. Banco: internet banking (OFX/CSV e PDF). Planilha: Google Sheets — Template Conciliação. Drive: Financeiro/Conciliação/AAAA-MM. Comunicação: TBO OS + WhatsApp.', '<p>OMIE / TBO OS | Internet banking | Google Sheets | Google Drive</p>', 6, 'tip'),
  (v_sop_id, '8. SLAs e Métricas', 'Prazo: iniciada dia 16, fechada dia 18. Completude: 100% dos lançamentos conciliados. Divergências: zero abertas no fechamento. Acurácia: 100% dos lançamentos com CC. Arquivo: Drive em até 24h após fechamento.', '<p>Prazo: dias 16-18 | 100% conciliados | Zero divergências abertas | Arquivo em 24h</p>', 7, 'note'),
  (v_sop_id, '9. Troubleshooting', 'OFX não importa → converter para CSV. Lançamento não encontrado → operação em trânsito, aguardar 2 dias. Valor divergente sem explicação → tarifa bancária, registrar como despesa ADM. Saldo não fecha com DRE → lançamento em CC errado, recategorizar.', '<ul><li>OFX incompatível: converter para CSV</li><li>Lançamento em trânsito: aguardar 2 dias</li><li>Valor divergente: tarifa bancária → despesa ADM</li><li>DRE não fecha: recategorizar lançamentos</li></ul>', 8, 'warning'),
  (v_sop_id, '10. Template — Log de Conciliação', 'LOG DE CONCILIAÇÃO BANCÁRIA
Mês de referência: ___  Período: ___/15 a ___/15
Responsável: ___  Início: ___  Fechamento: ___

CONTAS: [ ] Corrente Principal [ ] Aplicação [ ] Cartão Corporativo

RESUMO
Lançamentos no extrato: ___  | No sistema: ___
Conciliados automático: ___  | Divergências encontradas: ___
Divergências resolvidas: ___  | Em aberto: ___

SALDO POR CC
BRD: R$___ | D3D: R$___ | MKT: R$___ | AV: R$___ | ADM: R$___ | CORP: R$___

APROVADO POR: ___  Data: ___', '<pre>LOG DE CONCILIAÇÃO\nPeríodo: ___/15 a ___/15 | Responsável: ___\nLançamentos extrato: ___ | Sistema: ___ | Divergências: ___\nSaldo BRD:___ D3D:___ MKT:___ AV:___ ADM:___ CORP:___\nAprovado por: ___</pre>', 9, 'tip');

  -- ══════════════════════════════════════════════════════════════════════════
  -- SOP 4: Atendimento — Briefing Completo com Cliente
  -- ══════════════════════════════════════════════════════════════════════════
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Briefing Completo com Cliente',
    'tbo-atd-005-briefing-completo-cliente',
    'atendimento',
    'processo',
    'Líder de Atendimento',
    '## Briefing Completo com Cliente

### 1. Objetivo
Estruturar o processo de coleta, validação e documentação do briefing criativo completo junto ao cliente — desde o primeiro contato pós-contratação até a aprovação formal do documento que orienta toda a produção da TBO. Um briefing bem feito elimina retrabalho, alinha expectativas e protege a TBO de escopo não contratado.

### 2. Escopo
**Quem executa:** Atendimento (líder) + Diretor Criativo (Marco) para validação estratégica
**Quando se aplica:** Todo projeto novo após assinatura do contrato e antes de qualquer produção
**Limites:** Não inclui briefing técnico de produção por BU (cada BU tem seu próprio briefing específico); não substitui kick-off de projeto (SOP ops-003)

### 3. RACI

| Atividade | Responsável | Aprovador | Consultado | Informado |
|---|---|---|---|---|
| Agendamento da reunião de briefing | Atendimento | — | Cliente | Marco, Ruy |
| Condução da reunião | Atendimento | Marco | — | BU responsável |
| Documentação do briefing | Atendimento | Marco | — | — |
| Validação estratégica do briefing | Marco | Ruy | Atendimento | — |
| Aprovação formal pelo cliente | Atendimento | Marco | — | BU responsável |
| Distribuição para equipe de produção | Atendimento | — | — | Todas as BUs envolvidas |

### 4. Pré-requisitos
- Contrato assinado com escopo definido
- Template de briefing TBO atualizado (versão atual no Notion/Drive)
- Acesso à pasta do projeto no Drive (criada pelo Ops no kick-off)
- Informações básicas do empreendimento já coletadas na fase comercial

### 5. Procedimento

**5.1 Preparação pré-reunião (até 2 dias antes)**
1. Revisar proposta comercial aprovada e contrato: identificar escopo exato contratado
2. Preencher campos já conhecidos no template de briefing (nome do empreendimento, incorporadora, endereço, tipologias básicas)
3. Preparar perguntas específicas por entregável contratado
4. Enviar roteiro de briefing ao cliente com 24h de antecedência para que prepare respostas
5. Confirmar presença de decisores (não apenas equipe de marketing — incluir diretor comercial quando possível)

**5.2 Reunião de briefing (2-3h)**

**Bloco 1 — O Empreendimento (30min)**
- Nome, localização, tipologias, metragens, diferenciais do produto
- Público-alvo: perfil do comprador (renda, faixa etária, estilo de vida, motivação de compra)
- Diferenciais competitivos: o que este produto tem que a concorrência não tem?
- Concorrentes diretos: quem são, onde estão, como se posicionam?

**Bloco 2 — A Marca e a Comunicação (30min)**
- Existe marca do empreendimento? Está aprovada ou em criação?
- Tom de voz: como a incorporadora quer ser percebida? (luxo, acessível, moderno, familiar)
- Referências visuais aprovadas e reprovadas
- Restrições de marca: elementos obrigatórios (logo incorporadora, parceiros), elementos proibidos

**Bloco 3 — Os Entregáveis (60min)**
- Para cada entregável contratado: objetivo, público, canal, prazo, formato
- Aprovações necessárias: quem aprova cada entregável? Quantas rodadas de revisão?
- Restrições legais/regulatórias (aprovações de vendas, CRI, registros)

**Bloco 4 — Cronograma e Logística (30min)**
- Data de lançamento (hard deadline ou flexível?)
- Prazos intermediários: aprovação de briefing, aprovação de arte, aprovação de conteúdo
- Contatos de aprovação por entregável (nome, e-mail, WhatsApp)
- Reuniões de acompanhamento: frequência e formato

**5.3 Documentação (até 24h após reunião)**
1. Preencher template completo de briefing com todas as respostas
2. Adicionar anotações e nuances captadas na reunião (contexto não dito explicitamente)
3. Registrar itens de alerta: solicitações fora do escopo, prazos agressivos, decisores ausentes
4. Revisar com Marco antes de enviar ao cliente

**5.4 Validação e aprovação (até 3 dias após reunião)**
1. Enviar briefing ao cliente via e-mail com PDF e link para revisão online
2. Prazo de retorno do cliente: 2 dias úteis
3. Consolidar alterações em até 1 dia útil
4. Obter aprovação formal: assinatura no PDF ou confirmação por e-mail com "Briefing aprovado — [data]"
5. Registrar data de aprovação no TBO OS (módulo Projetos)

**5.5 Distribuição interna**
1. Publicar briefing aprovado no Notion do projeto
2. Compartilhar com todas as BUs envolvidas via TBO OS
3. Realizar reunião de alinhamento interno (kick-off criativo): 30-60min com equipe de produção
4. Registrar alertas e pontos de atenção no briefing da BU responsável

### 6. Checklist de Validação
- [ ] Template completo preenchido (todos os campos obrigatórios)
- [ ] Público-alvo descrito com riqueza de detalhes
- [ ] Diferenciais competitivos documentados
- [ ] Tom de voz e referências visuais registrados
- [ ] Entregáveis mapeados com objetivo, canal, prazo e aprovador
- [ ] Cronograma com datas definidas (não "a definir")
- [ ] Itens fora do escopo identificados e registrados
- [ ] Revisado e validado pelo Marco
- [ ] Aprovação formal obtida do cliente
- [ ] Distribuído para todas as BUs envolvidas

### 7. Ferramentas e Recursos
- **Template de Briefing TBO:** Notion (link: ___) / Google Docs (Drive: Clientes/___)
- **Reunião:** Google Meet ou presencial no escritório/cliente
- **Registro:** TBO OS (módulo Projetos → tab Briefing)
- **Armazenamento:** Drive → [Cliente]/[Empreendimento]/01_Briefing/

### 8. SLAs e Métricas
- **Reunião de briefing:** agendada em até 5 dias após assinatura do contrato
- **Documentação:** enviada ao cliente em até 24h após a reunião
- **Aprovação pelo cliente:** em até 3 dias úteis após envio
- **Ciclo total:** briefing aprovado em até 8 dias úteis após contratação
- **Retrabalho:** briefing bem feito → reduzir revisões de arte em > 40%

### 9. Troubleshooting
| Problema | Causa | Solução |
|---|---|---|
| Cliente não responde o briefing | Falta de urgência percebida | Ligar (não WhatsApp) e reforçar que atrasa o cronograma |
| Decisor ausente na reunião | Agenda incompatível | Remarcar ou realizar segunda reunião apenas com decisor |
| Escopo solicitado > escopo contratado | Cliente não leu contrato | Mapear gap, registrar no briefing e acionar Ruy para aditivo |
| Referências conflitantes | Múltiplos stakeholders | Identificar hierarquia de aprovação e resolver antes de prosseguir |

### 10. Template — Briefing TBO (resumo estruturado)

```
BRIEFING — [NOME DO EMPREENDIMENTO]
Versão: 1.0  Data: ___  Atendimento: ___  Aprovador TBO: Marco

═══ O EMPREENDIMENTO ═══
Nome: ___  Incorporadora: ___  Localização: ___
Tipologias: ___  Metragens: ___  VGV estimado: R$ ___
Data de lançamento: ___

Público-alvo:
- Perfil: ___
- Faixa etária: ___
- Renda: ___
- Motivação de compra: ___

Diferenciais do produto:
1. ___  2. ___  3. ___

Concorrentes diretos:
1. ___  2. ___

═══ MARCA E COMUNICAÇÃO ═══
Tom de voz: [ ] Luxo [ ] Premium [ ] Popular [ ] Familiar [ ] Moderno [ ] Outro: ___
Referências APROVADAS: ___
Referências REPROVADAS: ___
Restrições obrigatórias: ___

═══ ENTREGÁVEIS ═══
| Entregável | Objetivo | Canal | Prazo | Aprovador |
| ___ | ___ | ___ | ___ | ___ |

═══ CRONOGRAMA ═══
Aprovação de briefing: ___
Aprovação de arte: ___
Entrega final: ___
Lançamento: ___

APROVADO POR (cliente): ___  Data: ___
APROVADO POR (TBO): Marco Andolfato  Data: ___
```
',
    '<h2>Briefing Completo com Cliente</h2><p>Processo de coleta, validação e documentação do briefing criativo completo — da reunião à aprovação formal.</p>',
    'published',
    'critical',
    ARRAY['atendimento','briefing','cliente','kick-off','alinhamento','escopo','aprovacao']::TEXT[],
    4,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title, content = EXCLUDED.content,
    content_html = EXCLUDED.content_html, updated_at = now()
  RETURNING id INTO v_sop_id;

  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type) VALUES
  (v_sop_id, '1. Objetivo', 'Estruturar o processo de coleta, validação e documentação do briefing criativo completo junto ao cliente. Um briefing bem feito elimina retrabalho, alinha expectativas e protege a TBO de escopo não contratado.', '<p>Estruturar o processo de briefing criativo completo para eliminar retrabalho e proteger o escopo contratado.</p>', 0, 'step'),
  (v_sop_id, '2. Escopo', 'Atendimento (líder) + Marco (validação estratégica). Aplica-se a todo projeto novo após assinatura do contrato e antes de qualquer produção. Não inclui briefing técnico de produção por BU nem substitui o kick-off de projeto.', '<p>Todo projeto novo pós-contratação. Atendimento + Marco. Não substitui kick-off (ops-003).</p>', 1, 'step'),
  (v_sop_id, '3. RACI', '| Atividade | Responsável | Aprovador | Consultado | Informado |
|---|---|---|---|---|
| Agendamento | Atendimento | — | Cliente | Marco, Ruy |
| Condução da reunião | Atendimento | Marco | — | BU responsável |
| Documentação | Atendimento | Marco | — | — |
| Validação estratégica | Marco | Ruy | Atendimento | — |
| Aprovação pelo cliente | Atendimento | Marco | — | BUs envolvidas |
| Distribuição interna | Atendimento | — | — | Todas as BUs |', '<table><tr><th>Atividade</th><th>Responsável</th><th>Aprovador</th></tr><tr><td>Condução da reunião</td><td>Atendimento</td><td>Marco</td></tr><tr><td>Aprovação cliente</td><td>Atendimento</td><td>Marco</td></tr></table>', 2, 'step'),
  (v_sop_id, '4. Pré-requisitos', '- Contrato assinado com escopo definido
- Template de briefing TBO atualizado
- Pasta do projeto no Drive criada pelo Ops
- Informações básicas do empreendimento da fase comercial', '<ul><li>Contrato assinado</li><li>Template de briefing atualizado</li><li>Pasta no Drive criada</li><li>Dados básicos da fase comercial</li></ul>', 3, 'step'),
  (v_sop_id, '5. Procedimento', '5.1 Preparação (até 2 dias antes): revisar contrato, preencher campos conhecidos, preparar perguntas, enviar roteiro ao cliente, confirmar presença de decisores.
5.2 Reunião de briefing (2-3h): Bloco 1 — O Empreendimento (produto, público, diferenciais, concorrentes). Bloco 2 — Marca e Comunicação (tom de voz, referências, restrições). Bloco 3 — Entregáveis (objetivo, canal, prazo, aprovadores). Bloco 4 — Cronograma e logística.
5.3 Documentação (até 24h): preencher template completo, adicionar anotações e alertas, revisar com Marco.
5.4 Aprovação (até 3 dias): enviar ao cliente, prazo de 2 dias para retorno, consolidar alterações, obter aprovação formal.
5.5 Distribuição interna: publicar no Notion, compartilhar no TBO OS, realizar kick-off criativo interno.', '<ol><li>Preparação pré-reunião</li><li>Reunião de briefing (4 blocos: produto, marca, entregáveis, cronograma)</li><li>Documentação em 24h</li><li>Aprovação formal pelo cliente</li><li>Distribuição interna + kick-off criativo</li></ol>', 4, 'step'),
  (v_sop_id, '6. Checklist de Validação', '- [ ] Template completo preenchido
- [ ] Público-alvo descrito com detalhes
- [ ] Diferenciais competitivos documentados
- [ ] Tom de voz e referências registrados
- [ ] Entregáveis mapeados com objetivo, canal, prazo e aprovador
- [ ] Cronograma com datas definidas
- [ ] Itens fora do escopo identificados
- [ ] Validado pelo Marco
- [ ] Aprovação formal do cliente
- [ ] Distribuído para todas as BUs', '<ul><li>[ ] Template completo</li><li>[ ] Público-alvo detalhado</li><li>[ ] Entregáveis mapeados com datas</li><li>[ ] Validado por Marco</li><li>[ ] Aprovação formal do cliente</li></ul>', 5, 'checkpoint'),
  (v_sop_id, '7. Ferramentas', 'Template de Briefing TBO: Notion/Google Docs. Reunião: Google Meet ou presencial. Registro: TBO OS (Projetos → Briefing). Armazenamento: Drive → [Cliente]/[Empreendimento]/01_Briefing/.', '<p>Notion | Google Docs | Google Meet | TBO OS | Google Drive</p>', 6, 'tip'),
  (v_sop_id, '8. SLAs e Métricas', 'Reunião agendada em até 5 dias pós-contratação. Documentação enviada em até 24h após reunião. Aprovação do cliente em até 3 dias úteis. Ciclo total: briefing aprovado em até 8 dias úteis. Meta: reduzir revisões de arte em > 40%.', '<p>Agendamento: 5 dias pós-contratação | Documentação: 24h | Aprovação: 3 dias | Total: 8 dias úteis</p>', 7, 'note'),
  (v_sop_id, '9. Troubleshooting', 'Cliente não responde → ligar (não WhatsApp) e reforçar impacto no cronograma. Decisor ausente → remarcar. Escopo solicitado > contratado → mapear gap e acionar Ruy para aditivo. Referências conflitantes → identificar hierarquia de aprovação antes de prosseguir.', '<ul><li>Sem resposta: ligar e reforçar cronograma</li><li>Decisor ausente: remarcar</li><li>Escopo extrapolado: aditivo via Ruy</li><li>Referências conflitantes: definir hierarquia</li></ul>', 8, 'warning'),
  (v_sop_id, '10. Template — Briefing TBO (estrutura)', 'BRIEFING — [NOME DO EMPREENDIMENTO]
Versão: 1.0 | Data: ___ | Atendimento: ___ | Aprovador TBO: Marco

O EMPREENDIMENTO
Nome: ___ | Incorporadora: ___ | Localização: ___
Tipologias: ___ | Data de lançamento: ___
Público-alvo: Perfil: ___ | Faixa etária: ___ | Renda: ___ | Motivação: ___
Diferenciais: 1.___ 2.___ 3.___
Concorrentes: 1.___ 2.___

MARCA E COMUNICAÇÃO
Tom de voz: [ ] Luxo [ ] Premium [ ] Popular [ ] Familiar [ ] Moderno
Referências APROVADAS: ___ | REPROVADAS: ___

ENTREGÁVEIS
| Entregável | Objetivo | Canal | Prazo | Aprovador |

CRONOGRAMA
Aprovação briefing: ___ | Aprovação arte: ___ | Entrega: ___ | Lançamento: ___

APROVADO (cliente): ___ Data: ___  |  APROVADO (TBO): Marco  Data: ___', '<pre>BRIEFING — [EMPREENDIMENTO]\nPúblico: ___ | Tom: ___ | Diferenciais: ___\nEntregáveis: | Entregável | Prazo | Aprovador |\nLançamento: ___\nAprovado cliente: ___ | Marco: ___</pre>', 9, 'tip');

  -- ══════════════════════════════════════════════════════════════════════════
  -- SOP 5: Comercial — Onboarding de Novo Cliente (Primeiros 30 Dias)
  -- ══════════════════════════════════════════════════════════════════════════
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Onboarding de Novo Cliente — Primeiros 30 Dias',
    'tbo-com-005-onboarding-novo-cliente',
    'comercial',
    'processo',
    'Diretor Comercial (Ruy)',
    '## Onboarding de Novo Cliente — Primeiros 30 Dias

### 1. Objetivo
Estruturar a experiência dos primeiros 30 dias do cliente na TBO — o período mais crítico para a retenção e formação da percepção de valor. Um onboarding bem executado transforma a primeira entrega em referência e aumenta a probabilidade de projetos futuros e indicações.

### 2. Escopo
**Quem executa:** Comercial (Ruy) + Atendimento (líder designado) + BUs envolvidas
**Quando se aplica:** Todo cliente novo após assinatura do primeiro contrato
**Limites:** Não substitui o kick-off de projeto (ops-003) nem o briefing (atd-005); foca na gestão do relacionamento, não na produção

### 3. RACI

| Atividade | Responsável | Aprovador | Consultado | Informado |
|---|---|---|---|---|
| Designação do líder de atendimento | Ruy | Marco | — | Atendimento |
| Welcome kit e comunicação inicial | Atendimento | Ruy | — | Marco |
| Kick-off de projeto | Ops + Atendimento | Marco | BUs | Cliente |
| Briefing criativo | Atendimento | Marco | — | BUs |
| Check-in de 15 dias | Atendimento | Ruy | — | Marco |
| Check-in de 30 dias | Ruy | Marco | Atendimento | — |
| Pesquisa de satisfação (30 dias) | Atendimento | Ruy | — | Marco |

### 4. Pré-requisitos
- Contrato assinado e pasta do cliente criada no Drive e TBO OS
- Atendimento designado e comunicado ao cliente
- Proposta comercial e escopo como referência
- Template de Welcome Kit atualizado

### 5. Procedimento

**Dia 0 — Assinatura do Contrato**
1. Ruy envia e-mail de boas-vindas pessoal (não automático) com:
   - Agradecimento pela confiança
   - Apresentação do time que vai atender (nome, foto, contato)
   - Próximos passos claros (O que acontece agora? Quando? Quem vai contatar?)
2. Criar pasta do cliente no Drive com estrutura padrão
3. Registrar cliente no TBO OS (módulo Clientes + Projetos)
4. Atendimento designado contata cliente em até 24h para apresentação

**Dia 1-3 — Welcome Kit**
1. Enviar Welcome Kit (digital ou físico dependendo do cliente):
   - Apresentação da TBO: quem somos, nosso processo, nossas BUs
   - Time dedicado: atendimento, produtor, diretor criativo
   - Guia de colaboração: como funciona a aprovação, quantas rodadas de revisão, SLAs
   - Calendário dos próximos 30 dias: datas importantes, entregas esperadas
   - Contatos diretos de cada responsável

**Dia 3-5 — Kick-off de Projeto**
1. Reunião de kick-off (ops-003): alinhamento de escopo, cronograma, papéis
2. Reunião de briefing (atd-005): coleta completa do briefing criativo
3. Registrar no TBO OS: datas, responsáveis, marcos

**Dia 7 — Check-in de Início**
1. Atendimento contata cliente (WhatsApp ou call de 15min):
   - "Temos tudo o que precisamos para começar?"
   - Esclarecer dúvidas do processo
   - Confirmar preferência de comunicação (WhatsApp, e-mail, calls semanais)
2. Registrar preferências no TBO OS (perfil do cliente)

**Dia 15 — Check-in de Meio**
1. Call de 15-20min com Atendimento:
   - Status da produção: o que foi feito, o que está em andamento
   - Alguma preocupação ou expectativa não atendida?
   - Antecipação das próximas entregas
2. Registrar resultado no TBO OS (comentário na atividade do projeto)

**Dia 30 — Check-in de Encerramento do Onboarding**
1. Call de 30min com Ruy (presença de Marco se projeto estratégico):
   - Revisão do primeiro mês: entregas realizadas, qualidade percebida
   - Feedback aberto: o que funcionou bem? O que melhorar?
   - Apresentar próximos projetos ou expansão do escopo (upsell natural)
2. Enviar pesquisa de satisfação (NPS) após a call
3. Registrar NPS e feedbacks no TBO OS
4. Definir ritmo de relacionamento pós-onboarding: reuniões mensais/quinzenais

### 6. Checklist de Validação
- [ ] E-mail de boas-vindas pessoal enviado por Ruy (Dia 0)
- [ ] Atendimento contatou cliente em até 24h
- [ ] Welcome Kit enviado (Dia 1-3)
- [ ] Kick-off de projeto realizado
- [ ] Briefing completo coletado e aprovado
- [ ] Check-in de Dia 7 realizado
- [ ] Check-in de Dia 15 realizado
- [ ] Check-in de Dia 30 realizado com Ruy
- [ ] NPS coletado e registrado no TBO OS
- [ ] Ritmo de relacionamento pós-onboarding definido

### 7. Ferramentas e Recursos
- **CRM:** TBO OS (módulo Clientes + Projetos)
- **Comunicação:** E-mail (formal) + WhatsApp Business (ágil)
- **Welcome Kit:** Notion ou PDF (template em Drive: Comercial/Welcome Kit/)
- **NPS:** Google Forms ou Typeform (template em Drive: Comercial/Pesquisas/)
- **Reuniões:** Google Meet

### 8. SLAs e Métricas
- **Tempo de primeira resposta pós-assinatura:** < 24h
- **Welcome Kit:** enviado em até 3 dias corridos
- **NPS pós-onboarding:** meta > 8,5 (escala 0-10)
- **Taxa de retenção pós-onboarding:** meta > 85%
- **Tempo de kick-off:** realizado em até 5 dias úteis pós-assinatura

### 9. Troubleshooting
| Problema | Causa | Solução |
|---|---|---|
| Cliente não responde no início | Desorganização interna | Ligar direto para o decisor que assinou |
| Expectativas desalinhadas | Briefing incompleto | Reunião adicional de alinhamento, não pular etapas |
| Cliente insatisfeito no check-in de 15 dias | Produção mais lenta que esperado | Ruy entra no processo pessoalmente e redefine prazo |
| NPS abaixo de 7 | Problema real de entrega ou comunicação | Reunião de recuperação com Marco e Ruy em até 48h |

### 10. Template — E-mail de Boas-Vindas (Ruy)

```
Assunto: Bem-vindo(a) à TBO, [Nome do Cliente]!

[Nome],

É com muito prazer que damos as boas-vindas à TBO.

A partir de agora, você tem um time dedicado a fazer [Nome do Empreendimento] se destacar.

**Seu time:**
- [Nome Atendimento] (Atendimento) — [WhatsApp]
- [Nome Diretor Criativo] (Direção Criativa) — [WhatsApp]
- Ruy Lima (Diretor Comercial) — [WhatsApp] — copie-me sempre que precisar de algo urgente

**Próximos passos:**
1. [Nome Atendimento] vai entrar em contato ainda hoje para agendar o briefing
2. Kick-off de projeto: [data sugerida]
3. Briefing criativo: [data sugerida]

Estamos muito animados com este projeto. Qualquer dúvida, estou à disposição.

Ruy Lima
Diretor Comercial | TBO
[contato]
```
',
    '<h2>Onboarding de Novo Cliente — Primeiros 30 Dias</h2><p>Processo estruturado para os primeiros 30 dias do cliente na TBO, garantindo alinhamento, engajamento e base para retenção.</p>',
    'published',
    'critical',
    ARRAY['comercial','onboarding','cliente','relacionamento','nps','retencao','welcome-kit']::TEXT[],
    4,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title, content = EXCLUDED.content,
    content_html = EXCLUDED.content_html, updated_at = now()
  RETURNING id INTO v_sop_id;

  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type) VALUES
  (v_sop_id, '1. Objetivo', 'Estruturar a experiência dos primeiros 30 dias do cliente na TBO — o período mais crítico para retenção e formação de percepção de valor. Um onboarding bem executado transforma a primeira entrega em referência e aumenta a probabilidade de projetos futuros.', '<p>Estruturar os primeiros 30 dias do cliente para garantir retenção e percepção de valor desde o início.</p>', 0, 'step'),
  (v_sop_id, '2. Escopo', 'Comercial (Ruy) + Atendimento + BUs envolvidas. Todo cliente novo após assinatura do primeiro contrato. Não substitui kick-off (ops-003) nem briefing (atd-005) — foca no relacionamento, não na produção.', '<p>Ruy + Atendimento. Todo cliente novo. Foca no relacionamento, complementa kick-off e briefing.</p>', 1, 'step'),
  (v_sop_id, '3. RACI', '| Atividade | Responsável | Aprovador | Consultado | Informado |
|---|---|---|---|---|
| Designação do atendimento | Ruy | Marco | — | Atendimento |
| Welcome kit | Atendimento | Ruy | — | Marco |
| Kick-off | Ops + Atendimento | Marco | BUs | Cliente |
| Check-in 15 dias | Atendimento | Ruy | — | Marco |
| Check-in 30 dias | Ruy | Marco | Atendimento | — |
| NPS | Atendimento | Ruy | — | Marco |', '<table><tr><th>Atividade</th><th>Responsável</th><th>Aprovador</th></tr><tr><td>Welcome kit</td><td>Atendimento</td><td>Ruy</td></tr><tr><td>Check-in 30 dias</td><td>Ruy</td><td>Marco</td></tr></table>', 2, 'step'),
  (v_sop_id, '4. Pré-requisitos', '- Contrato assinado e pasta do cliente criada no Drive e TBO OS
- Atendimento designado e comunicado ao cliente
- Proposta comercial e escopo como referência
- Template de Welcome Kit atualizado', '<ul><li>Contrato assinado</li><li>Pasta no Drive e TBO OS criada</li><li>Atendimento designado</li><li>Welcome Kit pronto</li></ul>', 3, 'step'),
  (v_sop_id, '5. Procedimento', 'Dia 0: e-mail pessoal de boas-vindas de Ruy, criar pasta no Drive, registrar no TBO OS, atendimento contata em 24h.
Dia 1-3: enviar Welcome Kit (time dedicado, processo de aprovação, SLAs, calendário dos próximos 30 dias).
Dia 3-5: kick-off de projeto (ops-003) + briefing criativo (atd-005).
Dia 7: check-in de início (WhatsApp/call 15min) — confirmar preferências de comunicação.
Dia 15: check-in de meio (call 15-20min) — status e expectativas.
Dia 30: check-in com Ruy (call 30min) — retrospectiva, feedback, upsell natural, NPS pós-call.', '<ol><li>Dia 0: e-mail pessoal de Ruy + registro TBO OS</li><li>Dia 1-3: Welcome Kit</li><li>Dia 3-5: kick-off + briefing</li><li>Dia 7: check-in de início</li><li>Dia 15: check-in de meio</li><li>Dia 30: retrospectiva com Ruy + NPS</li></ol>', 4, 'step'),
  (v_sop_id, '6. Checklist de Validação', '- [ ] E-mail de boas-vindas pessoal de Ruy (Dia 0)
- [ ] Atendimento contatou em até 24h
- [ ] Welcome Kit enviado (Dia 1-3)
- [ ] Kick-off realizado
- [ ] Briefing coletado e aprovado
- [ ] Check-in Dia 7 realizado
- [ ] Check-in Dia 15 realizado
- [ ] Check-in Dia 30 com Ruy
- [ ] NPS coletado e registrado
- [ ] Ritmo pós-onboarding definido', '<ul><li>[ ] E-mail Ruy (Dia 0)</li><li>[ ] Welcome Kit (Dia 1-3)</li><li>[ ] Kick-off + briefing</li><li>[ ] Check-ins Dia 7, 15, 30</li><li>[ ] NPS registrado</li></ul>', 5, 'checkpoint'),
  (v_sop_id, '7. Ferramentas', 'CRM: TBO OS (Clientes + Projetos). Comunicação: E-mail + WhatsApp Business. Welcome Kit: Notion ou PDF (Drive: Comercial/Welcome Kit/). NPS: Google Forms ou Typeform. Reuniões: Google Meet.', '<p>TBO OS | E-mail | WhatsApp | Notion/PDF | Google Forms | Google Meet</p>', 6, 'tip'),
  (v_sop_id, '8. SLAs e Métricas', 'Primeira resposta pós-assinatura: < 24h. Welcome Kit: até 3 dias. NPS pós-onboarding: meta > 8,5. Taxa de retenção: meta > 85%. Kick-off: até 5 dias úteis pós-assinatura.', '<p>Resposta: &lt;24h | Welcome Kit: 3 dias | NPS: &gt;8,5 | Retenção: &gt;85%</p>', 7, 'note'),
  (v_sop_id, '9. Troubleshooting', 'Cliente não responde → ligar direto para o decisor que assinou. Expectativas desalinhadas → reunião adicional, não pular etapas. Produção mais lenta → Ruy entra pessoalmente e redefine prazo. NPS < 7 → reunião de recuperação com Marco e Ruy em até 48h.', '<ul><li>Sem resposta: ligar para decisor</li><li>Expectativas erradas: reunião adicional</li><li>Produção lenta: Ruy assume pessoalmente</li><li>NPS &lt;7: reunião de recuperação em 48h</li></ul>', 8, 'warning'),
  (v_sop_id, '10. Template — E-mail de Boas-Vindas (Ruy)', 'ASSUNTO: Bem-vindo(a) à TBO, [Nome do Cliente]!

[Nome],

É com muito prazer que damos as boas-vindas à TBO.

A partir de agora, você tem um time dedicado a fazer [Nome do Empreendimento] se destacar.

SEU TIME:
- [Nome Atendimento] (Atendimento) — [WhatsApp]
- [Nome Diretor Criativo] (Direção Criativa) — [WhatsApp]
- Ruy Lima (Diretor Comercial) — [WhatsApp]

PRÓXIMOS PASSOS:
1. [Nome Atendimento] entra em contato ainda hoje para agendar o briefing
2. Kick-off de projeto: [data sugerida]
3. Briefing criativo: [data sugerida]

Ruy Lima | Diretor Comercial | TBO', '<pre>ASSUNTO: Bem-vindo(a) à TBO, [Nome]!\n\nSeu time: Atendimento | Dir. Criativo | Ruy\nPróximos passos: briefing → kick-off → produção\n\nRuy Lima | Diretor Comercial | TBO</pre>', 9, 'tip');

END $$;

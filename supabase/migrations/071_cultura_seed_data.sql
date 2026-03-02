-- Migration 071: Cultura seed data from Manual de Cultura TBO (Notion v2.1)
-- Source: data/cultura-data.js — 12 sections, originally synced from Notion
-- This seeds cultura_items (generic content) + ritual_types + recognition_rewards

-- NOTE: Uses a placeholder tenant_id variable. Replace '<TENANT_ID>' with the actual
-- tenant UUID before running, OR wrap in a function that resolves tenant dynamically.

-- Helper: get first tenant for seeding (single-tenant bootstrap)
DO $$
DECLARE
  tid UUID;
BEGIN
  SELECT id INTO tid FROM tenants LIMIT 1;
  IF tid IS NULL THEN
    RAISE NOTICE 'No tenant found — skipping seed data';
    RETURN;
  END IF;

  -- ═══════════════════════════════════════════════════════════════════
  -- CULTURA_ITEMS: Pilares (category = 'pilar')
  -- ═══════════════════════════════════════════════════════════════════
  INSERT INTO cultura_items (tenant_id, category, title, content, status, order_index, icon, metadata) VALUES
  (tid, 'pilar', 'Mensagem dos Fundadores',
   E'Construimos a TBO com a crenca de que e possivel fazer trabalho de excelencia no mercado imobiliario brasileiro. Cada pessoa que entra nesse time carrega a responsabilidade de manter esse padrao — e a liberdade de supera-lo.\n\nPilares:\n1. Excelencia como habito, nao como excecao.\n2. Tecnologia a servico da criatividade.\n3. Pessoas no centro de tudo que construimos.',
   'published', 1, 'quote',
   '{"autores": ["Ruy Lima — CEO", "Marco Andolfato — COO"], "section": "mensagem-fundadores"}'::jsonb),

  (tid, 'pilar', 'Sobre a TBO — Manifesto',
   E'A TBO e um studio de visualizacao arquitetonica e marketing imobiliario. Nascemos com a missao de transformar a forma como o mercado imobiliario apresenta seus empreendimentos. Unimos tecnologia, design e estrategia para criar experiencias visuais que vendem.\n\nMetodologia Think | Build | Own:\n- Think: Pensar de forma estrategica antes de criar.\n- Build: Construir com excelencia tecnica.\n- Own: Assumir a responsabilidade pelo resultado.',
   'published', 2, 'building-2',
   '{"bus": ["Digital 3D", "Audiovisual", "Branding", "Marketing", "Interiores"], "numeros": {"projetos": "120+", "pessoas": "15+", "imagens": "3000+", "bus": "5"}, "section": "sobre"}'::jsonb),

  (tid, 'pilar', 'Missao, Visao & Valores',
   E'Missao: Transformar empreendimentos imobiliarios em marcas desejadas, memoraveis e lucrativas.\n\nVisao: Ser a plataforma global de referencia em solucoes de tecnologia, publicidade e estrategia para o mercado imobiliario.\n\nValores:\n- Excelencia Tecnica: Qualidade inegociavel em cada pixel, cada frame, cada palavra.\n- Ownership: Cada pessoa e dona do seu resultado. Autonomia com responsabilidade.\n- Colaboracao: Times integrados, conhecimento compartilhado, ego fora da porta.\n- Inovacao: Inconformismo criativo. Buscar o novo, questionar o obvio.\n- Cliente Primeiro: Entender o negocio do cliente como se fosse nosso.\n- Superacao: Ir alem do esperado. Entregar mais do que foi pedido.',
   'published', 3, 'target',
   '{"section": "mvv"}'::jsonb),

  (tid, 'pilar', 'Estrategia — 5 Pilares',
   E'1. 100% Mercado Imobiliario: Foco total. Profundidade > amplitude.\n2. Integracao Vertical: Da estrategia a execucao sob o mesmo teto.\n3. Criatividade com Metodo: Processos proprietarios que garantem consistencia.\n4. Tecnologia como Estrutura Invisivel: IA, plataformas interativas, automacao.\n5. Escala sem Perder Curacao: Crescer mantendo o padrao.\n\nFramework de Decisao: Antes de qualquer decisao, pergunte: Isso nos aproxima da visao? Fortalece nosso posicionamento? E escalavel sem perder qualidade?',
   'published', 4, 'compass',
   '{"section": "estrategia"}'::jsonb),

  (tid, 'pilar', 'Cultura Viva — Comportamentos',
   E'Comportamentos que vivemos:\n- Autonomia: Agir sem precisar de permissao. Tomar decisoes informadas.\n- Excelencia: Nao entregar nada que nao colocaria no portfolio.\n- Colaboracao: Compartilhar aprendizados. Pedir ajuda sem medo.\n- Aprendizado Continuo: Buscar referencia fora do obvio. Estudar.\n- Mentalidade de Dono: Tratar cada projeto como se o nome da empresa fosse o seu.\n\nAnti-cultura (o que NAO toleramos):\n- Esperar permissao quando a resposta e obvia\n- Entregar so o pedido sem pensar no resultado\n- Guardar conhecimento como vantagem pessoal\n- Aceitar mediocridade como padrao\n- Evitar conversas dificeis por conforto',
   'published', 5, 'sparkles',
   '{"section": "cultura-viva", "autoavaliacao": ["Eu tomo decisoes sem precisar de aprovacao constante?", "Eu compartilho o que aprendo com meus colegas?", "Eu busco feedback ativamente?", "Eu cuido dos detalhes como se fossem meus?", "Eu proponho solucoes quando encontro problemas?", "Eu priorizo resultado sobre processo?", "Eu trato as entregas do time como se fossem minhas?"]}'::jsonb),

  (tid, 'pilar', 'Lideranca na TBO',
   E'Autonomia com posicao: lideranca nao e sobre cargo — e sobre comportamento.\n\nFramework de Feedback (Crucial Conversations):\nTemplate: Eu observei que [fato]. O impacto foi [consequencia]. Eu sugiro que [proposta]. O que voce acha?\n\nGuia de 1:1s (Mensal minimo, semanal para novos):\n1. Como voce esta?\n2. O que esta indo bem?\n3. O que esta travando voce?\n4. Feedback mutuo\n5. Proximos passos\n\nTomada de Decisao (RACI simplificado):\n- Operacionais: PO decide, time executa\n- Estrategicas: Direcao decide com input dos POs\n- Escopo: PO + cliente com alinhamento da direcao\n- Pessoas: Direcao com input do PO direto',
   'published', 6, 'crown',
   '{"section": "lideranca"}'::jsonb)

  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════
  -- CULTURA_ITEMS: Politicas (category = 'politica')
  -- ═══════════════════════════════════════════════════════════════════
  INSERT INTO cultura_items (tenant_id, category, title, content, status, order_index, icon, metadata) VALUES
  (tid, 'politica', 'Politica Etica e Moral',
   E'Principios:\n- Integridade: Agir com honestidade e transparencia. Evitar conflitos de interesse.\n- Responsabilidade: Decisoes consideram impacto em clientes, equipe e sociedade.\n- Respeito: Ambiente inclusivo independente de raca, genero, orientacao, religiao.\n\nConfidencialidade: Dados de clientes, projetos, precificacao e metodologias sao confidenciais.\n\nCanais de relato: compliance@tbo.com.br, Diretoria, Denuncias anonimas aceitas.\n\nMedidas disciplinares:\n- Leve: Conversa de esclarecimento, advertencia verbal\n- Moderada: Advertencia formal, treinamento adicional\n- Grave: Suspensao, ajuste contratual\n- Gravissima: Encerramento imediato + acoes legais',
   'published', 1, 'shield-check',
   '{"section": "politicas-etica"}'::jsonb),

  (tid, 'politica', 'Politica Antiassedio',
   E'Na TBO, respeito e inegociavel. Assedio, intimidacao ou qualquer forma de desrespeito nao tem espaco.\n\nTipos de assedio:\n- Comentarios ofensivos sobre aparencia, genero, raca, orientacao\n- Brincadeiras ou apelidos que constranjam\n- Insinuacoes ou abordagens de cunho sexual\n- Humilhacoes, ameacas ou tom agressivo\n- Pressoes psicologicas ou manipulacoes emocionais\n- Assedio moral sistematico\n\nClassificacao:\n1. Primeira ocorrencia: suspensao temporaria + desculpas formais\n2. Recorrente: suspensao + treinamento obrigatorio + advertencia\n3. Grave: encerramento imediato do contrato\n4. Criminal: encerramento + autoridades',
   'published', 2, 'shield',
   '{"section": "politicas-antiassedio"}'::jsonb),

  (tid, 'politica', 'Limites e Regras TBO',
   E'Principios centrais:\n- Parceria, nao subordinacao: TBO atua como parceira estrategica\n- Comunicacao profissional: apenas canais oficiais\n- Qualidade acima de urgencia: nenhuma entrega acelerada com comprometimento\n- Respeito ao escopo: solicitacoes extras exigem alinhamento previo\n- Autonomia tecnica: TBO tem autonomia completa em direcao criativa\n\nRegras de revisoes: 3 rodadas incluidas no escopo. Extras geram custo adicional.\n\nHorario de atendimento: segunda a sexta, 9h-18h.\n\nNiveis de demanda:\n- N1 (48-72h): ajustes leves\n- N2 (5-10 dias): novas pecas\n- N3 (personalizado): estrategia/branding/CGI',
   'published', 3, 'shield',
   '{"section": "politicas-limites"}'::jsonb)

  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════
  -- CULTURA_ITEMS: Manual (category = 'manual')
  -- ═══════════════════════════════════════════════════════════════════
  INSERT INTO cultura_items (tenant_id, category, title, content, status, order_index, icon, metadata) VALUES
  (tid, 'manual', 'Regras de Negocio',
   E'8 blocos operacionais:\n\n1. Entrada de Projetos: Todo projeto entra via briefing. Sem briefing aprovado, nao existe projeto. Precificacao: tabela + margem minima de 40%.\n\n2. Onboarding do Cliente: Kick-off obrigatorio. Materiais coletados antes do inicio.\n\n3. Kickoff Interno: PO define cronograma. Time valida viabilidade. Riscos mapeados na primeira semana.\n\n4. Entregas: Curadoria antes de enviar ao cliente. Nomenclatura padrao. Entrega via Drive.\n\n5. Revisoes: 3 rodadas incluidas. Extras geram custo. Mudanca de conceito e novo escopo.\n\n6. Governanca: Reunioes semanais por BU. Daily de socios. Review criativo quinzenal.\n\n7. Financeiro: 50% entrada + 50% entrega. Projetos longos: parcelas mensais. Inadimplencia > 30d: pausa.\n\n8. Protecao da Equipe: Carga monitorada. Prazo minimo respeitado. Ferias inegociaveis.',
   'published', 1, 'book-open',
   '{"section": "regras-negocio"}'::jsonb),

  (tid, 'manual', 'Comunicacao — Diretrizes',
   E'Regras de ouro:\n1. Parta da intencao positiva\n2. Gentileza importa no digital\n3. Seja claro e inclusivo\n4. Assuma o que comunica\n\nFerramentas: Notion (base de conhecimento), Google Chat (comunicacao diaria), Google Meet (reunioes), Google Drive (entregas), E-mail (formal), WhatsApp (clientes).\n\nTom de voz: Sofisticado, Empatico, Transparente, Tecnologico, Consultivo, Adaptavel.\n\nPalavras que usamos: Diagnostico, estrategia, posicionamento, pertencimento, valor percebido, narrativa, curadoria, criatividade.\n\nPalavras que evitamos: Promocao, novidade, propaganda, simplicidade, jargoes vazios.',
   'published', 2, 'message-circle',
   '{"section": "comunicacao"}'::jsonb),

  (tid, 'manual', 'Estrutura de Cargos',
   E'Modelo: Hibrido com autonomia descentralizada.\n\nCamadas:\n1. Direcao: Visao, estrategia, cultura — Ruy Lima (CEO), Marco Andolfato (COO)\n2. Product Owners + Coord: Gestao de nucleos — Nelson (Branding), Nath (Digital 3D), Rafa (Marketing), Carol (Atendimento)\n3. Especialistas: Execucao tecnica — Celso, Erick, Dann, Duda, Tiago, Mari, Lucca\n4. Suporte: Comercial e Financeiro — Gustavo, Financa Azul (terceirizado)\n\nPrincipios de gestao:\n- Autonomia Descentralizada: POs decidem "como", Direcao decide "o que" e "por que"\n- Colaboracao Horizontal: POs colaboram diretamente\n- Meritocracia Tecnica: Contribuicao > Hierarquia\n- Estrutura Enxuta: 3 camadas, sem burocracia\n- Escala com Qualidade: POs garantem padrao\n\nTotal: 17 pessoas (15 internas + 2 suporte terceirizado)',
   'published', 3, 'git-branch',
   '{"section": "estrutura"}'::jsonb),

  (tid, 'manual', 'Guia de Ferramentas',
   E'Boas praticas:\n- Cada colaborador e responsavel por armazenar e nomear corretamente seus arquivos\n- Senhas nao devem ser compartilhados fora do time autorizado\n- Notion, Drive e Google Chat sao fontes oficiais\n- Ferramentas devem ser usadas com login corporativo\n\nCategorias:\n1. Comunicacao: Google Workspace, WhatsApp Business\n2. Design: Adobe Creative Suite, Figma\n3. 3D: 3ds Max, Corona Renderer, Unreal Engine, Chaos Vantage\n4. IA: ChatGPT/Claude, Midjourney, Stable Diffusion, Runway ML\n5. Marketing: Meta Business Suite, Google Ads, Google Analytics, RD Station',
   'published', 4, 'wrench',
   '{"section": "ferramentas"}'::jsonb),

  (tid, 'manual', 'Cultura & Lideranca',
   E'Principios culturais:\n- Alta performance com humanidade\n- Autonomia com responsabilidade\n- Feedback constante como ferramenta de crescimento\n- Erro faz parte — repetir erro e negligencia\n- Transparencia radical — problemas sao discutidos abertamente\n- Documentar e um ato de lideranca\n\nPerfil do lider TBO:\n- Lidera pelo exemplo, nao pelo cargo\n- Desenvolve pessoas — nao apenas cobra resultados\n- Da contexto antes de dar ordens\n- Protege a equipe e assume responsabilidade\n- Celebra conquistas e reconhece esforco\n- Toma decisoes dificeis com maturidade\n\nTrabalho remoto: A TBO e remota com raizes em Curitiba. Comunicacao assincrona e padrao.',
   'published', 5, 'heart',
   '{"section": "cultura-lideranca"}'::jsonb)

  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════
  -- CULTURA_ITEMS: Valores (category = 'valor')
  -- ═══════════════════════════════════════════════════════════════════
  INSERT INTO cultura_items (tenant_id, category, title, content, status, order_index, icon, metadata) VALUES
  (tid, 'valor', 'Excelencia Tecnica',
   'Qualidade inegociavel em cada pixel, cada frame, cada palavra.',
   'published', 1, 'target',
   '{"emoji": "🎯", "value_id": "excelencia"}'::jsonb),
  (tid, 'valor', 'Ownership',
   'Cada pessoa e dona do seu resultado. Autonomia com responsabilidade.',
   'published', 2, 'key',
   '{"emoji": "🔑", "value_id": "ownership"}'::jsonb),
  (tid, 'valor', 'Colaboracao',
   'Times integrados, conhecimento compartilhado, ego fora da porta.',
   'published', 3, 'handshake',
   '{"emoji": "🤝", "value_id": "colaboracao"}'::jsonb),
  (tid, 'valor', 'Inovacao',
   'Inconformismo criativo. Buscar o novo, questionar o obvio.',
   'published', 4, 'lightbulb',
   '{"emoji": "💡", "value_id": "inovacao"}'::jsonb),
  (tid, 'valor', 'Cliente Primeiro',
   'Entender o negocio do cliente como se fosse nosso.',
   'published', 5, 'heart',
   '{"emoji": "❤️", "value_id": "cliente"}'::jsonb),
  (tid, 'valor', 'Superacao',
   'Ir alem do esperado. Entregar mais do que foi pedido.',
   'published', 6, 'rocket',
   '{"emoji": "🚀", "value_id": "superacao"}'::jsonb)

  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════
  -- RITUAL_TYPES: Seed from comunicacao.rituais
  -- ═══════════════════════════════════════════════════════════════════
  INSERT INTO ritual_types (tenant_id, name, description, frequency, duration_minutes, is_system, is_active, color) VALUES
  (tid, 'Checkpoint Diario', 'Status, bloqueios e prioridades via Google Chat.', 'daily', 15, true, true, '#3b82f6'),
  (tid, '1:1 Mensal', 'Feedback, escuta ativa e alinhamento individual com lideranca.', 'monthly', 60, true, true, '#8b5cf6'),
  (tid, 'Reuniao de Time', 'Revisao de entregas, aprendizados e proximos passos.', 'weekly', 60, true, true, '#22c55e'),
  (tid, 'Revisao Criativa', 'Curadoria e refinamento estetico/conceitual quinzenal.', 'biweekly', 90, true, true, '#f59e0b'),
  (tid, 'Onboarding Estruturado', 'Diretrizes de comunicacao e cultura nos primeiros dias.', 'once', 120, true, true, '#0ea5e9'),
  (tid, 'Debrief Pos-Entrega', 'O que funcionou, o que nao e o que aprendemos.', 'per_project', 60, true, true, '#ef4444')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════
  -- RECOGNITION_REWARDS: Starter catalog
  -- ═══════════════════════════════════════════════════════════════════
  INSERT INTO recognition_rewards (tenant_id, name, description, type, points_required, value_brl, active) VALUES
  (tid, 'Day Off Extra', 'Um dia de folga adicional para recarregar as energias.', 'folga', 50, 0, true),
  (tid, 'Jantar para Dois', 'Voucher para jantar em restaurante parceiro.', 'experiencia', 80, 200, true),
  (tid, 'Curso ou Workshop', 'Acesso a um curso online ou workshop presencial a sua escolha.', 'experiencia', 100, 500, true),
  (tid, 'Kit TBO Premium', 'Kit com itens exclusivos da marca TBO.', 'produto', 40, 150, true),
  (tid, 'Assinatura Mensal', 'Spotify, Netflix ou assinatura de app a sua escolha por 3 meses.', 'beneficio', 60, 120, true),
  (tid, 'Experiencia VIP', 'Experiencia especial: spa, aventura ou evento cultural.', 'experiencia', 150, 800, true)
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════
  -- REWARD_TIERS: Default tiers
  -- ═══════════════════════════════════════════════════════════════════
  INSERT INTO reward_tiers (tenant_id, name, min_points, max_points, color, icon, benefits, sort_order) VALUES
  (tid, 'Bronze', 0, 49, '#cd7f32', 'medal', ARRAY['Acesso ao catalogo basico'], 1),
  (tid, 'Prata', 50, 149, '#c0c0c0', 'medal', ARRAY['Catalogo completo', 'Prioridade em resgates'], 2),
  (tid, 'Ouro', 150, 299, '#ffd700', 'trophy', ARRAY['Catalogo completo', 'Resgates prioritarios', 'Bonus +10% pontos'], 3),
  (tid, 'Diamante', 300, NULL, '#b9f2ff', 'gem', ARRAY['Catalogo VIP', 'Resgates imediatos', 'Bonus +20% pontos', 'Experiencias exclusivas'], 4)
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════
  -- REWARD_POLICY: Default financial policy
  -- ═══════════════════════════════════════════════════════════════════
  INSERT INTO reward_policy (tenant_id, monthly_budget_brl, quarterly_budget_brl, min_tenure_days, min_points_to_redeem, approval_required, special_threshold)
  VALUES (tid, 5000.00, 15000.00, 90, 25, true, 200)
  ON CONFLICT (tenant_id) DO NOTHING;

  RAISE NOTICE 'Cultura seed data inserted for tenant %', tid;
END $$;

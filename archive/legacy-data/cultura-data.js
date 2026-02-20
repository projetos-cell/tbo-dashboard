// TBO OS — Manual de Cultura Data (synced from Notion — Feb 2026)
// Source: https://www.notion.so/Manual-de-Cultura-2193782e356143e5b41756c78e230cec
// v2.1: Conteudo enriquecido com 12 secoes do Notion (antes eram 8)

const TBO_CULTURA_DATA = {

  metadata: {
    source: 'Notion — Manual de Cultura TBO',
    lastUpdate: '2026-02-19',
    totalSections: 12,
    version: '2.1'
  },

  // ── SECTION 1: Mensagem dos Fundadores ──────────────────────────────
  mensagemFundadores: {
    id: 'mensagem-fundadores',
    titulo: 'Mensagem dos Fundadores',
    icon: 'quote',
    resumo: 'A origem da TBO, visao de futuro e compromisso com o time.',
    callout: 'Construimos a TBO com a crenca de que e possivel fazer trabalho de excelencia no mercado imobiliario brasileiro. Cada pessoa que entra nesse time carrega a responsabilidade de manter esse padrao — e a liberdade de supera-lo.',
    autores: ['Ruy Lima — CEO', 'Marco Andolfato — COO'],
    pilares: [
      'Excelencia como habito, nao como excecao.',
      'Tecnologia a servico da criatividade.',
      'Pessoas no centro de tudo que construimos.'
    ]
  },

  // ── SECTION 2: Sobre a TBO ──────────────────────────────────────────
  sobre: {
    id: 'sobre',
    titulo: 'Sobre a TBO',
    icon: 'building-2',
    resumo: 'Quem somos, manifesto e metodologia Think | Build | Own.',
    conteudo: {
      manifesto: 'A TBO e um studio de visualizacao arquitetonica e marketing imobiliario. Nascemos com a missao de transformar a forma como o mercado imobiliario apresenta seus empreendimentos. Unimos tecnologia, design e estrategia para criar experiencias visuais que vendem.',
      metodologia: {
        think: 'Pensar de forma estrategica antes de criar. Diagnostico, pesquisa, posicionamento.',
        build: 'Construir com excelencia tecnica. Cada imagem, cada filme, cada marca reflete nosso padrao.',
        own: 'Assumir a responsabilidade pelo resultado. Ownership em cada entrega.'
      },
      numeros: [
        { label: 'Projetos entregues', valor: '120+' },
        { label: 'Pessoas no time', valor: '15+' },
        { label: 'Imagens produzidas', valor: '3.000+' },
        { label: 'BUs ativas', valor: '5' }
      ],
      bus: ['Digital 3D', 'Audiovisual', 'Branding', 'Marketing', 'Interiores']
    }
  },

  // ── SECTION 3: Missao, Visao, Valores ────────────────────────────────
  mvv: {
    id: 'mvv',
    titulo: 'Missao, Visao & Valores',
    icon: 'target',
    resumo: 'Proposito, direcao e principios que guiam a TBO.',
    missao: {
      texto: 'Transformar empreendimentos imobiliarios em marcas desejadas, memoraveis e lucrativas.',
      principios: [
        'Nao somos fornecedores — somos parceiros estrategicos.',
        'Cada entrega carrega o peso da nossa reputacao.',
        'Resultado medido por impacto real no negocio do cliente.'
      ]
    },
    visao: {
      texto: 'Ser a plataforma global de referencia em solucoes de tecnologia, publicidade e estrategia para o mercado imobiliario.',
      elementos: [
        'Plataforma: Nao uma agencia, mas um ecossistema de solucoes integradas.',
        'Global: Expandir para mercados internacionais, mantendo excelencia.',
        'Tecnologia: IA, Unreal Engine, plataformas interativas como diferencial.',
        'Publicidade: Criar narrativas que vendem, nao apenas visuais bonitos.',
        'Estrategia: Posicionamento, branding, dados — nao apenas execucao.'
      ]
    },
    valores: [
      { nome: 'Excelencia Tecnica', desc: 'Qualidade inegociavel em cada pixel, cada frame, cada palavra.', emoji: '🎯' },
      { nome: 'Ownership', desc: 'Cada pessoa e dona do seu resultado. Autonomia com responsabilidade.', emoji: '🔑' },
      { nome: 'Colaboracao', desc: 'Times integrados, conhecimento compartilhado, ego fora da porta.', emoji: '🤝' },
      { nome: 'Inovacao', desc: 'Inconformismo criativo. Buscar o novo, questionar o obvio.', emoji: '💡' },
      { nome: 'Cliente Primeiro', desc: 'Entender o negocio do cliente como se fosse nosso.', emoji: '❤️' },
      { nome: 'Superacao', desc: 'Ir alem do esperado. Entregar mais do que foi pedido.', emoji: '🚀' }
    ]
  },

  // ── SECTION 4: Estrategia ────────────────────────────────────────────
  estrategia: {
    id: 'estrategia',
    titulo: 'Estrategia',
    icon: 'compass',
    resumo: '5 pilares estrategicos e framework de decisao.',
    pilares: [
      { nome: '100% Mercado Imobiliario', desc: 'Foco total. Nao diluimos energia em outros segmentos. Profundidade > amplitude.' },
      { nome: 'Integracao Vertical', desc: 'Da estrategia a execucao. Branding + 3D + Marketing + Audiovisual sob o mesmo teto.' },
      { nome: 'Criatividade com Metodo', desc: 'Processos proprietarios (Branding TBO, Sexy Canvas, Metodo de Lancamentos) que garantem consistencia.' },
      { nome: 'Tecnologia como Estrutura Invisivel', desc: 'IA, plataformas interativas, automacao — tecnologia que potencializa, nao que aparece.' },
      { nome: 'Escala sem Perder Curacao', desc: 'Crescer mantendo o padrao. POs como guardioes da qualidade.' }
    ],
    frameworkDecisao: 'Antes de qualquer decisao estrategica, pergunte: (1) Isso nos aproxima da visao? (2) Isso fortalece nosso posicionamento no imobiliario? (3) Isso e escalavel sem perder qualidade? Se a resposta for NAO para qualquer uma, reconsidere.'
  },

  // ── SECTION 5: Cultura Viva ─────────────────────────────────────────
  culturaViva: {
    id: 'cultura-viva',
    titulo: 'Vida na TBO — Cultura Viva',
    icon: 'sparkles',
    resumo: 'Comportamentos que vivemos, o que NAO e nossa cultura, e autoavaliacao.',
    comportamentos: [
      { pilar: 'Autonomia', desc: 'Agir sem precisar de permissao. Tomar decisoes informadas. Resolver antes de escalar.' },
      { pilar: 'Excelencia', desc: 'Nao entregar nada que voce nao colocaria no portfolio. Curadoria obsessiva.' },
      { pilar: 'Colaboracao', desc: 'Compartilhar aprendizados. Pedir ajuda sem medo. Dar feedback com empatia.' },
      { pilar: 'Aprendizado Continuo', desc: 'Buscar referencia fora do obvio. Estudar. Evoluir o oficio.' },
      { pilar: 'Mentalidade de Dono', desc: 'Tratar cada projeto como se o nome da empresa fosse o seu nome.' }
    ],
    antiCultura: [
      'Esperar permissao para agir quando a resposta e obvia.',
      'Entregar "so o que foi pedido" sem pensar no resultado.',
      'Guardar conhecimento como vantagem pessoal.',
      'Dizer "isso nao e minha area" quando o time precisa.',
      'Aceitar mediocridade como padrao.',
      'Evitar conversas dificeis por conforto.',
      'Reclamar sem propor solucao.',
      'Tratar erro como fracasso ao inves de aprendizado.'
    ],
    autoavaliacao: [
      'Eu tomo decisoes sem precisar de aprovacao constante?',
      'Eu compartilho o que aprendo com meus colegas?',
      'Eu busco feedback ativamente, nao apenas quando recebo?',
      'Eu cuido dos detalhes como se fossem meus?',
      'Eu proponho solucoes quando encontro problemas?',
      'Eu priorizo resultado sobre processo?',
      'Eu trato as entregas do time como se fossem minhas?'
    ]
  },

  // ── SECTION 6: Lideranca ────────────────────────────────────────────
  lideranca: {
    id: 'lideranca',
    titulo: 'Lideranca na TBO',
    icon: 'crown',
    resumo: 'Autonomia, feedback, 1:1s e tomada de decisao.',
    principioAutonomia: {
      titulo: 'Autonomia com posicao',
      desc: 'Na TBO, lideranca nao e sobre cargo — e sobre comportamento. Cada pessoa e lider do seu trabalho.',
      praticas: [
        'Se voce identificou um problema, resolva ou proponha uma solucao.',
        'Se precisa de uma decisao, traga opcoes — nao so a pergunta.',
        'Se discorda, diga com argumentos — silencio nao e concordancia.',
        'Se errou, assuma e corrija — transparencia > perfeicao.'
      ]
    },
    feedback: {
      titulo: 'Framework de Feedback (baseado em Crucial Conversations)',
      principios: [
        'Feedback nao e ataque — e investimento no crescimento do outro.',
        'Comece pelo fato, nao pela interpretacao.',
        'Descreva o impacto: o que aconteceu como consequencia.',
        'Proponha o caminho: o que voce sugere de diferente.',
        'Escute a perspectiva do outro com genuina curiosidade.'
      ],
      template: 'Eu observei que [fato]. O impacto foi [consequencia]. Eu sugiro que [proposta]. O que voce acha?',
      comoReceber: [
        'Escute antes de reagir.',
        'Parta da premissa de que quem fala quer ajudar.',
        'Pergunte exemplos se nao entendeu.',
        'Agradeca — feedback e um presente.',
        'Nao concorde por educacao. Reflita. Responda depois se precisar.'
      ]
    },
    oneOnOnes: {
      titulo: 'Guia de 1:1s',
      frequencia: 'Mensal (minimo). Semanal para novos membros.',
      estrutura: [
        'Como voce esta? (pessoal)',
        'O que esta indo bem?',
        'O que esta travando voce?',
        'Feedback (nos dois sentidos)',
        'Proximos passos e compromissos'
      ],
      dicas: [
        'Nunca cancele um 1:1 — e o momento mais importante do mes.',
        'Lider escuta 80% do tempo, fala 20%.',
        'Registre action items e cobre na proxima.'
      ]
    },
    tomadaDecisao: {
      titulo: 'Como tomamos decisoes',
      modelo: 'RACI simplificado: quem decide (D), quem executa (E), quem e consultado (C), quem e informado (I).',
      regras: [
        'Decisoes operacionais: PO decide, time executa.',
        'Decisoes estrategicas: Direcao decide com input dos POs.',
        'Decisoes de escopo: PO + cliente, com alinhamento da direcao.',
        'Decisoes de pessoas: Direcao, com input do PO direto.'
      ]
    }
  },

  // ── SECTION 7: Regras de Negocio ────────────────────────────────────
  regrasNegocio: {
    id: 'regras-negocio',
    titulo: 'Regras de Negocio',
    icon: 'book-open',
    resumo: '8 blocos operacionais: da entrada de projetos a protecao da equipe.',
    blocos: [
      {
        nome: 'Entrada de Projetos',
        regras: [
          'Todo projeto entra via briefing no Notion.',
          'Sem briefing aprovado, nao existe projeto.',
          'Gustavo (Comercial) e a porta de entrada para novos clientes.',
          'Precificacao segue tabela + margem minima de 40%.'
        ]
      },
      {
        nome: 'Onboarding do Cliente',
        regras: [
          'Kick-off obrigatorio com cliente + time.',
          'Materiais de referencia e branding do cliente coletados antes do inicio.',
          'Comunicar claramente: prazos, escopo, canais de contato.'
        ]
      },
      {
        nome: 'Kickoff Interno',
        regras: [
          'PO define cronograma e distribui tasks.',
          'Time valida viabilidade tecnica e prazos.',
          'Riscos mapeados e comunicados na primeira semana.'
        ]
      },
      {
        nome: 'Entregas',
        regras: [
          'Curadoria antes de enviar ao cliente — PO aprova tudo.',
          'Nomenclatura padrao de arquivos.',
          'Entrega via Drive em pasta padrao do projeto.'
        ]
      },
      {
        nome: 'Revisoes',
        regras: [
          '3 rodadas incluidas no escopo.',
          'Revisoes extras geram custo adicional e novo prazo.',
          'Revisao nao e refacao — mudanca de conceito e novo escopo.'
        ]
      },
      {
        nome: 'Governanca',
        regras: [
          'Reunioes internas semanais por BU.',
          'Daily de socios: alinhamento estrategico.',
          'Review criativo quinzenal: padrao de qualidade.'
        ]
      },
      {
        nome: 'Financeiro',
        regras: [
          'Cobranca: 50% entrada + 50% entrega (padrao).',
          'Projetos longos: parcelas mensais.',
          'Inadimplencia > 30 dias: pausa no projeto + notificacao.'
        ]
      },
      {
        nome: 'Protecao da Equipe',
        regras: [
          'Carga de trabalho monitorada semanalmente.',
          'Prazo minimo respeitado — urgencia nao justifica burnout.',
          'Cliente que desrespeita o time e redirecionado a direcao.',
          'Ferias e descanso sao inegociaveis.'
        ]
      }
    ]
  },

  // ── SECTION 8: Comunicacao ───────────────────────────────────────────
  comunicacao: {
    id: 'comunicacao',
    titulo: 'Comunicacao',
    icon: 'message-circle',
    resumo: 'Diretrizes de comunicacao interna e externa, tom de voz.',
    regrasOuro: [
      { titulo: 'Parta da intencao positiva', desc: 'Comece qualquer troca acreditando que o outro esta tentando acertar.', cor: 'blue' },
      { titulo: 'Gentileza importa no digital', desc: 'Voce esta escrevendo numa tela, mas se comunicando com uma pessoa real.', cor: 'green' },
      { titulo: 'Seja claro e inclusivo', desc: 'Expresse com propriedade, empatia e cuidado com o impacto.', cor: 'orange' },
      { titulo: 'Assuma o que comunica', desc: 'Se voce falou ou escreveu, e responsavel — inclusive pelo impacto nao-intencional.', cor: 'purple' }
    ],
    ferramentas: [
      { nome: 'Notion', uso: 'Base de conhecimento. Todo briefing, processo, pauta ou guideline.' },
      { nome: 'Google Chat', uso: 'Comunicacao diaria, checkpoints, avisos. Evite textoes sem contexto.' },
      { nome: 'Google Meet', uso: 'Reunioes com pauta clara e decisoes registradas.' },
      { nome: 'Google Drive', uso: 'Entregas, pastas de projeto, arquivos finais.' },
      { nome: 'E-mail', uso: 'Comunicacao externa ou formal.' },
      { nome: 'WhatsApp', uso: 'Comunicacoes rapidas com clientes.' }
    ],
    rituais: [
      'Checkpoints diarios (Google Chat): status, bloqueios e prioridades.',
      '1:1 mensais: feedback, escuta ativa e alinhamento individual.',
      'Reunioes de time: revisao de entregas, aprendizados, proximos passos.',
      'Revisoes criativas: curadoria e refinamento estetico/conceitual.',
      'Onboarding estruturado: diretrizes de comunicacao nos primeiros dias.',
      'Debriefs pos-entrega: o que funcionou, o que nao e o que aprendemos.'
    ],
    tomDeVoz: [
      { caracteristica: 'Sofisticado', desc: 'Pensamos de forma assertiva e com elegancia. Curadoria e fundamental.' },
      { caracteristica: 'Empatico', desc: 'Vinculo humano. Feito de humanos para humanos.' },
      { caracteristica: 'Transparente', desc: 'Frases curtas, diretas e assertivas. Comportamento vitreo.' },
      { caracteristica: 'Tecnologico', desc: 'Marca tecnologica, mas nao hi-tech.' },
      { caracteristica: 'Consultivo', desc: 'Especialistas no mercado imobiliario e suas vertentes.' },
      { caracteristica: 'Adaptavel', desc: 'Resiliencia e flexibilidade para cada cliente e projeto.' }
    ],
    palavrasUsamos: 'Diagnostico, estrategia, posicionamento, pertencimento, valor percebido, narrativa, solucoes, curadoria, conceito, criatividade, sofisticacao, resultados, data driven, storytelling',
    palavrasEvitamos: 'Promocao, novidade, propaganda, simplicidade, jargoes vazios, girias, superioridade'
  },

  // ── SECTION 9: Estrutura de Cargos ───────────────────────────────────
  estrutura: {
    id: 'estrutura',
    titulo: 'Estrutura de Cargos',
    icon: 'git-branch',
    resumo: 'Organograma, cargos, funcoes e modelo hibrido de gestao.',
    modelo: {
      tipo: 'Hibrido com autonomia descentralizada',
      camadas: [
        { nivel: 1, nome: 'Direcao', desc: 'Visao, estrategia, cultura', pessoas: ['Ruy Lima (CEO)', 'Marco Andolfato (COO)'] },
        { nivel: 2, nome: 'Product Owners + Coord', desc: 'Gestao de nucleos', pessoas: ['Nelson (Branding)', 'Nath (Digital 3D)', 'Rafa (Marketing)', 'Carol (Atendimento)'] },
        { nivel: 3, nome: 'Especialistas', desc: 'Execucao tecnica de excelencia', pessoas: ['Celso', 'Erick', 'Dann', 'Duda', 'Tiago', 'Mari', 'Lucca'] },
        { nivel: 4, nome: 'Suporte', desc: 'Comercial e Financeiro', pessoas: ['Gustavo (Comercial)', 'Financa Azul (Financeiro terc.)'] }
      ]
    },
    principios: [
      { nome: 'Autonomia Descentralizada', desc: 'POs decidem "como" executar. Direcao decide "o que" e "por que".' },
      { nome: 'Colaboracao Horizontal', desc: 'POs colaboram diretamente. Times compartilham conhecimento.' },
      { nome: 'Meritocracia Tecnica', desc: 'Crescimento por excelencia. Contribuicao > Hierarquia.' },
      { nome: 'Estrutura Enxuta', desc: 'Apenas 3 camadas hierarquicas. Comunicacao rapida. Sem burocracia.' },
      { nome: 'Escala com Qualidade', desc: 'POs garantem padrao. Processos documentados.' }
    ],
    totalPessoas: '17 (15 internas + 2 suporte terceirizado)'
  },

  // ── SECTION 10: Politicas ─────────────────────────────────────────────
  politicas: {
    id: 'politicas',
    titulo: 'Politicas & Compliance',
    icon: 'shield-check',
    resumo: 'Politica Etica, Antiassedio, Limites e Regras.',
    etica: {
      titulo: 'Politica Etica e Moral',
      principios: [
        { nome: 'Integridade', desc: 'Agir com honestidade e transparencia. Evitar conflitos de interesse.' },
        { nome: 'Responsabilidade', desc: 'Decisoes consideram impacto em clientes, equipe e sociedade.' },
        { nome: 'Respeito', desc: 'Ambiente inclusivo independente de raca, genero, orientacao, religiao ou qualquer outra caracteristica.' }
      ],
      confidencialidade: 'Dados de clientes, projetos, precificacao e metodologias sao confidenciais. Mesmo apos encerramento do contrato.',
      canaisRelato: ['E-mail: compliance@tbo.com.br', 'Diretoria: Marco ou Ruy', 'Denuncias anonimas aceitas'],
      medidas: [
        { nivel: 'Leve', acao: 'Conversa de esclarecimento, advertencia verbal.' },
        { nivel: 'Moderada', acao: 'Advertencia formal, treinamento adicional.' },
        { nivel: 'Grave', acao: 'Suspensao, ajuste contratual, encerramento de contrato.' },
        { nivel: 'Gravissima', acao: 'Encerramento imediato + possiveis acoes legais.' }
      ]
    },
    antiassedio: {
      titulo: 'Politica Antiassedio',
      principio: 'Na TBO, respeito e inegociavel. Assedio, intimidacao ou qualquer forma de desrespeito nao tem espaco.',
      tiposAssedio: [
        'Comentarios ofensivos sobre aparencia, genero, raca, orientacao.',
        'Brincadeiras, piadas ou apelidos que constranjam.',
        'Insinuacoes ou abordagens de cunho sexual.',
        'Humilhacoes, ameacas ou tom agressivo.',
        'Pressoes psicologicas ou manipulacoes emocionais.',
        'Assedio moral: atitudes sistematicas que causem dano emocional.'
      ],
      classificacao: [
        { nivel: 1, desc: 'Primeira ocorrencia — suspensao temporaria + pedido formal de desculpas.' },
        { nivel: 2, desc: 'Recorrente — suspensao + treinamento obrigatorio + advertencia formal.' },
        { nivel: 3, desc: 'Grave ou apos advertencia — encerramento imediato do contrato.' },
        { nivel: 4, desc: 'Criminal — encerramento imediato + comunicacao as autoridades.' }
      ]
    },
    limitesRegras: {
      titulo: 'Limites e Regras TBO',
      principiosCentrais: [
        { nome: 'Parceria, nao subordinacao', desc: 'TBO atua como parceira estrategica. Demandas em formato de ordem nao sao aceitas.' },
        { nome: 'Comunicacao profissional', desc: 'Interacoes apenas por canais oficiais, com clareza e contexto.' },
        { nome: 'Qualidade acima de urgencia', desc: 'Nenhuma entrega e acelerada de forma que comprometa o resultado.' },
        { nome: 'Respeito ao escopo', desc: 'Solicitacoes fora do contrato exigem alinhamento previo e custo adicional.' },
        { nome: 'Autonomia tecnica', desc: 'TBO tem autonomia completa em direcao criativa, estrategia e qualidade tecnica.' }
      ],
      regrasRevisoes: '3 rodadas incluidas no escopo. Revisoes extras geram custo adicional e novo prazo.',
      regrasComunicacao: 'Horario de atendimento: segunda a sexta, 9h-18h. Mensagens fora do horario nao entram automaticamente no fluxo.',
      nivelDemandas: [
        { nivel: 1, desc: 'Ajustes leves: 48-72h (revisao de textos, trocas de imagens).' },
        { nivel: 2, desc: 'Novas pecas: 5-10 dias uteis (novos layouts, artes ineditas).' },
        { nivel: 3, desc: 'Estrategia/Branding/CGI: prazos personalizados (Key Visual, Book, campanhas).' }
      ]
    }
  },

  // ── SECTION 11: Ferramentas ───────────────────────────────────────────
  ferramentas: {
    id: 'ferramentas',
    titulo: 'Guia de Ferramentas',
    icon: 'wrench',
    resumo: 'Stack de ferramentas por area — comunicacao, design, 3D, IA, marketing.',
    boasPraticas: [
      'Cada colaborador e responsavel por armazenar e nomear corretamente seus arquivos.',
      'Senhas e logins nao devem ser compartilhados fora do time autorizado.',
      'Notion, Drive e Google Chat sao fontes oficiais — documentos fora deles nao sao validos.',
      'Ferramentas devem ser usadas com login corporativo.',
      'Ferramentas compartilhadas: acessar por projetos@agenciatbo.com.br'
    ],
    categorias: [
      { nome: 'Comunicacao e E-mail', ferramentas: ['Google Workspace (Gmail, Chat, Meet, Calendar)', 'WhatsApp Business'] },
      { nome: 'Design e Producao Visual', ferramentas: ['Adobe Creative Suite (Photoshop, Illustrator, InDesign, Premiere, After Effects)', 'Figma'] },
      { nome: 'Renderizacao e 3D', ferramentas: ['3ds Max', 'Corona Renderer', 'Unreal Engine', 'Chaos Vantage'] },
      { nome: 'IA e Geracao de Conteudo', ferramentas: ['ChatGPT / Claude', 'Midjourney', 'Stable Diffusion', 'Runway ML'] },
      { nome: 'Marketing e Relatorios', ferramentas: ['Meta Business Suite', 'Google Ads', 'Google Analytics', 'RD Station'] }
    ]
  },

  // ── SECTION 12: Cultura & Lideranca (legado — manter compatibilidade) ──
  cultura: {
    id: 'cultura',
    titulo: 'Cultura & Lideranca',
    icon: 'heart',
    resumo: 'Cultura organizacional, perfil de lideranca e principios de trabalho.',
    principiosCulturais: [
      'Alta performance com humanidade.',
      'Autonomia com responsabilidade.',
      'Feedback constante como ferramenta de crescimento.',
      'Erro faz parte — mas repetir erro e negligencia.',
      'Transparencia radical — problemas sao discutidos abertamente.',
      'Documentar e um ato de lideranca.'
    ],
    perfilLider: [
      'Lidera pelo exemplo, nao pelo cargo.',
      'Desenvolve pessoas — nao apenas cobra resultados.',
      'Da contexto antes de dar ordens.',
      'Protege a equipe e assume responsabilidade.',
      'Celebra conquistas e reconhece esforco.',
      'Toma decisoes dificeis com maturidade.'
    ],
    trabalhoRemoto: 'A TBO e uma empresa remota com raizes em Curitiba. A comunicacao assincrona e padrao. A distancia nunca pode ser desculpa para desalinhamento.'
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CULTURE NUDGES — Micro-lembretes para o dashboard
  // Rotacionados diariamente no widget do Command Center
  // ═══════════════════════════════════════════════════════════════════════

  nudges: {
    // Valor do dia (6 valores, rotaciona pelo dia do ano)
    valorDoDia() {
      const valores = TBO_CULTURA_DATA.mvv.valores;
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      return valores[dayOfYear % valores.length];
    },

    // Tip cultural aleatorio
    tipCultural() {
      const tips = [
        ...TBO_CULTURA_DATA.culturaViva.comportamentos.map(c => `${c.pilar}: ${c.desc}`),
        ...TBO_CULTURA_DATA.cultura.principiosCulturais,
        ...TBO_CULTURA_DATA.lideranca.principioAutonomia.praticas,
        ...TBO_CULTURA_DATA.lideranca.feedback.principios,
        ...TBO_CULTURA_DATA.comunicacao.regrasOuro.map(r => `${r.titulo}: ${r.desc}`)
      ];
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      return tips[dayOfYear % tips.length];
    },

    // Anti-padrao do dia (lembrete do que NAO fazer)
    antiPadraoDoDia() {
      const anti = TBO_CULTURA_DATA.culturaViva.antiCultura;
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      return anti[dayOfYear % anti.length];
    },

    // Pergunta de autoavaliacao
    reflexaoDoDia() {
      const perguntas = TBO_CULTURA_DATA.culturaViva.autoavaliacao;
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      return perguntas[dayOfYear % perguntas.length];
    }
  }
};

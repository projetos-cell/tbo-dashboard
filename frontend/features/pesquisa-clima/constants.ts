// ============================================================
// 4ª Pesquisa de Clima — Agência TBO (v3 — parecer RH aplicado)
// v2: Likert padronizado, eNPS canônico, comunicação, anti-fadiga
// v3: +segurança psicológica, +intenção permanência, +propósito,
//     sobrecarga invertida, q42 multi-select, equilíbrio reformulado
// Total: 48 perguntas, 8 seções, ~9 min
// ============================================================

export interface SurveyQuestion {
  id: string;
  sectionId: string;
  label: string;
  type: "text" | "textarea" | "select" | "scale" | "nps" | "multi_select";
  required: boolean;
  options?: string[];
  scaleMin?: string;
  scaleMax?: string;
  conditionalOn?: { questionId: string; values: string[] };
  helperText?: string;
  maxSelections?: number;
}

export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  order: number;
}

// ── Seções (reordenadas: escalas rápidas primeiro, aberto no final) ──
export const SURVEY_SECTIONS: SurveySection[] = [
  {
    id: "clima",
    title: "Clima Organizacional",
    description:
      "Como você se sente no dia a dia da TBO. Responda com sinceridade — a pesquisa é 100% anônima.",
    order: 0,
  },
  {
    id: "lideranca",
    title: "Liderança e Gestão",
    description:
      "Sobre a relação com a liderança direta e o estilo de gestão da empresa.",
    order: 1,
  },
  {
    id: "comunicacao",
    title: "Comunicação e Reconhecimento",
    description:
      "Sobre o fluxo de informação entre áreas, reconhecimento e segurança para se expressar.",
    order: 2,
  },
  {
    id: "funcoes",
    title: "Funções e Carga de Trabalho",
    description: "Sobre sua atividade laboral e equilíbrio de demanda.",
    order: 3,
  },
  {
    id: "carreira",
    title: "Plano de Carreira",
    description: "Sobre sua perspectiva de crescimento na empresa.",
    order: 4,
  },
  {
    id: "ambiente",
    title: "Ambiente e Ferramentas",
    description: "Sobre as condições de trabalho, presencial e remoto.",
    order: 5,
  },
  {
    id: "salarios",
    title: "Remuneração e Benefícios",
    description:
      "Sobre a compensação financeira e o pacote de benefícios.",
    order: 6,
  },
  {
    id: "geral",
    title: "Visão Geral",
    description:
      "Últimas perguntas — sua visão sobre a TBO, marca e futuro.",
    order: 7,
  },
];

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  // ══════════════════════════════════════════════════════════
  // SEÇÃO 1: CLIMA ORGANIZACIONAL (7 perguntas)
  // +propósito (q5), reformulou equilíbrio (q4)
  // ══════════════════════════════════════════════════════════
  {
    id: "q1",
    sectionId: "clima",
    label: "A cultura da empresa é clara para você?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q2",
    sectionId: "clima",
    label: "Você se sente confortável com a sua equipe de trabalho?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q3",
    sectionId: "clima",
    label: "O dia a dia de trabalho é agradável para você?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q4",
    sectionId: "clima",
    label:
      "Consigo manter um equilíbrio saudável entre vida pessoal e trabalho.",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q5",
    sectionId: "clima",
    label: "O trabalho que faço aqui tem significado e propósito para mim.",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q6",
    sectionId: "clima",
    label: "Você se sente pertencente à empresa?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q7",
    sectionId: "clima",
    label:
      "Você tem acesso às informações que precisa para tomar boas decisões no seu trabalho?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
    helperText: "Clareza sobre objetivos, prioridades e contexto dos projetos.",
  },

  // ══════════════════════════════════════════════════════════
  // SEÇÃO 2: LIDERANÇA E GESTÃO (5 perguntas)
  // ══════════════════════════════════════════════════════════
  {
    id: "q8",
    sectionId: "lideranca",
    label: "Seu gestor é claro ao delegar tarefas e definir expectativas?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q9",
    sectionId: "lideranca",
    label:
      "A comunicação entre gestor e equipe é transparente e acessível?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q10",
    sectionId: "lideranca",
    label: "Suas entregas são reconhecidas e valorizadas pela liderança?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q11",
    sectionId: "lideranca",
    label:
      "Sua opinião é levada em consideração nas decisões que afetam o seu trabalho?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q12",
    sectionId: "lideranca",
    label:
      "Seu líder te incentiva a aprender e impulsionar sua carreira?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },

  // ══════════════════════════════════════════════════════════
  // SEÇÃO 3: COMUNICAÇÃO E RECONHECIMENTO (5 perguntas)
  // +segurança psicológica (q16)
  // ══════════════════════════════════════════════════════════
  {
    id: "q13",
    sectionId: "comunicacao",
    label:
      "A comunicação entre as diferentes áreas da TBO funciona bem?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q14",
    sectionId: "comunicacao",
    label:
      "Os objetivos e prioridades da empresa são comunicados com clareza?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q15",
    sectionId: "comunicacao",
    label:
      "Você sente que seus colegas reconhecem e valorizam seu trabalho?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
    helperText: "Reconhecimento horizontal — entre pares, não só da liderança.",
  },
  {
    id: "q16",
    sectionId: "comunicacao",
    label:
      "Você se sente à vontade para dar e receber feedback com seus colegas?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q17",
    sectionId: "comunicacao",
    label:
      "Me sinto seguro(a) para expressar discordância ou apontar problemas sem medo de consequências negativas.",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
    helperText: "Segurança psicológica — essencial para inovação e cultura saudável.",
  },

  // ══════════════════════════════════════════════════════════
  // SEÇÃO 4: FUNÇÕES E CARGA DE TRABALHO (6 perguntas)
  // Sobrecarga invertida (q21): 5 = bom (consigo entregar com qualidade)
  // ══════════════════════════════════════════════════════════
  {
    id: "q18",
    sectionId: "funcoes",
    label:
      "Você está satisfeito(a) com as funções que desempenha no dia a dia?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q19",
    sectionId: "funcoes",
    label:
      "Você enxerga que suas atividades contribuem para o sucesso do negócio?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q20",
    sectionId: "funcoes",
    label: "Você se sente desafiado(a) de forma saudável no trabalho?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q21",
    sectionId: "funcoes",
    label:
      "Minha carga de trabalho permite que eu entregue com qualidade sem comprometer minha saúde.",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
    helperText: "1 = sobrecarregado, 5 = carga equilibrada. Escala alinhada com as demais.",
  },
  {
    id: "q22",
    sectionId: "funcoes",
    label:
      "Que sugestão você daria para melhorar a distribuição de trabalho na equipe?",
    type: "textarea",
    required: false,
    conditionalOn: { questionId: "q21", values: ["1", "2"] },
    helperText: "Só aparece para quem marcou carga desequilibrada.",
  },
  {
    id: "q23",
    sectionId: "funcoes",
    label:
      "Se pudesse mudar uma coisa na sua rotina de trabalho, o que seria?",
    type: "textarea",
    required: false,
  },

  // ══════════════════════════════════════════════════════════
  // SEÇÃO 5: PLANO DE CARREIRA (5 perguntas)
  // ══════════════════════════════════════════════════════════
  {
    id: "q24",
    sectionId: "carreira",
    label: "Você enxerga possibilidades reais de crescimento na TBO?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q25",
    sectionId: "carreira",
    label:
      "O plano de carreira para a sua posição é claro e documentado?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q26",
    sectionId: "carreira",
    label:
      "Você sabe exatamente o que precisa entregar para alcançar o próximo nível?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q27",
    sectionId: "carreira",
    label:
      "Você tem interesse em ocupar outros cargos dentro da organização?",
    type: "select",
    required: true,
    options: ["Sim", "Não", "Estou avaliando"],
  },
  {
    id: "q28",
    sectionId: "carreira",
    label: "Qual cargo ou área você gostaria de explorar?",
    type: "text",
    required: false,
    conditionalOn: { questionId: "q27", values: ["Sim", "Estou avaliando"] },
    helperText: "Campo livre — escreva o que faz sentido para você.",
  },

  // ══════════════════════════════════════════════════════════
  // SEÇÃO 6: AMBIENTE E FERRAMENTAS (7 perguntas)
  // ══════════════════════════════════════════════════════════
  {
    id: "q29",
    sectionId: "ambiente",
    label:
      "O ambiente de trabalho é adequado para realizar suas atividades?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q30",
    sectionId: "ambiente",
    label:
      "Você tem acesso a todas as ferramentas digitais necessárias para o seu trabalho?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
    helperText: "Softwares, licenças, plugins, acesso a plataformas.",
  },
  {
    id: "q31",
    sectionId: "ambiente",
    label:
      "O equipamento físico que você usa está adequado para suas atividades?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
    helperText: "Computador, monitor, periféricos, cadeira, mesa.",
  },
  {
    id: "q32",
    sectionId: "ambiente",
    label: "O home office funciona bem para a sua produtividade?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q33",
    sectionId: "ambiente",
    label: "Encontros presenciais são importantes para o seu trabalho?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
    helperText: "Atividades criativas, conexões, pertencimento.",
  },
  {
    id: "q34",
    sectionId: "ambiente",
    label: "Quais atividades presenciais fazem mais sentido para você?",
    type: "multi_select",
    required: false,
    options: [
      "Coworking criativo (discutir projetos do ponto de vista criativo)",
      "Coworking técnico (aspectos técnicos e produção)",
      "Happy Hour para integração",
      "Eventos culturais (museus, cinemas, mostras, feiras)",
      "Atividades esportivas (corrida, escalada, trilhas)",
    ],
    conditionalOn: { questionId: "q33", values: ["4", "5"] },
  },
  {
    id: "q35",
    sectionId: "ambiente",
    label:
      "Que equipamento, ferramenta ou melhoria ergonômica faria diferença no seu dia a dia?",
    type: "textarea",
    required: false,
  },

  // ══════════════════════════════════════════════════════════
  // SEÇÃO 7: REMUNERAÇÃO E BENEFÍCIOS (5 perguntas)
  // ══════════════════════════════════════════════════════════
  {
    id: "q36",
    sectionId: "salarios",
    label:
      "Comparando com o mercado, como você avalia sua remuneração na TBO?",
    type: "select",
    required: true,
    options: ["Abaixo do mercado", "Na média", "Acima do mercado", "Não sei avaliar"],
    helperText: "Baseado na sua percepção, não precisa de dados exatos.",
  },
  {
    id: "q37",
    sectionId: "salarios",
    label:
      "Sua remuneração é justa considerando as atividades que você desempenha?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q38",
    sectionId: "salarios",
    label:
      "Se pudesse escolher 1 melhoria, qual seria a prioridade para você?",
    type: "select",
    required: true,
    options: [
      "Aumento salarial",
      "Novo benefício (saúde, alimentação, etc.)",
      "Bônus por performance / projetos",
      "Mais flexibilidade (horário, remoto)",
      "Investimento em educação / cursos",
    ],
  },
  {
    id: "q39",
    sectionId: "salarios",
    label:
      "Quais benefícios você sente falta de receber?",
    type: "textarea",
    required: false,
    helperText: "Ex: plano de saúde, vale alimentação, gympass, auxílio home office, etc.",
  },
  {
    id: "q40",
    sectionId: "salarios",
    label:
      "As formas atuais de bonificação fazem sentido para você?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },

  // ══════════════════════════════════════════════════════════
  // SEÇÃO 8: VISÃO GERAL (8 perguntas)
  // +intenção de permanência (q43), q45 = multi-select atributos marca
  // ══════════════════════════════════════════════════════════
  {
    id: "q41",
    sectionId: "geral",
    label:
      "De 0 a 10, qual a probabilidade de você recomendar a TBO como lugar para trabalhar?",
    type: "nps",
    required: true,
    scaleMin: "Nada provável",
    scaleMax: "Extremamente provável",
    helperText: "Essa é a pergunta padrão de eNPS usada globalmente.",
  },
  {
    id: "q42",
    sectionId: "geral",
    label: "Quão feliz você se sente na empresa?",
    type: "scale",
    required: true,
    scaleMin: "Pouco feliz",
    scaleMax: "Muito feliz",
  },
  {
    id: "q43",
    sectionId: "geral",
    label: "Você se vê trabalhando na TBO daqui a 12 meses?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
    helperText: "Indicador de intenção de permanência — principal preditor de turnover.",
  },
  {
    id: "q44",
    sectionId: "geral",
    label: "Trabalhar na TBO é motivo de orgulho para você?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q45",
    sectionId: "geral",
    label:
      "Quais palavras melhor descrevem a marca TBO para você?",
    type: "multi_select",
    required: true,
    options: [
      "Inovadora",
      "Criativa",
      "Profissional",
      "Jovem",
      "Confiável",
      "Premium",
      "Acolhedora",
      "Ambiciosa",
      "Técnica",
      "Desorganizada",
    ],
    maxSelections: 3,
    helperText: "Selecione até 3 palavras.",
  },
  {
    id: "q46",
    sectionId: "geral",
    label:
      "A identidade da marca está alinhada com o que você vive no dia a dia?",
    type: "scale",
    required: true,
    scaleMin: "Discordo totalmente",
    scaleMax: "Concordo totalmente",
  },
  {
    id: "q47",
    sectionId: "geral",
    label: "Onde você vê a TBO nos próximos 5 anos?",
    type: "textarea",
    required: true,
  },
  {
    id: "q48",
    sectionId: "geral",
    label:
      "Tem alguma sugestão, ideia ou ponto de atenção que gostaria de compartilhar com a diretoria?",
    type: "textarea",
    required: false,
    helperText: "Espaço livre e seguro. Use como quiser.",
  },
];

export const SURVEY_INTRO = {
  title: "Pesquisa de Clima",
  edition: "4ª edição",
  body: `Essa pesquisa existe para ouvir você de verdade.

Queremos entender como está sendo sua experiência na TBO — o que funciona, o que incomoda, o que pode melhorar. Sem filtro, sem julgamento.

As últimas edições já geraram mudanças reais. Essa também vai.`,
  anonymity: "Suas respostas são 100% anônimas. Nenhum dado pessoal é coletado ou vinculado à sua identidade.",
  cta: "Começar pesquisa",
};

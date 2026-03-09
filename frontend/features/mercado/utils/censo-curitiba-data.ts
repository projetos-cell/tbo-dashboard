// Dados do Censo 2022 - Curitiba
// Fonte: CNEFE e IBGE - Censo 2022: Agregados por Setores Censitários
// Desenvolvido por IPPUC - Coordenação de Monitoramento e Pesquisa

export const CENSO_RESUMO = {
  cidade: "Curitiba",
  populacao: 1773718,
  densidadeMedia: 40.79,
  domiciliosParticulares: 788684,
  domiciliosColetivos: 1162,
  pctCasas: 59.4,
  pctApartamentos: 5.24,
  pctOutros: 35.4,
  acrescimoDomicilios25pct: true,
  pctOcupados: 86.99,
  pctNaoOcupados: 13.01,
};

export const POPULACAO_ABSOLUTA = [
  { bairro: "Cidade Industrial", valor: 172510 },
  { bairro: "Sítio Cercado", valor: 102293 },
  { bairro: "Cajuru", valor: 90002 },
  { bairro: "Uberaba", valor: 73241 },
  { bairro: "Boqueirão", valor: 65618 },
  { bairro: "Xaxim", valor: 58124 },
];

export const DENSIDADE_POPULACIONAL = [
  { bairro: "Cristo Rei", valor: 122 },
  { bairro: "Centro", valor: 116 },
  { bairro: "Vila Izabel", valor: 106 },
  { bairro: "Água Verde", valor: 104 },
  { bairro: "Juvevê", valor: 97 },
  { bairro: "Sítio Cercado", valor: 91 },
];

export const VARIACAO_POPULACIONAL = [
  { bairro: "Caximba", valor: 188.98, destaque: true },
  { bairro: "Ganchinho", valor: 70.38 },
  { bairro: "Riviera", valor: 52.94 },
  { bairro: "Campo de Santana", valor: 52.43 },
  { bairro: "Cristo Rei", valor: 27.61 },
  { bairro: "Mossunguê", valor: 26.72 },
];

export const ACRESCIMO_DOMICILIOS = [
  { bairro: "Caximba", valor: 284.22, destaque: true },
  { bairro: "Ganchinho", valor: 110.77 },
  { bairro: "Campo de Santana", valor: 91.81 },
  { bairro: "Riviera", valor: 74.49 },
  { bairro: "Santa Cândida", valor: 59.72 },
  { bairro: "Cachoeira", valor: 59.61 },
  { bairro: "São Miguel", valor: 55.39 },
  { bairro: "Atuba", valor: 54.10 },
];

export const POPULACAO_HISTORICA = [
  { ano: 1980, populacao: 1024975, domicilios: 351936 },
  { ano: 1991, populacao: 1315035, domicilios: 421978 },
  { ano: 1996, populacao: 1476253, domicilios: 472181 },
  { ano: 2000, populacao: 1587315, domicilios: null },
  { ano: 2010, populacao: 1751907, domicilios: 634538 },
  { ano: 2022, populacao: 1773718, domicilios: 788684 },
];

export const ESTABELECIMENTOS = [
  { tipo: "Ensino", valor: 1574, icone: "graduation-cap" as const },
  { tipo: "Saúde", valor: 2820, icone: "heart-pulse" as const },
  { tipo: "Religioso", valor: 2094, icone: "church" as const },
  { tipo: "Outros", valor: 87930, icone: "building-2" as const },
  { tipo: "Em construção", valor: 16123, icone: "hard-hat" as const },
];

// Dados por bairro para o mapa (variação populacional 2010-2022)
// Agrupados em faixas: perda (negativo), baixo (0-10%), médio (10-30%), alto (30%+)
export const BAIRROS_VARIACAO: Record<
  string,
  { variacao: number; populacao: number; regional: string }
> = {
  "Abranches": { variacao: 14.52, populacao: 13821, regional: "Boa Vista" },
  "Água Verde": { variacao: 9.12, populacao: 52718, regional: "Portão" },
  "Ahú": { variacao: 5.48, populacao: 11302, regional: "Matriz" },
  "Alto Boqueirão": { variacao: 8.91, populacao: 55814, regional: "Boqueirão" },
  "Alto da Glória": { variacao: 18.21, populacao: 5743, regional: "Matriz" },
  "Alto da XV": { variacao: 12.44, populacao: 8752, regional: "Matriz" },
  "Atuba": { variacao: 16.52, populacao: 15182, regional: "Boa Vista" },
  "Augusta": { variacao: 10.31, populacao: 4127, regional: "Pinheirinho" },
  "Bacacheri": { variacao: 4.95, populacao: 25472, regional: "Boa Vista" },
  "Bairro Alto": { variacao: 15.73, populacao: 47321, regional: "Boa Vista" },
  "Barreirinha": { variacao: 12.14, populacao: 19862, regional: "Santa Felicidade" },
  "Bigorrilho": { variacao: 7.82, populacao: 28953, regional: "Matriz" },
  "Boa Vista": { variacao: 6.21, populacao: 29671, regional: "Boa Vista" },
  "Bom Retiro": { variacao: 3.41, populacao: 6742, regional: "Matriz" },
  "Boqueirão": { variacao: 0.58, populacao: 65618, regional: "Boqueirão" },
  "Butiatuvinha": { variacao: 21.35, populacao: 13574, regional: "Santa Felicidade" },
  "Cabral": { variacao: 10.82, populacao: 13174, regional: "Matriz" },
  "Cachoeira": { variacao: 24.61, populacao: 10214, regional: "Santa Felicidade" },
  "Cajuru": { variacao: 1.72, populacao: 90002, regional: "Cajuru" },
  "Campina do Siqueira": { variacao: 6.54, populacao: 7213, regional: "Portão" },
  "Campo Comprido": { variacao: 19.82, populacao: 32641, regional: "CIC" },
  "Campo de Santana": { variacao: 52.43, populacao: 35821, regional: "Tatuquara" },
  "Capão da Imbuia": { variacao: 4.21, populacao: 21457, regional: "Cajuru" },
  "Capão Raso": { variacao: 5.12, populacao: 36158, regional: "Pinheirinho" },
  "Cascatinha": { variacao: 8.41, populacao: 2174, regional: "Santa Felicidade" },
  "Caximba": { variacao: 188.98, populacao: 5821, regional: "Tatuquara" },
  "Centro": { variacao: -4.21, populacao: 37283, regional: "Matriz" },
  "Centro Cívico": { variacao: 8.21, populacao: 5124, regional: "Matriz" },
  "Cidade Industrial": { variacao: 2.95, populacao: 172510, regional: "CIC" },
  "Cristo Rei": { variacao: 27.61, populacao: 14521, regional: "Matriz" },
  "Fanny": { variacao: 3.21, populacao: 7812, regional: "Portão" },
  "Fazendinha": { variacao: 2.14, populacao: 27642, regional: "Portão" },
  "Ganchinho": { variacao: 70.38, populacao: 13852, regional: "Boqueirão" },
  "Guabirotuba": { variacao: 7.61, populacao: 11452, regional: "Cajuru" },
  "Guaíra": { variacao: 1.82, populacao: 14763, regional: "Portão" },
  "Hauer": { variacao: 4.52, populacao: 13841, regional: "Boqueirão" },
  "Hugo Lange": { variacao: 15.72, populacao: 3218, regional: "Matriz" },
  "Jardim Botânico": { variacao: 11.32, populacao: 6152, regional: "Matriz" },
  "Jardim das Américas": { variacao: 8.21, populacao: 15234, regional: "Cajuru" },
  "Jardim Social": { variacao: 3.81, populacao: 5423, regional: "Matriz" },
  "Juvevê": { variacao: 11.82, populacao: 11893, regional: "Matriz" },
  "Lamenha Pequena": { variacao: 18.42, populacao: 1214, regional: "Santa Felicidade" },
  "Lindóia": { variacao: 2.54, populacao: 7821, regional: "Portão" },
  "Mercês": { variacao: 12.92, populacao: 14582, regional: "Matriz" },
  "Mossunguê": { variacao: 26.72, populacao: 9241, regional: "Santa Felicidade" },
  "Novo Mundo": { variacao: 3.41, populacao: 42163, regional: "Pinheirinho" },
  "Orleans": { variacao: 9.54, populacao: 8421, regional: "Santa Felicidade" },
  "Parolin": { variacao: 6.21, populacao: 12453, regional: "Portão" },
  "Pilarzinho": { variacao: 7.82, populacao: 28452, regional: "Boa Vista" },
  "Pinheirinho": { variacao: 4.21, populacao: 50723, regional: "Pinheirinho" },
  "Portão": { variacao: 5.62, populacao: 42571, regional: "Portão" },
  "Prado Velho": { variacao: 8.53, populacao: 3214, regional: "Matriz" },
  "Rebouças": { variacao: 14.21, populacao: 15874, regional: "Matriz" },
  "Riviera": { variacao: 52.94, populacao: 4218, regional: "Tatuquara" },
  "Santa Cândida": { variacao: 15.21, populacao: 32574, regional: "Boa Vista" },
  "Santa Felicidade": { variacao: 13.42, populacao: 32174, regional: "Santa Felicidade" },
  "Santa Quitéria": { variacao: 4.12, populacao: 12341, regional: "Portão" },
  "Santo Inácio": { variacao: 16.73, populacao: 6824, regional: "Santa Felicidade" },
  "São Braz": { variacao: 14.52, populacao: 25321, regional: "Santa Felicidade" },
  "São Francisco": { variacao: -2.41, populacao: 6421, regional: "Matriz" },
  "São João": { variacao: 5.21, populacao: 3152, regional: "Portão" },
  "São Lourenço": { variacao: 9.72, populacao: 6214, regional: "Boa Vista" },
  "São Miguel": { variacao: 20.14, populacao: 5742, regional: "Boqueirão" },
  "Seminário": { variacao: 7.32, populacao: 6521, regional: "Portão" },
  "Sítio Cercado": { variacao: 5.52, populacao: 102293, regional: "Boqueirão" },
  "Taboão": { variacao: 11.42, populacao: 3214, regional: "Boa Vista" },
  "Tarumã": { variacao: 7.14, populacao: 8742, regional: "Cajuru" },
  "Tatuquara": { variacao: 16.42, populacao: 54231, regional: "Tatuquara" },
  "Tingui": { variacao: 5.82, populacao: 12435, regional: "Boa Vista" },
  "Uberaba": { variacao: 9.41, populacao: 73241, regional: "Cajuru" },
  "Umbará": { variacao: 18.62, populacao: 18574, regional: "Boqueirão" },
  "Vila Izabel": { variacao: 6.41, populacao: 10523, regional: "Portão" },
  "Vista Alegre": { variacao: 12.72, populacao: 10214, regional: "Santa Felicidade" },
  "Xaxim": { variacao: 3.82, populacao: 58124, regional: "Boqueirão" },
};

export const REGIONAIS = [
  "Todos",
  "Boa Vista",
  "Boqueirão",
  "Cajuru",
  "CIC",
  "Matriz",
  "Pinheirinho",
  "Portão",
  "Santa Felicidade",
  "Tatuquara",
];

// Dados do Censo 2022 - Paraná
// Fonte: IBGE — Censo Demográfico 2022 | IPARDES

export const CENSO_PR_RESUMO = {
  estado: "Paraná",
  populacao: 11444380,
  populacao2010: 10444526,
  crescimento: 9.57,
  areaTerritorial: 199307.985,
  densidade: 57.42,
  urbanizacao: 89.0,
  totalMunicipios: 399,
  domiciliosParticulares: 4285721,
  pibPerCapita: 47264,
};

export interface CidadePR {
  cidade: string;
  populacao: number;
  populacao2010: number;
  variacao: number;
  area: number;
  densidade: number;
  regiao: string;
}

export const CIDADES_PR: CidadePR[] = [
  { cidade: "Curitiba", populacao: 1773718, populacao2010: 1751907, variacao: 1.24, area: 435.27, densidade: 4074.58, regiao: "Metropolitana de Curitiba" },
  { cidade: "Londrina", populacao: 580870, populacao2010: 506701, variacao: 14.64, area: 1653.07, densidade: 351.39, regiao: "Norte Central" },
  { cidade: "Maringá", populacao: 436472, populacao2010: 357077, variacao: 22.23, area: 487.93, densidade: 894.52, regiao: "Norte Central" },
  { cidade: "Ponta Grossa", populacao: 358838, populacao2010: 311611, variacao: 15.16, area: 2054.73, densidade: 174.69, regiao: "Centro-Oriental" },
  { cidade: "Cascavel", populacao: 342807, populacao2010: 286205, variacao: 19.78, area: 2091.40, densidade: 163.91, regiao: "Oeste" },
  { cidade: "São José dos Pinhais", populacao: 328979, populacao2010: 264210, variacao: 24.51, area: 946.44, densidade: 347.60, regiao: "Metropolitana de Curitiba" },
  { cidade: "Foz do Iguaçu", populacao: 285779, populacao2010: 256088, variacao: 11.59, area: 618.35, densidade: 462.10, regiao: "Oeste" },
  { cidade: "Colombo", populacao: 246540, populacao2010: 212967, variacao: 15.76, area: 197.81, densidade: 1246.33, regiao: "Metropolitana de Curitiba" },
  { cidade: "Guarapuava", populacao: 183755, populacao2010: 167328, variacao: 9.82, area: 3177.60, densidade: 57.83, regiao: "Centro-Sul" },
  { cidade: "Paranaguá", populacao: 159005, populacao2010: 140469, variacao: 13.20, area: 826.67, densidade: 192.34, regiao: "Metropolitana de Curitiba" },
  { cidade: "Araucária", populacao: 156913, populacao2010: 119123, variacao: 31.72, area: 469.24, densidade: 334.38, regiao: "Metropolitana de Curitiba" },
  { cidade: "Toledo", populacao: 145752, populacao2010: 119313, variacao: 22.16, area: 1197.00, densidade: 121.76, regiao: "Oeste" },
  { cidade: "Apucarana", populacao: 139900, populacao2010: 120919, variacao: 15.70, area: 558.39, densidade: 250.53, regiao: "Norte Central" },
  { cidade: "Pinhais", populacao: 136479, populacao2010: 117008, variacao: 16.64, area: 60.87, densidade: 2242.00, regiao: "Metropolitana de Curitiba" },
  { cidade: "Campo Largo", populacao: 135824, populacao2010: 112377, variacao: 20.87, area: 1243.55, densidade: 109.23, regiao: "Metropolitana de Curitiba" },
  { cidade: "Arapongas", populacao: 134191, populacao2010: 104150, variacao: 28.84, area: 382.22, densidade: 351.10, regiao: "Norte Central" },
  { cidade: "Almirante Tamandaré", populacao: 124572, populacao2010: 103204, variacao: 20.71, area: 195.00, densidade: 639.08, regiao: "Metropolitana de Curitiba" },
  { cidade: "Fazenda Rio Grande", populacao: 118775, populacao2010: 81675, variacao: 45.43, area: 116.68, densidade: 1018.05, regiao: "Metropolitana de Curitiba" },
  { cidade: "Piraquara", populacao: 117228, populacao2010: 93207, variacao: 25.77, area: 227.04, densidade: 516.33, regiao: "Metropolitana de Curitiba" },
  { cidade: "Umuarama", populacao: 115063, populacao2010: 100676, variacao: 14.30, area: 1232.79, densidade: 93.34, regiao: "Noroeste" },
  { cidade: "Cambé", populacao: 113058, populacao2010: 96733, variacao: 16.87, area: 495.38, densidade: 228.22, regiao: "Norte Central" },
  { cidade: "Francisco Beltrão", populacao: 92781, populacao2010: 78943, variacao: 17.53, area: 735.11, densidade: 126.21, regiao: "Sudoeste" },
];

export interface PopulacaoHistoricaPR {
  ano: number;
  populacao: number;
  urbanizacao: number;
}

export const POPULACAO_HISTORICA_PR: PopulacaoHistoricaPR[] = [
  { ano: 1970, populacao: 6929868, urbanizacao: 36.1 },
  { ano: 1980, populacao: 7629392, urbanizacao: 58.6 },
  { ano: 1991, populacao: 8448713, urbanizacao: 73.4 },
  { ano: 2000, populacao: 9563458, urbanizacao: 81.4 },
  { ano: 2010, populacao: 10444526, urbanizacao: 85.3 },
  { ano: 2022, populacao: 11444380, urbanizacao: 89.0 },
];

export interface MesorregiaoPR {
  nome: string;
  populacao: number;
  municipios: number;
  cidadePrincipal: string;
}

export const MESORREGIOES_PR: MesorregiaoPR[] = [
  { nome: "Metropolitana de Curitiba", populacao: 3785709, municipios: 37, cidadePrincipal: "Curitiba" },
  { nome: "Norte Central", populacao: 2037185, municipios: 79, cidadePrincipal: "Londrina" },
  { nome: "Oeste", populacao: 1315422, municipios: 50, cidadePrincipal: "Cascavel" },
  { nome: "Centro-Oriental", populacao: 689016, municipios: 14, cidadePrincipal: "Ponta Grossa" },
  { nome: "Noroeste", populacao: 678319, municipios: 61, cidadePrincipal: "Umuarama" },
  { nome: "Norte Pioneiro", populacao: 494159, municipios: 46, cidadePrincipal: "Jacarezinho" },
  { nome: "Centro-Sul", populacao: 544788, municipios: 29, cidadePrincipal: "Guarapuava" },
  { nome: "Sudoeste", populacao: 530892, municipios: 37, cidadePrincipal: "Francisco Beltrão" },
  { nome: "Sudeste", populacao: 427612, municipios: 21, cidadePrincipal: "Irati" },
  { nome: "Centro-Ocidental", populacao: 334278, municipios: 25, cidadePrincipal: "Campo Mourão" },
];

export const HABITACAO_PR = {
  deficitHabitacional: 285000,
  domiciliosProprios: 72.3,
  domiciliosAlugados: 19.8,
  domiciliosCedidos: 7.9,
};

// TBO OS — Contratos Data (extracted from Google Drive — Feb 2026)
// Source: Google Drive > Juridico > Contratos > Clientes (82 .doc files, 37 client folders)

const TBO_CONTRATOS_DATA = {

  metadata: {
    source: 'Google Drive — Juridico/Contratos/Clientes',
    lastUpdate: '2026-02-17',
    totalContratos: 82
  },

  contratos: [

    // ── HOMS EMPREENDIMENTOS ────────────────────────────────────────────
    {
      id: 'ctr_001',
      cliente: 'Homs Empreendimentos',
      projeto: 'Homs Contrato 1',
      servicos: ['Render 3D', 'Branding', 'Audiovisual', 'Plantas Humanizadas'],
      valorTotal: 13400,
      parcelas: [],
      qtdImagens: 3,
      qtdPlantas: 10,
      status: 'finalizado',
      arquivo: 'HOMS_contrato_01.doc'
    },
    {
      id: 'ctr_002',
      cliente: 'Homs Empreendimentos',
      projeto: 'Homs Contrato 2',
      servicos: ['Render 3D', 'Branding', 'Marketing', 'Audiovisual'],
      valorTotal: 7500,
      parcelas: [],
      qtdImagens: 5,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'HOMS_contrato_02.doc'
    },

    // ── O3 EMPREENDIMENTOS ──────────────────────────────────────────────
    {
      id: 'ctr_003',
      cliente: 'O3 Empreendimentos',
      projeto: 'Interiores Nort Hill',
      servicos: ['Interiores'],
      valorTotal: 6500,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'O3_interiores_nort_hill.doc'
    },
    {
      id: 'ctr_004',
      cliente: 'O3 Empreendimentos',
      projeto: 'Oxygen',
      servicos: ['Render 3D', 'Plantas Humanizadas'],
      valorTotal: 18500,
      parcelas: [],
      qtdImagens: 20,
      qtdPlantas: 13,
      status: 'finalizado',
      arquivo: 'O3_oxygen.doc'
    },
    {
      id: 'ctr_005',
      cliente: 'O3 Empreendimentos',
      projeto: 'Balance',
      servicos: ['Render 3D', 'Plantas Humanizadas', 'Tour Virtual'],
      valorTotal: 47000,
      parcelas: [],
      qtdImagens: 15,
      qtdPlantas: 18,
      status: 'finalizado',
      arquivo: 'O3_balance.doc'
    },

    // ── GRUPO THAL ──────────────────────────────────────────────────────
    {
      id: 'ctr_006',
      cliente: 'Grupo Thal',
      projeto: 'Legacy',
      servicos: ['Render 3D'],
      valorTotal: 22000,
      parcelas: [],
      qtdImagens: 30,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'THAL_legacy.doc'
    },
    {
      id: 'ctr_007',
      cliente: 'Grupo Thal',
      projeto: 'Auma Lancamento',
      servicos: ['Render 3D', 'Branding', 'Marketing', 'Tour Virtual'],
      valorTotal: 100000,
      parcelas: [],
      qtdImagens: 25,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'THAL_auma_lancamento.doc'
    },
    {
      id: 'ctr_008',
      cliente: 'Grupo Thal',
      projeto: 'Auma Interiores Comuns',
      servicos: ['Interiores'],
      valorTotal: 7127.40,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'THAL_auma_interiores_comuns.doc'
    },
    {
      id: 'ctr_009',
      cliente: 'Grupo Thal',
      projeto: 'Auma Interiores Decorado',
      servicos: ['Interiores'],
      valorTotal: 19000,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'THAL_auma_interiores_decorado.doc'
    },
    {
      id: 'ctr_010',
      cliente: 'Grupo Thal',
      projeto: 'Auma Social Media',
      servicos: ['Branding', 'Marketing'],
      valorTotal: 30000,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'THAL_auma_social_media.doc'
    },
    {
      id: 'ctr_011',
      cliente: 'Grupo Thal',
      projeto: 'Auma Complementar',
      servicos: ['Render 3D', 'Branding', 'Marketing'],
      valorTotal: 36000,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'THAL_auma_complementar.doc'
    },

    // ── FONTANIVE ───────────────────────────────────────────────────────
    {
      id: 'ctr_012',
      cliente: 'Fontanive',
      projeto: 'Ecovillage',
      servicos: ['Render 3D', 'Interiores', 'Plantas Humanizadas', 'Tour Virtual'],
      valorTotal: 43350,
      parcelas: [],
      qtdImagens: 23,
      qtdPlantas: 12,
      status: 'ativo',
      arquivo: 'FONTANIVE_ecovillage.doc'
    },
    {
      id: 'ctr_013',
      cliente: 'Fontanive',
      projeto: 'Ecoville',
      servicos: ['Render 3D', 'Interiores', 'Plantas Humanizadas'],
      valorTotal: 17150,
      parcelas: [],
      qtdImagens: 15,
      qtdPlantas: 3,
      status: 'finalizado',
      arquivo: 'FONTANIVE_ecoville.doc'
    },
    {
      id: 'ctr_014',
      cliente: 'Fontanive',
      projeto: 'Jose Correia (Bemavi)',
      servicos: ['Render 3D', 'Interiores', 'Plantas Humanizadas', 'Tour Virtual'],
      valorTotal: 30450,
      parcelas: [],
      qtdImagens: 15,
      qtdPlantas: 7,
      status: 'finalizado',
      arquivo: 'FONTANIVE_jose_correia_bemavi.doc'
    },
    {
      id: 'ctr_015',
      cliente: 'Fontanive',
      projeto: 'Benjamin',
      servicos: ['Render 3D', 'Plantas Humanizadas', 'Tour Virtual'],
      valorTotal: 59520,
      parcelas: [],
      qtdImagens: 26,
      qtdPlantas: 19,
      status: 'finalizado',
      arquivo: 'FONTANIVE_benjamin.doc'
    },
    {
      id: 'ctr_016',
      cliente: 'Fontanive',
      projeto: 'Navegantes',
      servicos: ['Render 3D', 'Branding'],
      valorTotal: 22300,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'FONTANIVE_navegantes.doc'
    },
    {
      id: 'ctr_017',
      cliente: 'Fontanive',
      projeto: 'New Life 19',
      servicos: ['Render 3D', 'Branding', 'Plantas Humanizadas', 'Tour Virtual'],
      valorTotal: 81060,
      parcelas: [],
      qtdImagens: 26,
      qtdPlantas: 11,
      status: 'finalizado',
      arquivo: 'FONTANIVE_new_life_19.doc'
    },
    {
      id: 'ctr_018',
      cliente: 'Fontanive',
      projeto: 'New Life 19 Branding',
      servicos: ['Render 3D', 'Branding', 'Plantas Humanizadas'],
      valorTotal: 42540,
      parcelas: [],
      qtdImagens: 22,
      qtdPlantas: 2,
      status: 'finalizado',
      arquivo: 'FONTANIVE_new_life_19_branding.doc'
    },

    // ── CONSTROM ────────────────────────────────────────────────────────
    {
      id: 'ctr_019',
      cliente: 'Constrom',
      projeto: 'Constrom',
      servicos: ['Render 3D', 'Plantas Humanizadas'],
      valorTotal: 3250,
      parcelas: [],
      qtdImagens: 5,
      qtdPlantas: 5,
      status: 'finalizado',
      arquivo: 'CONSTROM_contrato.doc'
    },

    // ── MEDIEVAL ENGENHARIA ─────────────────────────────────────────────
    {
      id: 'ctr_020',
      cliente: 'Medieval Engenharia',
      projeto: 'Galliano250 Contrato 1',
      servicos: ['Render 3D', 'Branding', 'Plantas Humanizadas', 'Tour Virtual'],
      valorTotal: 41550,
      parcelas: [],
      qtdImagens: 26,
      qtdPlantas: 9,
      status: 'finalizado',
      arquivo: 'MEDIEVAL_galliano250_contrato_01.doc'
    },
    {
      id: 'ctr_021',
      cliente: 'Medieval Engenharia',
      projeto: 'Galliano250 Contrato 2 (Complementar)',
      servicos: ['Render 3D', 'Branding', 'Tour Virtual'],
      valorTotal: 23900,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'MEDIEVAL_galliano250_contrato_02.doc'
    },
    {
      id: 'ctr_022',
      cliente: 'Medieval Engenharia',
      projeto: 'Caieiras',
      servicos: ['Render 3D', 'Branding'],
      valorTotal: 28300,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'MEDIEVAL_caieiras.doc'
    },
    {
      id: 'ctr_023',
      cliente: 'Medieval Engenharia',
      projeto: 'Caieiras Complementar',
      servicos: ['Render 3D', 'Branding', 'Plantas Humanizadas'],
      valorTotal: 5700,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'MEDIEVAL_caieiras_complementar.doc'
    },

    // ── HOME INCORPORACOES ──────────────────────────────────────────────
    {
      id: 'ctr_024',
      cliente: 'Home Incorporacoes',
      projeto: 'Home Contrato 01',
      servicos: ['Render 3D', 'Interiores'],
      valorTotal: 7500,
      parcelas: [],
      qtdImagens: 5,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'HOME_contrato_01.doc'
    },
    {
      id: 'ctr_025',
      cliente: 'Home Incorporacoes',
      projeto: 'Home Contrato 02',
      servicos: ['Render 3D', 'Plantas Humanizadas'],
      valorTotal: 10000,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 22,
      status: 'finalizado',
      arquivo: 'HOME_contrato_02.doc'
    },

    // ── SWELL CONSTRUCOES ───────────────────────────────────────────────
    {
      id: 'ctr_026',
      cliente: 'Swell Construcoes',
      projeto: 'Casamia',
      servicos: ['Render 3D', 'Tour Virtual'],
      valorTotal: 9000,
      parcelas: [],
      qtdImagens: 6,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'SWELL_casamia.doc'
    },
    {
      id: 'ctr_027',
      cliente: 'Swell Construcoes',
      projeto: 'Le Sense',
      servicos: ['Render 3D', 'Tour Virtual'],
      valorTotal: 10000,
      parcelas: [],
      qtdImagens: 8,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'SWELL_le_sense.doc'
    },

    // ── RODOLFO FONTANA ─────────────────────────────────────────────────
    {
      id: 'ctr_028',
      cliente: 'Rodolfo Fontana',
      projeto: 'Rodolfo Fontana',
      servicos: ['Render 3D'],
      valorTotal: 16000,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'RODOLFO_FONTANA_contrato.doc'
    },

    // ── BOS INCORPORACOES ───────────────────────────────────────────────
    {
      id: 'ctr_029',
      cliente: 'BOS Incorporacoes',
      projeto: 'BOS Render Imagens',
      servicos: ['Render 3D', 'Interiores'],
      valorTotal: 12000,
      parcelas: [],
      qtdImagens: 24,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'BOS_render_imagens.doc'
    },
    {
      id: 'ctr_030',
      cliente: 'BOS Incorporacoes',
      projeto: 'BOS Render Plantas',
      servicos: ['Render 3D', 'Plantas Humanizadas'],
      valorTotal: 5000,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 11,
      status: 'finalizado',
      arquivo: 'BOS_render_plantas.doc'
    },
    {
      id: 'ctr_031',
      cliente: 'BOS Incorporacoes',
      projeto: 'BOS Branding',
      servicos: ['Branding'],
      valorTotal: 27000,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'BOS_branding.doc'
    },

    // ── VITTA INCORPORACOES ─────────────────────────────────────────────
    {
      id: 'ctr_032',
      cliente: 'Vitta Incorporacoes',
      projeto: 'Vitta',
      servicos: ['Render 3D', 'Plantas Humanizadas'],
      valorTotal: 13000,
      parcelas: [],
      qtdImagens: 10,
      qtdPlantas: 19,
      status: 'finalizado',
      arquivo: 'VITTA_contrato.doc'
    },

    // ── GRP CONSTRUTORA ─────────────────────────────────────────────────
    {
      id: 'ctr_033',
      cliente: 'GRP Construtora',
      projeto: 'WIT Residences',
      servicos: ['Render 3D', 'Interiores', 'Plantas Humanizadas', 'Tour Virtual'],
      valorTotal: 24000,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'GRP_wit_residences.doc'
    },
    {
      id: 'ctr_034',
      cliente: 'GRP Construtora',
      projeto: 'Axis',
      servicos: ['Render 3D', 'Branding', 'Marketing', 'Plantas Humanizadas'],
      valorTotal: 125000,
      parcelas: [],
      qtdImagens: 25,
      qtdPlantas: 4,
      status: 'ativo',
      arquivo: 'GRP_axis.doc'
    },
    {
      id: 'ctr_035',
      cliente: 'GRP Construtora',
      projeto: 'Nura',
      servicos: ['Render 3D', 'Branding', 'Marketing', 'Plantas Humanizadas'],
      valorTotal: 98250,
      parcelas: [],
      qtdImagens: 26,
      qtdPlantas: 6,
      status: 'ativo',
      arquivo: 'GRP_nura.doc'
    },
    {
      id: 'ctr_036',
      cliente: 'GRP Construtora',
      projeto: 'Rebranding Institucional',
      servicos: ['Branding'],
      valorTotal: 13650,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'GRP_rebranding_institucional.doc'
    },

    // ── CONSTRUTORA PESSOA ──────────────────────────────────────────────
    {
      id: 'ctr_037',
      cliente: 'Construtora Pessoa',
      projeto: 'Plural',
      servicos: ['Render 3D', 'Interiores'],
      valorTotal: 5000,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'PESSOA_plural.doc'
    },
    {
      id: 'ctr_038',
      cliente: 'Construtora Pessoa',
      projeto: 'Porto Alto',
      servicos: ['Render 3D', 'Branding', 'Marketing', 'Plantas Humanizadas', 'Tour Virtual'],
      valorTotal: 148800,
      parcelas: [],
      qtdImagens: 25,
      qtdPlantas: 20,
      status: 'finalizado',
      arquivo: 'PESSOA_porto_alto.doc'
    },
    {
      id: 'ctr_039',
      cliente: 'Construtora Pessoa',
      projeto: 'Porto Alto Complementar',
      servicos: ['Render 3D', 'Marketing', 'Tour Virtual'],
      valorTotal: 40250,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'PESSOA_porto_alto_complementar.doc'
    },
    {
      id: 'ctr_040',
      cliente: 'Construtora Pessoa',
      projeto: 'Porto Batel',
      servicos: ['Render 3D', 'Branding', 'Marketing'],
      valorTotal: 137600,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'ativo',
      arquivo: 'PESSOA_porto_batel.doc'
    },
    {
      id: 'ctr_041',
      cliente: 'Construtora Pessoa',
      projeto: 'Portofino',
      servicos: ['Render 3D', 'Branding', 'Marketing'],
      valorTotal: 114050,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'ativo',
      arquivo: 'PESSOA_portofino.doc'
    },

    // ── BASE FORTE ──────────────────────────────────────────────────────
    {
      id: 'ctr_042',
      cliente: 'Base Forte',
      projeto: 'Base Forte',
      servicos: ['Render 3D', 'Interiores'],
      valorTotal: 2745,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'BASE_FORTE_contrato.doc'
    },

    // ── BASE EMPREENDIMENTOS ────────────────────────────────────────────
    {
      id: 'ctr_043',
      cliente: 'Base Empreendimentos',
      projeto: 'Mirage',
      servicos: ['Render 3D', 'Interiores', 'Tour Virtual'],
      valorTotal: 40000,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'BASE_EMPREENDIMENTOS_mirage.doc'
    },

    // ── PRISCILA POLI ───────────────────────────────────────────────────
    {
      id: 'ctr_044',
      cliente: 'Priscila Poli',
      projeto: 'Priscila Poli',
      servicos: ['Render 3D', 'Interiores'],
      valorTotal: 6550,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'PRISCILA_POLI_contrato.doc'
    },

    // ── MUSSI EMPREENDIMENTOS ───────────────────────────────────────────
    {
      id: 'ctr_045',
      cliente: 'Mussi Empreendimentos',
      projeto: 'Mussi',
      servicos: ['Render 3D', 'Branding', 'Plantas Humanizadas', 'Tour Virtual'],
      valorTotal: 150050,
      parcelas: [],
      qtdImagens: 15,
      qtdPlantas: 7,
      status: 'finalizado',
      arquivo: 'MUSSI_contrato.doc'
    },

    // ── HYPE ────────────────────────────────────────────────────────────
    {
      id: 'ctr_046',
      cliente: 'Hype Empreendimentos',
      projeto: 'Hype',
      servicos: ['Render 3D'],
      valorTotal: 6570,
      parcelas: [],
      qtdImagens: 4,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'HYPE_contrato.doc'
    },

    // ── PLAENGE ─────────────────────────────────────────────────────────
    {
      id: 'ctr_047',
      cliente: 'Plaenge',
      projeto: 'Plaenge',
      servicos: ['Render 3D', 'Plataforma Interativa', 'Interiores'],
      valorTotal: 33720,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'PLAENGE_contrato.doc'
    },

    // ── UNI-IT ──────────────────────────────────────────────────────────
    {
      id: 'ctr_048',
      cliente: 'Uni-IT',
      projeto: 'Uni-IT',
      servicos: ['Render 3D'],
      valorTotal: 6200,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'UNI_IT_contrato.doc'
    },

    // ── R ZILLI ─────────────────────────────────────────────────────────
    {
      id: 'ctr_049',
      cliente: 'R Zilli',
      projeto: 'Aura',
      servicos: ['Render 3D', 'Interiores', 'Plantas Humanizadas'],
      valorTotal: 50000,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'RZILLI_aura.doc'
    },

    // ── BSA ─────────────────────────────────────────────────────────────
    {
      id: 'ctr_050',
      cliente: 'BSA',
      projeto: 'BSA',
      servicos: ['Render 3D'],
      valorTotal: 10400,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'BSA_contrato.doc'
    },

    // ── PATRAO ──────────────────────────────────────────────────────────
    {
      id: 'ctr_051',
      cliente: 'Patrao',
      projeto: 'Gaia',
      servicos: ['Render 3D', 'Branding', 'Plantas Humanizadas', 'Tour Virtual'],
      valorTotal: 44800,
      parcelas: [],
      qtdImagens: 15,
      qtdPlantas: 4,
      status: 'finalizado',
      arquivo: 'PATRAO_gaia.doc'
    },
    {
      id: 'ctr_052',
      cliente: 'Patrao',
      projeto: 'Estoril',
      servicos: ['Render 3D', 'Branding', 'Marketing', 'Plantas Humanizadas', 'Tour Virtual'],
      valorTotal: 102300,
      parcelas: [],
      qtdImagens: 24,
      qtdPlantas: 10,
      status: 'ativo',
      arquivo: 'PATRAO_estoril.doc'
    },
    {
      id: 'ctr_053',
      cliente: 'Patrao',
      projeto: 'Estoril Audiovisual',
      servicos: ['Audiovisual'],
      valorTotal: 16000,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'ativo',
      arquivo: 'PATRAO_estoril_audiovisual.doc'
    },

    // ── DAMIANI ─────────────────────────────────────────────────────────
    {
      id: 'ctr_054',
      cliente: 'Damiani',
      projeto: 'Wave 3.0',
      servicos: ['Render 3D', 'Plantas Humanizadas'],
      valorTotal: 52000,
      parcelas: [],
      qtdImagens: 29,
      qtdPlantas: 10,
      status: 'finalizado',
      arquivo: 'DAMIANI_wave_3.0.doc'
    },
    {
      id: 'ctr_055',
      cliente: 'Damiani',
      projeto: 'Wave 3.0 Aditivo',
      servicos: ['Interiores'],
      valorTotal: 7000,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'DAMIANI_wave_3.0_aditivo.doc'
    },
    {
      id: 'ctr_056',
      cliente: 'Damiani',
      projeto: 'Pacific',
      servicos: ['Render 3D', 'Branding'],
      valorTotal: 8550,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'DAMIANI_pacific.doc'
    },

    // ── TEKTON ──────────────────────────────────────────────────────────
    {
      id: 'ctr_057',
      cliente: 'Tekton',
      projeto: 'Studios Tekton Marketing e Render',
      servicos: ['Render 3D', 'Marketing', 'Plantas Humanizadas'],
      valorTotal: 73968,
      parcelas: [],
      qtdImagens: 30,
      qtdPlantas: 3,
      status: 'ativo',
      arquivo: 'TEKTON_studios_mkt_render.doc'
    },
    {
      id: 'ctr_058',
      cliente: 'Tekton',
      projeto: 'Studios Tekton Marketing e Audiovisual',
      servicos: ['Marketing', 'Audiovisual'],
      valorTotal: 92092,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'ativo',
      arquivo: 'TEKTON_studios_mkt_audiovisual.doc'
    },
    {
      id: 'ctr_059',
      cliente: 'Tekton',
      projeto: 'Studios Tekton Interiores',
      servicos: ['Interiores'],
      valorTotal: 66714.77,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'ativo',
      arquivo: 'TEKTON_studios_interiores.doc'
    },
    {
      id: 'ctr_060',
      cliente: 'Tekton',
      projeto: 'Studios Tekton Branding',
      servicos: ['Branding'],
      valorTotal: 46500,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'ativo',
      arquivo: 'TEKTON_studios_branding.doc'
    },
    {
      id: 'ctr_061',
      cliente: 'Tekton',
      projeto: 'Studios Tekton Diagnostico',
      servicos: [],
      valorTotal: 7000,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'ativo',
      arquivo: 'TEKTON_studios_diagnostico.doc'
    },
    {
      id: 'ctr_062',
      cliente: 'Tekton',
      projeto: 'Blanc',
      servicos: ['Marketing'],
      valorTotal: 13600,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'TEKTON_blanc.doc'
    },
    {
      id: 'ctr_063',
      cliente: 'Tekton',
      projeto: 'Townhouses Marketing e Render',
      servicos: ['Render 3D', 'Marketing', 'Plantas Humanizadas'],
      valorTotal: 34408,
      parcelas: [],
      qtdImagens: 12,
      qtdPlantas: 2,
      status: 'ativo',
      arquivo: 'TEKTON_townhouses_mkt_render.doc'
    },
    {
      id: 'ctr_064',
      cliente: 'Tekton',
      projeto: 'Townhouses Interiores',
      servicos: ['Interiores'],
      valorTotal: 11235.69,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'ativo',
      arquivo: 'TEKTON_townhouses_interiores.doc'
    },
    {
      id: 'ctr_065',
      cliente: 'Tekton',
      projeto: 'Townhouses Branding',
      servicos: ['Branding'],
      valorTotal: 40000,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'ativo',
      arquivo: 'TEKTON_townhouses_branding.doc'
    },
    {
      id: 'ctr_066',
      cliente: 'Tekton',
      projeto: 'Townhouses Marketing e Audiovisual',
      servicos: ['Marketing', 'Audiovisual'],
      valorTotal: 41906,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'ativo',
      arquivo: 'TEKTON_townhouses_mkt_audiovisual.doc'
    },

    // ── VIPLAN ──────────────────────────────────────────────────────────
    {
      id: 'ctr_067',
      cliente: 'Viplan',
      projeto: 'Art',
      servicos: ['Render 3D', 'Plantas Humanizadas'],
      valorTotal: 37260,
      parcelas: [],
      qtdImagens: 19,
      qtdPlantas: 4,
      status: 'finalizado',
      arquivo: 'VIPLAN_art.doc'
    },
    {
      id: 'ctr_068',
      cliente: 'Viplan',
      projeto: 'Campo Alegre',
      servicos: ['Render 3D', 'Interiores', 'Plantas Humanizadas'],
      valorTotal: 21300,
      parcelas: [],
      qtdImagens: 11,
      qtdPlantas: 4,
      status: 'finalizado',
      arquivo: 'VIPLAN_campo_alegre.doc'
    },
    {
      id: 'ctr_069',
      cliente: 'Viplan',
      projeto: 'Leopoldo Fischer',
      servicos: ['Render 3D', 'Branding', 'Plantas Humanizadas'],
      valorTotal: 70000,
      parcelas: [],
      qtdImagens: 22,
      qtdPlantas: 2,
      status: 'finalizado',
      arquivo: 'VIPLAN_leopoldo_fischer.doc'
    },

    // ── MDI ─────────────────────────────────────────────────────────────
    {
      id: 'ctr_070',
      cliente: 'MDI Brasil',
      projeto: 'MDI',
      servicos: ['Render 3D', 'Branding'],
      valorTotal: 36400,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'MDI_contrato.doc'
    },

    // ── ARTHUR SILVEIRA ─────────────────────────────────────────────────
    {
      id: 'ctr_071',
      cliente: 'Arthur Silveira',
      projeto: 'Cachoeira Enio',
      servicos: ['Render 3D', 'Interiores', 'Plantas Humanizadas'],
      valorTotal: 25700,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'ARTHUR_SILVEIRA_cachoeira_enio.doc'
    },

    // ── SAN PIETRO / AGBEM ─────────────────────────────────────────────
    {
      id: 'ctr_072',
      cliente: 'San Pietro',
      projeto: 'San Pietro Lancamento',
      servicos: ['Render 3D', 'Branding', 'Marketing', 'Plantas Humanizadas', 'Tour Virtual'],
      valorTotal: 199200,
      parcelas: [],
      qtdImagens: 18,
      qtdPlantas: 6,
      status: 'finalizado',
      arquivo: 'SAN_PIETRO_lancamento.doc'
    },
    {
      id: 'ctr_073',
      cliente: 'San Pietro',
      projeto: 'San Pietro Arquitetura',
      servicos: ['Render 3D', 'Tour Virtual'],
      valorTotal: 75000,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'SAN_PIETRO_arquitetura.doc'
    },

    // ── ELIO WINTER ─────────────────────────────────────────────────────
    {
      id: 'ctr_074',
      cliente: 'Elio Winter',
      projeto: 'Elio Winter',
      servicos: ['Render 3D', 'Plantas Humanizadas'],
      valorTotal: 35000,
      parcelas: [],
      qtdImagens: 10,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'ELIO_WINTER_contrato.doc'
    },

    // ── GIACOMAZZI ──────────────────────────────────────────────────────
    {
      id: 'ctr_075',
      cliente: 'Giacomazzi',
      projeto: 'Giacomazzi',
      servicos: ['Render 3D', 'Plantas Humanizadas'],
      valorTotal: 43652.50,
      parcelas: [],
      qtdImagens: 14,
      qtdPlantas: 15,
      status: 'finalizado',
      arquivo: 'GIACOMAZZI_contrato.doc'
    },

    // ── ARTHAUS ─────────────────────────────────────────────────────────
    {
      id: 'ctr_076',
      cliente: 'Arthaus',
      projeto: 'Arthaus Render 3D',
      servicos: ['Render 3D', 'Plantas Humanizadas'],
      valorTotal: 62125,
      parcelas: [],
      qtdImagens: 28,
      qtdPlantas: 6,
      status: 'ativo',
      arquivo: 'ARTHAUS_render_3d.doc'
    },
    {
      id: 'ctr_077',
      cliente: 'Arthaus',
      projeto: 'Arthaus Branding e Audiovisual',
      servicos: ['Branding', 'Audiovisual'],
      valorTotal: 28860,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'ativo',
      arquivo: 'ARTHAUS_branding_audiovisual.doc'
    },
    {
      id: 'ctr_078',
      cliente: 'Arthaus',
      projeto: 'Arthaus Plataforma Interativa',
      servicos: ['Plataforma Interativa'],
      valorTotal: 42375,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'ativo',
      arquivo: 'ARTHAUS_plataforma_interativa.doc'
    },

    // ── LANGARD ─────────────────────────────────────────────────────────
    {
      id: 'ctr_079',
      cliente: 'Langard',
      projeto: 'Langard',
      servicos: ['Render 3D', 'Branding', 'Interiores', 'Plantas Humanizadas'],
      valorTotal: 36200,
      parcelas: [],
      qtdImagens: 12,
      qtdPlantas: 3,
      status: 'finalizado',
      arquivo: 'LANGARD_contrato.doc'
    },

    // ── GESSI EMPREENDIMENTOS ───────────────────────────────────────────
    {
      id: 'ctr_080',
      cliente: 'Gessi Empreendimentos',
      projeto: 'Gessi',
      servicos: ['Render 3D', 'Branding', 'Marketing', 'Plantas Humanizadas', 'Tour Virtual'],
      valorTotal: 165000,
      parcelas: [],
      qtdImagens: 30,
      qtdPlantas: 7,
      status: 'ativo',
      arquivo: 'GESSI_contrato.doc'
    },

    // ── GSPM & ARDC ─────────────────────────────────────────────────────
    {
      id: 'ctr_081',
      cliente: 'GSPM & ARDC',
      projeto: 'GSPM & ARDC',
      servicos: ['Render 3D', 'Plantas Humanizadas'],
      valorTotal: 15364,
      parcelas: [],
      qtdImagens: 7,
      qtdPlantas: 3,
      status: 'finalizado',
      arquivo: 'GSPM_ARDC_contrato.doc'
    },

    // ── ARQUITETARE ─────────────────────────────────────────────────────
    {
      id: 'ctr_082',
      cliente: 'Arquitetare',
      projeto: 'Arquitetare (The Bear Office)',
      servicos: ['Render 3D', 'Branding', 'Marketing'],
      valorTotal: 0,
      parcelas: [],
      qtdImagens: 0,
      qtdPlantas: 0,
      status: 'finalizado',
      arquivo: 'ARQUITETARE_contratos_diversos.doc'
    }
  ],

  // ── COMPUTED HELPERS ────────────────────────────────────────────────────
  // Convenience getters for analytics (used by BI module)

  get totalValor() {
    return this.contratos.reduce((sum, c) => sum + c.valorTotal, 0);
  },

  get totalImagens() {
    return this.contratos.reduce((sum, c) => sum + c.qtdImagens, 0);
  },

  get totalPlantas() {
    return this.contratos.reduce((sum, c) => sum + c.qtdPlantas, 0);
  },

  get contratosAtivos() {
    return this.contratos.filter(c => c.status === 'ativo');
  },

  get contratosFinalizados() {
    return this.contratos.filter(c => c.status === 'finalizado');
  },

  get clientesUnicos() {
    return [...new Set(this.contratos.map(c => c.cliente))];
  },

  get servicosUnicos() {
    const all = this.contratos.flatMap(c => c.servicos);
    return [...new Set(all)].sort();
  },

  get valorPorCliente() {
    const map = {};
    this.contratos.forEach(c => {
      if (!map[c.cliente]) map[c.cliente] = 0;
      map[c.cliente] += c.valorTotal;
    });
    return Object.entries(map)
      .map(([cliente, valor]) => ({ cliente, valor }))
      .sort((a, b) => b.valor - a.valor);
  },

  get valorPorServico() {
    const map = {};
    this.contratos.forEach(c => {
      c.servicos.forEach(s => {
        if (!map[s]) map[s] = { count: 0, valor: 0 };
        map[s].count++;
        map[s].valor += c.valorTotal;
      });
    });
    return Object.entries(map)
      .map(([servico, data]) => ({ servico, ...data }))
      .sort((a, b) => b.valor - a.valor);
  },

  get ticketMedio() {
    const comValor = this.contratos.filter(c => c.valorTotal > 0);
    return comValor.length > 0 ? this.totalValor / comValor.length : 0;
  }
};

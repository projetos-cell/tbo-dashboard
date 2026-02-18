// TBO OS — Module: Portal do Cliente (Client Portal — Instagram Performance & Project Status)
const TBO_PORTAL_CLIENTE = {
  _selectedClient: null,
  _activeTab: 'instagram', // 'instagram' | 'projeto'

  // ── Demo Seed Data: Instagram Campaign Metrics ─────────────────────────────
  _demoInstagramData: {
    'arthaus': {
      clientId: 'arthaus',
      clientName: 'Arthaus',
      instagram: {
        handle: '@arthaus.arq',
        followers: 22800,
        followersGrowth: 5.4,
        avgEngagementRate: 4.6
      },
      campaigns: [
        {
          id: 'ah-camp1',
          name: 'Lancamento Arthaus Batel',
          period: '2026-01 a 2026-02',
          status: 'ativo',
          metrics: {
            impressions: 318000, reach: 246000, engagement: 15200, engagementRate: 6.18,
            clicks: 4200, ctr: 1.32, followers_gained: 920, investment: 21000,
            cpl: 17.50, leads: 1200, saves: 2040, shares: 560, comments: 340, likes: 10800
          },
          posts: [
            { type: 'carrossel', date: '2026-02-12', engagement: 1800, reach: 31000 },
            { type: 'reels', date: '2026-02-09', engagement: 4800, reach: 76000 },
            { type: 'stories', date: '2026-02-06', engagement: 940, reach: 15000 }
          ]
        },
        {
          id: 'ah-camp2',
          name: 'Branding Residencial Pinheiros',
          period: '2025-11 a 2026-01',
          status: 'finalizado',
          metrics: {
            impressions: 274000, reach: 212000, engagement: 13600, engagementRate: 6.42,
            clicks: 3600, ctr: 1.31, followers_gained: 780, investment: 18000,
            cpl: 16.36, leads: 1100, saves: 1800, shares: 490, comments: 310, likes: 9600
          },
          posts: [
            { type: 'carrossel', date: '2025-12-18', engagement: 1500, reach: 27000 },
            { type: 'reels', date: '2025-12-12', engagement: 3900, reach: 62000 },
            { type: 'stories', date: '2025-12-08', engagement: 780, reach: 12500 }
          ]
        },
        {
          id: 'ah-camp3',
          name: 'Campanha Institucional Arthaus 2026',
          period: '2026-02 a 2026-03',
          status: 'ativo',
          metrics: {
            impressions: 92000, reach: 68000, engagement: 4400, engagementRate: 6.47,
            clicks: 1050, ctr: 1.14, followers_gained: 310, investment: 8500,
            cpl: 19.32, leads: 440, saves: 580, shares: 190, comments: 105, likes: 3100
          },
          posts: [
            { type: 'carrossel', date: '2026-02-15', engagement: 650, reach: 12000 },
            { type: 'reels', date: '2026-02-13', engagement: 1500, reach: 30000 },
            { type: 'stories', date: '2026-02-11', engagement: 400, reach: 7000 }
          ]
        }
      ],
      monthlyTrend: [
        { month: 'Set/25', reach: 152000, engagement: 8800 },
        { month: 'Out/25', reach: 178000, engagement: 10400 },
        { month: 'Nov/25', reach: 206000, engagement: 12200 },
        { month: 'Dez/25', reach: 232000, engagement: 14100 },
        { month: 'Jan/26', reach: 254000, engagement: 15400 },
        { month: 'Fev/26', reach: 282000, engagement: 17600 }
      ]
    },
    'fontanive': {
      clientId: 'fontanive',
      clientName: 'Fontanive',
      instagram: {
        handle: '@fontanive.inc',
        followers: 18600,
        followersGrowth: 4.8,
        avgEngagementRate: 4.3
      },
      campaigns: [
        {
          id: 'fn-camp1',
          name: 'Lancamento Fontanive Cabral',
          period: '2026-01 a 2026-02',
          status: 'ativo',
          metrics: {
            impressions: 264000, reach: 204000, engagement: 12800, engagementRate: 6.27,
            clicks: 3500, ctr: 1.33, followers_gained: 760, investment: 18500,
            cpl: 17.13, leads: 1080, saves: 1720, shares: 470, comments: 290, likes: 9200
          },
          posts: [
            { type: 'carrossel', date: '2026-02-10', engagement: 1500, reach: 26000 },
            { type: 'reels', date: '2026-02-07', engagement: 4100, reach: 65000 },
            { type: 'stories', date: '2026-02-04', engagement: 820, reach: 13000 }
          ]
        },
        {
          id: 'fn-camp2',
          name: 'Fontanive Alto da Gloria - Branding',
          period: '2025-10 a 2025-12',
          status: 'finalizado',
          metrics: {
            impressions: 298000, reach: 230000, engagement: 14600, engagementRate: 6.35,
            clicks: 3900, ctr: 1.31, followers_gained: 880, investment: 20000,
            cpl: 16.00, leads: 1250, saves: 1960, shares: 540, comments: 350, likes: 10500
          },
          posts: [
            { type: 'carrossel', date: '2025-11-22', engagement: 1700, reach: 30000 },
            { type: 'reels', date: '2025-11-18', engagement: 4400, reach: 70000 },
            { type: 'stories', date: '2025-11-14', engagement: 860, reach: 14000 }
          ]
        }
      ],
      monthlyTrend: [
        { month: 'Set/25', reach: 138000, engagement: 7600 },
        { month: 'Out/25', reach: 162000, engagement: 9200 },
        { month: 'Nov/25', reach: 192000, engagement: 11000 },
        { month: 'Dez/25', reach: 214000, engagement: 12400 },
        { month: 'Jan/26', reach: 236000, engagement: 13800 },
        { month: 'Fev/26', reach: 264000, engagement: 15200 }
      ]
    },
    'copessoa': {
      clientId: 'copessoa',
      clientName: 'Co.Pessoa',
      instagram: {
        handle: '@co.pessoa',
        followers: 14200,
        followersGrowth: 6.2,
        avgEngagementRate: 5.1
      },
      campaigns: [
        {
          id: 'cp-camp1',
          name: 'Co.Pessoa Juveve - Lancamento Digital',
          period: '2026-01 a 2026-02',
          status: 'ativo',
          metrics: {
            impressions: 196000, reach: 150000, engagement: 10600, engagementRate: 7.07,
            clicks: 2800, ctr: 1.43, followers_gained: 680, investment: 14000,
            cpl: 16.47, leads: 850, saves: 1380, shares: 400, comments: 260, likes: 7800
          },
          posts: [
            { type: 'carrossel', date: '2026-02-11', engagement: 1200, reach: 21000 },
            { type: 'reels', date: '2026-02-08', engagement: 3400, reach: 52000 },
            { type: 'stories', date: '2026-02-05', engagement: 700, reach: 11000 }
          ]
        },
        {
          id: 'cp-camp2',
          name: 'Institucional Co.Pessoa',
          period: '2025-12 a 2026-02',
          status: 'ativo',
          metrics: {
            impressions: 112000, reach: 84000, engagement: 6200, engagementRate: 7.38,
            clicks: 1700, ctr: 1.52, followers_gained: 460, investment: 9000,
            cpl: 15.00, leads: 600, saves: 780, shares: 240, comments: 160, likes: 4400
          },
          posts: [
            { type: 'carrossel', date: '2026-01-28', engagement: 780, reach: 14000 },
            { type: 'reels', date: '2026-01-22', engagement: 2100, reach: 34000 },
            { type: 'stories', date: '2026-01-18', engagement: 520, reach: 8000 }
          ]
        },
        {
          id: 'cp-camp3',
          name: 'Black November Co.Pessoa',
          period: '2025-11 a 2025-11',
          status: 'finalizado',
          metrics: {
            impressions: 178000, reach: 136000, engagement: 9800, engagementRate: 7.21,
            clicks: 2900, ctr: 1.63, followers_gained: 740, investment: 11000,
            cpl: 13.75, leads: 800, saves: 1180, shares: 380, comments: 240, likes: 6900
          },
          posts: [
            { type: 'carrossel', date: '2025-11-28', engagement: 1100, reach: 19000 },
            { type: 'reels', date: '2025-11-24', engagement: 3000, reach: 48000 },
            { type: 'stories', date: '2025-11-20', engagement: 760, reach: 12000 }
          ]
        }
      ],
      monthlyTrend: [
        { month: 'Set/25', reach: 82000, engagement: 5200 },
        { month: 'Out/25', reach: 98000, engagement: 6400 },
        { month: 'Nov/25', reach: 136000, engagement: 9800 },
        { month: 'Dez/25', reach: 118000, engagement: 7800 },
        { month: 'Jan/26', reach: 142000, engagement: 9600 },
        { month: 'Fev/26', reach: 168000, engagement: 11200 }
      ]
    },
    'grp': {
      clientId: 'grp',
      clientName: 'GRP',
      instagram: {
        handle: '@grp.construtora',
        followers: 31400,
        followersGrowth: 3.6,
        avgEngagementRate: 3.9
      },
      campaigns: [
        {
          id: 'grp-camp1',
          name: 'GRP Ecoville Premium',
          period: '2026-01 a 2026-02',
          status: 'ativo',
          metrics: {
            impressions: 402000, reach: 310000, engagement: 18800, engagementRate: 6.06,
            clicks: 5300, ctr: 1.32, followers_gained: 940, investment: 28000,
            cpl: 18.67, leads: 1500, saves: 2480, shares: 680, comments: 440, likes: 13600
          },
          posts: [
            { type: 'carrossel', date: '2026-02-13', engagement: 2200, reach: 39000 },
            { type: 'reels', date: '2026-02-10', engagement: 5900, reach: 94000 },
            { type: 'stories', date: '2026-02-07', engagement: 1100, reach: 18000 }
          ]
        },
        {
          id: 'grp-camp2',
          name: 'GRP Champagnat - Fase 2',
          period: '2025-11 a 2026-01',
          status: 'finalizado',
          metrics: {
            impressions: 346000, reach: 268000, engagement: 16200, engagementRate: 6.04,
            clicks: 4600, ctr: 1.33, followers_gained: 820, investment: 24000,
            cpl: 17.14, leads: 1400, saves: 2140, shares: 600, comments: 380, likes: 11800
          },
          posts: [
            { type: 'carrossel', date: '2025-12-20', engagement: 1900, reach: 34000 },
            { type: 'reels', date: '2025-12-15', engagement: 5000, reach: 80000 },
            { type: 'stories', date: '2025-12-10', engagement: 960, reach: 15000 }
          ]
        },
        {
          id: 'grp-camp3',
          name: 'Natal GRP - Campanha Sazonal',
          period: '2025-12 a 2025-12',
          status: 'finalizado',
          metrics: {
            impressions: 168000, reach: 128000, engagement: 7800, engagementRate: 6.09,
            clicks: 2000, ctr: 1.19, followers_gained: 380, investment: 9500,
            cpl: 15.83, leads: 600, saves: 940, shares: 280, comments: 170, likes: 5600
          },
          posts: [
            { type: 'carrossel', date: '2025-12-24', engagement: 1000, reach: 17000 },
            { type: 'reels', date: '2025-12-21', engagement: 2500, reach: 42000 },
            { type: 'stories', date: '2025-12-18', engagement: 600, reach: 9500 }
          ]
        }
      ],
      monthlyTrend: [
        { month: 'Set/25', reach: 228000, engagement: 11600 },
        { month: 'Out/25', reach: 256000, engagement: 13200 },
        { month: 'Nov/25', reach: 282000, engagement: 14800 },
        { month: 'Dez/25', reach: 324000, engagement: 17400 },
        { month: 'Jan/26', reach: 306000, engagement: 16600 },
        { month: 'Fev/26', reach: 348000, engagement: 18800 }
      ]
    },
    'tekton': {
      clientId: 'tekton',
      clientName: 'Tekton',
      instagram: {
        handle: '@tekton.eng',
        followers: 11800,
        followersGrowth: 5.9,
        avgEngagementRate: 5.2
      },
      campaigns: [
        {
          id: 'tk-camp1',
          name: 'Tekton Agua Verde - Pre-lancamento',
          period: '2026-01 a 2026-02',
          status: 'ativo',
          metrics: {
            impressions: 172000, reach: 132000, engagement: 9400, engagementRate: 7.12,
            clicks: 2500, ctr: 1.45, followers_gained: 620, investment: 13000,
            cpl: 16.25, leads: 800, saves: 1240, shares: 360, comments: 230, likes: 6800
          },
          posts: [
            { type: 'carrossel', date: '2026-02-14', engagement: 1050, reach: 18000 },
            { type: 'reels', date: '2026-02-10', engagement: 2900, reach: 46000 },
            { type: 'stories', date: '2026-02-07', engagement: 640, reach: 10000 }
          ]
        },
        {
          id: 'tk-camp2',
          name: 'Tekton Portao - Campanha Digital',
          period: '2025-10 a 2025-12',
          status: 'finalizado',
          metrics: {
            impressions: 234000, reach: 180000, engagement: 12400, engagementRate: 6.89,
            clicks: 3200, ctr: 1.37, followers_gained: 740, investment: 16000,
            cpl: 14.55, leads: 1100, saves: 1620, shares: 460, comments: 300, likes: 8900
          },
          posts: [
            { type: 'carrossel', date: '2025-11-20', engagement: 1400, reach: 24000 },
            { type: 'reels', date: '2025-11-15', engagement: 3800, reach: 58000 },
            { type: 'stories', date: '2025-11-10', engagement: 740, reach: 11500 }
          ]
        }
      ],
      monthlyTrend: [
        { month: 'Set/25', reach: 96000, engagement: 5800 },
        { month: 'Out/25', reach: 118000, engagement: 7400 },
        { month: 'Nov/25', reach: 148000, engagement: 9200 },
        { month: 'Dez/25', reach: 132000, engagement: 8400 },
        { month: 'Jan/26', reach: 156000, engagement: 10200 },
        { month: 'Fev/26', reach: 184000, engagement: 11800 }
      ]
    },
    'mdi-brasil': {
      clientId: 'mdi-brasil',
      clientName: 'MDI Brasil',
      instagram: {
        handle: '@mdibrasil',
        followers: 26200,
        followersGrowth: 3.4,
        avgEngagementRate: 3.7
      },
      campaigns: [
        {
          id: 'mdi-camp1',
          name: 'MDI Residence Park',
          period: '2026-01 a 2026-02',
          status: 'ativo',
          metrics: {
            impressions: 356000, reach: 274000, engagement: 16800, engagementRate: 6.13,
            clicks: 4800, ctr: 1.35, followers_gained: 880, investment: 24000,
            cpl: 17.78, leads: 1350, saves: 2200, shares: 620, comments: 400, likes: 12400
          },
          posts: [
            { type: 'carrossel', date: '2026-02-11', engagement: 2000, reach: 35000 },
            { type: 'reels', date: '2026-02-08', engagement: 5400, reach: 86000 },
            { type: 'stories', date: '2026-02-05', engagement: 1000, reach: 16000 }
          ]
        },
        {
          id: 'mdi-camp2',
          name: 'MDI Alto Padrao Centro Civico',
          period: '2025-12 a 2026-01',
          status: 'finalizado',
          metrics: {
            impressions: 288000, reach: 222000, engagement: 13400, engagementRate: 6.04,
            clicks: 3900, ctr: 1.35, followers_gained: 760, investment: 19500,
            cpl: 16.25, leads: 1200, saves: 1780, shares: 510, comments: 320, likes: 10200
          },
          posts: [
            { type: 'carrossel', date: '2026-01-12', engagement: 1600, reach: 28000 },
            { type: 'reels', date: '2026-01-08', engagement: 4000, reach: 64000 },
            { type: 'stories', date: '2026-01-04', engagement: 780, reach: 12000 }
          ]
        },
        {
          id: 'mdi-camp3',
          name: 'MDI Institucional 2026',
          period: '2025-11 a 2026-02',
          status: 'ativo',
          metrics: {
            impressions: 142000, reach: 108000, engagement: 7200, engagementRate: 6.67,
            clicks: 1900, ctr: 1.34, followers_gained: 420, investment: 10000,
            cpl: 16.67, leads: 600, saves: 920, shares: 270, comments: 170, likes: 5200
          },
          posts: [
            { type: 'carrossel', date: '2026-01-30', engagement: 850, reach: 15000 },
            { type: 'reels', date: '2026-01-24', engagement: 2400, reach: 38000 },
            { type: 'stories', date: '2026-01-19', engagement: 560, reach: 8500 }
          ]
        }
      ],
      monthlyTrend: [
        { month: 'Set/25', reach: 196000, engagement: 10000 },
        { month: 'Out/25', reach: 218000, engagement: 11400 },
        { month: 'Nov/25', reach: 244000, engagement: 12800 },
        { month: 'Dez/25', reach: 268000, engagement: 14200 },
        { month: 'Jan/26', reach: 290000, engagement: 15600 },
        { month: 'Fev/26', reach: 318000, engagement: 17200 }
      ]
    },
    'agbem': {
      clientId: 'agbem',
      clientName: 'AGBEM',
      instagram: {
        handle: '@agbem.empreendimentos',
        followers: 8900,
        followersGrowth: 7.8,
        avgEngagementRate: 5.8
      },
      campaigns: [
        {
          id: 'ag-camp1',
          name: 'AGBEM Vista Verde - Lancamento',
          period: '2026-01 a 2026-02',
          status: 'ativo',
          metrics: {
            impressions: 148000, reach: 112000, engagement: 8600, engagementRate: 7.68,
            clicks: 2300, ctr: 1.55, followers_gained: 580, investment: 11000,
            cpl: 15.71, leads: 700, saves: 1080, shares: 330, comments: 210, likes: 6100
          },
          posts: [
            { type: 'carrossel', date: '2026-02-12', engagement: 920, reach: 16000 },
            { type: 'reels', date: '2026-02-09', engagement: 2600, reach: 40000 },
            { type: 'stories', date: '2026-02-06', engagement: 580, reach: 9000 }
          ]
        },
        {
          id: 'ag-camp2',
          name: 'AGBEM Institucional',
          period: '2025-11 a 2026-01',
          status: 'finalizado',
          metrics: {
            impressions: 118000, reach: 90000, engagement: 6800, engagementRate: 7.56,
            clicks: 1800, ctr: 1.53, followers_gained: 480, investment: 8500,
            cpl: 14.17, leads: 600, saves: 860, shares: 260, comments: 170, likes: 4800
          },
          posts: [
            { type: 'carrossel', date: '2025-12-16', engagement: 760, reach: 13000 },
            { type: 'reels', date: '2025-12-11', engagement: 2100, reach: 32000 },
            { type: 'stories', date: '2025-12-07', engagement: 480, reach: 7500 }
          ]
        },
        {
          id: 'ag-camp3',
          name: 'AGBEM Verao 2026',
          period: '2025-12 a 2026-01',
          status: 'pausado',
          metrics: {
            impressions: 64000, reach: 48000, engagement: 3600, engagementRate: 7.50,
            clicks: 980, ctr: 1.53, followers_gained: 220, investment: 5000,
            cpl: 16.67, leads: 300, saves: 440, shares: 140, comments: 85, likes: 2500
          },
          posts: [
            { type: 'carrossel', date: '2025-12-28', engagement: 420, reach: 7500 },
            { type: 'reels', date: '2025-12-22', engagement: 1100, reach: 18000 },
            { type: 'stories', date: '2025-12-19', engagement: 280, reach: 4500 }
          ]
        }
      ],
      monthlyTrend: [
        { month: 'Set/25', reach: 58000, engagement: 3800 },
        { month: 'Out/25', reach: 72000, engagement: 4800 },
        { month: 'Nov/25', reach: 90000, engagement: 6200 },
        { month: 'Dez/25', reach: 102000, engagement: 7400 },
        { month: 'Jan/26', reach: 118000, engagement: 8200 },
        { month: 'Fev/26', reach: 142000, engagement: 9600 }
      ]
    },
    'ricardo-maio': {
      clientId: 'ricardo-maio',
      clientName: 'Ricardo Maio',
      instagram: {
        handle: '@ricardomaio.arq',
        followers: 16400,
        followersGrowth: 4.2,
        avgEngagementRate: 4.5
      },
      campaigns: [
        {
          id: 'rm-camp1',
          name: 'Ricardo Maio Cabral - Full Campaign',
          period: '2026-01 a 2026-02',
          status: 'ativo',
          metrics: {
            impressions: 228000, reach: 176000, engagement: 11400, engagementRate: 6.48,
            clicks: 3100, ctr: 1.36, followers_gained: 680, investment: 16000,
            cpl: 17.39, leads: 920, saves: 1500, shares: 420, comments: 270, likes: 8400
          },
          posts: [
            { type: 'carrossel', date: '2026-02-13', engagement: 1300, reach: 23000 },
            { type: 'reels', date: '2026-02-10', engagement: 3600, reach: 56000 },
            { type: 'stories', date: '2026-02-07', engagement: 720, reach: 11500 }
          ]
        },
        {
          id: 'rm-camp2',
          name: 'RM Alto da XV - Pre-lancamento',
          period: '2025-11 a 2026-01',
          status: 'finalizado',
          metrics: {
            impressions: 256000, reach: 198000, engagement: 12800, engagementRate: 6.46,
            clicks: 3400, ctr: 1.33, followers_gained: 720, investment: 17500,
            cpl: 15.91, leads: 1100, saves: 1680, shares: 480, comments: 300, likes: 9200
          },
          posts: [
            { type: 'carrossel', date: '2025-12-14', engagement: 1500, reach: 26000 },
            { type: 'reels', date: '2025-12-09', engagement: 3800, reach: 60000 },
            { type: 'stories', date: '2025-12-05', engagement: 760, reach: 12000 }
          ]
        }
      ],
      monthlyTrend: [
        { month: 'Set/25', reach: 124000, engagement: 7000 },
        { month: 'Out/25', reach: 146000, engagement: 8400 },
        { month: 'Nov/25', reach: 172000, engagement: 10200 },
        { month: 'Dez/25', reach: 192000, engagement: 11600 },
        { month: 'Jan/26', reach: 212000, engagement: 12800 },
        { month: 'Fev/26', reach: 238000, engagement: 14200 }
      ]
    },
    'viplan': {
      clientId: 'viplan',
      clientName: 'Viplan',
      instagram: {
        handle: '@viplan.eng',
        followers: 13500,
        followersGrowth: 5.1,
        avgEngagementRate: 4.7
      },
      campaigns: [
        {
          id: 'vp-camp1',
          name: 'Viplan Jardim Botanico',
          period: '2026-01 a 2026-02',
          status: 'ativo',
          metrics: {
            impressions: 186000, reach: 142000, engagement: 9800, engagementRate: 6.90,
            clicks: 2600, ctr: 1.40, followers_gained: 600, investment: 14000,
            cpl: 16.47, leads: 850, saves: 1280, shares: 370, comments: 240, likes: 7200
          },
          posts: [
            { type: 'carrossel', date: '2026-02-12', engagement: 1100, reach: 19000 },
            { type: 'reels', date: '2026-02-08', engagement: 3100, reach: 48000 },
            { type: 'stories', date: '2026-02-05', engagement: 660, reach: 10500 }
          ]
        },
        {
          id: 'vp-camp2',
          name: 'Viplan Merces - Branding',
          period: '2025-10 a 2025-12',
          status: 'finalizado',
          metrics: {
            impressions: 218000, reach: 168000, engagement: 11200, engagementRate: 6.67,
            clicks: 3000, ctr: 1.38, followers_gained: 660, investment: 15000,
            cpl: 15.00, leads: 1000, saves: 1460, shares: 420, comments: 280, likes: 8200
          },
          posts: [
            { type: 'carrossel', date: '2025-11-18', engagement: 1300, reach: 22000 },
            { type: 'reels', date: '2025-11-12', engagement: 3400, reach: 54000 },
            { type: 'stories', date: '2025-11-08', engagement: 700, reach: 11000 }
          ]
        },
        {
          id: 'vp-camp3',
          name: 'Viplan Institucional 2026',
          period: '2025-12 a 2026-02',
          status: 'ativo',
          metrics: {
            impressions: 98000, reach: 74000, engagement: 5200, engagementRate: 7.03,
            clicks: 1400, ctr: 1.43, followers_gained: 360, investment: 7000,
            cpl: 14.00, leads: 500, saves: 640, shares: 200, comments: 130, likes: 3600
          },
          posts: [
            { type: 'carrossel', date: '2026-01-26', engagement: 620, reach: 11000 },
            { type: 'reels', date: '2026-01-20', engagement: 1700, reach: 28000 },
            { type: 'stories', date: '2026-01-16', engagement: 420, reach: 6500 }
          ]
        }
      ],
      monthlyTrend: [
        { month: 'Set/25', reach: 102000, engagement: 6000 },
        { month: 'Out/25', reach: 124000, engagement: 7400 },
        { month: 'Nov/25', reach: 150000, engagement: 9200 },
        { month: 'Dez/25', reach: 138000, engagement: 8400 },
        { month: 'Jan/26', reach: 162000, engagement: 10200 },
        { month: 'Fev/26', reach: 186000, engagement: 11800 }
      ]
    },
    'damiani': {
      clientId: 'damiani',
      clientName: 'Damiani',
      instagram: {
        handle: '@damiani.const',
        followers: 10200,
        followersGrowth: 6.4,
        avgEngagementRate: 5.5
      },
      campaigns: [
        {
          id: 'dm-camp1',
          name: 'Damiani Bigorrilho - Lancamento',
          period: '2026-01 a 2026-02',
          status: 'ativo',
          metrics: {
            impressions: 158000, reach: 122000, engagement: 8800, engagementRate: 7.21,
            clicks: 2200, ctr: 1.39, followers_gained: 560, investment: 12000,
            cpl: 16.00, leads: 750, saves: 1140, shares: 340, comments: 220, likes: 6400
          },
          posts: [
            { type: 'carrossel', date: '2026-02-14', engagement: 980, reach: 17000 },
            { type: 'reels', date: '2026-02-11', engagement: 2700, reach: 42000 },
            { type: 'stories', date: '2026-02-08', engagement: 600, reach: 9500 }
          ]
        },
        {
          id: 'dm-camp2',
          name: 'Damiani Reboucas - Digital 3D',
          period: '2025-11 a 2026-01',
          status: 'finalizado',
          metrics: {
            impressions: 194000, reach: 150000, engagement: 10400, engagementRate: 6.93,
            clicks: 2800, ctr: 1.44, followers_gained: 640, investment: 13500,
            cpl: 15.00, leads: 900, saves: 1360, shares: 400, comments: 260, likes: 7600
          },
          posts: [
            { type: 'carrossel', date: '2025-12-20', engagement: 1200, reach: 21000 },
            { type: 'reels', date: '2025-12-14', engagement: 3200, reach: 50000 },
            { type: 'stories', date: '2025-12-10', engagement: 680, reach: 10500 }
          ]
        }
      ],
      monthlyTrend: [
        { month: 'Set/25', reach: 78000, engagement: 4600 },
        { month: 'Out/25', reach: 96000, engagement: 5800 },
        { month: 'Nov/25', reach: 118000, engagement: 7200 },
        { month: 'Dez/25', reach: 138000, engagement: 8800 },
        { month: 'Jan/26', reach: 152000, engagement: 9600 },
        { month: 'Fev/26', reach: 172000, engagement: 10800 }
      ]
    },
    'giacomazzi': {
      clientId: 'giacomazzi',
      clientName: 'Giacomazzi',
      instagram: {
        handle: '@giacomazzi.inc',
        followers: 19800,
        followersGrowth: 4.0,
        avgEngagementRate: 4.2
      },
      campaigns: [
        {
          id: 'gc-camp1',
          name: 'Giacomazzi Hugo Lange - Pre-lancamento',
          period: '2026-01 a 2026-02',
          status: 'ativo',
          metrics: {
            impressions: 286000, reach: 220000, engagement: 13600, engagementRate: 6.18,
            clicks: 3800, ctr: 1.33, followers_gained: 780, investment: 20000,
            cpl: 16.67, leads: 1200, saves: 1800, shares: 510, comments: 330, likes: 10000
          },
          posts: [
            { type: 'carrossel', date: '2026-02-10', engagement: 1600, reach: 28000 },
            { type: 'reels', date: '2026-02-06', engagement: 4200, reach: 68000 },
            { type: 'stories', date: '2026-02-03', engagement: 860, reach: 13500 }
          ]
        },
        {
          id: 'gc-camp2',
          name: 'Giacomazzi Bacacheri - Fase Final',
          period: '2025-10 a 2025-12',
          status: 'finalizado',
          metrics: {
            impressions: 312000, reach: 242000, engagement: 14800, engagementRate: 6.12,
            clicks: 4200, ctr: 1.35, followers_gained: 860, investment: 22000,
            cpl: 15.71, leads: 1400, saves: 1980, shares: 560, comments: 360, likes: 10900
          },
          posts: [
            { type: 'carrossel', date: '2025-11-24', engagement: 1700, reach: 30000 },
            { type: 'reels', date: '2025-11-18', engagement: 4500, reach: 72000 },
            { type: 'stories', date: '2025-11-14', engagement: 880, reach: 14000 }
          ]
        },
        {
          id: 'gc-camp3',
          name: 'Giacomazzi Marca - Refresh',
          period: '2025-12 a 2026-02',
          status: 'pausado',
          metrics: {
            impressions: 86000, reach: 64000, engagement: 4200, engagementRate: 6.56,
            clicks: 1100, ctr: 1.28, followers_gained: 280, investment: 6500,
            cpl: 16.25, leads: 400, saves: 520, shares: 160, comments: 100, likes: 3000
          },
          posts: [
            { type: 'carrossel', date: '2026-01-15', engagement: 500, reach: 9000 },
            { type: 'reels', date: '2026-01-10', engagement: 1400, reach: 22000 },
            { type: 'stories', date: '2026-01-06', engagement: 360, reach: 5500 }
          ]
        }
      ],
      monthlyTrend: [
        { month: 'Set/25', reach: 168000, engagement: 9200 },
        { month: 'Out/25', reach: 194000, engagement: 10800 },
        { month: 'Nov/25', reach: 226000, engagement: 12600 },
        { month: 'Dez/25', reach: 210000, engagement: 11800 },
        { month: 'Jan/26', reach: 242000, engagement: 13800 },
        { month: 'Fev/26', reach: 272000, engagement: 15200 }
      ]
    },
    'gessi-empreendimentos': {
      clientId: 'gessi-empreendimentos',
      clientName: 'Gessi Empreendimentos',
      instagram: {
        handle: '@gessi.emp',
        followers: 7600,
        followersGrowth: 8.2,
        avgEngagementRate: 6.1
      },
      campaigns: [
        {
          id: 'ge-camp1',
          name: 'Gessi Solar do Parque - Lancamento',
          period: '2026-01 a 2026-02',
          status: 'ativo',
          metrics: {
            impressions: 128000, reach: 96000, engagement: 7400, engagementRate: 7.71,
            clicks: 2000, ctr: 1.56, followers_gained: 520, investment: 9500,
            cpl: 15.83, leads: 600, saves: 940, shares: 290, comments: 185, likes: 5400
          },
          posts: [
            { type: 'carrossel', date: '2026-02-13', engagement: 800, reach: 14000 },
            { type: 'reels', date: '2026-02-09', engagement: 2300, reach: 36000 },
            { type: 'stories', date: '2026-02-06', engagement: 520, reach: 8000 }
          ]
        },
        {
          id: 'ge-camp2',
          name: 'Gessi Institucional',
          period: '2025-11 a 2026-01',
          status: 'finalizado',
          metrics: {
            impressions: 94000, reach: 72000, engagement: 5400, engagementRate: 7.50,
            clicks: 1500, ctr: 1.60, followers_gained: 400, investment: 7000,
            cpl: 14.00, leads: 500, saves: 680, shares: 210, comments: 130, likes: 3800
          },
          posts: [
            { type: 'carrossel', date: '2025-12-12', engagement: 620, reach: 11000 },
            { type: 'reels', date: '2025-12-08', engagement: 1700, reach: 26000 },
            { type: 'stories', date: '2025-12-04', engagement: 400, reach: 6200 }
          ]
        }
      ],
      monthlyTrend: [
        { month: 'Set/25', reach: 48000, engagement: 3200 },
        { month: 'Out/25', reach: 58000, engagement: 4000 },
        { month: 'Nov/25', reach: 72000, engagement: 5000 },
        { month: 'Dez/25', reach: 84000, engagement: 5800 },
        { month: 'Jan/26', reach: 98000, engagement: 6800 },
        { month: 'Fev/26', reach: 118000, engagement: 8200 }
      ]
    }
  },

  // ── Demo Seed Data: Project Status ─────────────────────────────────────────
  _demoProjectData: {
    'arthaus': [
      {
        id: 'ah-proj1', name: 'Arthaus Batel - Campanha Digital Completa',
        phase: 'Desenvolvimento', progress: 58,
        startDate: '2025-12-01', expectedDelivery: '2026-04-15',
        deliverables: [
          { name: 'Identidade Visual do Empreendimento', status: 'aprovado' },
          { name: 'Key Visual 3D Fachada', status: 'em revisao' },
          { name: 'Pack Social Media (30 pecas)', status: 'em revisao' },
          { name: 'Video Manifesto 60s', status: 'pendente' },
          { name: 'Tour Virtual 360', status: 'pendente' }
        ]
      },
      {
        id: 'ah-proj2', name: 'Residencial Pinheiros - Branding',
        phase: 'Render Final', progress: 86,
        startDate: '2025-09-15', expectedDelivery: '2026-02-28',
        deliverables: [
          { name: 'Brandbook Completo', status: 'aprovado' },
          { name: 'Renders Fachada HD', status: 'aprovado' },
          { name: 'Renders Interiores', status: 'aprovado' },
          { name: 'Material PDV', status: 'em revisao' }
        ]
      }
    ],
    'fontanive': [
      {
        id: 'fn-proj1', name: 'Fontanive Cabral - Full Campaign',
        phase: 'Conceito', progress: 32,
        startDate: '2026-01-10', expectedDelivery: '2026-05-30',
        deliverables: [
          { name: 'Conceito Criativo', status: 'em revisao' },
          { name: 'Moodboard Visual', status: 'aprovado' },
          { name: 'Renders Externos', status: 'pendente' },
          { name: 'Renders Internos', status: 'pendente' },
          { name: 'Animacao Fly-through', status: 'pendente' }
        ]
      },
      {
        id: 'fn-proj2', name: 'Alto da Gloria - Entrega Final',
        phase: 'Entrega', progress: 97,
        startDate: '2025-06-01', expectedDelivery: '2026-02-20',
        deliverables: [
          { name: 'Renders HD Completos', status: 'aprovado' },
          { name: 'Video Institucional', status: 'aprovado' },
          { name: 'Material Impresso', status: 'aprovado' },
          { name: 'Pack Digital', status: 'aprovado' }
        ]
      }
    ],
    'copessoa': [
      {
        id: 'cp-proj1', name: 'Co.Pessoa Juveve - Digital 3D',
        phase: 'Desenvolvimento', progress: 52,
        startDate: '2025-11-20', expectedDelivery: '2026-04-10',
        deliverables: [
          { name: 'Renders Fachada Principal', status: 'aprovado' },
          { name: 'Renders Areas Comuns', status: 'em revisao' },
          { name: 'Planta Humanizada', status: 'em revisao' },
          { name: 'Tour Virtual 360', status: 'pendente' }
        ]
      },
      {
        id: 'cp-proj2', name: 'Co.Pessoa Rebrand Institucional',
        phase: 'Revisao', progress: 70,
        startDate: '2025-10-01', expectedDelivery: '2026-03-01',
        deliverables: [
          { name: 'Nova Identidade Visual', status: 'aprovado' },
          { name: 'Manual de Marca', status: 'em revisao' },
          { name: 'Templates Corporativos', status: 'pendente' }
        ]
      }
    ],
    'grp': [
      {
        id: 'grp-proj1', name: 'GRP Ecoville Premium - Full Service',
        phase: 'Desenvolvimento', progress: 45,
        startDate: '2025-11-01', expectedDelivery: '2026-04-30',
        deliverables: [
          { name: 'Identidade do Empreendimento', status: 'aprovado' },
          { name: 'Renders Premium Fachada', status: 'em revisao' },
          { name: 'Renders Interiores Decorados', status: 'em revisao' },
          { name: 'Video Conceito Cinematic', status: 'pendente' },
          { name: 'Material Corretor', status: 'pendente' },
          { name: 'Stand Decorado VR', status: 'pendente' }
        ]
      },
      {
        id: 'grp-proj2', name: 'GRP Champagnat - Entrega Final',
        phase: 'Entrega', progress: 94,
        startDate: '2025-05-15', expectedDelivery: '2026-02-18',
        deliverables: [
          { name: 'Renders Finais HD', status: 'aprovado' },
          { name: 'Video Cinematic 90s', status: 'aprovado' },
          { name: 'Pack Digital Completo', status: 'aprovado' },
          { name: 'Material PDV Impresso', status: 'aprovado' }
        ]
      },
      {
        id: 'grp-proj3', name: 'GRP Branding Refresh',
        phase: 'Conceito', progress: 25,
        startDate: '2026-01-15', expectedDelivery: '2026-06-30',
        deliverables: [
          { name: 'Auditoria de Marca', status: 'aprovado' },
          { name: 'Conceito Estrategico', status: 'em revisao' },
          { name: 'Redesign Visual', status: 'pendente' }
        ]
      }
    ],
    'tekton': [
      {
        id: 'tk-proj1', name: 'Tekton Agua Verde - Pre-lancamento',
        phase: 'Briefing', progress: 18,
        startDate: '2026-02-01', expectedDelivery: '2026-07-30',
        deliverables: [
          { name: 'Briefing Criativo', status: 'em revisao' },
          { name: 'Pesquisa de Mercado', status: 'pendente' },
          { name: 'Conceito Visual', status: 'pendente' },
          { name: 'Renders Externos', status: 'pendente' },
          { name: 'Video Teaser', status: 'pendente' }
        ]
      },
      {
        id: 'tk-proj2', name: 'Tekton Portao - Entrega',
        phase: 'Entrega', progress: 100,
        startDate: '2025-07-01', expectedDelivery: '2026-01-30',
        deliverables: [
          { name: 'Renders Completos', status: 'aprovado' },
          { name: 'Tour 360 Interativo', status: 'aprovado' },
          { name: 'Animacao Walkthrough', status: 'aprovado' }
        ]
      }
    ],
    'mdi-brasil': [
      {
        id: 'mdi-proj1', name: 'MDI Residence Park - Campanha Completa',
        phase: 'Render Final', progress: 80,
        startDate: '2025-09-01', expectedDelivery: '2026-03-10',
        deliverables: [
          { name: 'Renders Externos HD', status: 'aprovado' },
          { name: 'Renders Internos Decorados', status: 'aprovado' },
          { name: 'Video Walkthrough 3D', status: 'em revisao' },
          { name: 'Pack Social Media', status: 'aprovado' }
        ]
      },
      {
        id: 'mdi-proj2', name: 'MDI Centro Civico - Digital 3D',
        phase: 'Desenvolvimento', progress: 48,
        startDate: '2025-11-15', expectedDelivery: '2026-04-20',
        deliverables: [
          { name: 'Conceito Visual', status: 'aprovado' },
          { name: 'Renders Fachada', status: 'em revisao' },
          { name: 'Planta Humanizada', status: 'pendente' },
          { name: 'Video Teaser', status: 'pendente' }
        ]
      }
    ],
    'agbem': [
      {
        id: 'ag-proj1', name: 'AGBEM Vista Verde - Lancamento Digital',
        phase: 'Desenvolvimento', progress: 55,
        startDate: '2025-11-10', expectedDelivery: '2026-04-15',
        deliverables: [
          { name: 'Identidade Visual', status: 'aprovado' },
          { name: 'Renders Fachada', status: 'aprovado' },
          { name: 'Renders Areas Comuns', status: 'em revisao' },
          { name: 'Video Manifesto', status: 'pendente' },
          { name: 'Pack Digital Corretor', status: 'pendente' }
        ]
      }
    ],
    'ricardo-maio': [
      {
        id: 'rm-proj1', name: 'Ricardo Maio Cabral - Full Campaign',
        phase: 'Revisao', progress: 72,
        startDate: '2025-10-01', expectedDelivery: '2026-03-15',
        deliverables: [
          { name: 'Renders Fachada Principal', status: 'aprovado' },
          { name: 'Renders Interiores', status: 'aprovado' },
          { name: 'Brandbook', status: 'em revisao' },
          { name: 'Video Cinematic', status: 'em revisao' },
          { name: 'Material Impresso', status: 'pendente' }
        ]
      },
      {
        id: 'rm-proj2', name: 'RM Alto da XV - Entrega',
        phase: 'Entrega', progress: 96,
        startDate: '2025-06-15', expectedDelivery: '2026-02-15',
        deliverables: [
          { name: 'Renders Completos HD', status: 'aprovado' },
          { name: 'Tour Virtual 360', status: 'aprovado' },
          { name: 'Pack Social Media', status: 'aprovado' },
          { name: 'Material PDV', status: 'aprovado' }
        ]
      }
    ],
    'viplan': [
      {
        id: 'vp-proj1', name: 'Viplan Jardim Botanico - Campanha Digital',
        phase: 'Conceito', progress: 30,
        startDate: '2026-01-05', expectedDelivery: '2026-06-15',
        deliverables: [
          { name: 'Moodboard e Conceito', status: 'em revisao' },
          { name: 'Renders Externos', status: 'pendente' },
          { name: 'Renders Internos', status: 'pendente' },
          { name: 'Animacao Fly-through', status: 'pendente' },
          { name: 'Pack Social Media', status: 'pendente' }
        ]
      },
      {
        id: 'vp-proj2', name: 'Viplan Merces - Entrega Final',
        phase: 'Entrega', progress: 98,
        startDate: '2025-05-20', expectedDelivery: '2026-02-10',
        deliverables: [
          { name: 'Renders Finais HD', status: 'aprovado' },
          { name: 'Video Walkthrough', status: 'aprovado' },
          { name: 'Material Completo', status: 'aprovado' }
        ]
      }
    ],
    'damiani': [
      {
        id: 'dm-proj1', name: 'Damiani Bigorrilho - Lancamento Full',
        phase: 'Render Final', progress: 78,
        startDate: '2025-09-20', expectedDelivery: '2026-03-20',
        deliverables: [
          { name: 'Renders Externos HD', status: 'aprovado' },
          { name: 'Renders Internos Decorados', status: 'aprovado' },
          { name: 'Video Conceito 45s', status: 'em revisao' },
          { name: 'Planta Humanizada', status: 'aprovado' }
        ]
      },
      {
        id: 'dm-proj2', name: 'Damiani Reboucas - Digital 3D',
        phase: 'Entrega', progress: 100,
        startDate: '2025-07-01', expectedDelivery: '2026-01-30',
        deliverables: [
          { name: 'Renders Completos', status: 'aprovado' },
          { name: 'Tour 360', status: 'aprovado' },
          { name: 'Pack Social Media', status: 'aprovado' }
        ]
      }
    ],
    'giacomazzi': [
      {
        id: 'gc-proj1', name: 'Giacomazzi Hugo Lange - Full Service',
        phase: 'Desenvolvimento', progress: 42,
        startDate: '2025-11-15', expectedDelivery: '2026-05-15',
        deliverables: [
          { name: 'Identidade do Empreendimento', status: 'aprovado' },
          { name: 'Renders Fachada Premium', status: 'em revisao' },
          { name: 'Renders Areas Comuns', status: 'pendente' },
          { name: 'Video Cinematic', status: 'pendente' },
          { name: 'Material Corretor', status: 'pendente' }
        ]
      },
      {
        id: 'gc-proj2', name: 'Giacomazzi Bacacheri - Entrega',
        phase: 'Entrega', progress: 95,
        startDate: '2025-05-01', expectedDelivery: '2026-02-20',
        deliverables: [
          { name: 'Renders Finais HD', status: 'aprovado' },
          { name: 'Video Institucional', status: 'aprovado' },
          { name: 'Pack Digital Completo', status: 'aprovado' },
          { name: 'Material Impresso', status: 'aprovado' }
        ]
      }
    ],
    'gessi-empreendimentos': [
      {
        id: 'ge-proj1', name: 'Gessi Solar do Parque - Digital 3D',
        phase: 'Desenvolvimento', progress: 50,
        startDate: '2025-11-01', expectedDelivery: '2026-04-30',
        deliverables: [
          { name: 'Renders Fachada', status: 'aprovado' },
          { name: 'Renders Interiores', status: 'em revisao' },
          { name: 'Planta Humanizada', status: 'em revisao' },
          { name: 'Tour Virtual 360', status: 'pendente' },
          { name: 'Video Teaser 30s', status: 'pendente' }
        ]
      }
    ]
  },

  // ── Phase definitions ─────────────────────────────────────────────────────
  _phases: ['Briefing', 'Conceito', 'Desenvolvimento', 'Revisao', 'Render Final', 'Entrega'],

  // ── Render ─────────────────────────────────────────────────────────────────
  render() {
    const clients = this._getClientList();
    const selected = this._selectedClient;
    const igData = selected ? this._demoInstagramData[selected] : null;
    const projData = selected ? (this._demoProjectData[selected] || []) : [];

    return `
      <div class="portal-cliente-module">
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Portal do Cliente</h2>
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="tag">${clients.length} clientes</span>
            </div>
          </div>

          <!-- Client Selector -->
          <div class="portal-cliente-selector">
            <label class="portal-cliente-selector-label">Selecionar Cliente</label>
            <select class="form-input portal-cliente-select" id="portalClienteSelect">
              <option value="">-- Escolha um cliente --</option>
              ${clients.map(c => `
                <option value="${this._esc(c.id)}" ${selected === c.id ? 'selected' : ''}>${this._esc(c.name)}${c.projectCount > 0 ? ' (' + c.projectCount + ' projetos)' : ''}</option>
              `).join('')}
            </select>
          </div>

          ${selected && igData ? this._renderClientView(igData, projData) : this._renderEmptyState()}
        </section>
      </div>
    `;
  },

  _renderEmptyState() {
    return `
      <div class="portal-cliente-empty">
        <div class="portal-cliente-empty-icon">
          <i data-lucide="building-2" style="width:48px;height:48px;color:var(--text-muted);"></i>
        </div>
        <h3 style="color:var(--text-secondary);margin:16px 0 8px;">Selecione um cliente</h3>
        <p style="color:var(--text-muted);font-size:0.85rem;">Escolha um cliente no seletor acima para visualizar o desempenho das campanhas Instagram e o status dos projetos.</p>
      </div>
    `;
  },

  _renderClientView(igData, projData) {
    return `
      <!-- Client Header -->
      <div class="portal-cliente-header">
        <div class="portal-cliente-avatar" style="background:${this._avatarColor(igData.clientName)};">
          ${this._initials(igData.clientName)}
        </div>
        <div class="portal-cliente-info">
          <h3 class="portal-cliente-name">${this._esc(igData.clientName)}</h3>
          <span class="portal-cliente-handle">${this._esc(igData.instagram.handle)}</span>
          <span class="portal-cliente-followers">${this._fmtNum(igData.instagram.followers)} seguidores</span>
          <span class="portal-cliente-growth" style="color:var(--color-success);">+${igData.instagram.followersGrowth}% /mes</span>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="portal-cliente-tabs">
        <button class="portal-cliente-tab ${this._activeTab === 'instagram' ? 'portal-cliente-tab--active' : ''}" data-tab="instagram">
          <i data-lucide="instagram" style="width:16px;height:16px;"></i>
          Performance Instagram
        </button>
        <button class="portal-cliente-tab ${this._activeTab === 'projeto' ? 'portal-cliente-tab--active' : ''}" data-tab="projeto">
          <i data-lucide="clipboard-list" style="width:16px;height:16px;"></i>
          Status dos Projetos
        </button>
      </div>

      <!-- Tab Content -->
      ${this._activeTab === 'instagram' ? this._renderInstagramTab(igData) : this._renderProjectTab(projData)}
    `;
  },

  // ── Instagram Performance Tab ──────────────────────────────────────────────
  _renderInstagramTab(igData) {
    // Aggregate metrics from all active campaigns
    const activeCampaigns = igData.campaigns.filter(c => c.status === 'ativo');
    const allCampaigns = igData.campaigns;

    const totalImpressions = allCampaigns.reduce((s, c) => s + c.metrics.impressions, 0);
    const totalReach = allCampaigns.reduce((s, c) => s + c.metrics.reach, 0);
    const totalEngagement = allCampaigns.reduce((s, c) => s + c.metrics.engagement, 0);
    const totalLeads = allCampaigns.reduce((s, c) => s + c.metrics.leads, 0);
    const totalInvestment = allCampaigns.reduce((s, c) => s + c.metrics.investment, 0);
    const avgCTR = allCampaigns.length > 0
      ? (allCampaigns.reduce((s, c) => s + c.metrics.ctr, 0) / allCampaigns.length).toFixed(2)
      : 0;
    const avgCPL = totalLeads > 0 ? (totalInvestment / totalLeads).toFixed(2) : 0;

    return `
      <!-- KPI Cards -->
      <div class="portal-cliente-kpis">
        <div class="portal-cliente-kpi">
          <div class="portal-cliente-kpi-value">${this._fmtNum(totalImpressions)}</div>
          <div class="portal-cliente-kpi-label">Impressoes</div>
        </div>
        <div class="portal-cliente-kpi">
          <div class="portal-cliente-kpi-value">${this._fmtNum(totalReach)}</div>
          <div class="portal-cliente-kpi-label">Alcance</div>
        </div>
        <div class="portal-cliente-kpi">
          <div class="portal-cliente-kpi-value">${this._fmtNum(totalEngagement)}</div>
          <div class="portal-cliente-kpi-label">Engajamento</div>
        </div>
        <div class="portal-cliente-kpi">
          <div class="portal-cliente-kpi-value">${avgCTR}%</div>
          <div class="portal-cliente-kpi-label">CTR Medio</div>
        </div>
        <div class="portal-cliente-kpi">
          <div class="portal-cliente-kpi-value">R$ ${avgCPL}</div>
          <div class="portal-cliente-kpi-label">CPL Medio</div>
        </div>
        <div class="portal-cliente-kpi">
          <div class="portal-cliente-kpi-value">${this._fmtNum(totalLeads)}</div>
          <div class="portal-cliente-kpi-label">Leads</div>
        </div>
      </div>

      <!-- Campaigns Table -->
      <div class="portal-cliente-section-title">Campanhas</div>
      <div class="portal-cliente-table-wrap">
        <table class="data-table portal-cliente-table">
          <thead>
            <tr>
              <th>Campanha</th>
              <th>Periodo</th>
              <th>Status</th>
              <th>Impressoes</th>
              <th>Alcance</th>
              <th>Engajamento</th>
              <th>CTR</th>
              <th>Leads</th>
              <th>Investimento</th>
              <th>CPL</th>
            </tr>
          </thead>
          <tbody>
            ${allCampaigns.map(c => `
              <tr>
                <td><strong>${this._esc(c.name)}</strong></td>
                <td style="white-space:nowrap;">${this._esc(c.period)}</td>
                <td>${this._renderStatusBadge(c.status)}</td>
                <td>${this._fmtNum(c.metrics.impressions)}</td>
                <td>${this._fmtNum(c.metrics.reach)}</td>
                <td>${this._fmtNum(c.metrics.engagement)}</td>
                <td>${c.metrics.ctr}%</td>
                <td>${this._fmtNum(c.metrics.leads)}</td>
                <td>R$ ${this._fmtNum(c.metrics.investment)}</td>
                <td>R$ ${c.metrics.cpl.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Charts Row -->
      <div class="portal-cliente-charts-row">
        <!-- Engagement by Post Type -->
        <div class="portal-cliente-chart-card">
          <div class="portal-cliente-chart-title">Engajamento por Tipo de Post</div>
          ${this._renderPostTypeChart(allCampaigns)}
        </div>

        <!-- Monthly Trend -->
        <div class="portal-cliente-chart-card">
          <div class="portal-cliente-chart-title">Tendencia Mensal (Alcance)</div>
          ${this._renderMonthlyTrendChart(igData.monthlyTrend)}
        </div>
      </div>

      <!-- Detailed Metrics per Campaign -->
      <div class="portal-cliente-section-title">Detalhamento por Campanha</div>
      ${allCampaigns.map(c => `
        <div class="portal-cliente-campaign-detail">
          <div class="portal-cliente-campaign-header">
            <strong>${this._esc(c.name)}</strong>
            ${this._renderStatusBadge(c.status)}
          </div>
          <div class="portal-cliente-campaign-metrics">
            <div class="portal-cliente-mini-stat">
              <span class="portal-cliente-mini-val">${this._fmtNum(c.metrics.likes)}</span>
              <span class="portal-cliente-mini-label">Likes</span>
            </div>
            <div class="portal-cliente-mini-stat">
              <span class="portal-cliente-mini-val">${this._fmtNum(c.metrics.comments)}</span>
              <span class="portal-cliente-mini-label">Comentarios</span>
            </div>
            <div class="portal-cliente-mini-stat">
              <span class="portal-cliente-mini-val">${this._fmtNum(c.metrics.shares)}</span>
              <span class="portal-cliente-mini-label">Compartilhamentos</span>
            </div>
            <div class="portal-cliente-mini-stat">
              <span class="portal-cliente-mini-val">${this._fmtNum(c.metrics.saves)}</span>
              <span class="portal-cliente-mini-label">Salvamentos</span>
            </div>
            <div class="portal-cliente-mini-stat">
              <span class="portal-cliente-mini-val">${this._fmtNum(c.metrics.clicks)}</span>
              <span class="portal-cliente-mini-label">Cliques</span>
            </div>
            <div class="portal-cliente-mini-stat">
              <span class="portal-cliente-mini-val">+${this._fmtNum(c.metrics.followers_gained)}</span>
              <span class="portal-cliente-mini-label">Novos Seguidores</span>
            </div>
          </div>
        </div>
      `).join('')}
    `;
  },

  _renderStatusBadge(status) {
    const map = {
      'ativo': { label: 'Ativo', cls: 'portal-cliente-badge--active' },
      'pausado': { label: 'Pausado', cls: 'portal-cliente-badge--paused' },
      'finalizado': { label: 'Finalizado', cls: 'portal-cliente-badge--finished' }
    };
    const info = map[status] || { label: status, cls: '' };
    return `<span class="portal-cliente-badge ${info.cls}">${info.label}</span>`;
  },

  _renderPostTypeChart(campaigns) {
    // Aggregate engagement by post type
    const types = {};
    campaigns.forEach(c => {
      (c.posts || []).forEach(p => {
        if (!types[p.type]) types[p.type] = 0;
        types[p.type] += p.engagement;
      });
    });

    const entries = Object.entries(types).sort((a, b) => b[1] - a[1]);
    const maxVal = Math.max(...entries.map(e => e[1]), 1);
    const typeLabels = { carrossel: 'Carrossel', reels: 'Reels', stories: 'Stories', feed: 'Feed' };
    const typeColors = { carrossel: 'var(--accent, #3b82f6)', reels: '#8b5cf6', stories: '#f59e0b', feed: '#22c55e' };

    return `
      <div class="portal-cliente-bar-chart">
        ${entries.map(([type, val]) => {
          const pct = Math.round((val / maxVal) * 100);
          const label = typeLabels[type] || type;
          const color = typeColors[type] || 'var(--accent, #3b82f6)';
          return `
            <div class="portal-cliente-bar-row">
              <span class="portal-cliente-bar-label">${label}</span>
              <div class="portal-cliente-bar-track">
                <div class="portal-cliente-bar-fill" style="width:${pct}%;background:${color};"></div>
              </div>
              <span class="portal-cliente-bar-value">${this._fmtNum(val)}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  _renderMonthlyTrendChart(trend) {
    if (!trend || trend.length === 0) return '<div style="color:var(--text-muted);font-size:0.82rem;">Sem dados</div>';

    const maxReach = Math.max(...trend.map(t => t.reach), 1);
    const barWidth = Math.floor(100 / trend.length);

    return `
      <div class="portal-cliente-trend-chart">
        <div class="portal-cliente-trend-bars">
          ${trend.map(t => {
            const pct = Math.round((t.reach / maxReach) * 100);
            return `
              <div class="portal-cliente-trend-col" style="width:${barWidth}%;">
                <div class="portal-cliente-trend-bar-wrap">
                  <div class="portal-cliente-trend-bar" style="height:${pct}%;"></div>
                </div>
                <div class="portal-cliente-trend-label">${t.month}</div>
                <div class="portal-cliente-trend-value">${this._fmtCompact(t.reach)}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  // ── Project Status Tab ─────────────────────────────────────────────────────
  _renderProjectTab(projData) {
    if (!projData || projData.length === 0) {
      return `
        <div class="portal-cliente-empty" style="margin-top:24px;">
          <p style="color:var(--text-muted);font-size:0.85rem;">Nenhum projeto encontrado para este cliente.</p>
        </div>
      `;
    }

    return `
      <div class="portal-cliente-projects">
        ${projData.map(p => this._renderProjectCard(p)).join('')}
      </div>
    `;
  },

  _renderProjectCard(project) {
    const phaseIndex = this._phases.indexOf(project.phase);
    const delivStats = this._getDeliverableStats(project.deliverables);

    return `
      <div class="portal-cliente-project-card">
        <div class="portal-cliente-project-header">
          <h4 class="portal-cliente-project-name">${this._esc(project.name)}</h4>
          <span class="portal-cliente-progress-badge" style="color:${project.progress >= 80 ? 'var(--color-success)' : project.progress >= 40 ? 'var(--color-warning)' : 'var(--accent, #3b82f6)'};">
            ${project.progress}%
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="portal-cliente-progress-bar">
          <div class="portal-cliente-progress-fill" style="width:${project.progress}%;background:${project.progress >= 80 ? 'var(--color-success)' : project.progress >= 40 ? 'var(--color-warning)' : 'var(--accent, #3b82f6)'};"></div>
        </div>

        <!-- Phase Timeline -->
        <div class="portal-cliente-phases">
          ${this._phases.map((phase, idx) => {
            let cls = 'portal-cliente-phase';
            if (idx < phaseIndex) cls += ' portal-cliente-phase--done';
            else if (idx === phaseIndex) cls += ' portal-cliente-phase--active';
            return `
              <div class="${cls}">
                <div class="portal-cliente-phase-dot"></div>
                <div class="portal-cliente-phase-label">${phase}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Dates -->
        <div class="portal-cliente-dates">
          <div class="portal-cliente-date">
            <span class="portal-cliente-date-label">Inicio:</span>
            <span class="portal-cliente-date-value">${this._formatDate(project.startDate)}</span>
          </div>
          <div class="portal-cliente-date">
            <span class="portal-cliente-date-label">Previsao Entrega:</span>
            <span class="portal-cliente-date-value">${this._formatDate(project.expectedDelivery)}</span>
          </div>
        </div>

        <!-- Deliverables -->
        <div class="portal-cliente-deliverables">
          <div class="portal-cliente-deliv-header">
            <span class="portal-cliente-deliv-title">Entregaveis</span>
            <span class="portal-cliente-deliv-summary">
              <span style="color:var(--color-success);">${delivStats.aprovado} aprovado${delivStats.aprovado !== 1 ? 's' : ''}</span>
              <span style="color:var(--color-warning);">${delivStats['em revisao']} em revisao</span>
              <span style="color:var(--text-muted);">${delivStats.pendente} pendente${delivStats.pendente !== 1 ? 's' : ''}</span>
            </span>
          </div>
          <div class="portal-cliente-deliv-list">
            ${(project.deliverables || []).map(d => `
              <div class="portal-cliente-deliv-item">
                <span class="portal-cliente-deliv-name">${this._esc(d.name)}</span>
                ${this._renderDeliverableStatus(d.status)}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  _renderDeliverableStatus(status) {
    const map = {
      'aprovado': { label: 'Aprovado', cls: 'portal-cliente-deliv--aprovado' },
      'em revisao': { label: 'Em Revisao', cls: 'portal-cliente-deliv--revisao' },
      'pendente': { label: 'Pendente', cls: 'portal-cliente-deliv--pendente' }
    };
    const info = map[status] || { label: status, cls: '' };
    return `<span class="portal-cliente-deliv-status ${info.cls}">${info.label}</span>`;
  },

  _getDeliverableStats(deliverables) {
    const stats = { aprovado: 0, 'em revisao': 0, pendente: 0 };
    (deliverables || []).forEach(d => {
      if (stats.hasOwnProperty(d.status)) stats[d.status]++;
    });
    return stats;
  },

  // ── Helpers ────────────────────────────────────────────────────────────────
  _getClientList() {
    const demoClients = [
      { id: 'arthaus', name: 'Arthaus' },
      { id: 'fontanive', name: 'Fontanive' },
      { id: 'copessoa', name: 'Co.Pessoa' },
      { id: 'grp', name: 'GRP' },
      { id: 'tekton', name: 'Tekton' },
      { id: 'mdi-brasil', name: 'MDI Brasil' },
      { id: 'agbem', name: 'AGBEM' },
      { id: 'ricardo-maio', name: 'Ricardo Maio' },
      { id: 'viplan', name: 'Viplan' },
      { id: 'damiani', name: 'Damiani' },
      { id: 'elio-winter', name: 'Elio Winter' },
      { id: 'arthur-silveira', name: 'Arthur Silveira' },
      { id: 'giacomazzi', name: 'Giacomazzi' },
      { id: 'itamar-levi', name: 'Itamar Levi' },
      { id: 'thal', name: 'Thal' },
      { id: 'arquitetare', name: 'Arquitetare' },
      { id: 'f7-inc', name: 'F7 Inc.' },
      { id: 'medieval', name: 'Medieval' },
      { id: 'patrao', name: 'Patrao' },
      { id: 'soulpcr', name: 'SoulPCR' },
      { id: 'rzilli', name: 'RZilli' },
      { id: 'langard', name: 'Langard' },
      { id: 'volarque', name: 'Volarque' },
      { id: 'hsh', name: 'HSH' },
      { id: 'gessi-empreendimentos', name: 'Gessi Empreendimentos' },
      { id: 'd-borcath', name: 'D. Borcath' },
      { id: 'ardc-empreendimentos', name: 'ARDC Empreendimentos' }
    ];

    // Try to get clients from context
    let contextClients = [];
    try {
      const context = TBO_STORAGE.get('context');
      const raw = context.clientes_construtoras || [];
      contextClients = raw.map(name => ({
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        name: name
      }));
    } catch (e) {
      // fallback to demo
    }

    // Merge: use context clients if available, otherwise demo
    const clients = contextClients.length > 0 ? contextClients : demoClients;

    // Add project count from demo data
    return clients.map(c => {
      const projData = this._demoProjectData[c.id] || [];
      return { ...c, projectCount: projData.length };
    });
  },

  _esc(str) {
    if (str == null) return '';
    if (typeof str !== 'string') str = String(str);
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  _fmtNum(val) {
    return (val || 0).toLocaleString('pt-BR');
  },

  _fmtCompact(val) {
    if (val >= 1000000) return (val / 1000000).toFixed(1).replace('.', ',') + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
    return String(val);
  },

  _formatDate(dateStr) {
    if (!dateStr) return '--';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  _avatarColor(name) {
    const colors = ['#3b82f6','#8b5cf6','#f59e0b','#22c55e','#ef4444','#14b8a6','#E85102','#6366f1','#ec4899'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  },

  _initials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  },

  // ── Init (Event Binding) ───────────────────────────────────────────────────
  init() {
    // Client selector
    const select = document.getElementById('portalClienteSelect');
    if (select) {
      select.addEventListener('change', (e) => {
        this._selectedClient = e.target.value || null;
        this._activeTab = 'instagram';
        this._refresh();
      });
    }

    // Tab buttons
    document.querySelectorAll('.portal-cliente-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this._activeTab = btn.dataset.tab;
        this._refresh();
      });
    });

    // Re-init Lucide icons for dynamic content
    if (window.lucide) lucide.createIcons();
  },

  _refresh() {
    const container = document.getElementById('moduleContainer');
    if (container) {
      container.innerHTML = this.render();
      this.init();
    }
  }
};

// ── Scoped Styles ─────────────────────────────────────────────────────────────
(function() {
  const style = document.createElement('style');
  style.textContent = `
    /* ── Portal Cliente Module Styles ──────────────────────────────────────── */

    .portal-cliente-module {
      max-width: 1200px;
    }

    /* Selector */
    .portal-cliente-selector {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding: 16px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
    }
    .portal-cliente-selector-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-secondary);
      white-space: nowrap;
    }
    .portal-cliente-select {
      max-width: 360px;
      min-width: 240px;
    }

    /* Empty State */
    .portal-cliente-empty {
      text-align: center;
      padding: 48px 24px;
    }

    /* Client Header */
    .portal-cliente-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding: 20px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
    }
    .portal-cliente-avatar {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      color: #fff;
      flex-shrink: 0;
    }
    .portal-cliente-info {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 16px;
    }
    .portal-cliente-name {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }
    .portal-cliente-handle {
      font-size: 0.82rem;
      color: var(--accent, #3b82f6);
      font-weight: 500;
    }
    .portal-cliente-followers {
      font-size: 0.82rem;
      color: var(--text-secondary);
    }
    .portal-cliente-growth {
      font-size: 0.78rem;
      font-weight: 600;
    }

    /* Tabs */
    .portal-cliente-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 0;
    }
    .portal-cliente-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-muted);
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      margin-bottom: -1px;
    }
    .portal-cliente-tab:hover {
      color: var(--text-primary);
    }
    .portal-cliente-tab--active {
      color: var(--accent, #3b82f6);
      border-bottom-color: var(--accent, #3b82f6);
    }

    /* KPIs */
    .portal-cliente-kpis {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .portal-cliente-kpi {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 16px;
      text-align: center;
    }
    .portal-cliente-kpi-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }
    .portal-cliente-kpi-label {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    /* Section Title */
    .portal-cliente-section-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 24px 0 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Table */
    .portal-cliente-table-wrap {
      overflow-x: auto;
      margin-bottom: 24px;
      border-radius: 10px;
      border: 1px solid var(--border-subtle);
    }
    .portal-cliente-table {
      font-size: 0.82rem;
    }
    .portal-cliente-table th {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    /* Status Badges */
    .portal-cliente-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .portal-cliente-badge--active {
      background: rgba(34, 197, 94, 0.12);
      color: var(--color-success);
      border: 1px solid rgba(34, 197, 94, 0.25);
    }
    .portal-cliente-badge--paused {
      background: rgba(245, 158, 11, 0.12);
      color: var(--color-warning);
      border: 1px solid rgba(245, 158, 11, 0.25);
    }
    .portal-cliente-badge--finished {
      background: rgba(100, 116, 139, 0.12);
      color: var(--text-secondary);
      border: 1px solid rgba(100, 116, 139, 0.25);
    }

    /* Charts Row */
    .portal-cliente-charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .portal-cliente-chart-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 20px;
    }
    .portal-cliente-chart-title {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 16px;
    }

    /* Bar Chart (Post Type) */
    .portal-cliente-bar-chart {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .portal-cliente-bar-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .portal-cliente-bar-label {
      font-size: 0.78rem;
      color: var(--text-secondary);
      min-width: 72px;
      text-align: right;
    }
    .portal-cliente-bar-track {
      flex: 1;
      height: 22px;
      background: var(--border-subtle);
      border-radius: 6px;
      overflow: hidden;
    }
    .portal-cliente-bar-fill {
      height: 100%;
      border-radius: 6px;
      transition: width 0.5s ease;
      min-width: 2px;
    }
    .portal-cliente-bar-value {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-primary);
      min-width: 54px;
    }

    /* Monthly Trend Chart */
    .portal-cliente-trend-chart {
      padding: 8px 0;
    }
    .portal-cliente-trend-bars {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 140px;
    }
    .portal-cliente-trend-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }
    .portal-cliente-trend-bar-wrap {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .portal-cliente-trend-bar {
      width: 70%;
      max-width: 40px;
      background: var(--accent, #3b82f6);
      border-radius: 4px 4px 0 0;
      min-height: 4px;
      transition: height 0.4s ease;
      opacity: 0.85;
    }
    .portal-cliente-trend-bar:hover {
      opacity: 1;
    }
    .portal-cliente-trend-label {
      font-size: 0.68rem;
      color: var(--text-muted);
      margin-top: 6px;
      white-space: nowrap;
    }
    .portal-cliente-trend-value {
      font-size: 0.68rem;
      color: var(--text-secondary);
      font-weight: 600;
    }

    /* Campaign Detail */
    .portal-cliente-campaign-detail {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 12px;
    }
    .portal-cliente-campaign-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .portal-cliente-campaign-metrics {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
    }
    .portal-cliente-mini-stat {
      text-align: center;
      padding: 8px;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 8px;
    }
    .dark-mode .portal-cliente-mini-stat {
      background: rgba(255, 255, 255, 0.04);
    }
    .portal-cliente-mini-val {
      display: block;
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .portal-cliente-mini-label {
      display: block;
      font-size: 0.68rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* ── Project Status Tab ──────────────────────────────────────────── */
    .portal-cliente-projects {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .portal-cliente-project-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 20px 24px;
    }
    .portal-cliente-project-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .portal-cliente-project-name {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }
    .portal-cliente-progress-badge {
      font-size: 1.1rem;
      font-weight: 700;
    }

    /* Progress Bar */
    .portal-cliente-progress-bar {
      height: 6px;
      background: var(--border-subtle);
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .portal-cliente-progress-fill {
      height: 100%;
      border-radius: 6px;
      transition: width 0.5s ease;
    }

    /* Phase Timeline */
    .portal-cliente-phases {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      position: relative;
    }
    .portal-cliente-phases::before {
      content: '';
      position: absolute;
      top: 9px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--border-subtle);
      z-index: 0;
    }
    .portal-cliente-phase {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 1;
      flex: 1;
    }
    .portal-cliente-phase-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--bg-card);
      border: 2px solid var(--border-subtle);
      margin-bottom: 6px;
      transition: all 0.2s ease;
    }
    .portal-cliente-phase--done .portal-cliente-phase-dot {
      background: var(--color-success);
      border-color: var(--color-success);
    }
    .portal-cliente-phase--active .portal-cliente-phase-dot {
      background: var(--accent, #3b82f6);
      border-color: var(--accent, #3b82f6);
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
    }
    .portal-cliente-phase-label {
      font-size: 0.68rem;
      color: var(--text-muted);
      text-align: center;
      line-height: 1.2;
    }
    .portal-cliente-phase--active .portal-cliente-phase-label {
      color: var(--accent, #3b82f6);
      font-weight: 700;
    }
    .portal-cliente-phase--done .portal-cliente-phase-label {
      color: var(--color-success);
      font-weight: 500;
    }

    /* Dates */
    .portal-cliente-dates {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;
    }
    .portal-cliente-date {
      display: flex;
      gap: 6px;
      font-size: 0.82rem;
    }
    .portal-cliente-date-label {
      color: var(--text-muted);
    }
    .portal-cliente-date-value {
      color: var(--text-primary);
      font-weight: 600;
    }

    /* Deliverables */
    .portal-cliente-deliverables {
      border-top: 1px solid var(--border-subtle);
      padding-top: 16px;
    }
    .portal-cliente-deliv-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .portal-cliente-deliv-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .portal-cliente-deliv-summary {
      display: flex;
      gap: 12px;
      font-size: 0.72rem;
      font-weight: 600;
    }
    .portal-cliente-deliv-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .portal-cliente-deliv-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.02);
    }
    .dark-mode .portal-cliente-deliv-item {
      background: rgba(255, 255, 255, 0.03);
    }
    .portal-cliente-deliv-name {
      font-size: 0.82rem;
      color: var(--text-primary);
    }
    .portal-cliente-deliv-status {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 20px;
    }
    .portal-cliente-deliv--aprovado {
      background: rgba(34, 197, 94, 0.12);
      color: var(--color-success);
    }
    .portal-cliente-deliv--revisao {
      background: rgba(245, 158, 11, 0.12);
      color: var(--color-warning);
    }
    .portal-cliente-deliv--pendente {
      background: rgba(100, 116, 139, 0.12);
      color: var(--text-muted);
    }

    /* ── Responsive ──────────────────────────────────────────────── */
    @media (max-width: 900px) {
      .portal-cliente-kpis {
        grid-template-columns: repeat(3, 1fr);
      }
      .portal-cliente-charts-row {
        grid-template-columns: 1fr;
      }
      .portal-cliente-campaign-metrics {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    @media (max-width: 600px) {
      .portal-cliente-kpis {
        grid-template-columns: repeat(2, 1fr);
      }
      .portal-cliente-campaign-metrics {
        grid-template-columns: repeat(2, 1fr);
      }
      .portal-cliente-phases {
        flex-wrap: wrap;
        gap: 8px;
      }
      .portal-cliente-phases::before {
        display: none;
      }
      .portal-cliente-header {
        flex-direction: column;
        text-align: center;
      }
      .portal-cliente-info {
        justify-content: center;
      }
      .portal-cliente-dates {
        flex-direction: column;
        gap: 8px;
      }
      .portal-cliente-table-wrap {
        font-size: 0.75rem;
      }
    }
  `;
  document.head.appendChild(style);
})();

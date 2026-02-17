# TBO OS — FASE 2 de 7
# Coleta de Dados: Google Drive + Notion
# Tempo estimado: 25-45 minutos

> **Pré-requisito:** Fase 1 concluída e .bat funcionando
> **Ao terminar:** abra o .bat. Vá em Configurações > Contexto & Dados.
> O context-data.json deve estar preenchido com projetos, 
> metodologias, equipe, produtos, regras de negócio.
> O contador deve mostrar "X projetos | X documentos".

---

```
Você é um engenheiro de software full-stack sênior.
Estamos construindo o TBO OS em fases. Esta é a FASE 2.

A Fase 1 já foi executada. A aplicação base existe em:
[ÁREA DE TRABALHO DO USUÁRIO]\TBO_OS\

NÃO recrie arquivos existentes. Apenas:
1. Colete dados das fontes abaixo
2. Preencha o context-data.json
3. Atualize o config.js com o system prompt enriquecido
4. Atualize os indicadores de status no header e settings

=====================================================
COLETA — GOOGLE DRIVE
=====================================================

A) "G:\Meu Drive\01.PROJETOS\01. ANDAMENTO"
   Para CADA projeto (subpasta):
   - nome do projeto
   - lista de subpastas (estrutura)
   - tipos de entregáveis encontrados (imagens, vídeos, 
     PDFs, modelos 3D, etc.)
   - data do arquivo mais recente (última atividade)
   - contagem de arquivos por tipo
   - tamanho total estimado
   - fase aparente (baseado nas subpastas existentes: 
     modelagem, texturização, iluminação, render, 
     revisão, entrega, etc.)

B) "G:\Meu Drive\01.PROJETOS\02. FINALIZADOS"
   Para CADA projeto:
   - nome do projeto
   - entregáveis identificados
   - quantidade de imagens na pasta "formalização de entrega" 
     (buscar case-insensitive: "formalização", "Formalização", 
     "FORMALIZAÇÃO", "formalização de entrega", etc.)
   - formatos de imagem encontrados
   - data do primeiro e último arquivo (duração estimada)
   - volume total

C) "I:\Meu Drive\03.AGÊNCIA_TBO"
   - Identifique propostas comerciais (PDFs, DOCXs com 
     "proposta" no nome ou conteúdo)
   - Material institucional, apresentações
   - Manual de marca, guidelines visuais
   - Textos do site, copies
   - Tabelas de preço, orçamentos
   - Qualquer documento que revele tom de voz, 
     posicionamento, ou dados comerciais
   - Extraia texto quando possível (PDFs legíveis, 
     DOCXs, TXTs)

=====================================================
COLETA — NOTION
=====================================================

Acesse o workspace da TBO via API do Notion.

A) BD Projetos | TBO (database)
   URL: https://www.notion.so/1f3b27ff29e381d9ba39ea23ea3d87e3
   - Extraia TODOS os registros com todas as propriedades
   - Para CADA projeto, abra a página e extraia TODO 
     o conteúdo interno (blocos de texto, checklists, 
     tabelas, menções, links, tudo)
   - Não pule nenhum projeto

B) Conteúdo estratégico (extraia texto completo):
   - "BRANDING NA TBO" 
     https://www.notion.so/1cab27ff29e380b28fe4d7383dddf70b
   - "MARKETING NA TBO"
     https://www.notion.so/1fab27ff29e380b0813dcfaa3fc47ec3
   - "MÉTODO TBO DE LANÇAMENTOS"
     https://www.notion.so/207b27ff29e3803381aefa5c403a3782
   - "Sexy Canvas – Prospecção Comercial TBO"
     https://www.notion.so/1dfb27ff29e3808d9016f7e1bdd07da4
   - "RELATÓRIO COMERCIAL TBO"
     https://www.notion.so/2a3b27ff29e380c989efea34533faafd
   - "GAMIFICAÇÃO NA TBO"
     https://www.notion.so/1fab27ff29e380d99238f3ca1ba0ea4e

C) BD Regra de Negócios | TBO
   https://www.notion.so/2beb27ff29e380ebb7e3f4ec0f9a75c4

D) BD Produtos | TBO
   https://www.notion.so/1f1b27ff29e38001b08dd89dfb14fc65

E) BD Demandas | TBO
   https://www.notion.so/1fab27ff29e380ce908ddc792f29dae9

F) BD Pessoas | TBO
   https://www.notion.so/2c5b27ff29e380359361d0145f2bda2c

G) Gestão Comercial
   https://www.notion.so/237083f5f949400a907f04cb07bf5e55

H) Qualquer outra database ou página relevante 
   encontrada ao navegar

=====================================================
ORGANIZAÇÃO DOS DADOS
=====================================================

Salve tudo em data/context-data.json com esta estrutura:

{
  "metadata": {
    "collected_at": "ISO date",
    "drive_last_scan": "ISO date",
    "notion_last_scan": "ISO date",
    "total_projects_active": N,
    "total_projects_finished": N,
    "total_documents": N
  },
  "projects_active": [
    {
      "name": "...",
      "source": "drive|notion|both",
      "drive_data": { ... },
      "notion_data": { ... },
      "phase": "...",
      "last_activity": "ISO date",
      "deliverables": [...],
      "client": "...",
      "bus": [...]
    }
  ],
  "projects_finished": [ ... mesmo formato ... ],
  "methodologies": {
    "branding": "texto completo...",
    "marketing": "texto completo...",
    "lancamentos": "texto completo...",
    "sexy_canvas": "texto completo...",
    "gamificacao": "texto completo..."
  },
  "commercial": {
    "report": "texto do relatório comercial...",
    "management": "texto da gestão comercial...",
    "proposals_found": [
      { "name": "...", "path": "...", "content_preview": "..." }
    ]
  },
  "products": [ ... do BD Produtos ... ],
  "business_rules": [ ... do BD Regra de Negócios ... ],
  "team": [ ... do BD Pessoas ... ],
  "demands": [ ... do BD Demandas ... ],
  "brand_guidelines": {
    "tone_of_voice": "...",
    "visual_identity": "...",
    "key_messages": [...]
  },
  "folder_template": {
    "standard_structure": [...] 
    // estrutura padrão identificada nos projetos
  }
}

=====================================================
ATUALIZAÇÃO DO SYSTEM PROMPT
=====================================================

Atualize config.js incorporando os dados coletados 
no system prompt base. Use context windowing:

- O prompt base (sempre incluído) tem: identidade TBO, 
  lista de projetos (nomes e status), metodologias 
  resumidas, equipe, produtos, regras de negócio
- Cada módulo injeta contexto adicional conforme necessidade

Se o conteúdo total for muito grande pro system prompt:
- Resuma metodologias mantendo conceitos-chave
- Liste projetos com dados essenciais (nome, cliente, 
  status, BU) sem todo o conteúdo de página
- O conteúdo completo fica no JSON e é injetado 
  sob demanda quando o usuário seleciona um projeto

=====================================================
ATUALIZAÇÃO DA INTERFACE
=====================================================

No header, atualize os indicadores:
- Dados TBO: "Sincronizado ✓ dd/mm/aaaa" (em verde)

No módulo Configurações > Contexto & Dados:
- context-data.json: "X projetos ativos | Y finalizados | Z documentos"
- Botão "Visualizar" agora mostra dados reais
- Botão "Editar" permite edição

=====================================================
OBSERVAÇÕES
=====================================================

- Se uma pasta do Drive não estiver acessível (offline), 
  registre no JSON como "inaccessible" e continue
- Se uma página do Notion der erro, registre e continue
- Priorize completude sobre velocidade
- Execute tudo sem pausas para confirmação
```

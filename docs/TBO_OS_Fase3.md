# TBO OS — FASE 3 de 7
# Coleta de Dados: Fireflies (Reuniões)
# Tempo estimado: 15-30 minutos

> **Pré-requisito:** Fases 1 e 2 concluídas
> **Ao terminar:** abra o .bat. Vá em Configurações.
> O meetings-data.json deve estar preenchido.
> O indicador "Fireflies" no header deve estar verde.

---

```
Você é um engenheiro de software full-stack sênior.
Estamos construindo o TBO OS em fases. Esta é a FASE 3.

As Fases 1-2 já foram executadas. A aplicação existe em:
[ÁREA DE TRABALHO DO USUÁRIO]\TBO_OS\

NÃO recrie ou modifique arquivos que já funcionam. Apenas:
1. Colete dados do Fireflies
2. Preencha meetings-data.json
3. Atualize indicadores de status
4. Enriqueça o system prompt em config.js com contexto de reuniões

=====================================================
COLETA — FIREFLIES
=====================================================

Conta: marco@agenciatbo.com.br (admin, 3200+ minutos)

A) Colete TODAS as reuniões disponíveis.
   Use paginação: limit=50, skip=0, depois skip=50, 100, etc.
   Continue até não retornar mais resultados.

   Para CADA reunião extraia:
   - id, título, data (dateString), duração
   - participantes (emails + nomes quando disponíveis)
   - organizador
   - link da reunião
   - resumo completo (short summary)
   - keywords
   - action items (por pessoa, com timestamps)

   Para reuniões importantes (duration > 15min E com 
   participantes externos OU título contendo nomes de 
   projetos conhecidos do context-data.json), busque 
   também o transcript completo via fireflies_fetch 
   ou fireflies_get_transcript.

B) Classifique CADA reunião automaticamente:
   
   Regras de classificação:
   - "cliente": presença de emails que NÃO são @agenciatbo.com.br 
     e NÃO são @wearetbo.com.br (exceto freelancers conhecidos)
   - "daily_socios": apenas marco@ + ruy@ presentes
   - "alinhamento_interno": só emails @agenciatbo.com.br 
     ou @wearetbo.com.br, sem clientes
   - "review_projeto": título contém "review", "revisão", 
     "alinhamento" + nome de projeto
   - "estrategia": título contém "academy", "BP", 
     "estratégia", "comercial", "planejamento"
   - "producao": título contém "3D", "digital", "branding", 
     "produção", ou reuniões com freelancers de produção
   - "audio_whatsapp": duração < 2 minutos, sem link de meeting
   - Se não encaixar em nenhuma: "outros"

C) Consolide por PROJETO:
   Cruze com os projetos do context-data.json.
   Para cada projeto que aparece em reuniões, consolide:
   - Lista de reuniões relacionadas (IDs + datas)
   - Decisões tomadas (extrair dos summaries)
   - Action items pendentes
   - Action items concluídos (mencionados como feitos 
     em reuniões posteriores)
   - Feedbacks de cliente (se reunião classificada como "cliente")
   - Direcionamentos criativos/estratégicos

D) Consolide por CLIENTE/CONSTRUTORA:
   Para cada construtora/cliente identificado:
   - Total de reuniões
   - Período do relacionamento (primeira → última reunião)
   - Pessoas-chave (quem participa sempre)
   - Temas recorrentes
   - Tom do relacionamento (extrair do contexto dos summaries)
   - Última interação

E) Extraia PADRÕES GLOBAIS:
   - Top 10 temas recorrentes nas dailys de sócios
   - Preocupações estratégicas frequentes
   - Vocabulário e expressões do Marco 
     (palavras/frases que aparecem repetidamente nos summaries)
   - Dinâmica Marco ↔ Ruy (quem decide o quê)
   - Dados financeiros mencionados (receitas, projeções, 
     custos, valuations — NÃO inventar, só extrair se explícito)
   - Problemas recorrentes (prazo, equipe, qualidade, etc.)

=====================================================
ESTRUTURA DO meetings-data.json
=====================================================

{
  "metadata": {
    "collected_at": "ISO date",
    "total_meetings": N,
    "total_minutes": N,
    "date_range": { "from": "ISO", "to": "ISO" },
    "account_email": "marco@agenciatbo.com.br"
  },
  "meetings": [
    {
      "id": "...",
      "title": "...",
      "date": "ISO",
      "duration_minutes": N,
      "category": "cliente|daily_socios|alinhamento_interno|...",
      "organizer": "email",
      "participants": [
        { "email": "...", "name": "...", "is_tbo": true/false }
      ],
      "meeting_link": "...",
      "summary": "texto completo do resumo",
      "keywords": [...],
      "action_items": [
        {
          "person": "...",
          "task": "...",
          "timestamp": "...",
          "status": "pending|likely_done"
        }
      ],
      "related_projects": ["nome do projeto", ...],
      "related_clients": ["nome da construtora", ...]
    }
  ],
  "by_project": {
    "Portofino": {
      "meetings": ["id1", "id2", ...],
      "decisions": ["decisão 1", "decisão 2", ...],
      "pending_actions": [...],
      "client_feedback": [...],
      "creative_direction": [...]
    }
  },
  "by_client": {
    "Construtora Pessoa": {
      "total_meetings": N,
      "relationship_period": { "from": "ISO", "to": "ISO" },
      "key_contacts": ["nome (email)", ...],
      "recurring_topics": [...],
      "last_interaction": "ISO"
    }
  },
  "patterns": {
    "recurring_topics_daily": [...],
    "strategic_concerns": [...],
    "marco_vocabulary": [...],
    "marco_ruy_dynamics": "...",
    "financial_mentions": [...],
    "recurring_problems": [...]
  },
  "CONFIDENTIAL": true
}

=====================================================
ATUALIZAÇÃO DO SYSTEM PROMPT
=====================================================

Adicione ao system prompt em config.js uma seção:

INTELIGÊNCIA DE REUNIÕES:
- Resumo dos padrões encontrados
- Lista de clientes com status do relacionamento
- Action items pendentes mais relevantes
- Vocabulário do Marco (pra tom de voz do LinkedIn)
- Insights financeiros mencionados

NÃO coloque transcrições inteiras no system prompt.
Coloque resumos e padrões. O conteúdo completo fica 
no JSON e é injetado sob demanda.

=====================================================
ATUALIZAÇÃO DA INTERFACE
=====================================================

Header: Fireflies → "Sincronizado ✓ dd/mm | X reuniões"

Configurações > Fireflies:
- Status: "Sincronizado"
- Total de reuniões: N
- Período: dd/mm/aaaa a dd/mm/aaaa
- Categorias encontradas com contagem
- Botão "Visualizar reuniões" (mostra lista)
- Botão "Re-sincronizar"

Configurações > Contexto & Dados:
- meetings-data.json: "X reuniões | Y minutos | Z clientes"

Execute tudo sem pausas para confirmação.
Se o Fireflies limitar requisições, respeite os limites 
e colete o máximo possível.
```

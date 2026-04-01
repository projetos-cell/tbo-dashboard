# Plano: Calendario integrado com Google Calendar no /servicos

## Contexto
O `/servicos` tem um CalendarWidget com dados hardcoded. Ja existe:
- `useCalendarEvents(timeMin, timeMax)` — hook React Query que busca do Supabase
- `calendar_events` tabela com campos `google_event_id`, `source`
- `getMonthRange()`, `getWeekRange()` helpers
- MCP Google Calendar disponivel (`gcal_list_events`, `gcal_respond_to_event`)

## Abordagem
Substituir o CalendarWidget estatico por um componente que usa dados reais do Supabase (`useCalendarEvents`), mantem o visual glassmorphism atual, e adiciona skeletons + empty state.

**NAO vamos** implementar sync bidirecional com Google Calendar API neste momento (requer OAuth flow complexo). Vamos usar os dados que ja estao no Supabase `calendar_events`.

## Arquivos a alterar

### 1. `frontend/app/(hub)/servicos/page.tsx`
- Remover constantes hardcoded `CALENDAR`
- Substituir `CalendarWidget` por novo componente que:
  - Usa `useCalendarEvents` para buscar eventos do dia/semana
  - Calcula grid do mini-calendario dinamicamente (mes atual)
  - Marca dias com eventos com dot indicator
  - Lista proximos 3 eventos do dia com horario
  - Mostra skeleton enquanto carrega
  - Mostra empty state se nao ha eventos
  - Link "Ver todos" aponta para `/agenda`

### 2. Logica do mini-calendario
- Gerar grid de dias do mes atual dinamicamente
- Highlight hoje com orange circle (ja existe)
- Dot abaixo de dias que tem eventos
- Navegacao prev/next mes com state local

### 3. Lista de eventos
- Buscar eventos de hoje ate fim do dia
- Mostrar titulo truncado + horario formatado (HH:mm)
- Se evento tem `google_event_id`, mostrar icone Google
- Indicador visual de "agora" para evento em andamento

## Steps
1. Importar `useCalendarEvents` e helpers no page
2. Reescrever `CalendarWidget` como componente com state + query
3. Adicionar skeleton loading
4. Adicionar empty state
5. Testar build + preview

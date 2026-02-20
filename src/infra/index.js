/**
 * TBO OS — Infra Barrel Export
 *
 * Ordem de carregamento:
 * 1. src/infra/supabase/client.js        (TBO_DB — single client)
 * 2. src/infra/http/fetcher.js            (TBO_HTTP)
 * 3. src/infra/supabase/storage/index.js  (TBO_STORAGE)
 * 4. src/infra/supabase/queries/_base.js    (RepoBase — shared helpers)
 * 5. src/infra/supabase/queries/projects.js  (ProjectsRepo)
 * 5. src/infra/supabase/queries/people.js    (PeopleRepo)
 * 6. src/infra/supabase/queries/finance.js   (FinanceRepo)
 * 7. src/infra/supabase/queries/chat.js      (ChatRepo)
 * 8. src/infra/supabase/queries/crm.js       (CrmRepo)
 * 9. src/infra/supabase/queries/audit.js     (AuditRepo)
 * 10. src/infra/integrations/rdstation/index.js
 * 11. src/infra/integrations/omie/index.js
 * 12. src/infra/integrations/fireflies/index.js
 * 13. src/infra/integrations/google-calendar/index.js
 */

-- ============================================================
-- IT Helpdesk / Service Desk
-- Tabelas: helpdesk_tickets, helpdesk_comments, helpdesk_faqs
-- ============================================================

-- ── Tickets ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS helpdesk_tickets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        NOT NULL REFERENCES tenants(id),
  created_by  UUID        NOT NULL REFERENCES profiles(id),
  assigned_to UUID        REFERENCES profiles(id),
  title       TEXT        NOT NULL,
  description TEXT,
  category    TEXT        NOT NULL DEFAULT 'geral',
  priority    TEXT        NOT NULL DEFAULT 'media'
              CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
  status      TEXT        NOT NULL DEFAULT 'aberto'
              CHECK (status IN ('aberto', 'em_andamento', 'aguardando', 'resolvido', 'fechado')),
  sla_due_at  TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Comments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS helpdesk_comments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID        NOT NULL REFERENCES helpdesk_tickets(id) ON DELETE CASCADE,
  author_id   UUID        NOT NULL REFERENCES profiles(id),
  body        TEXT        NOT NULL,
  is_internal BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── FAQs ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS helpdesk_faqs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        NOT NULL REFERENCES tenants(id),
  question    TEXT        NOT NULL,
  answer      TEXT        NOT NULL,
  category    TEXT        NOT NULL DEFAULT 'geral',
  sort_order  INT         NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_tenant     ON helpdesk_tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_created_by ON helpdesk_tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_status     ON helpdesk_tickets(status);
CREATE INDEX IF NOT EXISTS idx_helpdesk_comments_ticket    ON helpdesk_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_helpdesk_faqs_tenant        ON helpdesk_faqs(tenant_id);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE helpdesk_tickets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpdesk_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpdesk_faqs     ENABLE ROW LEVEL SECURITY;

-- ─ Tickets: select (own + staff)
CREATE POLICY "helpdesk_tickets_read" ON helpdesk_tickets
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      created_by = auth.uid()
      OR assigned_to = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('founder', 'diretoria', 'lider')
      )
    )
  );

-- ─ Tickets: insert (any authenticated user creates own ticket)
CREATE POLICY "helpdesk_tickets_insert" ON helpdesk_tickets
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- ─ Tickets: update (creator closes/comments; staff does everything)
CREATE POLICY "helpdesk_tickets_update" ON helpdesk_tickets
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('founder', 'diretoria', 'lider')
    )
  );

-- ─ Comments: select (non-internal visible to ticket owner; internal only for staff)
CREATE POLICY "helpdesk_comments_read" ON helpdesk_comments
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      (NOT is_internal AND EXISTS (
        SELECT 1 FROM helpdesk_tickets t
        WHERE t.id = ticket_id AND (
          t.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
              AND p.role IN ('founder', 'diretoria', 'lider')
          )
        )
      ))
      OR (is_internal AND EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('founder', 'diretoria', 'lider')
      ))
    )
  );

-- ─ Comments: insert (author = current user)
CREATE POLICY "helpdesk_comments_insert" ON helpdesk_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- ─ FAQs: select (all authenticated)
CREATE POLICY "helpdesk_faqs_read" ON helpdesk_faqs
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ─ FAQs: manage (founder + diretoria only)
CREATE POLICY "helpdesk_faqs_manage" ON helpdesk_faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('founder', 'diretoria')
    )
  );

-- ── Seed: FAQ exemplos ────────────────────────────────────────
-- (Executado somente se tenant existir — usa DO block)
DO $$
DECLARE
  v_tenant UUID;
BEGIN
  SELECT id INTO v_tenant FROM tenants LIMIT 1;
  IF v_tenant IS NOT NULL THEN
    INSERT INTO helpdesk_faqs (tenant_id, question, answer, category, sort_order)
    VALUES
      (v_tenant, 'Como solicito acesso a um sistema?',
       'Abra um chamado nesta página, escolha a categoria "Acessos" e descreva qual sistema precisa de acesso. O time de TI responderá em até 1 dia útil.',
       'acessos', 1),
      (v_tenant, 'Meu computador está lento, o que faço?',
       'Tente reiniciar o computador primeiro. Se o problema persistir, abra um chamado com a categoria "Hardware" descrevendo o sintoma e o modelo do equipamento.',
       'hardware', 2),
      (v_tenant, 'Como configuro minha assinatura de e-mail?',
       'Acesse as configurações do Gmail > Geral > Assinatura e use o template disponível na pasta "Templates TBO" no Google Drive.',
       'email', 3),
      (v_tenant, 'Esqueci minha senha, como recupero?',
       'Clique em "Esqueci minha senha" na tela de login. O link de redefinição será enviado para o seu e-mail corporativo.',
       'acessos', 4),
      (v_tenant, 'Como solicito um novo equipamento?',
       'Abra um chamado com a categoria "Hardware" e justifique a necessidade. Pedidos são avaliados mensalmente pela diretoria.',
       'hardware', 5)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

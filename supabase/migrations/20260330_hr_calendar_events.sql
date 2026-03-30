-- ============================================================================
-- HR Calendar Events — Calendario RH (feriados, ciclos, eventos institucionais)
-- ============================================================================

CREATE TABLE IF NOT EXISTS hr_calendar_events (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title            TEXT NOT NULL,
    description      TEXT,
    category         TEXT NOT NULL CHECK (category IN (
        'feriado','ciclo_gestao','treinamento','evento','recesso','data_comemorativa'
    )),
    start_date       DATE NOT NULL,
    end_date         DATE,
    is_all_day       BOOLEAN DEFAULT true,
    recurrence_rule  TEXT,          -- RRULE string, ex: FREQ=YEARLY
    color            TEXT,          -- hex override (nullable, usa default por categoria)
    visibility       TEXT DEFAULT 'all' CHECK (visibility IN ('all','leadership')),
    created_by       UUID REFERENCES auth.users(id),
    created_at       TIMESTAMPTZ DEFAULT now(),
    updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hr_cal_events_dates ON hr_calendar_events (tenant_id, start_date);
CREATE INDEX idx_hr_cal_events_category ON hr_calendar_events (tenant_id, category);

-- Trigger updated_at
CREATE TRIGGER set_hr_calendar_events_updated_at
    BEFORE UPDATE ON hr_calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_set_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────────────
ALTER TABLE hr_calendar_events ENABLE ROW LEVEL SECURITY;

-- Todos do tenant podem ler
CREATE POLICY "hr_cal_select"
    ON hr_calendar_events FOR SELECT
    USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Apenas admin (founder/diretoria) pode inserir
CREATE POLICY "hr_cal_insert"
    ON hr_calendar_events FOR INSERT
    WITH CHECK (
        tenant_id IN (SELECT get_user_tenant_ids())
        AND get_current_user_role() = ANY(ARRAY['founder','diretoria','admin'])
    );

-- Apenas admin pode atualizar
CREATE POLICY "hr_cal_update"
    ON hr_calendar_events FOR UPDATE
    USING (
        tenant_id IN (SELECT get_user_tenant_ids())
        AND get_current_user_role() = ANY(ARRAY['founder','diretoria','admin'])
    );

-- Apenas admin pode deletar
CREATE POLICY "hr_cal_delete"
    ON hr_calendar_events FOR DELETE
    USING (
        tenant_id IN (SELECT get_user_tenant_ids())
        AND get_current_user_role() = ANY(ARRAY['founder','diretoria','admin'])
    );

-- ── Seed: Feriados Nacionais BR 2026 ───────────────────────────────────
-- Nota: tenant_id precisa ser ajustado para o tenant real.
-- Os feriados fixos tem recurrence_rule='FREQ=YEARLY'.
-- Feriados moveis (Carnaval, Sexta-Santa, Corpus Christi) sao por ano.

DO $$
DECLARE
    v_tenant UUID;
BEGIN
    SELECT id INTO v_tenant FROM tenants LIMIT 1;
    IF v_tenant IS NULL THEN RETURN; END IF;

    -- Feriados fixos (recorrentes anualmente)
    INSERT INTO hr_calendar_events (tenant_id, title, category, start_date, recurrence_rule) VALUES
        (v_tenant, 'Confraternização Universal',    'feriado', '2026-01-01', 'FREQ=YEARLY'),
        (v_tenant, 'Tiradentes',                    'feriado', '2026-04-21', 'FREQ=YEARLY'),
        (v_tenant, 'Dia do Trabalho',               'feriado', '2026-05-01', 'FREQ=YEARLY'),
        (v_tenant, 'Independência do Brasil',       'feriado', '2026-09-07', 'FREQ=YEARLY'),
        (v_tenant, 'Nossa Sra. Aparecida',          'feriado', '2026-10-12', 'FREQ=YEARLY'),
        (v_tenant, 'Finados',                       'feriado', '2026-11-02', 'FREQ=YEARLY'),
        (v_tenant, 'Proclamação da República',      'feriado', '2026-11-15', 'FREQ=YEARLY'),
        (v_tenant, 'Consciência Negra',             'feriado', '2026-11-20', 'FREQ=YEARLY'),
        (v_tenant, 'Natal',                         'feriado', '2026-12-25', 'FREQ=YEARLY');

    -- Feriados móveis 2026 (sem recorrência — datas mudam a cada ano)
    INSERT INTO hr_calendar_events (tenant_id, title, category, start_date, end_date) VALUES
        (v_tenant, 'Carnaval',                      'feriado', '2026-02-16', '2026-02-17'),
        (v_tenant, 'Quarta-feira de Cinzas',        'feriado', '2026-02-18', NULL),
        (v_tenant, 'Sexta-feira Santa',             'feriado', '2026-04-03', NULL),
        (v_tenant, 'Corpus Christi',                'feriado', '2026-06-04', NULL);

    -- Ciclos de gestão comuns
    INSERT INTO hr_calendar_events (tenant_id, title, category, start_date, end_date, description) VALUES
        (v_tenant, 'Avaliação de Desempenho Q1',    'ciclo_gestao', '2026-04-01', '2026-04-15', 'Ciclo de avaliação do primeiro trimestre'),
        (v_tenant, 'Avaliação de Desempenho Q2',    'ciclo_gestao', '2026-07-01', '2026-07-15', 'Ciclo de avaliação do segundo trimestre'),
        (v_tenant, 'Avaliação de Desempenho Q3',    'ciclo_gestao', '2026-10-01', '2026-10-15', 'Ciclo de avaliação do terceiro trimestre'),
        (v_tenant, 'Pesquisa de Clima Anual',       'ciclo_gestao', '2026-06-01', '2026-06-14', 'Pesquisa anual de clima organizacional');

END $$;

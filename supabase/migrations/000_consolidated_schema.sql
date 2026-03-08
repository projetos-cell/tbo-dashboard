-- ============================================================================
-- TBO OS — CONSOLIDATED SCHEMA
-- Generated: 2026-03-08
-- Source: migrations 001 through 086 (squashed into final state)
--
-- This single migration replaces all 86 individual migrations.
-- It represents the complete final schema of the TBO OS database.
--
-- CONTENTS:
--   1. Extensions
--   2. Helper functions (used by tables/RLS/triggers)
--   3. Core tables: tenants, roles, tenant_members, profiles
--   4. RBAC tables: role_permissions, permissions, project_memberships
--   5. Audit tables: audit_logs, collaborator_history, changelog_entries
--   6. Integration tables: integration_configs, sync_logs, omie_sync_log
--   7. Sidebar / workspace tables
--   8. Chat tables
--   9. Finance tables (legacy fin_* + new finance_*)
--  10. Academy tables
--  11. Market research tables
--  12. Document / template / digest tables
--  13. Project tables
--  14. Meeting tables
--  15. People domain tables (teams, talents, vacancies, contracts, culture,
--      1:1s, performance, recognitions, rewards, PDIs, skills)
--  16. Page blocks + block links
--  17. Inbox notifications
--  18. Custom databases (Notion-style)
--  19. Reports (schedules + runs)
--  20. Client portal tables
--  21. RSM (social media) tables
--  22. Demands + OS core tables
--  23. OKRs (objectives, key results, check-ins, cycles, comments)
--  24. Ritual types + user preferences
--  25. Scorecard tables
--  26. Alerts / notifications / thread subscriptions
--  27. RD Station + Fireflies + Reportei config/sync
--  28. Chat v2 enhancements + RPCs
--  29. DRE settings + fin_cash_entries
--  30. All RLS policies, indexes, triggers
--  31. Realtime publication
-- ============================================================================


-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

-- moddatetime is used by some triggers (available in Supabase by default)
-- CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;


-- ============================================================================
-- 2. HELPER FUNCTIONS
-- ============================================================================

-- ── update_updated_at_column ─────────────────────────────────────────────────
-- Generic trigger function to set updated_at = now() on UPDATE.
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── get_user_tenant_ids() ────────────────────────────────────────────────────
-- Returns all tenant_ids for the authenticated user.
-- Used in virtually ALL RLS policies based on tenant_id.
DROP FUNCTION IF EXISTS get_user_tenant_ids() CASCADE;
CREATE OR REPLACE FUNCTION get_user_tenant_ids()
RETURNS SETOF UUID AS $$
  SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── get_user_role_in_tenant(p_tenant_id UUID) ────────────────────────────────
-- Returns the role slug for the authenticated user in a specific tenant.
DROP FUNCTION IF EXISTS get_user_role_in_tenant(UUID) CASCADE;
CREATE OR REPLACE FUNCTION get_user_role_in_tenant(p_tenant_id UUID)
RETURNS TEXT AS $$
  SELECT r.slug
  FROM tenant_members tm
  JOIN roles r ON r.id = tm.role_id
  WHERE tm.user_id = auth.uid()
    AND tm.tenant_id = p_tenant_id
    AND tm.is_active = true
  LIMIT 1
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── get_user_role_in_tenant(p_user_id UUID, p_tenant_id UUID) ────────────────
-- Returns full role info (name, label, permissions JSONB) for a specific user+tenant.
DROP FUNCTION IF EXISTS get_user_role_in_tenant(UUID, UUID) CASCADE;
CREATE OR REPLACE FUNCTION get_user_role_in_tenant(p_user_id UUID, p_tenant_id UUID)
RETURNS TABLE(role_name TEXT, role_label TEXT, permissions JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.slug AS role_name,
        r.name AS role_label,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'module', rp.module,
                        'can_view', rp.can_view,
                        'can_create', rp.can_create,
                        'can_edit', rp.can_edit,
                        'can_delete', rp.can_delete,
                        'can_export', rp.can_export
                    )
                )
                FROM role_permissions rp
                WHERE rp.role_id = r.id
            ),
            '[]'::jsonb
        ) AS permissions
    FROM tenant_members tm
    JOIN roles r ON r.id = tm.role_id
    WHERE tm.user_id = p_user_id
      AND tm.tenant_id = p_tenant_id
      AND tm.is_active = true
    LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_role_in_tenant(UUID, UUID) TO authenticated;

-- ── is_founder_or_admin() ────────────────────────────────────────────────────
-- Returns TRUE if user is founder/admin/owner in ANY tenant they belong to.
DROP FUNCTION IF EXISTS is_founder_or_admin() CASCADE;
CREATE OR REPLACE FUNCTION is_founder_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM tenant_members tm
    JOIN roles r ON r.id = tm.role_id
    WHERE tm.user_id = auth.uid()
      AND tm.is_active = true
      AND r.slug IN ('admin', 'socio', 'founder', 'owner')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── is_finance_admin(p_tenant_id UUID) ───────────────────────────────────────
-- Returns TRUE if user has founder/owner/diretoria role in the given tenant.
-- Used by the finance_* table RLS policies.
DROP FUNCTION IF EXISTS is_finance_admin(UUID) CASCADE;
CREATE OR REPLACE FUNCTION is_finance_admin(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM tenant_members tm
    JOIN roles r ON r.id = tm.role_id
    WHERE tm.user_id = auth.uid()
      AND tm.tenant_id = p_tenant_id
      AND tm.is_active = TRUE
      AND r.slug IN ('founder', 'owner', 'diretoria')
  );
$$;

GRANT EXECUTE ON FUNCTION is_finance_admin(UUID) TO authenticated;

COMMENT ON FUNCTION is_finance_admin(UUID) IS
  'Retorna TRUE se o usuario autenticado tem role founder/owner/diretoria '
  'no tenant informado. Usada nas RLS policies do modulo financeiro.';

-- ── get_session_context(p_tenant_id UUID) ────────────────────────────────────
-- RPC that returns the full user context in a single call.
DROP FUNCTION IF EXISTS get_session_context(UUID) CASCADE;
CREATE OR REPLACE FUNCTION get_session_context(p_tenant_id UUID DEFAULT NULL)
RETURNS JSON AS $$
  SELECT json_build_object(
    'user_id', auth.uid(),
    'tenants', (
      SELECT COALESCE(json_agg(json_build_object(
        'tenant_id', t.id,
        'tenant_name', t.name,
        'tenant_slug', t.slug,
        'role_slug', r.slug,
        'role_name', r.name,
        'is_active', tm.is_active,
        'joined_at', tm.joined_at
      )), '[]'::json)
      FROM tenant_members tm
      JOIN tenants t ON t.id = tm.tenant_id
      LEFT JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.is_active = true
        AND (p_tenant_id IS NULL OR tm.tenant_id = p_tenant_id)
    ),
    'permissions', (
      SELECT COALESCE(json_agg(json_build_object(
        'tenant_id', r.tenant_id,
        'module', rp.module,
        'can_view', rp.can_view,
        'can_create', rp.can_create,
        'can_edit', rp.can_edit,
        'can_delete', rp.can_delete,
        'can_export', rp.can_export
      )), '[]'::json)
      FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      JOIN role_permissions rp ON rp.role_id = r.id
      WHERE tm.user_id = auth.uid()
        AND tm.is_active = true
        AND (p_tenant_id IS NULL OR tm.tenant_id = p_tenant_id)
    ),
    'profile', (
      SELECT row_to_json(p.*)
      FROM profiles p
      WHERE p.id = auth.uid()
    )
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── check_module_access(p_user_id UUID, p_module TEXT) ───────────────────────
-- Checks if user has can_view on a module via role_permissions.
DROP FUNCTION IF EXISTS check_module_access(UUID, TEXT) CASCADE;
CREATE OR REPLACE FUNCTION check_module_access(p_user_id UUID, p_module TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM tenant_members tm
        JOIN role_permissions rp ON rp.role_id = tm.role_id
        WHERE tm.user_id = p_user_id
          AND tm.is_active = true
          AND rp.module = p_module
          AND rp.can_view = true
    )
$$;

GRANT EXECUTE ON FUNCTION check_module_access(UUID, TEXT) TO authenticated;

-- ── log_audit_event() ────────────────────────────────────────────────────────
-- Inserts an audit event, auto-detecting user and tenant.
DROP FUNCTION IF EXISTS log_audit_event(TEXT, TEXT, UUID, JSONB) CASCADE;
CREATE OR REPLACE FUNCTION log_audit_event(
    p_action TEXT,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_log_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT tm.tenant_id INTO v_tenant_id
    FROM tenant_members tm
    WHERE tm.user_id = v_user_id
      AND tm.is_active = true
    LIMIT 1;

    INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, metadata)
    VALUES (v_tenant_id, v_user_id, p_action, p_entity_type, p_entity_id, p_metadata)
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;

GRANT EXECUTE ON FUNCTION log_audit_event(TEXT, TEXT, UUID, JSONB) TO authenticated;

-- ── fn_audit_trigger() ──────────────────────────────────────────────────────
-- Generic AFTER trigger function for automatic audit logging.
-- Detects INSERT/UPDATE/DELETE, captures diffs, logs to audit_logs.
DROP FUNCTION IF EXISTS fn_audit_trigger() CASCADE;
CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_action TEXT;
    v_entity_id UUID;
    v_entity_type TEXT;
    v_tenant_id UUID;
    v_user_id UUID;
    v_metadata JSONB;
    v_old_data JSONB;
    v_new_data JSONB;
BEGIN
    CASE TG_OP
        WHEN 'INSERT' THEN v_action := 'create';
        WHEN 'UPDATE' THEN v_action := 'update';
        WHEN 'DELETE' THEN v_action := 'delete';
        ELSE v_action := lower(TG_OP);
    END CASE;

    v_entity_type := TG_TABLE_NAME;
    v_user_id := auth.uid();

    IF TG_OP = 'DELETE' THEN
        v_entity_id := OLD.id;
        IF TG_TABLE_NAME = 'profiles' THEN
            v_tenant_id := OLD.tenant_id;
        ELSE
            BEGIN
                EXECUTE format('SELECT ($1).%I', 'tenant_id') INTO v_tenant_id USING OLD;
            EXCEPTION WHEN OTHERS THEN
                v_tenant_id := NULL;
            END;
        END IF;
        v_old_data := to_jsonb(OLD);
        v_metadata := jsonb_build_object('old_data', v_old_data);
    ELSIF TG_OP = 'UPDATE' THEN
        v_entity_id := NEW.id;
        IF TG_TABLE_NAME = 'profiles' THEN
            v_tenant_id := NEW.tenant_id;
        ELSE
            BEGIN
                EXECUTE format('SELECT ($1).%I', 'tenant_id') INTO v_tenant_id USING NEW;
            EXCEPTION WHEN OTHERS THEN
                v_tenant_id := NULL;
            END;
        END IF;
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        v_metadata := jsonb_build_object(
            'changed_fields', (
                SELECT COALESCE(jsonb_object_agg(key, jsonb_build_object('old', v_old_data->key, 'new', value)), '{}'::jsonb)
                FROM jsonb_each(v_new_data)
                WHERE v_old_data->key IS DISTINCT FROM v_new_data->key
                  AND key NOT IN ('updated_at', 'created_at')
            )
        );
    ELSE
        v_entity_id := NEW.id;
        IF TG_TABLE_NAME = 'profiles' THEN
            v_tenant_id := NEW.tenant_id;
        ELSE
            BEGIN
                EXECUTE format('SELECT ($1).%I', 'tenant_id') INTO v_tenant_id USING NEW;
            EXCEPTION WHEN OTHERS THEN
                v_tenant_id := NULL;
            END;
        END IF;
        v_metadata := jsonb_build_object('new_data', to_jsonb(NEW));
    END IF;

    IF v_tenant_id IS NULL AND v_user_id IS NOT NULL THEN
        SELECT tm.tenant_id INTO v_tenant_id
        FROM tenant_members tm
        WHERE tm.user_id = v_user_id
          AND tm.is_active = true
        LIMIT 1;
    END IF;

    INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, metadata)
    VALUES (v_tenant_id, v_user_id, v_action, v_entity_type, v_entity_id, v_metadata);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- ── fn_sync_profile_status() ─────────────────────────────────────────────────
-- Syncs profiles.is_active <-> profiles.status for backward compatibility.
DROP FUNCTION IF EXISTS fn_sync_profile_status() CASCADE;
CREATE OR REPLACE FUNCTION fn_sync_profile_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.is_active := NEW.status IN ('active', 'onboarding');
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.is_active IS DISTINCT FROM OLD.is_active AND NEW.status IS NOT DISTINCT FROM OLD.status THEN
    IF NEW.is_active = TRUE THEN
      NEW.status := 'active';
    ELSE
      NEW.status := 'inactive';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── fn_new_member_gets_founder_role() ────────────────────────────────────────
-- Assigns founder role to new tenant_members if no role_id is specified.
DROP FUNCTION IF EXISTS fn_new_member_gets_founder_role() CASCADE;
CREATE OR REPLACE FUNCTION fn_new_member_gets_founder_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_founder_id UUID;
BEGIN
    SELECT id INTO v_founder_id
    FROM roles
    WHERE tenant_id = NEW.tenant_id AND slug = 'founder'
    LIMIT 1;

    IF v_founder_id IS NOT NULL AND NEW.role_id IS NULL THEN
        NEW.role_id = v_founder_id;
    END IF;

    RETURN NEW;
END;
$$;

-- ── fn_auto_add_super_admins_to_space() ──────────────────────────────────────
-- Auto-adds super admins + the creator as owners when a new workspace is created.
DROP FUNCTION IF EXISTS fn_auto_add_super_admins_to_space() CASCADE;
CREATE OR REPLACE FUNCTION fn_auto_add_super_admins_to_space()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_super RECORD;
    v_auth_uid UUID;
BEGIN
    IF NEW.type <> 'workspace' THEN
        RETURN NEW;
    END IF;

    FOR v_super IN
        SELECT u.id AS user_id
        FROM auth.users u
        WHERE u.email IN ('marco@agenciatbo.com.br', 'ruy@agenciatbo.com.br')
    LOOP
        INSERT INTO space_members (tenant_id, space_id, user_id, role)
        VALUES (NEW.tenant_id, NEW.id, v_super.user_id, 'owner')
        ON CONFLICT (tenant_id, space_id, user_id) DO UPDATE SET role = 'owner';
    END LOOP;

    v_auth_uid := auth.uid();
    IF v_auth_uid IS NOT NULL THEN
        INSERT INTO space_members (tenant_id, space_id, user_id, role)
        VALUES (NEW.tenant_id, NEW.id, v_auth_uid, 'owner')
        ON CONFLICT (tenant_id, space_id, user_id) DO UPDATE SET role = 'owner';
    END IF;

    RETURN NEW;
END;
$$;

-- ── fn_deal_stage_automation() ───────────────────────────────────────────────
-- Trigger function: auto-creates project+proposal when deal stage = 'fechado_ganho'.
DROP FUNCTION IF EXISTS fn_deal_stage_automation() CASCADE;
CREATE OR REPLACE FUNCTION public.fn_deal_stage_automation()
RETURNS TRIGGER AS $$
DECLARE
  v_project_id UUID;
  v_proposal_id UUID;
  v_founder_ids UUID[];
BEGIN
  IF OLD.stage = NEW.stage THEN
    RETURN NEW;
  END IF;

  IF NEW.stage = 'fechado_ganho' THEN
    INSERT INTO public.projects (
      name, client, client_company, status, owner_id, owner_name,
      value, services, priority, source, notes
    ) VALUES (
      'Projeto - ' || NEW.name, NEW.contact, NEW.company, 'briefing',
      NEW.owner_id, NEW.owner_name, NEW.value, NEW.services,
      COALESCE(NEW.priority, 'media'), 'deal_automation',
      'Projeto criado automaticamente a partir do deal "' || NEW.name || '"'
    ) RETURNING id INTO v_project_id;

    INSERT INTO public.proposals (
      name, client, company, status, value, services,
      owner_id, owner_name, deal_id, notes
    ) VALUES (
      'Proposta - ' || NEW.name, NEW.contact, NEW.company, 'aprovada',
      NEW.value, NEW.services, NEW.owner_id, NEW.owner_name, NEW.id,
      'Proposta gerada automaticamente pelo deal "' || NEW.name || '"'
    ) RETURNING id INTO v_proposal_id;

    UPDATE public.projects SET proposal_id = v_proposal_id WHERE id = v_project_id;

    INSERT INTO public.audit_log (
      entity_type, entity_id, entity_name, action,
      from_state, to_state, user_id, user_name, reason, metadata
    ) VALUES (
      'deal', NEW.id::TEXT, NEW.name, 'stage_change',
      OLD.stage, NEW.stage, NEW.owner_id, NEW.owner_name,
      'Deal fechado ganho - projeto e proposta criados automaticamente',
      jsonb_build_object('project_id', v_project_id, 'proposal_id', v_proposal_id, 'deal_value', NEW.value, 'company', NEW.company)
    );

    IF NEW.owner_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, body, type, entity_type, entity_id, action_url)
      VALUES (NEW.owner_id, 'Deal Fechado!', 'O deal "' || NEW.name || '" foi fechado com sucesso!', 'success', 'deal', NEW.id::TEXT, '#projetos');
    END IF;

    SELECT ARRAY_AGG(id) INTO v_founder_ids
    FROM public.profiles WHERE role = 'founder' AND id != COALESCE(NEW.owner_id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF v_founder_ids IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, body, type, entity_type, entity_id, action_url)
      SELECT unnest(v_founder_ids), 'Novo Deal Fechado!',
        'O deal "' || NEW.name || '" (R$ ' || COALESCE(NEW.value::TEXT, '0') || ') foi fechado.',
        'success', 'deal', NEW.id::TEXT, '#projetos';
    END IF;

  ELSIF NEW.stage = 'fechado_perdido' THEN
    INSERT INTO public.audit_log (entity_type, entity_id, entity_name, action, from_state, to_state, user_id, user_name, reason, metadata)
    VALUES ('deal', NEW.id::TEXT, NEW.name, 'stage_change', OLD.stage, NEW.stage, NEW.owner_id, NEW.owner_name, 'Deal perdido', jsonb_build_object('deal_value', NEW.value, 'company', NEW.company));

    IF NEW.owner_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, body, type, entity_type, entity_id)
      VALUES (NEW.owner_id, 'Deal Perdido', 'O deal "' || NEW.name || '" foi marcado como perdido.', 'warning', 'deal', NEW.id::TEXT);
    END IF;

  ELSE
    INSERT INTO public.audit_log (entity_type, entity_id, entity_name, action, from_state, to_state, user_id, user_name, metadata)
    VALUES ('deal', NEW.id::TEXT, NEW.name, 'stage_change', OLD.stage, NEW.stage, NEW.owner_id, NEW.owner_name, jsonb_build_object('deal_value', NEW.value));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── fn_auto_version_document() ───────────────────────────────────────────────
DROP FUNCTION IF EXISTS fn_auto_version_document() CASCADE;
CREATE OR REPLACE FUNCTION public.fn_auto_version_document()
RETURNS TRIGGER AS $$
DECLARE
  v_max_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version), 0) INTO v_max_version
  FROM public.document_versions
  WHERE document_id = NEW.document_id;

  NEW.version := v_max_version + 1;

  UPDATE public.document_versions
  SET is_current = FALSE
  WHERE document_id = NEW.document_id AND is_current = TRUE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── check_permission() ──────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS check_permission(UUID, TEXT, TEXT) CASCADE;
CREATE OR REPLACE FUNCTION check_permission(p_user_id UUID, p_module TEXT, p_action TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM tenant_members tm
        JOIN role_permissions rp ON rp.role_id = tm.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE tm.user_id = p_user_id
          AND tm.is_active = true
          AND p.module = p_module
          AND p.action = p_action
          AND rp.granted = true
    )
$$;

GRANT EXECUTE ON FUNCTION check_permission(UUID, TEXT, TEXT) TO authenticated;

-- ── get_user_permissions() ──────────────────────────────────────────────────
-- FINAL version from migration 042 (plpgsql, with fallback)
DROP FUNCTION IF EXISTS get_user_permissions(UUID) CASCADE;
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE(module TEXT, action TEXT, granted BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        p.module,
        p.action,
        rp.granted
    FROM tenant_members tm
    JOIN role_permissions rp ON rp.role_id = tm.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE tm.user_id = p_user_id
      AND rp.granted = true;

    IF NOT FOUND THEN
        RETURN QUERY
        SELECT DISTINCT
            rp.module,
            'view'::TEXT AS action,
            true AS granted
        FROM tenant_members tm
        JOIN role_permissions rp ON rp.role_id = tm.role_id
        WHERE tm.user_id = p_user_id
          AND rp.can_view = true
          AND rp.permission_id IS NULL;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_permissions(UUID) TO authenticated;

-- ── get_all_roles_with_permissions() ─────────────────────────────────────────
DROP FUNCTION IF EXISTS get_all_roles_with_permissions(UUID) CASCADE;
CREATE OR REPLACE FUNCTION get_all_roles_with_permissions(p_tenant_id UUID)
RETURNS TABLE(
    role_id UUID,
    role_slug TEXT,
    role_name TEXT,
    role_label TEXT,
    role_color TEXT,
    role_sort_order INT,
    is_system BOOLEAN,
    permissions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id AS role_id,
        r.slug AS role_slug,
        r.name AS role_name,
        r.label AS role_label,
        r.color AS role_color,
        r.sort_order AS role_sort_order,
        r.is_system,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'permission_id', p.id,
                        'module', p.module,
                        'action', p.action,
                        'granted', rp.granted
                    )
                    ORDER BY p.sort_order
                )
                FROM role_permissions rp
                JOIN permissions p ON p.id = rp.permission_id
                WHERE rp.role_id = r.id AND rp.granted = true
            ),
            '[]'::jsonb
        ) AS permissions
    FROM roles r
    WHERE r.tenant_id = p_tenant_id
    ORDER BY r.sort_order;
END;
$$;

GRANT EXECUTE ON FUNCTION get_all_roles_with_permissions(UUID) TO authenticated;

-- ── get_people_kpis() ────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS get_people_kpis(UUID) CASCADE;
CREATE OR REPLACE FUNCTION get_people_kpis(p_tenant_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result JSON;
BEGIN
  WITH
  all_people AS (
    SELECT id, status, media_avaliacao
    FROM profiles WHERE tenant_id = p_tenant_id
  ),
  active_people AS (
    SELECT id, media_avaliacao FROM all_people WHERE status = 'active'
  ),
  at_risk AS (
    SELECT COUNT(DISTINCT ap.id) AS cnt
    FROM active_people ap
    LEFT JOIN pdis pd ON pd.person_id = ap.id AND pd.tenant_id = p_tenant_id
    WHERE (ap.media_avaliacao IS NOT NULL AND ap.media_avaliacao < 60)
       OR pd.status = 'Atrasado'
  ),
  last_1on1 AS (
    SELECT o.collaborator_id AS person_id, MAX(o.scheduled_at) AS last_at
    FROM one_on_ones o
    WHERE o.tenant_id = p_tenant_id AND o.status = 'completed'
    GROUP BY o.collaborator_id
  ),
  pending_1on1 AS (
    SELECT COUNT(*) AS cnt
    FROM active_people ap
    LEFT JOIN last_1on1 l ON l.person_id = ap.id
    WHERE l.last_at IS NULL OR l.last_at < (now() - INTERVAL '30 days')
  ),
  latest_pdi AS (
    SELECT pd.person_id, MAX(pd.last_updated_at) AS last_upd
    FROM pdis pd WHERE pd.tenant_id = p_tenant_id GROUP BY pd.person_id
  ),
  stale_pdi AS (
    SELECT COUNT(*) AS cnt
    FROM active_people ap
    LEFT JOIN latest_pdi lp ON lp.person_id = ap.id
    WHERE lp.last_upd IS NULL OR lp.last_upd < (now() - INTERVAL '90 days')
  ),
  month_recognitions AS (
    SELECT COUNT(*) AS cnt FROM recognitions r
    WHERE r.tenant_id = p_tenant_id AND r.created_at >= date_trunc('month', now())
  ),
  task_counts AS (
    SELECT person_id AS pid, SUM(cnt) AS total_tasks
    FROM (
      SELECT assignee_id::text AS person_id, COUNT(*) AS cnt
      FROM os_tasks
      WHERE tenant_id = p_tenant_id AND (is_completed = false OR is_completed IS NULL) AND assignee_id IS NOT NULL
      GROUP BY assignee_id
      UNION ALL
      SELECT person_id, COUNT(*) AS cnt
      FROM person_tasks
      WHERE tenant_id = p_tenant_id AND (status IS NULL OR status NOT IN ('concluida', 'cancelada'))
      GROUP BY person_id
    ) combined
    GROUP BY person_id
  ),
  overloaded AS (
    SELECT COUNT(*) AS cnt
    FROM active_people ap
    JOIN task_counts tc ON tc.pid = ap.id::text
    WHERE tc.total_tasks >= 8
  )
  SELECT json_build_object(
    'total',              (SELECT COUNT(*) FROM all_people),
    'active',             (SELECT COUNT(*) FROM active_people),
    'onboarding',         (SELECT COUNT(*) FROM all_people WHERE status = 'onboarding'),
    'at_risk',            (SELECT cnt FROM at_risk),
    'pending_1on1',       (SELECT cnt FROM pending_1on1),
    'stale_pdi',          (SELECT cnt FROM stale_pdi),
    'month_recognitions', (SELECT cnt FROM month_recognitions),
    'overloaded',         (SELECT cnt FROM overloaded)
  ) INTO result;

  RETURN result;
END;
$$;

-- ── get_people_ids_by_kpi() ──────────────────────────────────────────────────
DROP FUNCTION IF EXISTS get_people_ids_by_kpi(UUID, TEXT) CASCADE;
CREATE OR REPLACE FUNCTION get_people_ids_by_kpi(p_tenant_id UUID, p_kpi TEXT)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  CASE p_kpi
    WHEN 'at_risk' THEN
      RETURN QUERY
        SELECT DISTINCT ap.id
        FROM profiles ap
        LEFT JOIN pdis pd ON pd.person_id = ap.id AND pd.tenant_id = p_tenant_id
        WHERE ap.tenant_id = p_tenant_id AND ap.status = 'active'
          AND ((ap.media_avaliacao IS NOT NULL AND ap.media_avaliacao < 60) OR pd.status = 'Atrasado');
    WHEN 'pending_1on1' THEN
      RETURN QUERY
        SELECT ap.id FROM profiles ap
        LEFT JOIN (
          SELECT o.collaborator_id AS person_id, MAX(o.scheduled_at) AS last_at
          FROM one_on_ones o WHERE o.tenant_id = p_tenant_id AND o.status = 'completed' GROUP BY o.collaborator_id
        ) l ON l.person_id = ap.id
        WHERE ap.tenant_id = p_tenant_id AND ap.status = 'active'
          AND (l.last_at IS NULL OR l.last_at < (now() - INTERVAL '30 days'));
    WHEN 'stale_pdi' THEN
      RETURN QUERY
        SELECT ap.id FROM profiles ap
        LEFT JOIN (
          SELECT pd.person_id, MAX(pd.last_updated_at) AS last_upd
          FROM pdis pd WHERE pd.tenant_id = p_tenant_id GROUP BY pd.person_id
        ) lp ON lp.person_id = ap.id
        WHERE ap.tenant_id = p_tenant_id AND ap.status = 'active'
          AND (lp.last_upd IS NULL OR lp.last_upd < (now() - INTERVAL '90 days'));
    WHEN 'overloaded' THEN
      RETURN QUERY
        SELECT ap.id FROM profiles ap
        JOIN (
          SELECT person_id AS pid, SUM(cnt) AS total_tasks FROM (
            SELECT assignee_id::text AS person_id, COUNT(*) AS cnt FROM os_tasks
            WHERE tenant_id = p_tenant_id AND (is_completed = false OR is_completed IS NULL) AND assignee_id IS NOT NULL GROUP BY assignee_id
            UNION ALL
            SELECT person_id, COUNT(*) AS cnt FROM person_tasks
            WHERE tenant_id = p_tenant_id AND (status IS NULL OR status NOT IN ('concluida', 'cancelada')) GROUP BY person_id
          ) combined GROUP BY person_id
        ) tc ON tc.pid = ap.id::text
        WHERE ap.tenant_id = p_tenant_id AND ap.status = 'active' AND tc.total_tasks >= 8;
    ELSE
      RETURN;
  END CASE;
END;
$$;


-- ============================================================================
-- 3. CORE TABLES
-- ============================================================================

-- ── tenants ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT UNIQUE NOT NULL,
    logo_url    TEXT,
    settings    JSONB DEFAULT '{}',
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── roles ────────────────────────────────────────────────────────────────────
-- Includes all columns from migrations 002 + 011 (label, color, is_default, sort_order, updated_at)
CREATE TABLE IF NOT EXISTS roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL,
    description TEXT,
    label       TEXT,
    color       TEXT DEFAULT '#94a3b8',
    is_system   BOOLEAN DEFAULT false,
    is_default  BOOLEAN DEFAULT false,
    sort_order  INT DEFAULT 100,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, slug)
);

-- ── tenant_members ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenant_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id     UUID REFERENCES roles(id),
    is_active   BOOLEAN DEFAULT true,
    joined_at   TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, user_id)
);

-- ── profiles ─────────────────────────────────────────────────────────────────
-- NOTE: profiles is assumed to pre-exist (created by Supabase Auth trigger or prior migration).
-- This consolidated definition includes ALL columns from migrations 002, 022, 023, 027.
-- The base profiles table must have at minimum: id, role, full_name, avatar_url, username, email, bu, is_active, is_coordinator
CREATE TABLE IF NOT EXISTS profiles (
    id                          UUID PRIMARY KEY REFERENCES auth.users(id),
    tenant_id                   UUID REFERENCES tenants(id),
    full_name                   TEXT,
    username                    TEXT,
    email                       TEXT,
    avatar_url                  TEXT,
    role                        TEXT,
    bu                          TEXT,
    is_active                   BOOLEAN DEFAULT true,
    is_coordinator              BOOLEAN DEFAULT false,
    -- Multi-tenant / onboarding (002)
    first_login_completed       BOOLEAN DEFAULT false,
    onboarding_wizard_completed BOOLEAN DEFAULT false,
    module_tours_completed      JSONB DEFAULT '{}',
    cargo                       TEXT,
    department                  TEXT,
    salary_pj                   NUMERIC(15,2),
    contract_type               TEXT DEFAULT 'pj',
    start_date                  DATE,
    document_cnpj               TEXT,
    -- People module (022)
    phone                       TEXT,
    manager_id                  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status                      TEXT DEFAULT 'active',
    team_id                     UUID,  -- FK added after teams table
    -- Data enrichment (023)
    birth_date                  DATE,
    address_street              TEXT,
    address_number              TEXT,
    address_city                TEXT,
    address_state               TEXT,
    address_cep                 TEXT,
    nivel_atual                 TEXT,
    proximo_nivel               TEXT,
    media_avaliacao             NUMERIC(5,2),
    -- Offboarding (027)
    exit_date                   DATE,
    exit_reason                 TEXT,
    exit_interview              JSONB,
    -- Timestamps
    created_at                  TIMESTAMPTZ DEFAULT now(),
    updated_at                  TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_profiles_status CHECK (status IN ('active','inactive','vacation','away','onboarding','suspended'))
);


-- ============================================================================
-- 4. RBAC TABLES
-- ============================================================================

-- ── permissions (catalogo de permissoes granulares) ──────────────────────────
CREATE TABLE IF NOT EXISTS permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module      TEXT NOT NULL,
    action      TEXT NOT NULL,
    label       TEXT NOT NULL,
    description TEXT,
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(module, action)
);

-- ── role_permissions ─────────────────────────────────────────────────────────
-- Includes both legacy VCEDX columns and normalized permission_id + granted.
CREATE TABLE IF NOT EXISTS role_permissions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module        TEXT NOT NULL,
    can_view      BOOLEAN DEFAULT false,
    can_create    BOOLEAN DEFAULT false,
    can_edit      BOOLEAN DEFAULT false,
    can_delete    BOOLEAN DEFAULT false,
    can_export    BOOLEAN DEFAULT false,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted       BOOLEAN DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT now(),
    UNIQUE(role_id, module)
);

-- ── project_memberships ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_memberships (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id     UUID NOT NULL REFERENCES roles(id),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    granted_at  TIMESTAMPTZ DEFAULT now(),
    granted_by  UUID REFERENCES auth.users(id),
    UNIQUE(project_id, user_id)
);


-- ============================================================================
-- 5. AUDIT & CHANGELOG TABLES
-- ============================================================================

-- ── audit_logs ───────────────────────────────────────────────────────────────
-- Combined schema from 005 (resource_type/resource_id/details) + 006 (entity_type/entity_id/metadata).
CREATE TABLE IF NOT EXISTS audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id),
    user_id         UUID REFERENCES auth.users(id),
    action          TEXT NOT NULL,
    resource_type   TEXT,
    resource_id     UUID,
    details         JSONB,
    entity_type     TEXT,
    entity_id       UUID,
    metadata        JSONB DEFAULT '{}',
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── collaborator_history ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collaborator_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    field_changed   TEXT NOT NULL,
    old_value       TEXT,
    new_value       TEXT,
    changed_by      UUID REFERENCES auth.users(id),
    changed_at      TIMESTAMPTZ DEFAULT now()
);

-- ── changelog_entries ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS changelog_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version         TEXT NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL,
    author          TEXT,
    tag             TEXT CHECK (tag IN ('feature', 'fix', 'improvement', 'breaking', 'security')),
    module          TEXT,
    published_at    DATE NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now()
);


-- ============================================================================
-- 6. INTEGRATION / SYNC TABLES
-- ============================================================================

-- ── integration_configs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS integration_configs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id),
    provider                TEXT NOT NULL,
    api_key_encrypted       TEXT,
    api_secret_encrypted    TEXT,
    access_token_encrypted  TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at        TIMESTAMPTZ,
    settings                JSONB DEFAULT '{}',
    is_active               BOOLEAN DEFAULT true,
    last_sync_at            TIMESTAMPTZ,
    last_sync_status        TEXT,
    last_sync_error         TEXT,
    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, provider)
);

-- ── sync_logs ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sync_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    provider        TEXT NOT NULL,
    direction       TEXT CHECK (direction IN ('pull', 'push', 'bidirectional')),
    entity_type     TEXT,
    records_fetched INT DEFAULT 0,
    records_created INT DEFAULT 0,
    records_updated INT DEFAULT 0,
    records_errors  INT DEFAULT 0,
    started_at      TIMESTAMPTZ DEFAULT now(),
    completed_at    TIMESTAMPTZ,
    status          TEXT DEFAULT 'running' CHECK (status IN ('running', 'success', 'partial', 'error')),
    error_details   JSONB,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── omie_sync_log ────────────────────────────────────────────────────────────
-- Columns from 019 + 081
CREATE TABLE IF NOT EXISTS omie_sync_log (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    started_at              TIMESTAMPTZ DEFAULT NOW(),
    finished_at             TIMESTAMPTZ,
    status                  TEXT DEFAULT 'running'
                            CHECK (status IN ('running','success','partial','error')),
    vendors_synced          INT DEFAULT 0,
    clients_synced          INT DEFAULT 0,
    payables_synced         INT DEFAULT 0,
    receivables_synced      INT DEFAULT 0,
    categories_synced       INT DEFAULT 0,
    bank_accounts_synced    INT DEFAULT 0,
    duration_ms             INT,
    trigger_source          TEXT DEFAULT 'manual'
                            CHECK (trigger_source IN ('manual', 'cron', 'webhook')),
    errors                  JSONB DEFAULT '[]',
    triggered_by            UUID
);

-- ── fireflies_sync_log ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fireflies_sync_log (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    started_at              TIMESTAMPTZ DEFAULT now(),
    finished_at             TIMESTAMPTZ,
    status                  TEXT DEFAULT 'running'
                            CHECK (status IN ('running','success','partial','error')),
    meetings_fetched        INT DEFAULT 0,
    meetings_created        INT DEFAULT 0,
    meetings_updated        INT DEFAULT 0,
    transcriptions_synced   INT DEFAULT 0,
    errors                  JSONB DEFAULT '[]',
    triggered_by            UUID,
    trigger_source          TEXT DEFAULT 'manual'
                            CHECK (trigger_source IN ('manual','auto','zapier','webhook'))
);


-- ============================================================================
-- 7. SIDEBAR / WORKSPACE TABLES
-- ============================================================================

-- ── sidebar_items ────────────────────────────────────────────────────────────
-- type CHECK expanded to include 'child' (018), order_index changed to DOUBLE PRECISION (052),
-- UNIQUE(tenant_id, order_index) removed (052), extra workspace cols from 018.
CREATE TABLE IF NOT EXISTS sidebar_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    parent_id       UUID REFERENCES sidebar_items(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    type            TEXT NOT NULL CHECK (type IN ('system', 'workspace', 'separator', 'child')),
    order_index     DOUBLE PRECISION NOT NULL,
    icon            TEXT DEFAULT 'file',
    route           TEXT,
    is_expanded     BOOLEAN DEFAULT TRUE,
    is_visible      BOOLEAN DEFAULT TRUE,
    allowed_roles   TEXT[] DEFAULT '{}',
    metadata        JSONB DEFAULT '{}',
    -- Workspace settings (018)
    description     TEXT DEFAULT '',
    icon_type       TEXT DEFAULT 'lucide',
    icon_value      TEXT,
    icon_url        TEXT,
    archived_at     TIMESTAMPTZ,
    archived_by     UUID,
    deleted_at      TIMESTAMPTZ,
    deleted_by      UUID,
    -- Timestamps
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── sidebar_user_state ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sidebar_user_state (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    user_id         UUID NOT NULL,
    item_id         UUID NOT NULL REFERENCES sidebar_items(id) ON DELETE CASCADE,
    is_expanded     BOOLEAN DEFAULT TRUE,
    is_pinned       BOOLEAN DEFAULT FALSE,
    last_accessed   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, user_id, item_id)
);

-- ── space_members ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS space_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    space_id    UUID NOT NULL REFERENCES sidebar_items(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL,
    role        TEXT NOT NULL DEFAULT 'member'
                CHECK (role IN ('owner', 'admin', 'member')),
    invited_by  UUID,
    joined_at   TIMESTAMPTZ DEFAULT NOW(),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, space_id, user_id)
);

-- ── space_invitations ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS space_invitations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    space_id    UUID NOT NULL REFERENCES sidebar_items(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'member'
                CHECK (role IN ('admin', 'member')),
    invited_by  UUID NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    token       UUID DEFAULT gen_random_uuid(),
    expires_at  TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, space_id, email, status)
);

-- ── user_recent_icons ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_recent_icons (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL,
    icon_type   TEXT NOT NULL CHECK (icon_type IN ('lucide', 'emoji')),
    icon_value  TEXT NOT NULL,
    used_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, user_id, icon_type, icon_value)
);

-- ── user_table_preferences ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_table_preferences (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    table_id    TEXT NOT NULL,
    columns     JSONB NOT NULL DEFAULT '[]'::jsonb,
    sort        JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_table_pref UNIQUE (tenant_id, user_id, table_id)
);

-- ── user_view_state ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_view_state (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    workspace    TEXT NOT NULL,
    view_key     TEXT NOT NULL,
    filters_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    sort_json    JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_view_state UNIQUE (user_id, workspace, view_key)
);


-- ============================================================================
-- 8. CHAT TABLES
-- ============================================================================

-- ── chat_channel_sections ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_channel_sections (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL,
    name        TEXT NOT NULL,
    sort_order  INT DEFAULT 0,
    is_collapsed BOOLEAN DEFAULT false,
    created_by  UUID REFERENCES auth.users(id),
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── chat_channels ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_channels (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL,
    name        TEXT NOT NULL,
    type        TEXT DEFAULT 'channel' CHECK (type IN ('channel','direct','group')),
    description TEXT,
    created_by  UUID REFERENCES auth.users(id),
    is_archived BOOLEAN DEFAULT false,
    section_id  UUID REFERENCES chat_channel_sections(id),
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── chat_messages ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id      UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES auth.users(id),
    content         TEXT NOT NULL,
    reply_to        UUID REFERENCES chat_messages(id),
    message_type    TEXT DEFAULT 'text'
                    CHECK (message_type IN ('text','image','file','poll','system')),
    metadata        JSONB DEFAULT '{}',
    edited_at       TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── chat_channel_members ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_channel_members (
    channel_id  UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id),
    role        TEXT DEFAULT 'member',
    last_read_at TIMESTAMPTZ DEFAULT now(),
    joined_at   TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (channel_id, user_id)
);

-- ── chat_reactions ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_reactions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id  UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id),
    emoji       TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(message_id, user_id, emoji)
);

-- ── chat_attachments ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_attachments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    file_name       TEXT NOT NULL,
    file_type       TEXT NOT NULL,
    file_size       BIGINT DEFAULT 0,
    file_url        TEXT NOT NULL,
    thumbnail_url   TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── chat_polls / options / votes ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_polls (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    question        TEXT NOT NULL,
    allows_multiple BOOLEAN DEFAULT false,
    is_anonymous    BOOLEAN DEFAULT false,
    closes_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_poll_options (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id     UUID NOT NULL REFERENCES chat_polls(id) ON DELETE CASCADE,
    text        TEXT NOT NULL,
    sort_order  INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS chat_poll_votes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id     UUID NOT NULL REFERENCES chat_polls(id) ON DELETE CASCADE,
    option_id   UUID NOT NULL REFERENCES chat_poll_options(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id),
    created_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(poll_id, option_id, user_id)
);


-- ============================================================================
-- 9. FINANCE TABLES
-- ============================================================================

-- ── Legacy fin_* tables (deprecated but preserved) ───────────────────────────

CREATE TABLE IF NOT EXISTS fin_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL,
    type        TEXT NOT NULL CHECK (type IN ('receita', 'despesa', 'transferencia')),
    parent_id   UUID REFERENCES fin_categories(id),
    color       TEXT,
    icon        TEXT,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS fin_cost_centers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL,
    description     TEXT,
    category        TEXT,
    requires_project BOOLEAN DEFAULT false,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS fin_vendors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    cnpj            TEXT,
    email           TEXT,
    phone           TEXT,
    category        TEXT,
    notes           TEXT,
    is_active       BOOLEAN DEFAULT true,
    omie_id         TEXT,
    omie_synced_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fin_clients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    cnpj            TEXT,
    email           TEXT,
    phone           TEXT,
    contact_name    TEXT,
    notes           TEXT,
    is_active       BOOLEAN DEFAULT true,
    omie_id         TEXT,
    omie_synced_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fin_invoices (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    number      TEXT NOT NULL,
    series      TEXT,
    type        TEXT CHECK (type IN ('nfse', 'nfe', 'nfce', 'outros')),
    client_id   UUID REFERENCES fin_clients(id),
    vendor_id   UUID REFERENCES fin_vendors(id),
    amount      NUMERIC(15,2) NOT NULL,
    tax_amount  NUMERIC(15,2) DEFAULT 0,
    issue_date  DATE NOT NULL,
    status      TEXT DEFAULT 'emitida' CHECK (status IN ('rascunho', 'emitida', 'cancelada', 'substituida')),
    pdf_url     TEXT,
    xml_url     TEXT,
    omie_id     TEXT,
    notes       TEXT,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fin_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type            TEXT NOT NULL CHECK (type IN ('receita', 'despesa', 'transferencia')),
    description     TEXT NOT NULL,
    amount          NUMERIC(15,2) NOT NULL,
    date            DATE NOT NULL,
    due_date        DATE,
    paid_date       DATE,
    status          TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado', 'parcial')),
    category_id     UUID REFERENCES fin_categories(id),
    cost_center_id  UUID REFERENCES fin_cost_centers(id),
    vendor_id       UUID REFERENCES fin_vendors(id),
    client_id       UUID REFERENCES fin_clients(id),
    project_id      UUID REFERENCES projects(id),
    invoice_id      UUID REFERENCES fin_invoices(id),
    recurrence      TEXT CHECK (recurrence IN ('none', 'monthly', 'quarterly', 'semiannual', 'annual')),
    recurrence_end  DATE,
    payment_method  TEXT,
    bank_account    TEXT,
    document_number TEXT,
    notes           TEXT,
    tags            TEXT[],
    omie_id         TEXT,
    is_realized     BOOLEAN DEFAULT false,
    created_by      UUID REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fin_receivables (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id           UUID REFERENCES fin_clients(id),
    project_id          UUID REFERENCES projects(id),
    invoice_id          UUID REFERENCES fin_invoices(id),
    description         TEXT NOT NULL,
    amount              NUMERIC(15,2) NOT NULL,
    amount_paid         NUMERIC(15,2) DEFAULT 0,
    due_date            DATE NOT NULL,
    paid_date           DATE,
    status              TEXT DEFAULT 'previsto'
                        CHECK (status IN ('previsto','emitido','aberto','parcial','pago','atrasado','cancelado')),
    installment_number  INT,
    installment_total   INT,
    payment_method      TEXT,
    notes               TEXT,
    omie_id             TEXT,
    omie_synced_at      TIMESTAMPTZ,
    created_by          UUID REFERENCES auth.users(id),
    updated_by          UUID REFERENCES auth.users(id),
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fin_payables (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vendor_id           UUID REFERENCES fin_vendors(id),
    project_id          UUID REFERENCES projects(id),
    invoice_id          UUID REFERENCES fin_invoices(id),
    description         TEXT NOT NULL,
    amount              NUMERIC(15,2) NOT NULL,
    amount_paid         NUMERIC(15,2) DEFAULT 0,
    due_date            DATE NOT NULL,
    paid_date           DATE,
    status              TEXT DEFAULT 'rascunho'
                        CHECK (status IN ('rascunho','aguardando_aprovacao','aprovado','aberto','parcial','pago','atrasado','cancelado')),
    category_id         UUID REFERENCES fin_categories(id),
    cost_center_id      UUID REFERENCES fin_cost_centers(id),
    payment_method      TEXT,
    notes               TEXT,
    omie_id             TEXT,
    omie_synced_at      TIMESTAMPTZ,
    created_by          UUID REFERENCES auth.users(id),
    updated_by          UUID REFERENCES auth.users(id),
    approved_by         UUID REFERENCES auth.users(id),
    approved_at         TIMESTAMPTZ,
    attachment_url      TEXT,
    attachment_name     TEXT,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fin_balance_snapshots (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    balance     NUMERIC(15,2) NOT NULL,
    note        TEXT,
    recorded_by UUID REFERENCES auth.users(id),
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fin_bank_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    omie_id         TEXT,
    name            TEXT NOT NULL,
    bank_code       TEXT,
    bank_name       TEXT,
    agency          TEXT,
    account_number  TEXT,
    account_type    TEXT DEFAULT 'corrente',
    balance         NUMERIC(15,2) DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    omie_synced_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_imports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    filename            TEXT NOT NULL,
    format              TEXT NOT NULL CHECK (format IN ('ofx', 'csv')),
    bank_name           TEXT,
    account_number      TEXT,
    period_start        DATE,
    period_end          DATE,
    transaction_count   INT DEFAULT 0,
    matched_count       INT DEFAULT 0,
    status              TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    imported_by         UUID REFERENCES auth.users(id),
    created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bank_transactions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_id               UUID NOT NULL REFERENCES bank_imports(id) ON DELETE CASCADE,
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    date                    DATE NOT NULL,
    amount                  NUMERIC(15,2) NOT NULL,
    description             TEXT,
    memo                    TEXT,
    fitid                   TEXT,
    type                    TEXT,
    balance                 NUMERIC(15,2),
    match_status            TEXT DEFAULT 'unmatched' CHECK (match_status IN ('unmatched', 'matched', 'ignored', 'manual')),
    matched_transaction_id  UUID REFERENCES fin_transactions(id),
    created_at              TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reconciliation_rules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    match_field TEXT NOT NULL CHECK (match_field IN ('description', 'amount', 'both')),
    pattern     TEXT NOT NULL,
    category_id UUID REFERENCES fin_categories(id),
    vendor_id   UUID REFERENCES fin_vendors(id),
    client_id   UUID REFERENCES fin_clients(id),
    auto_match  BOOLEAN DEFAULT false,
    priority    INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reconciliation_audit (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    bank_transaction_id UUID REFERENCES bank_transactions(id),
    fin_transaction_id  UUID REFERENCES fin_transactions(id),
    action              TEXT NOT NULL CHECK (action IN ('auto_match', 'manual_match', 'unmatch', 'ignore', 'create')),
    matched_by          UUID REFERENCES auth.users(id),
    rule_id             UUID REFERENCES reconciliation_rules(id),
    confidence          NUMERIC(3,2),
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT now()
);

-- ── New finance_* tables (from migration 082) ────────────────────────────────

CREATE TABLE IF NOT EXISTS finance_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    type        TEXT NOT NULL DEFAULT 'despesa' CHECK (type IN ('receita', 'despesa')),
    omie_id     TEXT,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_finance_categories_tenant_omie UNIQUE (tenant_id, omie_id)
);

CREATE TABLE IF NOT EXISTS finance_cost_centers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code        TEXT NOT NULL,
    name        TEXT NOT NULL,
    omie_id     TEXT,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_finance_cost_centers_tenant_omie UNIQUE (tenant_id, omie_id)
);

CREATE TABLE IF NOT EXISTS finance_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type            TEXT NOT NULL DEFAULT 'despesa'
                    CHECK (type IN ('receita', 'despesa', 'transferencia')),
    status          TEXT NOT NULL DEFAULT 'previsto'
                    CHECK (status IN ('previsto', 'provisionado', 'pago', 'atrasado', 'recorrente', 'cancelado')),
    description     TEXT NOT NULL,
    notes           TEXT,
    tags            TEXT[] DEFAULT '{}',
    amount          NUMERIC(15,2) NOT NULL DEFAULT 0,
    paid_amount     NUMERIC(15,2) DEFAULT 0,
    date            DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date        DATE,
    paid_date       DATE,
    category_id     UUID REFERENCES finance_categories(id) ON DELETE SET NULL,
    cost_center_id  UUID REFERENCES finance_cost_centers(id) ON DELETE SET NULL,
    project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
    counterpart     TEXT,
    counterpart_doc TEXT,
    payment_method  TEXT,
    bank_account    TEXT,
    business_unit   TEXT,
    responsible_id  UUID REFERENCES profiles(id),
    omie_id         TEXT,
    omie_synced_at  TIMESTAMPTZ,
    omie_raw        JSONB,
    created_by      UUID REFERENCES auth.users(id),
    updated_by      UUID REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_finance_transactions_tenant_omie UNIQUE (tenant_id, omie_id),
    CONSTRAINT finance_transactions_business_unit_check
        CHECK (business_unit IS NULL OR business_unit IN ('Branding', 'Digital 3D', 'Marketing', 'Audiovisual', 'Interiores'))
);

CREATE TABLE IF NOT EXISTS finance_snapshots_daily (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    snapshot_date       DATE NOT NULL,
    total_receitas      NUMERIC(15,2) DEFAULT 0,
    total_despesas      NUMERIC(15,2) DEFAULT 0,
    saldo_dia           NUMERIC(15,2) DEFAULT 0,
    saldo_acumulado     NUMERIC(15,2) DEFAULT 0,
    payables_open       NUMERIC(15,2) DEFAULT 0,
    receivables_open    NUMERIC(15,2) DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS fin_cash_entries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    amount      NUMERIC NOT NULL,
    note        TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE fin_cash_entries IS
  'Immutable log of manually-entered consolidated cash balances for the Founder Dashboard.';

CREATE TABLE IF NOT EXISTS dre_settings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tax_rate    NUMERIC(5,2) NOT NULL DEFAULT 15.0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_by  UUID REFERENCES auth.users(id),
    UNIQUE (tenant_id)
);


-- ============================================================================
-- 10. ACADEMY TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS academy_courses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    slug            TEXT NOT NULL,
    description     TEXT,
    thumbnail_url   TEXT,
    instructor_id   UUID REFERENCES auth.users(id),
    category        TEXT CHECK (category IN ('3d', 'branding', 'marketing', 'audiovisual', 'interiores', 'gamificacao', 'gestao', 'ferramentas', 'geral')),
    level           TEXT CHECK (level IN ('iniciante', 'intermediario', 'avancado')),
    duration_hours  NUMERIC(5,1),
    is_published    BOOLEAN DEFAULT false,
    is_featured     BOOLEAN DEFAULT false,
    order_index     INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS academy_lessons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    content         TEXT,
    video_url       TEXT,
    duration_minutes INT,
    order_index     INT DEFAULT 0,
    is_published    BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS academy_assets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id   UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
    course_id   UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    file_url    TEXT NOT NULL,
    file_type   TEXT,
    file_size   INT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS academy_enrollments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id   UUID NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status      TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    UNIQUE(course_id, user_id)
);

CREATE TABLE IF NOT EXISTS academy_progress (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id   UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE,
    lesson_id       UUID NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
    status          TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_pct    NUMERIC(5,2) DEFAULT 0,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    UNIQUE(enrollment_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS academy_certificates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id       UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE,
    certificate_number  TEXT NOT NULL UNIQUE,
    issued_at           TIMESTAMPTZ DEFAULT now(),
    pdf_url             TEXT,
    metadata            JSONB DEFAULT '{}'
);


-- ============================================================================
-- 11. MARKET RESEARCH TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS market_research (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_andamento', 'publicado', 'arquivado')),
    category    TEXT,
    tags        TEXT[],
    author_id   UUID REFERENCES auth.users(id),
    published_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_sources (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_id UUID REFERENCES market_research(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    url         TEXT,
    source_type TEXT CHECK (source_type IN ('artigo', 'relatorio', 'dado', 'noticia', 'video', 'outro')),
    notes       TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);


-- ============================================================================
-- 12. DOCUMENT / TEMPLATE / DIGEST TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id     UUID NOT NULL,
    document_type   TEXT NOT NULL DEFAULT 'deliverable'
                    CHECK (document_type IN ('deliverable', 'proposal', 'contract', 'template', 'knowledge')),
    version         INTEGER NOT NULL DEFAULT 1,
    file_name       TEXT NOT NULL,
    file_path       TEXT NOT NULL,
    file_size       BIGINT DEFAULT 0,
    mime_type       TEXT DEFAULT '',
    thumbnail_path  TEXT,
    changelog       TEXT,
    uploaded_by     UUID REFERENCES profiles(id),
    uploaded_by_name TEXT,
    is_current      BOOLEAN DEFAULT TRUE,
    tenant_id       UUID REFERENCES tenants(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(document_id, version)
);

CREATE TABLE IF NOT EXISTS dynamic_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            TEXT NOT NULL DEFAULT 'proposta'
                    CHECK (type IN ('proposta', 'contrato', 'email', 'briefing', 'relatorio', 'ata', 'outro')),
    name            TEXT NOT NULL,
    description     TEXT,
    content         TEXT NOT NULL DEFAULT '',
    variables       JSONB DEFAULT '[]',
    category        TEXT DEFAULT 'geral',
    is_default      BOOLEAN DEFAULT FALSE,
    usage_count     INTEGER DEFAULT 0,
    last_used_at    TIMESTAMPTZ,
    created_by      UUID REFERENCES profiles(id),
    created_by_name TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS digest_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            TEXT NOT NULL DEFAULT 'weekly' CHECK (type IN ('daily', 'weekly', 'financial')),
    recipient_email TEXT NOT NULL,
    recipient_name  TEXT,
    subject         TEXT NOT NULL,
    content_html    TEXT,
    snapshot        JSONB DEFAULT '{}',
    sent_at         TIMESTAMPTZ DEFAULT now(),
    status          TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending'))
);


-- ============================================================================
-- 13. PROJECTS TABLE
-- ============================================================================

-- Final state from migration 028 (canonical CREATE) with all columns.
CREATE TABLE IF NOT EXISTS projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    client          TEXT,
    client_company  TEXT,
    status          TEXT NOT NULL DEFAULT 'briefing',
    owner_id        UUID,
    owner_name      TEXT,
    value           NUMERIC(15,2),
    services        TEXT[],
    priority        TEXT DEFAULT 'media',
    source          TEXT,
    notes           TEXT,
    proposal_id     UUID,
    google_folder_id TEXT,
    construtora     TEXT,
    bus             TEXT[],
    code            TEXT,
    due_date_start  DATE,
    due_date_end    DATE,
    notion_url      TEXT,
    notion_page_id  TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── project_files (Google Drive sync) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_files (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id          UUID REFERENCES projects(id) ON DELETE SET NULL,
    profile_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
    google_file_id      TEXT,
    name                TEXT NOT NULL,
    mime_type           TEXT,
    size_bytes          BIGINT,
    web_view_link       TEXT,
    web_content_link    TEXT,
    thumbnail_link      TEXT,
    icon_link           TEXT,
    google_folder_id    TEXT,
    last_modified_by    TEXT,
    last_modified_at    TIMESTAMPTZ,
    synced_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ── person_tasks ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS person_tasks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL,
    person_id   TEXT NOT NULL,
    assigned_by UUID REFERENCES auth.users(id),
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','em_andamento','concluida','cancelada')),
    priority    TEXT DEFAULT 'media' CHECK (priority IN ('alta','media','baixa')),
    due_date    DATE,
    category    TEXT DEFAULT 'general' CHECK (category IN ('pdi','onboarding','1on1_action','general')),
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── pages ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL,
    space_id    TEXT NOT NULL,
    title       TEXT NOT NULL DEFAULT 'Nova pagina',
    content     JSONB DEFAULT '{}',
    icon        TEXT,
    cover_url   TEXT,
    is_deleted  BOOLEAN DEFAULT FALSE,
    created_by  UUID NOT NULL,
    updated_by  UUID NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 14. MEETING TABLES
-- ============================================================================

-- NOTE: The base meetings table is assumed to pre-exist. Columns added by 020:
-- fireflies_id, fireflies_url, audio_url, organizer_email, keywords, overview,
-- short_summary, synced_at, sync_source, host_email, meeting_link

CREATE TABLE IF NOT EXISTS meeting_transcriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    meeting_id      UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    speaker_name    TEXT,
    speaker_email   TEXT,
    text            TEXT NOT NULL,
    start_time      NUMERIC,
    end_time        NUMERIC,
    raw_index       INT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meeting_participants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    meeting_id      UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    email           TEXT,
    display_name    TEXT,
    is_tbo          BOOLEAN DEFAULT false,
    profile_id      UUID REFERENCES profiles(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(meeting_id, email)
);


-- ============================================================================
-- 15. PEOPLE DOMAIN TABLES
-- ============================================================================

-- ── teams ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    color           TEXT DEFAULT '#64748B',
    icon            TEXT DEFAULT 'users',
    manager_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, name)
);

-- FK: profiles.team_id -> teams(id)
-- (Applied after both tables exist)

-- ── person_skills ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS person_skills (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    person_id           UUID NOT NULL,
    skill_name          TEXT NOT NULL,
    category            TEXT,
    proficiency_level   INT DEFAULT 1,
    verified_by         UUID REFERENCES auth.users(id),
    verified_at         TIMESTAMPTZ,
    certification_name  TEXT,
    certification_expiry DATE,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_skill_level CHECK (proficiency_level BETWEEN 1 AND 5)
);

-- ── talents ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS talents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name       TEXT NOT NULL,
    email           TEXT,
    phone           TEXT,
    specialty       TEXT,
    seniority       TEXT,
    city            TEXT,
    state           TEXT,
    portfolio_url   TEXT,
    linkedin_url    TEXT,
    status          TEXT DEFAULT 'available',
    tags            TEXT[],
    notes           TEXT,
    source          TEXT,
    created_by      UUID REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_talents_status CHECK (status IN ('available','contacted','in_process','hired','archived'))
);

-- ── vacancies ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vacancies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    area            TEXT,
    description     TEXT,
    requirements    TEXT,
    responsible_id  UUID REFERENCES auth.users(id),
    status          TEXT DEFAULT 'open',
    priority        TEXT DEFAULT 'medium',
    notes           TEXT,
    created_by      UUID REFERENCES auth.users(id),
    opened_at       TIMESTAMPTZ DEFAULT now(),
    closed_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_vacancies_status CHECK (status IN ('draft','open','in_progress','paused','closed','filled')),
    CONSTRAINT chk_vacancies_priority CHECK (priority IN ('low','medium','high','urgent'))
);

-- ── vacancy_candidates ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vacancy_candidates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vacancy_id  UUID NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    talent_id   UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
    stage       TEXT DEFAULT 'applied',
    notes       TEXT,
    linked_by   UUID REFERENCES auth.users(id),
    linked_at   TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_vc_stage CHECK (stage IN ('applied','screening','interview','offer','hired','rejected')),
    CONSTRAINT uq_vacancy_talent UNIQUE(vacancy_id, talent_id)
);

-- ── contracts ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contracts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    person_id       UUID REFERENCES auth.users(id),
    person_name     TEXT,
    type            TEXT NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    start_date      DATE,
    end_date        DATE,
    status          TEXT DEFAULT 'active',
    monthly_value   NUMERIC(12,2),
    file_url        TEXT,
    file_name       TEXT,
    created_by      UUID REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_contracts_type CHECK (type IN ('pj','nda','aditivo','freelancer','clt','outro')),
    CONSTRAINT chk_contracts_status CHECK (status IN ('draft','active','expired','cancelled','renewed'))
);

-- ── culture_pages ────────────────────────────────────────────────────────────
-- Final state from 002 + 055 (recreated with proper schema)
CREATE TABLE IF NOT EXISTS culture_pages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    slug        TEXT NOT NULL,
    content     TEXT,
    category    TEXT DEFAULT 'geral' CHECK (category IN ('geral', 'valores', 'praticas', 'rituais', 'padroes')),
    is_published BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_by  UUID REFERENCES auth.users(id),
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── cultura_items ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cultura_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category        TEXT NOT NULL DEFAULT 'pilar'
                    CHECK (category IN ('pilar','ritual','politica','reconhecimento','valor','documento','manual')),
    title           TEXT NOT NULL,
    content         TEXT,
    content_html    TEXT,
    author_id       TEXT,
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','published','archived')),
    order_index     INTEGER DEFAULT 0,
    icon            TEXT,
    metadata        JSONB DEFAULT '{}',
    version         INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── cultura_item_versions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cultura_item_versions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id     UUID NOT NULL REFERENCES cultura_items(id) ON DELETE CASCADE,
    version     INTEGER NOT NULL DEFAULT 1,
    title       TEXT,
    content     TEXT,
    edited_by   TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── cultura_audit_log ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cultura_audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('recognition','reward','redemption','points_adjustment')),
    entity_id   UUID NOT NULL,
    action      TEXT NOT NULL CHECK (action IN ('create','update','delete','approve','reject','fulfill','adjust')),
    actor_id    TEXT NOT NULL,
    old_data    JSONB,
    new_data    JSONB,
    reason      TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── reward_tiers ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reward_tiers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    min_points  INTEGER NOT NULL DEFAULT 0,
    max_points  INTEGER,
    color       TEXT DEFAULT '#6366f1',
    icon        TEXT DEFAULT 'star',
    benefits    TEXT[],
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── reward_policy ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reward_policy (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    monthly_budget_brl      NUMERIC(10,2) DEFAULT 5000,
    quarterly_budget_brl    NUMERIC(10,2) DEFAULT 15000,
    min_tenure_days         INTEGER DEFAULT 90,
    min_points_to_redeem    INTEGER DEFAULT 25,
    points_expiry_days      INTEGER,
    approval_required       BOOLEAN DEFAULT true,
    special_threshold       INTEGER DEFAULT 200,
    updated_at              TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id)
);

-- ── recognitions ─────────────────────────────────────────────────────────────
-- Final state: 026 base + 057 (points, source) + 058 (reviewed, meeting_id, detection_context) + 070 (category)
CREATE TABLE IF NOT EXISTS recognitions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    from_user           UUID NOT NULL REFERENCES auth.users(id),
    to_user             UUID NOT NULL REFERENCES auth.users(id),
    value_id            TEXT NOT NULL,
    value_name          TEXT,
    value_emoji         TEXT,
    message             TEXT NOT NULL,
    likes               INT DEFAULT 0,
    points              INT DEFAULT 1,
    source              TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'fireflies', 'chat')),
    reviewed            BOOLEAN DEFAULT true,
    meeting_id          UUID REFERENCES meetings(id) ON DELETE SET NULL,
    detection_context   TEXT,
    category            TEXT DEFAULT 'elogio' CHECK (category IN ('elogio','feedback','destaque','especial')),
    created_at          TIMESTAMPTZ DEFAULT now()
);

-- ── recognition_rewards ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recognition_rewards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    points_required INT NOT NULL DEFAULT 20,
    type            TEXT DEFAULT 'voucher' CHECK (type IN ('voucher', 'experience', 'gift', 'custom')),
    value_brl       NUMERIC(10,2),
    active          BOOLEAN DEFAULT true,
    budget_quarter  NUMERIC(10,2),
    image_url       TEXT,
    created_by      UUID REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── recognition_redemptions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recognition_redemptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id),
    reward_id       UUID NOT NULL REFERENCES recognition_rewards(id) ON DELETE CASCADE,
    points_spent    INT NOT NULL,
    status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered', 'rejected')),
    approved_by     UUID REFERENCES auth.users(id),
    approved_at     TIMESTAMPTZ,
    notes           TEXT,
    redeemed_at     TIMESTAMPTZ DEFAULT now(),
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── feedbacks ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedbacks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    from_user   UUID NOT NULL REFERENCES auth.users(id),
    to_user     UUID NOT NULL REFERENCES auth.users(id),
    type        TEXT NOT NULL CHECK (type IN ('positivo', 'construtivo')),
    visibility  TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'manager_only')),
    message     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── one_on_ones ──────────────────────────────────────────────────────────────
-- Final: 026 base + 027 (google_event_id, recurrence) + 057/059 (fireflies_meeting_id, transcript_summary, transcript_processed_at)
CREATE TABLE IF NOT EXISTS one_on_ones (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    leader_id               UUID NOT NULL REFERENCES auth.users(id),
    collaborator_id         UUID NOT NULL REFERENCES auth.users(id),
    scheduled_at            TIMESTAMPTZ NOT NULL,
    status                  TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    notes                   TEXT,
    created_by              UUID REFERENCES auth.users(id),
    google_event_id         TEXT,
    recurrence              TEXT,
    fireflies_meeting_id    UUID REFERENCES meetings(id) ON DELETE SET NULL,
    transcript_summary      TEXT,
    transcript_processed_at TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_1on1_recurrence CHECK (recurrence IS NULL OR recurrence IN ('weekly', 'biweekly', 'monthly'))
);

-- ── one_on_one_actions ───────────────────────────────────────────────────────
-- Final: 026 base + 057 (pdi_link_id) + 059 (source, ai_confidence, category with expanded CHECK)
CREATE TABLE IF NOT EXISTS one_on_one_actions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    one_on_one_id   UUID NOT NULL REFERENCES one_on_ones(id) ON DELETE CASCADE,
    text            TEXT NOT NULL,
    assignee_id     UUID REFERENCES auth.users(id),
    due_date        DATE,
    completed       BOOLEAN DEFAULT false,
    completed_at    TIMESTAMPTZ,
    pdi_link_id     UUID,
    source          TEXT DEFAULT 'manual',
    ai_confidence   NUMERIC(3,2),
    category        TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_action_source CHECK (source IN ('manual', 'ai_extracted', 'fireflies')),
    CONSTRAINT chk_action_category CHECK (category IS NULL OR category IN ('feedback', 'desenvolvimento', 'operacional', 'pdi', 'follow_up'))
);

-- ── one_on_one_transcript_logs ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS one_on_one_transcript_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    one_on_one_id   UUID NOT NULL REFERENCES one_on_ones(id) ON DELETE CASCADE,
    meeting_id      UUID REFERENCES meetings(id),
    raw_transcript  TEXT,
    ai_summary      TEXT,
    ai_actions      JSONB DEFAULT '[]',
    ai_model        TEXT,
    tokens_used     INT,
    status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    error_message   TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    completed_at    TIMESTAMPTZ
);

-- ── performance_cycles ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS performance_cycles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    period      TEXT,
    start_date  DATE,
    end_date    DATE,
    status      TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    created_by  UUID REFERENCES auth.users(id),
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── performance_reviews ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS performance_reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    cycle_id    UUID NOT NULL REFERENCES performance_cycles(id) ON DELETE CASCADE,
    target_user UUID NOT NULL REFERENCES auth.users(id),
    reviewer    UUID NOT NULL REFERENCES auth.users(id),
    review_type TEXT NOT NULL CHECK (review_type IN ('self', 'manager', 'peer')),
    scores      JSONB NOT NULL DEFAULT '[]',
    average     NUMERIC(3,2),
    highlights  TEXT[],
    gaps        TEXT[],
    comment     TEXT,
    status      TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged')),
    submitted_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(cycle_id, target_user, reviewer, review_type)
);

-- ── onboarding_templates ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,
    name        TEXT NOT NULL,
    steps       JSONB NOT NULL DEFAULT '[]',
    is_default  BOOLEAN DEFAULT false,
    created_by  UUID REFERENCES auth.users(id),
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_onb_template_type CHECK (type IN ('onboarding', 'offboarding'))
);

-- ── pdis (Planos de Desenvolvimento Individual) ──────────────────────────────
CREATE TABLE IF NOT EXISTS pdis (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    person_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title           TEXT NOT NULL DEFAULT '',
    status          TEXT NOT NULL DEFAULT 'Em andamento'
                    CHECK (status IN ('Em andamento', 'Concluido', 'Atrasado', 'Cancelado')),
    last_updated_at TIMESTAMPTZ DEFAULT now(),
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── pdi_goals ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pdi_goals (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pdi_id                  UUID NOT NULL REFERENCES pdis(id) ON DELETE CASCADE,
    title                   TEXT NOT NULL DEFAULT '',
    description             TEXT,
    status                  TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    target_date             DATE,
    skill_id                UUID REFERENCES person_skills(id) ON DELETE SET NULL,
    target_level_percent    SMALLINT CHECK (target_level_percent IS NULL OR (target_level_percent >= 0 AND target_level_percent <= 100)),
    sort_order              SMALLINT NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now()
);

-- ── pdi_actions ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pdi_actions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pdi_goal_id             UUID NOT NULL REFERENCES pdi_goals(id) ON DELETE CASCADE,
    text                    TEXT NOT NULL DEFAULT '',
    completed               BOOLEAN NOT NULL DEFAULT false,
    completed_at            TIMESTAMPTZ,
    due_date                DATE,
    assignee_id             UUID REFERENCES profiles(id) ON DELETE SET NULL,
    one_on_one_action_id    UUID REFERENCES one_on_one_actions(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ DEFAULT now()
);






-- ============================================================================
-- 16. ADDENDUM: COLUMNS ADDED TO PART 1 TABLES
-- ============================================================================

-- pages: add has_blocks (from 033_page_blocks)
ALTER TABLE pages ADD COLUMN IF NOT EXISTS has_blocks BOOLEAN DEFAULT FALSE;

-- os_tasks: add updated_by (from 079_alerts_inbox_mvp)
-- (os_tasks is created in section 24 below, so this is a forward-reference note.
--  The column is included directly in the CREATE TABLE below.)

-- chat_messages: add tenant_id, search_vector (from 080)
-- chat_reactions: add tenant_id (from 080)
-- chat_channels: add settings (from 080)
-- chat_channel_members: add muted (from 080)
-- (These are applied after the chat tables from PART 1 exist.)
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('portuguese', coalesce(content, ''))) STORED;
ALTER TABLE chat_reactions ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE chat_channels ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE chat_channel_members ADD COLUMN IF NOT EXISTS muted BOOLEAN DEFAULT false;

-- one_on_ones: add ritual_type_id (from 064, FK defined after ritual_types table)
-- (Applied in section 26 below after ritual_types is created.)


-- ============================================================================
-- 17. PAGE BLOCKS + BLOCK LINKS
-- ============================================================================

-- ── page_blocks ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_blocks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  page_id         UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  parent_block_id UUID REFERENCES page_blocks(id) ON DELETE CASCADE,
  type            TEXT NOT NULL DEFAULT 'text',
  content         JSONB DEFAULT '{"text":"","marks":[]}',
  props           JSONB DEFAULT '{}',
  position        NUMERIC NOT NULL DEFAULT 0,
  created_by      UUID NOT NULL,
  updated_by      UUID NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_blocks_page ON page_blocks(page_id, position ASC);
CREATE INDEX IF NOT EXISTS idx_page_blocks_tenant ON page_blocks(tenant_id, page_id);
CREATE INDEX IF NOT EXISTS idx_page_blocks_parent ON page_blocks(parent_block_id) WHERE parent_block_id IS NOT NULL;

ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "page_blocks_select" ON page_blocks;
CREATE POLICY page_blocks_select ON page_blocks
  FOR SELECT USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "page_blocks_insert" ON page_blocks;
CREATE POLICY page_blocks_insert ON page_blocks
  FOR INSERT WITH CHECK (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "page_blocks_update" ON page_blocks;
CREATE POLICY page_blocks_update ON page_blocks
  FOR UPDATE USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "page_blocks_delete" ON page_blocks;
CREATE POLICY page_blocks_delete ON page_blocks
  FOR DELETE USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

-- Trigger: auto-update updated_at
DROP FUNCTION IF EXISTS update_page_blocks_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION update_page_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_page_blocks_updated_at ON page_blocks;
CREATE TRIGGER trg_page_blocks_updated_at
  BEFORE UPDATE ON page_blocks
  FOR EACH ROW EXECUTE FUNCTION update_page_blocks_updated_at();

-- ── block_links ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS block_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL,
  block_id    UUID NOT NULL REFERENCES page_blocks(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_block_links_tenant_slug ON block_links(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_block_links_block ON block_links(block_id);

ALTER TABLE block_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "block_links_select" ON block_links;
CREATE POLICY block_links_select ON block_links
  FOR SELECT USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "block_links_insert" ON block_links;
CREATE POLICY block_links_insert ON block_links
  FOR INSERT WITH CHECK (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "block_links_delete" ON block_links;
CREATE POLICY block_links_delete ON block_links
  FOR DELETE USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );


-- ============================================================================
-- 18. INBOX NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS inbox_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  user_id     UUID NOT NULL,
  type        TEXT NOT NULL DEFAULT 'general',
  title       TEXT NOT NULL,
  body        TEXT,
  metadata    JSONB DEFAULT '{}',
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  read_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_inbox_user ON inbox_notifications(user_id, is_read, created_at DESC);

ALTER TABLE inbox_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own notifications" ON inbox_notifications;
CREATE POLICY "Users see own notifications" ON inbox_notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notifications" ON inbox_notifications;
CREATE POLICY "Users update own notifications" ON inbox_notifications
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role inserts notifications" ON inbox_notifications;
CREATE POLICY "Service role inserts notifications" ON inbox_notifications
  FOR INSERT WITH CHECK (true);


-- ============================================================================
-- 19. CUSTOM DATABASES (Notion-style)
-- ============================================================================

-- ── custom_databases ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS custom_databases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  name          TEXT NOT NULL,
  description   TEXT,
  icon          TEXT DEFAULT 'database',
  color         TEXT DEFAULT '#3B82F6',
  columns       JSONB NOT NULL DEFAULT '[]',
  default_view  TEXT DEFAULT 'table',
  views         JSONB NOT NULL DEFAULT '[]',
  created_by    UUID,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_databases_tenant ON custom_databases(tenant_id);

ALTER TABLE custom_databases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_databases_select" ON custom_databases;
CREATE POLICY "custom_databases_select" ON custom_databases FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "custom_databases_insert" ON custom_databases;
CREATE POLICY "custom_databases_insert" ON custom_databases FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "custom_databases_update" ON custom_databases;
CREATE POLICY "custom_databases_update" ON custom_databases FOR UPDATE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "custom_databases_delete" ON custom_databases;
CREATE POLICY "custom_databases_delete" ON custom_databases FOR DELETE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ── custom_database_rows ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS custom_database_rows (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  database_id   UUID NOT NULL REFERENCES custom_databases(id) ON DELETE CASCADE,
  properties    JSONB NOT NULL DEFAULT '{}',
  order_index   DOUBLE PRECISION DEFAULT 0,
  created_by    UUID,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_db_rows_tenant ON custom_database_rows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_db_rows_database ON custom_database_rows(database_id);
CREATE INDEX IF NOT EXISTS idx_custom_db_rows_props ON custom_database_rows USING gin(properties);

ALTER TABLE custom_database_rows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_db_rows_select" ON custom_database_rows;
CREATE POLICY "custom_db_rows_select" ON custom_database_rows FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "custom_db_rows_insert" ON custom_database_rows;
CREATE POLICY "custom_db_rows_insert" ON custom_database_rows FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "custom_db_rows_update" ON custom_database_rows;
CREATE POLICY "custom_db_rows_update" ON custom_database_rows FOR UPDATE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "custom_db_rows_delete" ON custom_database_rows;
CREATE POLICY "custom_db_rows_delete" ON custom_database_rows FOR DELETE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Trigger: auto-update updated_at for custom databases
DROP FUNCTION IF EXISTS update_custom_db_timestamp() CASCADE;
CREATE OR REPLACE FUNCTION update_custom_db_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_custom_databases_updated ON custom_databases;
CREATE TRIGGER trg_custom_databases_updated
  BEFORE UPDATE ON custom_databases
  FOR EACH ROW EXECUTE FUNCTION update_custom_db_timestamp();

DROP TRIGGER IF EXISTS trg_custom_db_rows_updated ON custom_database_rows;
CREATE TRIGGER trg_custom_db_rows_updated
  BEFORE UPDATE ON custom_database_rows
  FOR EACH ROW EXECUTE FUNCTION update_custom_db_timestamp();


-- ============================================================================
-- 20. REPORTS (schedules + runs)
-- ============================================================================

-- ── report_schedules ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS report_schedules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  type        TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'client')),
  name        TEXT NOT NULL,
  description TEXT,
  cron        TEXT NOT NULL DEFAULT '0 8 * * *',
  recipients  JSONB DEFAULT '[]',
  enabled     BOOLEAN DEFAULT true,
  config      JSONB DEFAULT '{}',
  created_by  UUID,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_schedules_tenant ON report_schedules(tenant_id, type);

ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant users can view report schedules" ON report_schedules;
CREATE POLICY "Tenant users can view report schedules" ON report_schedules
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "Tenant users can insert report schedules" ON report_schedules;
CREATE POLICY "Tenant users can insert report schedules" ON report_schedules
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "Tenant users can update report schedules" ON report_schedules;
CREATE POLICY "Tenant users can update report schedules" ON report_schedules
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "Tenant users can delete report schedules" ON report_schedules;
CREATE POLICY "Tenant users can delete report schedules" ON report_schedules
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ── report_runs ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS report_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  schedule_id   UUID REFERENCES report_schedules(id) ON DELETE SET NULL,
  type          TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'client')),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'error')),
  generated_at  TIMESTAMPTZ DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  content       JSONB DEFAULT '{}',
  html_content  TEXT,
  error         TEXT,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_runs_tenant ON report_runs(tenant_id, type, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_runs_schedule ON report_runs(schedule_id, generated_at DESC);

ALTER TABLE report_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant users can view report runs" ON report_runs;
CREATE POLICY "Tenant users can view report runs" ON report_runs
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "Tenant users can insert report runs" ON report_runs;
CREATE POLICY "Tenant users can insert report runs" ON report_runs
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "Tenant users can update report runs" ON report_runs;
CREATE POLICY "Tenant users can update report runs" ON report_runs
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));


-- ============================================================================
-- 21. CLIENT PORTAL TABLES
-- ============================================================================

-- ── client_portal_access ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_portal_access (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  client_id     UUID,
  client_name   TEXT NOT NULL,
  client_email  TEXT NOT NULL,
  access_token  UUID UNIQUE DEFAULT gen_random_uuid(),
  is_active     BOOLEAN DEFAULT true,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_portal_access_tenant ON client_portal_access(tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_access_token ON client_portal_access(access_token);
CREATE INDEX IF NOT EXISTS idx_client_portal_access_email ON client_portal_access(client_email);

ALTER TABLE client_portal_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_portal_access_select" ON client_portal_access;
CREATE POLICY "client_portal_access_select" ON client_portal_access FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "client_portal_access_insert" ON client_portal_access;
CREATE POLICY "client_portal_access_insert" ON client_portal_access FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "client_portal_access_update" ON client_portal_access;
CREATE POLICY "client_portal_access_update" ON client_portal_access FOR UPDATE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "client_portal_access_delete" ON client_portal_access;
CREATE POLICY "client_portal_access_delete" ON client_portal_access FOR DELETE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ── client_deliveries ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_deliveries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  client_id     UUID NOT NULL REFERENCES client_portal_access(id) ON DELETE CASCADE,
  project_id    UUID,
  title         TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'revision')),
  files         JSONB DEFAULT '[]',
  review_notes  TEXT,
  delivered_at  TIMESTAMPTZ DEFAULT now(),
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_deliveries_tenant ON client_deliveries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_deliveries_client ON client_deliveries(client_id);
CREATE INDEX IF NOT EXISTS idx_client_deliveries_project ON client_deliveries(project_id);
CREATE INDEX IF NOT EXISTS idx_client_deliveries_status ON client_deliveries(status);

ALTER TABLE client_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_deliveries_select" ON client_deliveries;
CREATE POLICY "client_deliveries_select" ON client_deliveries FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "client_deliveries_insert" ON client_deliveries;
CREATE POLICY "client_deliveries_insert" ON client_deliveries FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "client_deliveries_update" ON client_deliveries;
CREATE POLICY "client_deliveries_update" ON client_deliveries FOR UPDATE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "client_deliveries_delete" ON client_deliveries;
CREATE POLICY "client_deliveries_delete" ON client_deliveries FOR DELETE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ── client_messages ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  client_id     UUID NOT NULL REFERENCES client_portal_access(id) ON DELETE CASCADE,
  sender_type   TEXT NOT NULL CHECK (sender_type IN ('client', 'team')),
  sender_name   TEXT NOT NULL,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_messages_tenant ON client_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_client ON client_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_created ON client_messages(created_at DESC);

ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_messages_select" ON client_messages;
CREATE POLICY "client_messages_select" ON client_messages FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "client_messages_insert" ON client_messages;
CREATE POLICY "client_messages_insert" ON client_messages FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "client_messages_update" ON client_messages;
CREATE POLICY "client_messages_update" ON client_messages FOR UPDATE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "client_messages_delete" ON client_messages;
CREATE POLICY "client_messages_delete" ON client_messages FOR DELETE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ── client_activity_log ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  client_id   UUID NOT NULL REFERENCES client_portal_access(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_activity_log_tenant ON client_activity_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_activity_log_client ON client_activity_log(client_id);
CREATE INDEX IF NOT EXISTS idx_client_activity_log_created ON client_activity_log(created_at DESC);

ALTER TABLE client_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_activity_log_select" ON client_activity_log;
CREATE POLICY "client_activity_log_select" ON client_activity_log FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "client_activity_log_insert" ON client_activity_log;
CREATE POLICY "client_activity_log_insert" ON client_activity_log FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "client_activity_log_update" ON client_activity_log;
CREATE POLICY "client_activity_log_update" ON client_activity_log FOR UPDATE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "client_activity_log_delete" ON client_activity_log;
CREATE POLICY "client_activity_log_delete" ON client_activity_log FOR DELETE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));


-- ============================================================================
-- 22. RSM (Report Social Media) TABLES
-- ============================================================================

-- ── rsm_accounts ───────────────────────────────────────────────────────────
-- Final state: 039 base + 063 (reportei_account_id, platform_id)
CREATE TABLE IF NOT EXISTS rsm_accounts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id),
  client_id             UUID,
  platform              TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'linkedin', 'facebook')),
  handle                TEXT NOT NULL,
  profile_url           TEXT,
  followers_count       INTEGER DEFAULT 0,
  is_active             BOOLEAN DEFAULT true,
  reportei_account_id   TEXT,
  platform_id           TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rsm_accounts_tenant ON rsm_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rsm_accounts_client ON rsm_accounts(tenant_id, client_id);
-- Unique index for reportei upsert (replaces non-unique from 063, made unique in 065)
CREATE UNIQUE INDEX IF NOT EXISTS idx_rsm_accounts_reportei_unique
  ON rsm_accounts(reportei_account_id) WHERE reportei_account_id IS NOT NULL;

ALTER TABLE rsm_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rsm_accounts_select" ON rsm_accounts;
CREATE POLICY "rsm_accounts_select" ON rsm_accounts
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "rsm_accounts_insert" ON rsm_accounts;
CREATE POLICY "rsm_accounts_insert" ON rsm_accounts
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "rsm_accounts_update" ON rsm_accounts;
CREATE POLICY "rsm_accounts_update" ON rsm_accounts
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "rsm_accounts_delete" ON rsm_accounts;
CREATE POLICY "rsm_accounts_delete" ON rsm_accounts
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ── rsm_metrics ────────────────────────────────────────────────────────────
-- Final state: 039 base + 063 (source, clicks, saves, profile_views, upsert index)
CREATE TABLE IF NOT EXISTS rsm_metrics (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  account_id        UUID NOT NULL REFERENCES rsm_accounts(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  followers         INTEGER DEFAULT 0,
  following         INTEGER DEFAULT 0,
  posts_count       INTEGER DEFAULT 0,
  engagement_rate   NUMERIC(8,4) DEFAULT 0,
  reach             INTEGER DEFAULT 0,
  impressions       INTEGER DEFAULT 0,
  clicks            INTEGER DEFAULT 0,
  saves             INTEGER DEFAULT 0,
  profile_views     INTEGER DEFAULT 0,
  source            TEXT NOT NULL DEFAULT 'manual'
                    CHECK (source IN ('manual', 'reportei', 'meta_api', 'import')),
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rsm_metrics_tenant ON rsm_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rsm_metrics_account_date ON rsm_metrics(account_id, date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rsm_metrics_upsert ON rsm_metrics(account_id, date, source);

ALTER TABLE rsm_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rsm_metrics_select" ON rsm_metrics;
CREATE POLICY "rsm_metrics_select" ON rsm_metrics
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "rsm_metrics_insert" ON rsm_metrics;
CREATE POLICY "rsm_metrics_insert" ON rsm_metrics
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "rsm_metrics_update" ON rsm_metrics;
CREATE POLICY "rsm_metrics_update" ON rsm_metrics
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "rsm_metrics_delete" ON rsm_metrics;
CREATE POLICY "rsm_metrics_delete" ON rsm_metrics
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ── rsm_posts ──────────────────────────────────────────────────────────────
-- Final state: 039 base + 063 (external_post_id, source)
CREATE TABLE IF NOT EXISTS rsm_posts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  account_id        UUID NOT NULL REFERENCES rsm_accounts(id) ON DELETE CASCADE,
  title             TEXT,
  content           TEXT,
  type              TEXT NOT NULL DEFAULT 'feed' CHECK (type IN ('feed', 'story', 'reel', 'carousel')),
  status            TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'approved', 'production', 'scheduled', 'published')),
  scheduled_date    TIMESTAMPTZ,
  published_date    TIMESTAMPTZ,
  tags              JSONB DEFAULT '[]',
  media_urls        JSONB DEFAULT '[]',
  metrics           JSONB DEFAULT '{}',
  external_post_id  TEXT,
  source            TEXT NOT NULL DEFAULT 'manual'
                    CHECK (source IN ('manual', 'reportei', 'meta_api', 'import')),
  created_by        UUID,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rsm_posts_tenant ON rsm_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rsm_posts_account ON rsm_posts(account_id, status);
CREATE INDEX IF NOT EXISTS idx_rsm_posts_scheduled ON rsm_posts(tenant_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_rsm_posts_status ON rsm_posts(tenant_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rsm_posts_external
  ON rsm_posts(account_id, external_post_id) WHERE external_post_id IS NOT NULL;

ALTER TABLE rsm_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rsm_posts_select" ON rsm_posts;
CREATE POLICY "rsm_posts_select" ON rsm_posts
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "rsm_posts_insert" ON rsm_posts;
CREATE POLICY "rsm_posts_insert" ON rsm_posts
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "rsm_posts_update" ON rsm_posts;
CREATE POLICY "rsm_posts_update" ON rsm_posts
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "rsm_posts_delete" ON rsm_posts;
CREATE POLICY "rsm_posts_delete" ON rsm_posts
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ── rsm_ideas ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rsm_ideas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  client_id   UUID,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL DEFAULT 'educational' CHECK (category IN ('educational', 'institutional', 'product', 'backstage')),
  status      TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'approved', 'production', 'published')),
  assigned_to UUID,
  created_by  UUID,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rsm_ideas_tenant ON rsm_ideas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rsm_ideas_client ON rsm_ideas(tenant_id, client_id);
CREATE INDEX IF NOT EXISTS idx_rsm_ideas_status ON rsm_ideas(tenant_id, status);

ALTER TABLE rsm_ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rsm_ideas_select" ON rsm_ideas;
CREATE POLICY "rsm_ideas_select" ON rsm_ideas
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "rsm_ideas_insert" ON rsm_ideas;
CREATE POLICY "rsm_ideas_insert" ON rsm_ideas
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "rsm_ideas_update" ON rsm_ideas;
CREATE POLICY "rsm_ideas_update" ON rsm_ideas
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "rsm_ideas_delete" ON rsm_ideas;
CREATE POLICY "rsm_ideas_delete" ON rsm_ideas
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- RSM triggers
DROP TRIGGER IF EXISTS trg_rsm_accounts_updated_at ON rsm_accounts;
CREATE TRIGGER trg_rsm_accounts_updated_at
  BEFORE UPDATE ON rsm_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_rsm_posts_updated_at ON rsm_posts;
CREATE TRIGGER trg_rsm_posts_updated_at
  BEFORE UPDATE ON rsm_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_rsm_ideas_updated_at ON rsm_ideas;
CREATE TRIGGER trg_rsm_ideas_updated_at
  BEFORE UPDATE ON rsm_ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 23. DEMANDS + DEMAND CUSTOM FIELDS + DEMAND COMMENTS
-- ============================================================================

-- ── demands ────────────────────────────────────────────────────────────────
-- Final state: 046 base + 047 (extra columns) + 053 (start_date, tags)
CREATE TABLE IF NOT EXISTS demands (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id            UUID REFERENCES projects(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'A fazer',
  responsible           TEXT,
  due_date              DATE,
  due_date_end          DATE,
  start_date            DATE,
  bus                   TEXT[],
  tags                  TEXT[] DEFAULT '{}',
  notion_url            TEXT,
  notion_page_id        TEXT,
  prioridade            TEXT,
  info                  TEXT,
  formalizacao          TEXT,
  tipo_midia            TEXT[],
  subitem               TEXT,
  item_principal        TEXT,
  feito                 BOOLEAN DEFAULT FALSE,
  milestones            TEXT,
  notion_project_name   TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS demands_tenant_id_idx ON demands(tenant_id);
CREATE INDEX IF NOT EXISTS demands_project_id_idx ON demands(project_id);
CREATE INDEX IF NOT EXISTS demands_status_idx ON demands(status);
CREATE INDEX IF NOT EXISTS demands_prioridade_idx ON demands(prioridade) WHERE prioridade IS NOT NULL;
CREATE INDEX IF NOT EXISTS demands_due_date_range_idx ON demands(tenant_id, due_date, due_date_end) WHERE due_date IS NOT NULL;

ALTER TABLE demands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "demands_select" ON demands;
CREATE POLICY "demands_select" ON demands
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "demands_insert" ON demands;
CREATE POLICY "demands_insert" ON demands
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "demands_update" ON demands;
CREATE POLICY "demands_update" ON demands
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "demands_delete" ON demands;
CREATE POLICY "demands_delete" ON demands
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));


-- ============================================================================
-- 24. OS CORE TABLES (sections, tasks, custom fields, field values)
-- ============================================================================

-- Shared trigger function for OS tables
DROP FUNCTION IF EXISTS os_set_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION os_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── os_sections ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS os_sections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title        TEXT NOT NULL DEFAULT 'Sem titulo',
  order_index  INTEGER NOT NULL DEFAULT 0,
  color        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS os_sections_project_idx ON os_sections(project_id, order_index);
CREATE INDEX IF NOT EXISTS os_sections_tenant_idx ON os_sections(tenant_id);

ALTER TABLE os_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "os_sections_select" ON os_sections;
CREATE POLICY "os_sections_select" ON os_sections
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "os_sections_insert" ON os_sections;
CREATE POLICY "os_sections_insert" ON os_sections
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "os_sections_update" ON os_sections;
CREATE POLICY "os_sections_update" ON os_sections
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "os_sections_delete" ON os_sections;
CREATE POLICY "os_sections_delete" ON os_sections
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP TRIGGER IF EXISTS os_sections_updated_at ON os_sections;
CREATE TRIGGER os_sections_updated_at
  BEFORE UPDATE ON os_sections FOR EACH ROW EXECUTE FUNCTION os_set_updated_at();

-- ── os_tasks ───────────────────────────────────────────────────────────────
-- Final state: 049 base + 079 (updated_by)
CREATE TABLE IF NOT EXISTS os_tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section_id       UUID REFERENCES os_sections(id) ON DELETE SET NULL,
  parent_id        UUID REFERENCES os_tasks(id) ON DELETE CASCADE,
  title            TEXT NOT NULL DEFAULT '',
  description      TEXT,
  status           TEXT NOT NULL DEFAULT 'todo',
  assignee_id      UUID,
  assignee_name    TEXT,
  start_date       DATE,
  due_date         DATE,
  completed_at     TIMESTAMPTZ,
  priority         TEXT,
  order_index      INTEGER NOT NULL DEFAULT 0,
  is_completed     BOOLEAN DEFAULT FALSE,
  legacy_demand_id UUID,
  created_by       UUID,
  updated_by       UUID,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS os_tasks_project_section_idx ON os_tasks(project_id, section_id, order_index);
CREATE INDEX IF NOT EXISTS os_tasks_tenant_idx ON os_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS os_tasks_assignee_idx ON os_tasks(assignee_id) WHERE assignee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS os_tasks_parent_idx ON os_tasks(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS os_tasks_status_idx ON os_tasks(project_id, status);
CREATE INDEX IF NOT EXISTS os_tasks_legacy_idx ON os_tasks(legacy_demand_id) WHERE legacy_demand_id IS NOT NULL;

ALTER TABLE os_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "os_tasks_select" ON os_tasks;
CREATE POLICY "os_tasks_select" ON os_tasks
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "os_tasks_insert" ON os_tasks;
CREATE POLICY "os_tasks_insert" ON os_tasks
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "os_tasks_update" ON os_tasks;
CREATE POLICY "os_tasks_update" ON os_tasks
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "os_tasks_delete" ON os_tasks;
CREATE POLICY "os_tasks_delete" ON os_tasks
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP TRIGGER IF EXISTS os_tasks_updated_at ON os_tasks;
CREATE TRIGGER os_tasks_updated_at
  BEFORE UPDATE ON os_tasks FOR EACH ROW EXECUTE FUNCTION os_set_updated_at();

-- ── os_custom_fields ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS os_custom_fields (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  scope        TEXT NOT NULL DEFAULT 'project',
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL,
  config_json  JSONB DEFAULT '{}',
  order_index  INTEGER NOT NULL DEFAULT 0,
  is_visible   BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT os_cf_scope_check CHECK (
    (scope = 'global' AND project_id IS NULL) OR
    (scope = 'project' AND project_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS os_custom_fields_tenant_idx ON os_custom_fields(tenant_id);
CREATE INDEX IF NOT EXISTS os_custom_fields_project_idx ON os_custom_fields(project_id, order_index) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS os_custom_fields_scope_idx ON os_custom_fields(tenant_id, scope);

ALTER TABLE os_custom_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "os_custom_fields_select" ON os_custom_fields;
CREATE POLICY "os_custom_fields_select" ON os_custom_fields
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "os_custom_fields_insert" ON os_custom_fields;
CREATE POLICY "os_custom_fields_insert" ON os_custom_fields
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "os_custom_fields_update" ON os_custom_fields;
CREATE POLICY "os_custom_fields_update" ON os_custom_fields
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "os_custom_fields_delete" ON os_custom_fields;
CREATE POLICY "os_custom_fields_delete" ON os_custom_fields
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP TRIGGER IF EXISTS os_custom_fields_updated_at ON os_custom_fields;
CREATE TRIGGER os_custom_fields_updated_at
  BEFORE UPDATE ON os_custom_fields FOR EACH ROW EXECUTE FUNCTION os_set_updated_at();

-- ── os_task_field_values ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS os_task_field_values (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id     UUID NOT NULL REFERENCES os_tasks(id) ON DELETE CASCADE,
  field_id    UUID NOT NULL REFERENCES os_custom_fields(id) ON DELETE CASCADE,
  value_json  JSONB NOT NULL DEFAULT 'null',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT os_tfv_unique UNIQUE (task_id, field_id)
);

CREATE INDEX IF NOT EXISTS os_tfv_task_idx ON os_task_field_values(task_id);
CREATE INDEX IF NOT EXISTS os_tfv_field_idx ON os_task_field_values(field_id);
CREATE INDEX IF NOT EXISTS os_tfv_tenant_idx ON os_task_field_values(tenant_id);

ALTER TABLE os_task_field_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "os_tfv_select" ON os_task_field_values;
CREATE POLICY "os_tfv_select" ON os_task_field_values
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "os_tfv_insert" ON os_task_field_values;
CREATE POLICY "os_tfv_insert" ON os_task_field_values
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "os_tfv_update" ON os_task_field_values;
CREATE POLICY "os_tfv_update" ON os_task_field_values
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "os_tfv_delete" ON os_task_field_values;
CREATE POLICY "os_tfv_delete" ON os_task_field_values
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP TRIGGER IF EXISTS os_tfv_updated_at ON os_task_field_values;
CREATE TRIGGER os_tfv_updated_at
  BEFORE UPDATE ON os_task_field_values FOR EACH ROW EXECUTE FUNCTION os_set_updated_at();

-- ── demand_field_values ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS demand_field_values (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  demand_id   UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
  field_id    UUID NOT NULL REFERENCES os_custom_fields(id) ON DELETE CASCADE,
  value_json  JSONB NOT NULL DEFAULT 'null',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT dfv_unique UNIQUE (demand_id, field_id)
);

CREATE INDEX IF NOT EXISTS dfv_demand_idx ON demand_field_values(demand_id);
CREATE INDEX IF NOT EXISTS dfv_field_idx ON demand_field_values(field_id);
CREATE INDEX IF NOT EXISTS dfv_tenant_idx ON demand_field_values(tenant_id);

ALTER TABLE demand_field_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dfv_select" ON demand_field_values;
CREATE POLICY "dfv_select" ON demand_field_values
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "dfv_insert" ON demand_field_values;
CREATE POLICY "dfv_insert" ON demand_field_values
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "dfv_update" ON demand_field_values;
CREATE POLICY "dfv_update" ON demand_field_values
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "dfv_delete" ON demand_field_values;
CREATE POLICY "dfv_delete" ON demand_field_values
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP TRIGGER IF EXISTS dfv_updated_at ON demand_field_values;
CREATE TRIGGER dfv_updated_at
  BEFORE UPDATE ON demand_field_values FOR EACH ROW EXECUTE FUNCTION os_set_updated_at();

-- ── demand_comments ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS demand_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  demand_id   UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  mentions    JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dc_demand_created_idx ON demand_comments(demand_id, created_at);
CREATE INDEX IF NOT EXISTS dc_author_idx ON demand_comments(author_id);
CREATE INDEX IF NOT EXISTS dc_tenant_idx ON demand_comments(tenant_id);

ALTER TABLE demand_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dc_select" ON demand_comments;
CREATE POLICY "dc_select" ON demand_comments
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "dc_insert" ON demand_comments;
CREATE POLICY "dc_insert" ON demand_comments
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "dc_update" ON demand_comments;
CREATE POLICY "dc_update" ON demand_comments
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()) AND author_id = auth.uid());

DROP POLICY IF EXISTS "dc_delete" ON demand_comments;
CREATE POLICY "dc_delete" ON demand_comments
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()) AND author_id = auth.uid());

DROP TRIGGER IF EXISTS dc_updated_at ON demand_comments;
CREATE TRIGGER dc_updated_at
  BEFORE UPDATE ON demand_comments FOR EACH ROW EXECUTE FUNCTION os_set_updated_at();


-- ============================================================================
-- 25. OKRs (objectives, key results, check-ins, cycles, comments)
-- ============================================================================

-- Shared trigger function for OKR tables
DROP FUNCTION IF EXISTS okr_set_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION okr_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── okr_cycles ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS okr_cycles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  is_active   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_okr_cycles_tenant ON okr_cycles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_okr_cycles_active ON okr_cycles(tenant_id, is_active);

ALTER TABLE okr_cycles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "okr_cycles_select" ON okr_cycles;
CREATE POLICY okr_cycles_select ON okr_cycles FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "okr_cycles_insert" ON okr_cycles;
CREATE POLICY okr_cycles_insert ON okr_cycles FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "okr_cycles_update" ON okr_cycles;
CREATE POLICY okr_cycles_update ON okr_cycles FOR UPDATE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "okr_cycles_delete" ON okr_cycles;
CREATE POLICY okr_cycles_delete ON okr_cycles FOR DELETE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP TRIGGER IF EXISTS trg_okr_cycles_updated_at ON okr_cycles;
CREATE TRIGGER trg_okr_cycles_updated_at
  BEFORE UPDATE ON okr_cycles
  FOR EACH ROW EXECUTE FUNCTION okr_set_updated_at();

-- ── okr_objectives ─────────────────────────────────────────────────────────
-- Final state: 056 base + 062 (cycle_id, sort_order, status_override, archived_at, expanded level CHECK) + 066 (deleted_at)
CREATE TABLE IF NOT EXISTS okr_objectives (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  owner_id        UUID NOT NULL REFERENCES auth.users(id),
  period          TEXT NOT NULL,
  level           TEXT NOT NULL DEFAULT 'personal'
                  CHECK (level IN ('company', 'directorate', 'squad', 'individual', 'bu', 'personal')),
  bu              TEXT,
  parent_id       UUID REFERENCES okr_objectives(id) ON DELETE SET NULL,
  cycle_id        UUID REFERENCES okr_cycles(id) ON DELETE SET NULL,
  status          TEXT DEFAULT 'active'
                  CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  status_override TEXT DEFAULT NULL
                  CHECK (status_override IS NULL OR status_override IN ('on_track', 'attention', 'at_risk')),
  progress        NUMERIC(5,2) DEFAULT 0,
  sort_order      INTEGER DEFAULT 0,
  archived_at     TIMESTAMPTZ DEFAULT NULL,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_okr_objectives_tenant ON okr_objectives(tenant_id);
CREATE INDEX IF NOT EXISTS idx_okr_objectives_period ON okr_objectives(tenant_id, period);
CREATE INDEX IF NOT EXISTS idx_okr_objectives_level ON okr_objectives(tenant_id, level);
CREATE INDEX IF NOT EXISTS idx_okr_objectives_parent ON okr_objectives(parent_id);
CREATE INDEX IF NOT EXISTS idx_okr_objectives_owner ON okr_objectives(owner_id);
CREATE INDEX IF NOT EXISTS idx_okr_objectives_cycle ON okr_objectives(cycle_id);
CREATE INDEX IF NOT EXISTS idx_okr_objectives_sort ON okr_objectives(cycle_id, sort_order);

ALTER TABLE okr_objectives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "okr_objectives_select" ON okr_objectives;
CREATE POLICY okr_objectives_select ON okr_objectives FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "okr_objectives_insert" ON okr_objectives;
CREATE POLICY okr_objectives_insert ON okr_objectives FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "okr_objectives_update" ON okr_objectives;
CREATE POLICY okr_objectives_update ON okr_objectives FOR UPDATE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "okr_objectives_delete" ON okr_objectives;
CREATE POLICY okr_objectives_delete ON okr_objectives FOR DELETE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP TRIGGER IF EXISTS trg_okr_objectives_updated_at ON okr_objectives;
CREATE TRIGGER trg_okr_objectives_updated_at
  BEFORE UPDATE ON okr_objectives
  FOR EACH ROW EXECUTE FUNCTION okr_set_updated_at();

-- ── okr_key_results ────────────────────────────────────────────────────────
-- Final state: 056 base + 062 (weight, cadence, status_override, sort_order, archived_at, expanded metric_type CHECK) + 066 (deleted_at)
CREATE TABLE IF NOT EXISTS okr_key_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  objective_id    UUID NOT NULL REFERENCES okr_objectives(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  metric_type     TEXT DEFAULT 'number'
                  CHECK (metric_type IN ('number', 'percentage', 'currency', 'boolean', 'percent', 'binary', 'points')),
  start_value     NUMERIC(12,2) DEFAULT 0,
  target_value    NUMERIC(12,2) NOT NULL,
  current_value   NUMERIC(12,2) DEFAULT 0,
  unit            TEXT,
  owner_id        UUID REFERENCES auth.users(id),
  confidence      TEXT DEFAULT 'on_track'
                  CHECK (confidence IN ('on_track', 'at_risk', 'behind')),
  status          TEXT DEFAULT 'active'
                  CHECK (status IN ('active', 'completed', 'cancelled')),
  weight          NUMERIC(3,2) DEFAULT NULL,
  cadence         TEXT DEFAULT 'weekly'
                  CHECK (cadence IN ('weekly', 'biweekly', 'monthly')),
  status_override TEXT DEFAULT NULL
                  CHECK (status_override IS NULL OR status_override IN ('on_track', 'attention', 'at_risk')),
  sort_order      INTEGER DEFAULT 0,
  archived_at     TIMESTAMPTZ DEFAULT NULL,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_okr_kr_tenant ON okr_key_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_okr_kr_objective ON okr_key_results(objective_id);
CREATE INDEX IF NOT EXISTS idx_okr_kr_confidence ON okr_key_results(tenant_id, confidence);
CREATE INDEX IF NOT EXISTS idx_okr_kr_sort ON okr_key_results(objective_id, sort_order);

ALTER TABLE okr_key_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "okr_key_results_select" ON okr_key_results;
CREATE POLICY okr_key_results_select ON okr_key_results FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "okr_key_results_insert" ON okr_key_results;
CREATE POLICY okr_key_results_insert ON okr_key_results FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "okr_key_results_update" ON okr_key_results;
CREATE POLICY okr_key_results_update ON okr_key_results FOR UPDATE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "okr_key_results_delete" ON okr_key_results;
CREATE POLICY okr_key_results_delete ON okr_key_results FOR DELETE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP TRIGGER IF EXISTS trg_okr_key_results_updated_at ON okr_key_results;
CREATE TRIGGER trg_okr_key_results_updated_at
  BEFORE UPDATE ON okr_key_results
  FOR EACH ROW EXECUTE FUNCTION okr_set_updated_at();

-- ── okr_checkins ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS okr_checkins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key_result_id   UUID NOT NULL REFERENCES okr_key_results(id) ON DELETE CASCADE,
  previous_value  NUMERIC(12,2),
  new_value       NUMERIC(12,2) NOT NULL,
  confidence      TEXT DEFAULT 'on_track'
                  CHECK (confidence IN ('on_track', 'at_risk', 'behind')),
  notes           TEXT,
  author_id       UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_okr_checkins_tenant ON okr_checkins(tenant_id);
CREATE INDEX IF NOT EXISTS idx_okr_checkins_kr ON okr_checkins(key_result_id);
CREATE INDEX IF NOT EXISTS idx_okr_checkins_timeline ON okr_checkins(key_result_id, created_at DESC);

ALTER TABLE okr_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "okr_checkins_select" ON okr_checkins;
CREATE POLICY okr_checkins_select ON okr_checkins FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "okr_checkins_insert" ON okr_checkins;
CREATE POLICY okr_checkins_insert ON okr_checkins FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "okr_checkins_update" ON okr_checkins;
CREATE POLICY okr_checkins_update ON okr_checkins FOR UPDATE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "okr_checkins_delete" ON okr_checkins;
CREATE POLICY okr_checkins_delete ON okr_checkins FOR DELETE
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ── okr_comments ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS okr_comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  objective_id  UUID REFERENCES okr_objectives(id) ON DELETE CASCADE,
  key_result_id UUID REFERENCES okr_key_results(id) ON DELETE CASCADE,
  author_id     UUID NOT NULL,
  body          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_okr_comment_target CHECK (
    (objective_id IS NOT NULL AND key_result_id IS NULL) OR
    (objective_id IS NULL AND key_result_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_okr_comments_objective ON okr_comments(objective_id) WHERE objective_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_okr_comments_kr ON okr_comments(key_result_id) WHERE key_result_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_okr_comments_tenant ON okr_comments(tenant_id);

ALTER TABLE okr_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "okr_comments_tenant_read" ON okr_comments;
CREATE POLICY "okr_comments_tenant_read" ON okr_comments FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "okr_comments_tenant_insert" ON okr_comments;
CREATE POLICY "okr_comments_tenant_insert" ON okr_comments FOR INSERT
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "okr_comments_author_update" ON okr_comments;
CREATE POLICY "okr_comments_author_update" ON okr_comments FOR UPDATE
  USING (author_id = auth.uid());

DROP POLICY IF EXISTS "okr_comments_author_delete" ON okr_comments;
CREATE POLICY "okr_comments_author_delete" ON okr_comments FOR DELETE
  USING (author_id = auth.uid());


-- ============================================================================
-- 26. RITUAL TYPES
-- ============================================================================

CREATE TABLE IF NOT EXISTS ritual_types (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL,
  description         TEXT,
  frequency           TEXT NOT NULL CHECK (frequency IN ('daily','weekly','biweekly','monthly','quarterly','custom')),
  duration_minutes    INT DEFAULT 30,
  default_agenda      TEXT,
  default_participants TEXT[],
  icon                TEXT DEFAULT 'calendar',
  color               TEXT DEFAULT '#6366f1',
  is_system           BOOLEAN DEFAULT false,
  is_active           BOOLEAN DEFAULT true,
  sort_order          INT DEFAULT 0,
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_ritual_types_tenant ON ritual_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ritual_types_active ON ritual_types(tenant_id, is_active);

ALTER TABLE ritual_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ritual_types_select" ON ritual_types;
CREATE POLICY "ritual_types_select" ON ritual_types
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "ritual_types_insert" ON ritual_types;
CREATE POLICY "ritual_types_insert" ON ritual_types
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = ritual_types.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'project_owner', 'founder')
    )
  );

DROP POLICY IF EXISTS "ritual_types_update" ON ritual_types;
CREATE POLICY "ritual_types_update" ON ritual_types
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = ritual_types.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'project_owner', 'founder')
    )
  );

DROP POLICY IF EXISTS "ritual_types_delete" ON ritual_types;
CREATE POLICY "ritual_types_delete" ON ritual_types
  FOR DELETE USING (
    is_system = false
    AND EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = ritual_types.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

-- Add ritual_type_id FK to one_on_ones (from 064)
ALTER TABLE one_on_ones ADD COLUMN IF NOT EXISTS ritual_type_id UUID REFERENCES ritual_types(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_1on1_ritual_type ON one_on_ones(ritual_type_id);


-- ============================================================================
-- 27. USER PREFERENCES (table prefs, view state)
-- ============================================================================

-- ── user_table_preferences ─────────────────────────────────────────────────
-- Final state: 069 base + 083 (sort column)
CREATE TABLE IF NOT EXISTS user_table_preferences (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_id   TEXT NOT NULL,
  columns    JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort       JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_table_pref UNIQUE (tenant_id, user_id, table_id)
);

CREATE INDEX IF NOT EXISTS idx_user_table_pref_user ON user_table_preferences(user_id, table_id);
CREATE INDEX IF NOT EXISTS idx_user_table_pref_tenant ON user_table_preferences(tenant_id);

ALTER TABLE user_table_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_table_pref_own_read" ON user_table_preferences;
CREATE POLICY "user_table_pref_own_read" ON user_table_preferences FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_table_pref_own_insert" ON user_table_preferences;
CREATE POLICY "user_table_pref_own_insert" ON user_table_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid() AND tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "user_table_pref_own_update" ON user_table_preferences;
CREATE POLICY "user_table_pref_own_update" ON user_table_preferences FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_table_pref_own_delete" ON user_table_preferences;
CREATE POLICY "user_table_pref_own_delete" ON user_table_preferences FOR DELETE
  USING (user_id = auth.uid());

DROP FUNCTION IF EXISTS user_table_pref_set_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION user_table_pref_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_table_pref_updated_at ON user_table_preferences;
CREATE TRIGGER trg_user_table_pref_updated_at
  BEFORE UPDATE ON user_table_preferences
  FOR EACH ROW EXECUTE FUNCTION user_table_pref_set_updated_at();

-- ── user_view_state ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_view_state (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace    TEXT NOT NULL,
  view_key     TEXT NOT NULL,
  filters_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_json    JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_view_state UNIQUE (user_id, workspace, view_key)
);

CREATE INDEX IF NOT EXISTS idx_user_view_state_user ON user_view_state(user_id, workspace, view_key);
CREATE INDEX IF NOT EXISTS idx_user_view_state_tenant ON user_view_state(tenant_id);

ALTER TABLE user_view_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_view_state_own_select" ON user_view_state;
CREATE POLICY "user_view_state_own_select" ON user_view_state FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_view_state_own_insert" ON user_view_state;
CREATE POLICY "user_view_state_own_insert" ON user_view_state FOR INSERT
  WITH CHECK (user_id = auth.uid() AND tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "user_view_state_own_update" ON user_view_state;
CREATE POLICY "user_view_state_own_update" ON user_view_state FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_view_state_own_delete" ON user_view_state;
CREATE POLICY "user_view_state_own_delete" ON user_view_state FOR DELETE
  USING (user_id = auth.uid());

DROP FUNCTION IF EXISTS user_view_state_set_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION user_view_state_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_view_state_updated_at ON user_view_state;
CREATE TRIGGER trg_user_view_state_updated_at
  BEFORE UPDATE ON user_view_state
  FOR EACH ROW EXECUTE FUNCTION user_view_state_set_updated_at();


-- ============================================================================
-- 28. SCORECARD TABLES
-- ============================================================================

-- ── scorecard_skills ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scorecard_skills (
  id          TEXT PRIMARY KEY,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT DEFAULT 'technical',
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, id)
);

CREATE INDEX IF NOT EXISTS idx_scorecard_skills_tenant ON scorecard_skills(tenant_id);

ALTER TABLE scorecard_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scorecard_skills_select" ON scorecard_skills;
CREATE POLICY "scorecard_skills_select" ON scorecard_skills
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "scorecard_skills_insert" ON scorecard_skills;
CREATE POLICY "scorecard_skills_insert" ON scorecard_skills
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = scorecard_skills.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

DROP POLICY IF EXISTS "scorecard_skills_update" ON scorecard_skills;
CREATE POLICY "scorecard_skills_update" ON scorecard_skills
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = scorecard_skills.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

-- ── scorecard_config ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scorecard_config (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  skill_weight        NUMERIC(4,2) DEFAULT 0.35,
  impact_weight       NUMERIC(4,2) DEFAULT 0.45,
  culture_weight      NUMERIC(4,2) DEFAULT 0.20,
  elite_threshold     INT DEFAULT 90,
  high_perf_threshold INT DEFAULT 75,
  stable_threshold    INT DEFAULT 60,
  evaluation_period   TEXT DEFAULT 'monthly' CHECK (evaluation_period IN ('monthly', 'quarterly')),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id)
);

ALTER TABLE scorecard_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scorecard_config_select" ON scorecard_config;
CREATE POLICY "scorecard_config_select" ON scorecard_config
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "scorecard_config_upsert" ON scorecard_config;
CREATE POLICY "scorecard_config_upsert" ON scorecard_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = scorecard_config.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

-- ── scorecard_skill_weights ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scorecard_skill_weights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  skill_id    TEXT NOT NULL,
  role_name   TEXT NOT NULL,
  weight      NUMERIC(4,2) DEFAULT 1.0,
  expected_level INT DEFAULT 70,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, skill_id, role_name)
);

CREATE INDEX IF NOT EXISTS idx_skill_weights_tenant ON scorecard_skill_weights(tenant_id);

ALTER TABLE scorecard_skill_weights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "skill_weights_select" ON scorecard_skill_weights;
CREATE POLICY "skill_weights_select" ON scorecard_skill_weights
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "skill_weights_manage" ON scorecard_skill_weights;
CREATE POLICY "skill_weights_manage" ON scorecard_skill_weights
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = scorecard_skill_weights.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

-- ── employee_skill_scores ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employee_skill_scores (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES auth.users(id),
  skill_id          TEXT NOT NULL,
  level_percentage  INT NOT NULL CHECK (level_percentage BETWEEN 0 AND 100),
  expected_level    INT DEFAULT 70 CHECK (expected_level BETWEEN 0 AND 100),
  period            TEXT NOT NULL,
  evaluated_by      UUID REFERENCES auth.users(id),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, employee_id, skill_id, period)
);

CREATE INDEX IF NOT EXISTS idx_emp_skills_tenant ON employee_skill_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_emp_skills_employee ON employee_skill_scores(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_skills_period ON employee_skill_scores(period);

ALTER TABLE employee_skill_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "emp_skills_select" ON employee_skill_scores;
CREATE POLICY "emp_skills_select" ON employee_skill_scores
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "emp_skills_insert" ON employee_skill_scores;
CREATE POLICY "emp_skills_insert" ON employee_skill_scores
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = employee_skill_scores.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'coordinator', 'founder')
    )
  );

DROP POLICY IF EXISTS "emp_skills_update" ON employee_skill_scores;
CREATE POLICY "emp_skills_update" ON employee_skill_scores
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = employee_skill_scores.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'coordinator', 'founder')
    )
  );

-- ── employee_performance_snapshot ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employee_performance_snapshot (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES auth.users(id),
  skill_score     NUMERIC(5,2),
  impact_score    NUMERIC(5,2),
  culture_score   NUMERIC(5,2),
  final_score     NUMERIC(5,2),
  trend           TEXT CHECK (trend IN ('up', 'down', 'stable')),
  period          TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, employee_id, period)
);

CREATE INDEX IF NOT EXISTS idx_perf_snap_tenant ON employee_performance_snapshot(tenant_id);
CREATE INDEX IF NOT EXISTS idx_perf_snap_employee ON employee_performance_snapshot(employee_id);
CREATE INDEX IF NOT EXISTS idx_perf_snap_period ON employee_performance_snapshot(period);
CREATE INDEX IF NOT EXISTS idx_perf_snap_score ON employee_performance_snapshot(final_score);

ALTER TABLE employee_performance_snapshot ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "perf_snap_select" ON employee_performance_snapshot;
CREATE POLICY "perf_snap_select" ON employee_performance_snapshot
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "perf_snap_manage" ON employee_performance_snapshot;
CREATE POLICY "perf_snap_manage" ON employee_performance_snapshot
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = employee_performance_snapshot.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

-- ── employee_impact_metrics ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employee_impact_metrics (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id             UUID NOT NULL REFERENCES auth.users(id),
  period                  TEXT NOT NULL,
  on_time_delivery        NUMERIC(5,2),
  rework_rate             NUMERIC(5,2),
  project_margin          NUMERIC(5,2),
  okr_completion          NUMERIC(5,2),
  decision_participation  NUMERIC(5,2),
  recognitions_received   NUMERIC(5,2),
  raw_data                JSONB DEFAULT '{}'::jsonb,
  impact_score            NUMERIC(5,2),
  computed_at             TIMESTAMPTZ DEFAULT now(),
  created_at              TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, employee_id, period)
);

CREATE INDEX IF NOT EXISTS idx_impact_metrics_tenant ON employee_impact_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_impact_metrics_employee ON employee_impact_metrics(employee_id);
CREATE INDEX IF NOT EXISTS idx_impact_metrics_period ON employee_impact_metrics(period);

ALTER TABLE employee_impact_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "impact_metrics_select" ON employee_impact_metrics;
CREATE POLICY "impact_metrics_select" ON employee_impact_metrics
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "impact_metrics_manage" ON employee_impact_metrics;
CREATE POLICY "impact_metrics_manage" ON employee_impact_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = employee_impact_metrics.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

-- ── impact_metric_config ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS impact_metric_config (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_id   TEXT NOT NULL,
  weight      NUMERIC(4,2) DEFAULT 1.0,
  threshold   INT DEFAULT 100,
  is_inverted BOOLEAN DEFAULT FALSE,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, metric_id)
);

CREATE INDEX IF NOT EXISTS idx_impact_config_tenant ON impact_metric_config(tenant_id);

ALTER TABLE impact_metric_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "impact_config_select" ON impact_metric_config;
CREATE POLICY "impact_config_select" ON impact_metric_config
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "impact_config_manage" ON impact_metric_config;
CREATE POLICY "impact_config_manage" ON impact_metric_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = impact_metric_config.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

-- ── employee_culture_metrics ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employee_culture_metrics (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id               UUID NOT NULL REFERENCES auth.users(id),
  period                    TEXT NOT NULL,
  values_alignment          NUMERIC(5,2),
  feedback_engagement       NUMERIC(5,2),
  feedback_given            NUMERIC(5,2),
  one_on_one_participation  NUMERIC(5,2),
  collaboration_index       NUMERIC(5,2),
  peer_review_score         NUMERIC(5,2),
  raw_data                  JSONB DEFAULT '{}'::jsonb,
  culture_score             NUMERIC(5,2),
  computed_at               TIMESTAMPTZ DEFAULT now(),
  created_at                TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, employee_id, period)
);

CREATE INDEX IF NOT EXISTS idx_culture_metrics_tenant ON employee_culture_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_culture_metrics_employee ON employee_culture_metrics(employee_id);
CREATE INDEX IF NOT EXISTS idx_culture_metrics_period ON employee_culture_metrics(period);

ALTER TABLE employee_culture_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "culture_metrics_select" ON employee_culture_metrics;
CREATE POLICY "culture_metrics_select" ON employee_culture_metrics
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "culture_metrics_manage" ON employee_culture_metrics;
CREATE POLICY "culture_metrics_manage" ON employee_culture_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = employee_culture_metrics.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

-- ── culture_metric_config ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS culture_metric_config (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_id   TEXT NOT NULL,
  weight      NUMERIC(4,2) DEFAULT 1.0,
  threshold   INT DEFAULT 100,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, metric_id)
);

CREATE INDEX IF NOT EXISTS idx_culture_config_tenant ON culture_metric_config(tenant_id);

ALTER TABLE culture_metric_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "culture_config_select" ON culture_metric_config;
CREATE POLICY "culture_config_select" ON culture_metric_config
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "culture_config_manage" ON culture_metric_config;
CREATE POLICY "culture_config_manage" ON culture_metric_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = culture_metric_config.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );


-- ============================================================================
-- 29. ALERTS / NOTIFICATIONS / THREAD SUBSCRIPTIONS
-- ============================================================================

-- NOTE: Migration 079 references a `notifications` table (not inbox_notifications).
-- This table may have been created outside migrations or is an alias.
-- We include the column additions from 079 as ALTER TABLE statements.
-- If the table doesn't exist yet, create a minimal version:

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL,
  type        TEXT NOT NULL DEFAULT 'general',
  title       TEXT,
  body        TEXT,
  metadata    JSONB DEFAULT '{}',
  is_read     BOOLEAN DEFAULT false,
  read_at     TIMESTAMPTZ,
  -- Columns from 079
  actor_id        UUID,
  comment_id      UUID,
  meta            JSONB DEFAULT '{}',
  trigger_type    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_trigger
  ON notifications(user_id, trigger_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_actor
  ON notifications(actor_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert_authenticated" ON notifications;
CREATE POLICY "notifications_insert_authenticated" ON notifications
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
  );

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- ── thread_subscriptions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS thread_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL DEFAULT 'task',
  entity_id   UUID NOT NULL,
  user_id     UUID NOT NULL,
  is_muted    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT thread_subscriptions_unique_user_entity UNIQUE (entity_type, entity_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_thread_sub_entity ON thread_subscriptions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_thread_sub_user ON thread_subscriptions(user_id);

ALTER TABLE thread_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "thread_sub_select" ON thread_subscriptions;
CREATE POLICY "thread_sub_select" ON thread_subscriptions
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "thread_sub_insert" ON thread_subscriptions;
CREATE POLICY "thread_sub_insert" ON thread_subscriptions
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "thread_sub_update" ON thread_subscriptions;
CREATE POLICY "thread_sub_update" ON thread_subscriptions
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()) AND user_id = auth.uid());

DROP POLICY IF EXISTS "thread_sub_delete" ON thread_subscriptions;
CREATE POLICY "thread_sub_delete" ON thread_subscriptions
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()) AND user_id = auth.uid());


-- ============================================================================
-- 30. RD STATION + FIREFLIES CONFIG/SYNC TABLES
-- ============================================================================

-- ── rd_sync_log ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rd_sync_log (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id),
  status                  TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running','success','error')),
  deals_synced            INT NOT NULL DEFAULT 0,
  contacts_synced         INT NOT NULL DEFAULT 0,
  organizations_synced    INT NOT NULL DEFAULT 0,
  errors                  JSONB DEFAULT '[]'::jsonb,
  triggered_by            UUID REFERENCES auth.users(id),
  trigger_source          TEXT DEFAULT 'manual',
  started_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rd_sync_log_tenant ON rd_sync_log(tenant_id);

ALTER TABLE rd_sync_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rd_sync_log_tenant_read" ON rd_sync_log;
CREATE POLICY "rd_sync_log_tenant_read" ON rd_sync_log
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "rd_sync_log_tenant_insert" ON rd_sync_log;
CREATE POLICY "rd_sync_log_tenant_insert" ON rd_sync_log
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "rd_sync_log_tenant_update" ON rd_sync_log;
CREATE POLICY "rd_sync_log_tenant_update" ON rd_sync_log
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ── rd_config ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rd_config (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) UNIQUE,
  api_token   TEXT,
  base_url    TEXT DEFAULT 'https://crm.rdstation.com/api/v1',
  enabled     BOOLEAN NOT NULL DEFAULT false,
  last_sync   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE rd_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rd_config_tenant_rw" ON rd_config;
CREATE POLICY "rd_config_tenant_rw" ON rd_config
  FOR ALL USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ── fireflies_config ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fireflies_config (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) UNIQUE,
  api_key     TEXT,
  enabled     BOOLEAN NOT NULL DEFAULT false,
  auto_sync   BOOLEAN NOT NULL DEFAULT false,
  last_sync   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE fireflies_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fireflies_config_tenant_rw" ON fireflies_config;
CREATE POLICY "fireflies_config_tenant_rw" ON fireflies_config
  FOR ALL USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- ── fireflies_sync_log ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fireflies_sync_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id),
  status              TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running','success','error')),
  meetings_synced     INT NOT NULL DEFAULT 0,
  transcripts_synced  INT NOT NULL DEFAULT 0,
  errors              JSONB DEFAULT '[]'::jsonb,
  triggered_by        UUID REFERENCES auth.users(id),
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fireflies_sync_log_tenant ON fireflies_sync_log(tenant_id);

ALTER TABLE fireflies_sync_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fireflies_sync_log_tenant_read" ON fireflies_sync_log;
CREATE POLICY "fireflies_sync_log_tenant_read" ON fireflies_sync_log
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "fireflies_sync_log_tenant_insert" ON fireflies_sync_log;
CREATE POLICY "fireflies_sync_log_tenant_insert" ON fireflies_sync_log
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "fireflies_sync_log_tenant_update" ON fireflies_sync_log;
CREATE POLICY "fireflies_sync_log_tenant_update" ON fireflies_sync_log
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));


-- ============================================================================
-- 31. REPORTEI SYNC TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS reportei_sync_runs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id),
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at         TIMESTAMPTZ,
  status              TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'partial', 'error')),
  accounts_synced     INTEGER DEFAULT 0,
  metrics_upserted    INTEGER DEFAULT 0,
  posts_upserted      INTEGER DEFAULT 0,
  error_message       TEXT,
  details             JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_reportei_sync_runs_tenant ON reportei_sync_runs(tenant_id, started_at DESC);

ALTER TABLE reportei_sync_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reportei_sync_runs_select" ON reportei_sync_runs;
CREATE POLICY "reportei_sync_runs_select" ON reportei_sync_runs
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "reportei_sync_runs_insert" ON reportei_sync_runs;
CREATE POLICY "reportei_sync_runs_insert" ON reportei_sync_runs
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

DROP POLICY IF EXISTS "reportei_sync_runs_update" ON reportei_sync_runs;
CREATE POLICY "reportei_sync_runs_update" ON reportei_sync_runs
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()));


-- ============================================================================
-- 32. CHAT V2 ENHANCEMENTS
-- ============================================================================

-- Indexes for chat v2
CREATE INDEX IF NOT EXISTS idx_chat_messages_tenant ON chat_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_search ON chat_messages USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_created_active
  ON chat_messages(channel_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Recreate msg_select RLS policy (optimized, from 080)
DROP POLICY IF EXISTS "msg_select" ON chat_messages;
CREATE POLICY "msg_select" ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_channel_members
      WHERE channel_id = chat_messages.channel_id
      AND user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

-- RPC: get_unread_counts
DROP FUNCTION IF EXISTS get_unread_counts(UUID, UUID);
CREATE OR REPLACE FUNCTION get_unread_counts(p_user_id UUID, p_tenant_id UUID)
RETURNS TABLE(channel_id UUID, unread_count BIGINT) AS $$
  SELECT
    ccm.channel_id,
    COUNT(cm.id) AS unread_count
  FROM chat_channel_members ccm
  JOIN chat_channels cc ON cc.id = ccm.channel_id
  LEFT JOIN chat_messages cm
    ON cm.channel_id = ccm.channel_id
    AND cm.created_at > COALESCE(ccm.last_read_at, '1970-01-01'::timestamptz)
    AND cm.deleted_at IS NULL
    AND cm.sender_id != p_user_id
  WHERE ccm.user_id = p_user_id
    AND cc.tenant_id = p_tenant_id
    AND cc.is_archived = false
  GROUP BY ccm.channel_id;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- RPC: search_chat_messages
DROP FUNCTION IF EXISTS search_chat_messages(UUID, UUID, TEXT, INT, INT);
CREATE OR REPLACE FUNCTION search_chat_messages(
  p_tenant_id UUID,
  p_user_id UUID,
  p_query TEXT,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS SETOF chat_messages AS $$
  SELECT m.*
  FROM chat_messages m
  JOIN chat_channel_members ccm
    ON ccm.channel_id = m.channel_id AND ccm.user_id = p_user_id
  WHERE m.tenant_id = p_tenant_id
    AND m.deleted_at IS NULL
    AND m.search_vector @@ plainto_tsquery('portuguese', p_query)
  ORDER BY ts_rank(m.search_vector, plainto_tsquery('portuguese', p_query)) DESC
  LIMIT p_limit OFFSET p_offset;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;


-- ============================================================================
-- 33. RPC: get_people_ids_by_kpi (People KPI filter engine)
-- ============================================================================

DROP FUNCTION IF EXISTS get_people_ids_by_kpi(UUID, TEXT);
CREATE OR REPLACE FUNCTION get_people_ids_by_kpi(p_tenant_id UUID, p_kpi TEXT)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  CASE p_kpi

    WHEN 'at_risk' THEN
      RETURN QUERY
        SELECT DISTINCT ap.id
        FROM profiles ap
        LEFT JOIN pdis pd ON pd.person_id = ap.id AND pd.tenant_id = p_tenant_id
        WHERE ap.tenant_id = p_tenant_id
          AND ap.status = 'active'
          AND (
            (ap.media_avaliacao IS NOT NULL AND ap.media_avaliacao < 60)
            OR pd.status = 'Atrasado'
          );

    WHEN 'pending_1on1' THEN
      RETURN QUERY
        SELECT ap.id
        FROM profiles ap
        LEFT JOIN (
          SELECT o.collaborator_id AS person_id, MAX(o.scheduled_at) AS last_at
          FROM one_on_ones o
          WHERE o.tenant_id = p_tenant_id AND o.status = 'completed'
          GROUP BY o.collaborator_id
        ) l ON l.person_id = ap.id
        WHERE ap.tenant_id = p_tenant_id
          AND ap.status = 'active'
          AND (l.last_at IS NULL OR l.last_at < (now() - INTERVAL '30 days'));

    WHEN 'stale_pdi' THEN
      RETURN QUERY
        SELECT ap.id
        FROM profiles ap
        LEFT JOIN (
          SELECT pd.person_id, MAX(pd.last_updated_at) AS last_upd
          FROM pdis pd
          WHERE pd.tenant_id = p_tenant_id
          GROUP BY pd.person_id
        ) lp ON lp.person_id = ap.id
        WHERE ap.tenant_id = p_tenant_id
          AND ap.status = 'active'
          AND (lp.last_upd IS NULL OR lp.last_upd < (now() - INTERVAL '90 days'));

    WHEN 'overloaded' THEN
      RETURN QUERY
        SELECT ap.id
        FROM profiles ap
        JOIN (
          SELECT person_id AS pid, SUM(cnt) AS total_tasks
          FROM (
            SELECT assignee_id::text AS person_id, COUNT(*) AS cnt
            FROM os_tasks
            WHERE tenant_id = p_tenant_id
              AND (is_completed = false OR is_completed IS NULL)
              AND assignee_id IS NOT NULL
            GROUP BY assignee_id

            UNION ALL

            SELECT person_id, COUNT(*) AS cnt
            FROM person_tasks
            WHERE tenant_id = p_tenant_id
              AND (status IS NULL OR status NOT IN ('concluida', 'cancelada'))
            GROUP BY person_id
          ) combined
          GROUP BY person_id
        ) tc ON tc.pid = ap.id::text
        WHERE ap.tenant_id = p_tenant_id
          AND ap.status = 'active'
          AND tc.total_tasks >= 8;

    ELSE
      RETURN;

  END CASE;
END;
$$;


-- ============================================================================
-- 34. REALTIME PUBLICATION
-- ============================================================================

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_channel_members;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_reactions;
EXCEPTION WHEN others THEN NULL;
END $$;


-- ============================================================================
-- 35. AUDIT TRIGGERS (for PART 2 tables, uses fn_audit_trigger from PART 1)
-- ============================================================================

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_audit_trigger') THEN

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_recognition_rewards') THEN
      EXECUTE 'CREATE TRIGGER trg_audit_recognition_rewards AFTER INSERT OR UPDATE OR DELETE ON recognition_rewards FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_recognition_redemptions') THEN
      EXECUTE 'CREATE TRIGGER trg_audit_recognition_redemptions AFTER INSERT OR UPDATE OR DELETE ON recognition_redemptions FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_ritual_types') THEN
      EXECUTE 'CREATE TRIGGER trg_audit_ritual_types AFTER INSERT OR UPDATE OR DELETE ON ritual_types FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()';
    END IF;

  END IF;
END $$;


-- ============================================================================
-- 36. RLS POLICIES FOR PART 1 TABLES (that were not included in PART 1)
-- ============================================================================

-- recognition_rewards: Final RLS from 060 (LOWER for case-insensitive role matching)
DROP POLICY IF EXISTS "rewards_insert_admin" ON recognition_rewards;
CREATE POLICY rewards_insert_admin ON recognition_rewards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = recognition_rewards.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

DROP POLICY IF EXISTS "rewards_update_admin" ON recognition_rewards;
CREATE POLICY rewards_update_admin ON recognition_rewards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = recognition_rewards.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

DROP POLICY IF EXISTS "rewards_delete_admin" ON recognition_rewards;
CREATE POLICY rewards_delete_admin ON recognition_rewards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = recognition_rewards.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

-- recognition_rewards: tenant select
DROP POLICY IF EXISTS "rewards_select_tenant" ON recognition_rewards;
CREATE POLICY rewards_select_tenant ON recognition_rewards
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- recognition_redemptions: Final RLS from 060
DROP POLICY IF EXISTS "redemptions_select" ON recognition_redemptions;
CREATE POLICY redemptions_select ON recognition_redemptions
  FOR SELECT USING (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM tenant_members tm
        JOIN roles r ON r.id = tm.role_id
        WHERE tm.user_id = auth.uid()
          AND tm.tenant_id = recognition_redemptions.tenant_id
          AND LOWER(r.name) IN ('owner', 'admin', 'founder')
      )
    )
  );

DROP POLICY IF EXISTS "redemptions_insert" ON recognition_redemptions;
CREATE POLICY redemptions_insert ON recognition_redemptions
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT get_user_tenant_ids())
    AND user_id = auth.uid()
  );

DROP POLICY IF EXISTS "redemptions_update_admin" ON recognition_redemptions;
CREATE POLICY redemptions_update_admin ON recognition_redemptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = recognition_redemptions.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

-- culture_pages: Final RLS from 060
DROP POLICY IF EXISTS "culture_pages_update_admin" ON culture_pages;
CREATE POLICY culture_pages_update_admin ON culture_pages
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = culture_pages.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

DROP POLICY IF EXISTS "culture_pages_delete_admin" ON culture_pages;
CREATE POLICY culture_pages_delete_admin ON culture_pages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = culture_pages.tenant_id
        AND LOWER(r.name) IN ('owner', 'admin', 'founder')
    )
  );

-- fin_cash_entries: RLS from 086
ALTER TABLE fin_cash_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fin_cash_entries_select" ON fin_cash_entries;
CREATE POLICY "fin_cash_entries_select" ON fin_cash_entries
  FOR SELECT USING (is_finance_admin(tenant_id));

DROP POLICY IF EXISTS "fin_cash_entries_insert" ON fin_cash_entries;
CREATE POLICY "fin_cash_entries_insert" ON fin_cash_entries
  FOR INSERT WITH CHECK (is_finance_admin(tenant_id));

-- dre_settings: RLS from 085
ALTER TABLE dre_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant members can read dre_settings" ON dre_settings;
CREATE POLICY "Tenant members can read dre_settings" ON dre_settings FOR SELECT
  USING (tenant_id = ANY(get_user_tenant_ids()));

DROP POLICY IF EXISTS "Tenant members can manage dre_settings" ON dre_settings;
CREATE POLICY "Tenant members can manage dre_settings" ON dre_settings FOR ALL
  USING (tenant_id = ANY(get_user_tenant_ids()))
  WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));


-- ============================================================================
-- END OF PART 2
-- ============================================================================
-- Together with PART 1, this covers the complete TBO OS schema from
-- migrations 001 through 086 — all tables, columns, constraints, indexes,
-- RLS policies, triggers, and RPC functions in their final merged state.
-- ============================================================================

-- Fix: fn_deal_stage_automation was inserting into notifications WITHOUT tenant_id,
-- causing NOT NULL constraint violations. Deal notifications (won/lost) were silently failing.
-- This migration adds NEW.tenant_id to all notification inserts within the trigger.

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

    -- FIX: added tenant_id to notification inserts
    IF NEW.owner_id IS NOT NULL THEN
      INSERT INTO public.notifications (tenant_id, user_id, title, body, type, entity_type, entity_id, action_url)
      VALUES (NEW.tenant_id, NEW.owner_id, 'Deal Fechado!', 'O deal "' || NEW.name || '" foi fechado com sucesso!', 'success', 'deal', NEW.id::TEXT, '#projetos');
    END IF;

    SELECT ARRAY_AGG(id) INTO v_founder_ids
    FROM public.profiles WHERE role = 'founder' AND id != COALESCE(NEW.owner_id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF v_founder_ids IS NOT NULL THEN
      INSERT INTO public.notifications (tenant_id, user_id, title, body, type, entity_type, entity_id, action_url)
      SELECT NEW.tenant_id, unnest(v_founder_ids), 'Novo Deal Fechado!',
        'O deal "' || NEW.name || '" (R$ ' || COALESCE(NEW.value::TEXT, '0') || ') foi fechado.',
        'success', 'deal', NEW.id::TEXT, '#projetos';
    END IF;

  ELSIF NEW.stage = 'fechado_perdido' THEN
    INSERT INTO public.audit_log (entity_type, entity_id, entity_name, action, from_state, to_state, user_id, user_name, reason, metadata)
    VALUES ('deal', NEW.id::TEXT, NEW.name, 'stage_change', OLD.stage, NEW.stage, NEW.owner_id, NEW.owner_name, 'Deal perdido', jsonb_build_object('deal_value', NEW.value, 'company', NEW.company));

    -- FIX: added tenant_id to notification insert
    IF NEW.owner_id IS NOT NULL THEN
      INSERT INTO public.notifications (tenant_id, user_id, title, body, type, entity_type, entity_id)
      VALUES (NEW.tenant_id, NEW.owner_id, 'Deal Perdido', 'O deal "' || NEW.name || '" foi marcado como perdido.', 'warning', 'deal', NEW.id::TEXT);
    END IF;

  ELSE
    INSERT INTO public.audit_log (entity_type, entity_id, entity_name, action, from_state, to_state, user_id, user_name, metadata)
    VALUES ('deal', NEW.id::TEXT, NEW.name, 'stage_change', OLD.stage, NEW.stage, NEW.owner_id, NEW.owner_name, jsonb_build_object('deal_value', NEW.value));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

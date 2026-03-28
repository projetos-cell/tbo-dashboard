-- ============================================================================
-- TBO OS — RPC: promote_career (transacional)
-- Cria progressão + atualiza perfil em uma única transação
-- ============================================================================

CREATE OR REPLACE FUNCTION public.promote_career(
  p_tenant_id      uuid,
  p_profile_id     uuid,
  p_from_level_id  uuid,
  p_to_level_id    uuid,
  p_path_id        uuid,
  p_promoted_by    uuid,
  p_notes          text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_progression_id uuid;
BEGIN
  -- Validação: role do caller deve ser lider+
  IF public.get_current_user_role() NOT IN ('founder', 'diretoria', 'lider') THEN
    RAISE EXCEPTION 'Sem permissão para promover (role insuficiente)';
  END IF;

  -- Validação: tenant correto
  IF p_tenant_id != ALL(public.get_user_tenant_ids()) THEN
    RAISE EXCEPTION 'Tenant inválido';
  END IF;

  -- 1. Cria registro de progressão
  INSERT INTO public.career_progressions (
    tenant_id, profile_id, from_level_id, to_level_id, promoted_by, notes
  ) VALUES (
    p_tenant_id, p_profile_id, p_from_level_id, p_to_level_id, p_promoted_by, p_notes
  ) RETURNING id INTO v_progression_id;

  -- 2. Atualiza perfil (na mesma transação)
  UPDATE public.profiles
  SET career_level_id = p_to_level_id,
      career_path_id  = p_path_id
  WHERE id = p_profile_id;

  RETURN v_progression_id;
END;
$$;

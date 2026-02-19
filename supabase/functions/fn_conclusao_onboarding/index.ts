// ============================================================================
// TBO OS — Edge Function: fn_conclusao_onboarding
// Chamada quando o status do colaborador muda para 'ativo' (onboarding concluido)
// Registra notificacoes e agenda check-ins de Dia 30 e Dia 90
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { colaborador_id } = await req.json()

    if (!colaborador_id) {
      return new Response(
        JSON.stringify({ erro: 'colaborador_id e obrigatorio' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar dados do colaborador
    const { data: colab, error: colabError } = await supabase
      .from('colaboradores')
      .select('id, nome, email, cargo, buddy_id, quiz_score_final, data_inicio')
      .eq('id', colaborador_id)
      .single()

    if (colabError || !colab) {
      throw new Error(`Colaborador nao encontrado: ${colabError?.message}`)
    }

    // 1. Notificacao para o colaborador
    await supabase
      .from('onboarding_notificacoes')
      .insert({
        colaborador_id: colab.id,
        tipo: 'inapp',
        gatilho: 'conclusao_onboarding',
        destinatario: colab.email,
        mensagem: `Parabens, ${colab.nome}! Voce concluiu o onboarding com sucesso. Bem-vindo(a) oficialmente a equipe TBO!`,
        status: 'enviado'
      })

    // 2. Notificacao para os admins
    const { data: admins } = await supabase
      .from('colaboradores')
      .select('id, email')
      .in('perfil_acesso', ['admin', 'gestor'])

    if (admins) {
      for (const admin of admins) {
        await supabase
          .from('onboarding_notificacoes')
          .insert({
            colaborador_id: colab.id,
            tipo: 'inapp',
            gatilho: 'conclusao_onboarding_admin',
            destinatario: admin.email,
            mensagem: `${colab.nome} (${colab.cargo}) concluiu o onboarding${colab.quiz_score_final ? ` com score ${colab.quiz_score_final}%` : ''}.`,
            status: 'enviado'
          })
      }
    }

    // 3. Notificacao para o buddy
    if (colab.buddy_id) {
      const { data: buddy } = await supabase
        .from('colaboradores')
        .select('email, nome')
        .eq('id', colab.buddy_id)
        .single()

      if (buddy) {
        await supabase
          .from('onboarding_notificacoes')
          .insert({
            colaborador_id: colab.id,
            tipo: 'inapp',
            gatilho: 'conclusao_onboarding_buddy',
            destinatario: buddy.email,
            mensagem: `${colab.nome}, seu mentorado(a), concluiu o onboarding! Obrigado pelo apoio.`,
            status: 'enviado'
          })
      }
    }

    // 4. Agendar check-in de Dia 30
    const dia30 = new Date(colab.data_inicio)
    dia30.setDate(dia30.getDate() + 30)

    await supabase
      .from('onboarding_checkins')
      .insert({
        colaborador_id: colab.id,
        responsavel_id: colab.buddy_id,
        dia_numero: 30,
        agendado_para: dia30.toISOString(),
        duracao_min: 30
      })

    // 5. Agendar check-in de Dia 90
    const dia90 = new Date(colab.data_inicio)
    dia90.setDate(dia90.getDate() + 90)

    await supabase
      .from('onboarding_checkins')
      .insert({
        colaborador_id: colab.id,
        responsavel_id: colab.buddy_id,
        dia_numero: 90,
        agendado_para: dia90.toISOString(),
        duracao_min: 30
      })

    return new Response(
      JSON.stringify({
        mensagem: `Conclusao de onboarding registrada para ${colab.nome}`,
        checkins_agendados: ['Dia 30', 'Dia 90']
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na fn_conclusao_onboarding:', error)
    return new Response(
      JSON.stringify({ erro: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

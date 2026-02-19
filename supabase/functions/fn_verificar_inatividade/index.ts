// ============================================================================
// TBO OS — Edge Function: fn_verificar_inatividade
// Executada todo dia util as 10h via pg_cron
// Verifica colaboradores inativos e envia notificacoes escalonadas
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

    // Buscar colaboradores inativos via view
    const { data: inativos, error: fetchError } = await supabase
      .from('vw_colaboradores_inativos')
      .select('*')

    if (fetchError) {
      throw new Error(`Erro ao consultar inativos: ${fetchError.message}`)
    }

    if (!inativos || inativos.length === 0) {
      return new Response(
        JSON.stringify({ mensagem: 'Nenhum colaborador inativo encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const notificacoes: Array<{ nome: string; dias: number; nivel: string }> = []

    // Buscar admins para notificacao
    const { data: admins } = await supabase
      .from('colaboradores')
      .select('id, email')
      .in('perfil_acesso', ['admin', 'gestor'])

    for (const inativo of inativos) {
      const diasInativo = Math.floor(inativo.dias_sem_atividade)

      if (diasInativo >= 2) {
        // 2+ dias: notificar buddy e admin
        // Notificar buddy
        if (inativo.buddy_id) {
          await supabase
            .from('onboarding_notificacoes')
            .insert({
              colaborador_id: inativo.colaborador_id,
              tipo: 'inapp',
              gatilho: 'inatividade_buddy',
              destinatario: inativo.buddy_email,
              mensagem: `${inativo.nome} esta inativo(a) no onboarding ha ${diasInativo} dias. Como buddy, entre em contato para oferecer apoio.`,
              status: 'enviado'
            })
        }

        // Notificar admins
        if (admins) {
          for (const admin of admins) {
            await supabase
              .from('onboarding_notificacoes')
              .insert({
                colaborador_id: inativo.colaborador_id,
                tipo: 'inapp',
                gatilho: 'inatividade_admin',
                destinatario: admin.email,
                mensagem: `ATENCAO: ${inativo.nome} (${inativo.cargo}) esta inativo(a) no onboarding ha ${diasInativo} dias.`,
                status: 'enviado'
              })
          }
        }

        notificacoes.push({ nome: inativo.nome, dias: diasInativo, nivel: 'buddy+admin' })

      } else if (diasInativo >= 1) {
        // 1 dia: notificar apenas o colaborador
        await supabase
          .from('onboarding_notificacoes')
          .insert({
            colaborador_id: inativo.colaborador_id,
            tipo: 'inapp',
            gatilho: 'inatividade_colaborador',
            destinatario: inativo.email,
            mensagem: `Ola ${inativo.nome}! Notamos que voce nao acessou o onboarding ontem. Continue de onde parou — estamos aqui para ajudar!`,
            status: 'enviado'
          })

        notificacoes.push({ nome: inativo.nome, dias: diasInativo, nivel: 'colaborador' })
      }
    }

    return new Response(
      JSON.stringify({
        mensagem: `${notificacoes.length} notificacao(oes) de inatividade enviada(s)`,
        notificacoes
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na fn_verificar_inatividade:', error)
    return new Response(
      JSON.stringify({ erro: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

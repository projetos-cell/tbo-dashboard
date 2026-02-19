// ============================================================================
// TBO OS — Edge Function: fn_email_dia_anterior
// Executada todo dia util as 18h via pg_cron
// Envia notificacao de preparacao para colaboradores que comecam amanha
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

    // Calcular data de amanha no fuso de Sao Paulo
    const agora = new Date()
    const amanha = new Date(agora)
    amanha.setDate(amanha.getDate() + 1)
    const dataAmanha = amanha.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

    // Buscar colaboradores com data_inicio = amanha e status aguardando_inicio
    const { data: colaboradores, error: fetchError } = await supabase
      .from('colaboradores')
      .select('id, nome, email, cargo, buddy_id')
      .eq('status', 'aguardando_inicio')
      .eq('data_inicio', dataAmanha)

    if (fetchError) {
      throw new Error(`Erro ao buscar colaboradores: ${fetchError.message}`)
    }

    if (!colaboradores || colaboradores.length === 0) {
      return new Response(
        JSON.stringify({ mensagem: 'Nenhum colaborador comecando amanha', data: dataAmanha }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const notificados: string[] = []

    for (const colab of colaboradores) {
      // Registrar notificacao de preparacao para o colaborador
      // O envio real de email sera configurado quando o servico de email for definido
      await supabase
        .from('onboarding_notificacoes')
        .insert({
          colaborador_id: colab.id,
          tipo: 'email',
          gatilho: 'dia_anterior',
          destinatario: colab.email,
          mensagem: `Ola ${colab.nome}! Amanha e seu primeiro dia na TBO. Prepare-se para uma jornada incrivel! Voce recebera acesso a plataforma pela manha. Qualquer duvida, fale com seu buddy.`,
          status: 'pendente' // Pendente porque o envio real de email ainda nao esta configurado
        })

      // Notificar o buddy (se houver)
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
              gatilho: 'dia_anterior_buddy',
              destinatario: buddy.email,
              mensagem: `Lembrete: ${colab.nome} comeca na TBO amanha. Como buddy, esteja disponivel para recebe-lo(a)!`,
              status: 'enviado'
            })
        }
      }

      notificados.push(colab.nome)
    }

    return new Response(
      JSON.stringify({
        mensagem: `${notificados.length} notificacao(oes) de preparacao enviada(s)`,
        notificados,
        data: dataAmanha
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na fn_email_dia_anterior:', error)
    return new Response(
      JSON.stringify({ erro: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

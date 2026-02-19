// ============================================================================
// TBO OS — Edge Function: fn_liberar_dia_1
// Executada todo dia util as 08h via pg_cron
// Busca colaboradores aguardando inicio e libera o primeiro dia de onboarding
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Data de hoje no fuso de Sao Paulo
    const hoje = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

    // Buscar colaboradores com status 'aguardando_inicio' e data_inicio = hoje
    const { data: colaboradores, error: fetchError } = await supabase
      .from('colaboradores')
      .select('id, nome, email, tipo_onboarding, buddy_id')
      .eq('status', 'aguardando_inicio')
      .eq('data_inicio', hoje)

    if (fetchError) {
      throw new Error(`Erro ao buscar colaboradores: ${fetchError.message}`)
    }

    if (!colaboradores || colaboradores.length === 0) {
      return new Response(
        JSON.stringify({ mensagem: 'Nenhum colaborador para liberar hoje', data: hoje }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const liberados: string[] = []

    for (const colab of colaboradores) {
      // 1. Mudar status para 'onboarding'
      const { error: updateError } = await supabase
        .from('colaboradores')
        .update({ status: 'onboarding' })
        .eq('id', colab.id)

      if (updateError) {
        console.error(`Erro ao atualizar status de ${colab.nome}: ${updateError.message}`)
        continue
      }

      // 2. Buscar o primeiro dia do tipo de onboarding correto
      const { data: primeiroDia, error: diaError } = await supabase
        .from('onboarding_dias')
        .select('id')
        .eq('tipo_onboarding', colab.tipo_onboarding)
        .eq('numero', 1)
        .single()

      if (diaError || !primeiroDia) {
        console.error(`Dia 1 nao encontrado para tipo ${colab.tipo_onboarding}: ${diaError?.message}`)
        continue
      }

      // 3. Liberar o primeiro dia
      const { error: liberarError } = await supabase
        .from('onboarding_dias_liberados')
        .upsert({
          colaborador_id: colab.id,
          dia_id: primeiroDia.id,
          liberado_em: new Date().toISOString()
        }, { onConflict: 'colaborador_id,dia_id' })

      if (liberarError) {
        console.error(`Erro ao liberar dia 1 para ${colab.nome}: ${liberarError.message}`)
        continue
      }

      // 4. Registrar notificacao
      await supabase
        .from('onboarding_notificacoes')
        .insert({
          colaborador_id: colab.id,
          tipo: 'inapp',
          gatilho: 'inicio_onboarding',
          destinatario: colab.email,
          mensagem: `Bem-vindo(a) a TBO, ${colab.nome}! Seu onboarding comeca hoje. Acesse a plataforma para iniciar o Dia 1.`,
          status: 'enviado'
        })

      liberados.push(colab.nome)
    }

    return new Response(
      JSON.stringify({
        mensagem: `${liberados.length} colaborador(es) liberado(s)`,
        liberados,
        data: hoje
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na fn_liberar_dia_1:', error)
    return new Response(
      JSON.stringify({ erro: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

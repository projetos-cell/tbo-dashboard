// Vercel Serverless Function — Processar transcrição Fireflies → ações de 1:1
// Sprint 2.2.4: Extração de action items com Claude API
// Chamado pelo webhook Fireflies após linking com 1:1 ou manualmente pela UI
// Auth: X-Webhook-Secret header (mesmo do fireflies-webhook)

import { createClient } from '@supabase/supabase-js';

const ALLOWED_ORIGINS = [
  'https://tbo-dashboard-main.vercel.app',
  'https://tbo-os.vercel.app',
  'http://localhost:3000'
];

// ── Prompt para extração de ações ──
function buildExtractionPrompt(transcript, leaderName, collaboratorName) {
  return `Você é um assistente de RH da TBO (agência digital). Analise a transcrição de uma reunião 1:1 entre "${leaderName}" (líder) e "${collaboratorName}" (liderado).

Extraia:
1. **Resumo** (máximo 3 frases): O que foi discutido nesta 1:1.
2. **Ações**: Lista de tarefas/compromissos mencionados. Para cada ação:
   - text: descrição clara e acionável
   - assignee: "leader" ou "collaborator" (quem deve executar)
   - due_date_hint: prazo mencionado ou null (ex: "próxima semana", "sexta-feira")
   - category: uma de: feedback, desenvolvimento, operacional, pdi, follow_up
   - confidence: 0.0 a 1.0 (confiança na extração)

REGRAS:
- Extraia apenas compromissos CONCRETOS (não opiniões ou comentários).
- Se alguém disse "vou fazer X" ou "preciso de X", isso é uma ação.
- "Vamos acompanhar" = follow_up. "Preciso estudar/aprender" = desenvolvimento.
- Priorize ações atribuídas ao liderado, mas inclua também as do líder.
- Responda APENAS em JSON válido, sem markdown.

FORMATO (JSON array):
{
  "summary": "string",
  "actions": [
    {
      "text": "string",
      "assignee": "leader" | "collaborator",
      "due_date_hint": "string" | null,
      "category": "feedback" | "desenvolvimento" | "operacional" | "pdi" | "follow_up",
      "confidence": 0.85
    }
  ]
}

TRANSCRIÇÃO:
${transcript}`;
}

// ── Resolver due_date_hint para data ISO ──
function resolveDueDateHint(hint) {
  if (!hint) return null;
  const lower = hint.toLowerCase().trim();
  const now = new Date();
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  if (lower.includes('amanhã') || lower.includes('amanha')) return addDays(now, 1).toISOString().split('T')[0];
  if (lower.includes('hoje')) return now.toISOString().split('T')[0];
  if (lower.includes('próxima semana') || lower.includes('proxima semana') || lower.includes('semana que vem')) return addDays(now, 7).toISOString().split('T')[0];
  if (lower.includes('próximo mês') || lower.includes('proximo mes') || lower.includes('mês que vem')) return addDays(now, 30).toISOString().split('T')[0];

  // Dias da semana
  const dias = { 'segunda': 1, 'terça': 2, 'terca': 2, 'quarta': 3, 'quinta': 4, 'sexta': 5, 'sábado': 6, 'sabado': 6, 'domingo': 0 };
  for (const [nome, dia] of Object.entries(dias)) {
    if (lower.includes(nome)) {
      const diff = (dia - now.getDay() + 7) % 7 || 7;
      return addDays(now, diff).toISOString().split('T')[0];
    }
  }

  // Tentar parsear data direta (dd/mm, dd/mm/yyyy)
  const dateMatch = lower.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    const year = dateMatch[3] ? (dateMatch[3].length === 2 ? 2000 + parseInt(dateMatch[3]) : parseInt(dateMatch[3])) : now.getFullYear();
    const parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  }

  // Fallback: 7 dias
  return addDays(now, 7).toISOString().split('T')[0];
}

export default async function handler(req, res) {
  // ── CORS ──
  const origin = req.headers.origin || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Webhook-Secret, X-Tenant-Id');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Apenas POST' });

  // ── Auth: webhook secret OU Supabase JWT ──
  const webhookSecret = process.env.FIREFLIES_WEBHOOK_SECRET;
  const providedSecret = req.headers['x-webhook-secret'];
  const authHeader = req.headers.authorization;

  const isWebhookAuth = providedSecret && providedSecret === webhookSecret;
  const isBearerAuth = authHeader?.startsWith('Bearer ');

  if (!isWebhookAuth && !isBearerAuth) {
    return res.status(401).json({ ok: false, error: 'Auth inválido' });
  }

  // ── Parsear body ──
  const { one_on_one_id, meeting_id, tenant_id: bodyTenantId } = req.body || {};
  const tenantId = req.headers['x-tenant-id'] || bodyTenantId;

  if (!one_on_one_id || !tenantId) {
    return res.status(400).json({ ok: false, error: 'one_on_one_id e tenant_id obrigatórios' });
  }

  // ── Supabase ──
  const supabaseUrl = process.env.SUPABASE_URL || 'https://olnndpultyllyhzxuyxh.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceKey) return res.status(500).json({ ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY não configurado' });

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // ── Anthropic API key ──
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) return res.status(500).json({ ok: false, error: 'ANTHROPIC_API_KEY não configurado' });

  try {
    // 1. Buscar 1:1 + meeting vinculado
    const { data: oneOnOne, error: ooErr } = await supabase
      .from('one_on_ones')
      .select('id, leader_id, collaborator_id, fireflies_meeting_id, transcript_summary, transcript_processed_at')
      .eq('id', one_on_one_id)
      .eq('tenant_id', tenantId)
      .single();

    if (ooErr || !oneOnOne) return res.status(404).json({ ok: false, error: '1:1 não encontrada' });

    const meetingRef = meeting_id || oneOnOne.fireflies_meeting_id;
    if (!meetingRef) return res.status(400).json({ ok: false, error: '1:1 não tem meeting vinculado' });

    // 2. Buscar transcrição do meeting
    const { data: meeting } = await supabase
      .from('meetings')
      .select('id, title, summary, short_summary')
      .eq('id', meetingRef)
      .single();

    // Buscar sentences da transcrição
    const { data: sentences } = await supabase
      .from('meeting_transcriptions')
      .select('speaker_name, text')
      .eq('meeting_id', meetingRef)
      .order('raw_index', { ascending: true })
      .limit(500);

    // Montar texto completo
    let fullTranscript = '';
    if (sentences?.length) {
      fullTranscript = sentences.map(s => `${s.speaker_name || 'Speaker'}: ${s.text}`).join('\n');
    } else if (meeting?.summary) {
      fullTranscript = meeting.summary;
    } else if (meeting?.short_summary) {
      fullTranscript = meeting.short_summary;
    }

    if (!fullTranscript || fullTranscript.length < 50) {
      return res.status(400).json({ ok: false, error: 'Transcrição insuficiente para processar' });
    }

    // 3. Buscar nomes do líder e colaborador
    const { data: profiles } = await supabase
      .from('profiles')
      .select('supabase_uid, first_name, last_name')
      .eq('tenant_id', tenantId)
      .in('supabase_uid', [oneOnOne.leader_id, oneOnOne.collaborator_id].filter(Boolean));

    const leaderProfile = profiles?.find(p => p.supabase_uid === oneOnOne.leader_id);
    const collabProfile = profiles?.find(p => p.supabase_uid === oneOnOne.collaborator_id);
    const leaderName = leaderProfile ? `${leaderProfile.first_name || ''} ${leaderProfile.last_name || ''}`.trim() : 'Líder';
    const collabName = collabProfile ? `${collabProfile.first_name || ''} ${collabProfile.last_name || ''}`.trim() : 'Colaborador';

    // 4. Criar log de processamento
    const { data: logEntry } = await supabase
      .from('one_on_one_transcript_logs')
      .insert({
        tenant_id: tenantId,
        one_on_one_id: one_on_one_id,
        meeting_id: meetingRef,
        raw_transcript: fullTranscript.substring(0, 50000), // cap 50k chars
        status: 'processing'
      })
      .select('id')
      .single();

    // 5. Chamar Claude API
    // Limitar transcript a ~8k chars para manter custo baixo
    const truncatedTranscript = fullTranscript.length > 8000
      ? fullTranscript.substring(0, 8000) + '\n\n[... transcrição truncada ...]'
      : fullTranscript;

    const prompt = buildExtractionPrompt(truncatedTranscript, leaderName, collabName);

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!anthropicResponse.ok) {
      const errBody = await anthropicResponse.text();
      throw new Error(`Claude API error ${anthropicResponse.status}: ${errBody}`);
    }

    const anthropicResult = await anthropicResponse.json();
    const rawContent = anthropicResult.content?.[0]?.text || '{}';
    const tokensUsed = (anthropicResult.usage?.input_tokens || 0) + (anthropicResult.usage?.output_tokens || 0);

    // 6. Parsear resposta
    let parsed;
    try {
      // Limpar possíveis wrappers markdown
      const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      // Tentar extrair JSON do texto
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Resposta do Claude não é JSON válido');
      }
    }

    const summary = parsed.summary || '';
    const actions = parsed.actions || [];

    // 7. Atualizar log
    await supabase.from('one_on_one_transcript_logs')
      .update({
        ai_summary: summary,
        ai_actions: actions,
        ai_model: 'claude-haiku-4-5-20251001',
        tokens_used: tokensUsed,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', logEntry.id);

    // 8. Salvar resumo na 1:1
    await supabase.from('one_on_ones')
      .update({
        transcript_summary: summary,
        transcript_processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', one_on_one_id);

    // 9. Criar ações na tabela one_on_one_actions
    let actionsCreated = 0;
    for (const action of actions) {
      if (!action.text || action.confidence < 0.5) continue;

      const assigneeId = action.assignee === 'leader' ? oneOnOne.leader_id : oneOnOne.collaborator_id;
      const dueDate = resolveDueDateHint(action.due_date_hint);

      await supabase.from('one_on_one_actions').insert({
        tenant_id: tenantId,
        one_on_one_id: one_on_one_id,
        text: action.text,
        assignee_id: assigneeId,
        due_date: dueDate,
        completed: false,
        source: 'ai_extracted',
        ai_confidence: action.confidence,
        category: action.category || 'operacional',
        created_at: new Date().toISOString()
      });
      actionsCreated++;
    }

    console.log(`[Process Transcript] 1:1 ${one_on_one_id}: ${actionsCreated} ações extraídas, ${tokensUsed} tokens`);

    return res.status(200).json({
      ok: true,
      one_on_one_id,
      summary,
      actions_created: actionsCreated,
      tokens_used: tokensUsed
    });

  } catch (err) {
    console.error('[Process Transcript] Erro:', err.message);

    // Atualizar log com erro se possível
    try {
      await supabase.from('one_on_one_transcript_logs')
        .update({
          status: 'error',
          error_message: err.message,
          completed_at: new Date().toISOString()
        })
        .eq('one_on_one_id', one_on_one_id)
        .eq('status', 'processing');
    } catch { /* ignore */ }

    return res.status(500).json({ ok: false, error: err.message });
  }
}

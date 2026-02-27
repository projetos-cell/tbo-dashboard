// Vercel Serverless Function — Webhook para Fireflies via Zapier
// PRD v1.2: Recebe notificações de novas reuniões/transcrições
// Sprint 2.3.2: + Detecção automática de elogios em transcrições
// Deduplicação garantida por UNIQUE INDEX (tenant_id, fireflies_id)
// Auth: X-Webhook-Secret header + X-Tenant-Id header

import { createClient } from '@supabase/supabase-js';

// ── Server-side praise detection patterns ──
const PRAISE_PATTERNS = [
  // Alta confiança — Português
  { regex: /\bparab[eé]ns\b/gi, label: 'parabens', confidence: 0.9 },
  { regex: /\bexcelente\s+trabalho\b/gi, label: 'excelente trabalho', confidence: 0.95 },
  { regex: /\bmandou\s+(muito\s+)?bem\b/gi, label: 'mandou bem', confidence: 0.9 },
  { regex: /\barrasou\b/gi, label: 'arrasou', confidence: 0.85 },
  { regex: /\bmuito\s+orgulho/gi, label: 'orgulho', confidence: 0.85 },
  { regex: /\bmerece\s+reconhecimento/gi, label: 'merece reconhecimento', confidence: 0.95 },
  { regex: /\btrabalho\s+incr[ií]vel/gi, label: 'trabalho incrivel', confidence: 0.9 },
  { regex: /\bfez\s+um\s+[oó]timo\s+trabalho/gi, label: 'otimo trabalho', confidence: 0.95 },
  // Média confiança
  { regex: /\b(?:[oó]timo|otimo|excelente|sensacional|espetacular)\s+(?:resultado|entrega|desempenho|performance)/gi, label: 'otimo resultado', confidence: 0.85 },
  { regex: /\bde\s+parab[eé]ns\b/gi, label: 'de parabens', confidence: 0.9 },
  { regex: /\bdestaque\s+(?:para|pro|pra|do|da|de)\b/gi, label: 'destaque para', confidence: 0.85 },
  { regex: /\bparab[eé]ns\s+(?:para|pro|pra|ao|à|a)\b/gi, label: 'parabens para', confidence: 0.95 },
  // Inglês
  { regex: /\bgreat\s+(?:job|work)\b/gi, label: 'great job', confidence: 0.85 },
  { regex: /\bwell\s+done\b/gi, label: 'well done', confidence: 0.85 },
  { regex: /\bamazing\s+(?:work|job|result)/gi, label: 'amazing work', confidence: 0.85 },
  { regex: /\bkudos\b/gi, label: 'kudos', confidence: 0.9 }
];

const CONTEXT_WINDOW = 120;

function detectPraises(text, participants = [], minConfidence = 0.7) {
  if (!text || typeof text !== 'string') return [];
  const detections = [];
  const seen = new Set();

  for (const pat of PRAISE_PATTERNS) {
    if (pat.confidence < minConfidence) continue;
    let match;
    const regex = new RegExp(pat.regex.source, pat.regex.flags);
    while ((match = regex.exec(text)) !== null) {
      const start = Math.max(0, match.index - CONTEXT_WINDOW);
      const end = Math.min(text.length, match.index + match[0].length + CONTEXT_WINDOW);
      let ctx = text.substring(start, end).trim();
      if (start > 0) ctx = '...' + ctx;
      if (end < text.length) ctx = ctx + '...';

      const ctxKey = ctx.substring(0, 60);
      if (seen.has(ctxKey)) continue;
      seen.add(ctxKey);

      // Find person mentions in context
      const target = findTargetInContext(ctx, participants);

      detections.push({
        pattern: pat.label,
        matchedText: match[0],
        context: ctx,
        targetEmail: target?.email || null,
        targetName: target?.name || null,
        confidence: pat.confidence,
        index: match.index
      });
    }
  }

  // Sort by position, deduplicate overlapping
  detections.sort((a, b) => a.index - b.index);
  const deduped = [];
  for (const d of detections) {
    const overlap = deduped.find(prev => Math.abs(prev.index - d.index) < 50);
    if (!overlap) {
      deduped.push(d);
    } else if (d.confidence > overlap.confidence) {
      deduped[deduped.indexOf(overlap)] = d;
    }
  }
  return deduped;
}

function findTargetInContext(context, participants) {
  if (!participants || !participants.length) return null;
  const lowerCtx = context.toLowerCase();
  for (const p of participants) {
    const name = (typeof p === 'object') ? (p.displayName || p.name || '') : '';
    if (!name || name.length < 3) continue;
    if (lowerCtx.includes(name.toLowerCase())) {
      return { name, email: p.email };
    }
    const firstName = name.split(/\s+/)[0];
    if (firstName.length >= 3 && lowerCtx.includes(firstName.toLowerCase())) {
      return { name: firstName, email: p.email };
    }
  }
  return null;
}

// ── Whitelist de origens ──
const ALLOWED_ORIGINS = [
  'https://tbo-dashboard-main.vercel.app',
  'https://tbo-os.vercel.app',
  'https://hooks.zapier.com',
  'http://localhost:3000'
];

// ── Rate limiting em memória ──
const rateLimiter = {};
const RATE_LIMIT = 30; // requests por minuto
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(identifier) {
  const now = Date.now();
  if (!rateLimiter[identifier]) {
    rateLimiter[identifier] = { count: 1, resetAt: now + RATE_WINDOW };
    return true;
  }
  if (now > rateLimiter[identifier].resetAt) {
    rateLimiter[identifier] = { count: 1, resetAt: now + RATE_WINDOW };
    return true;
  }
  rateLimiter[identifier].count++;
  return rateLimiter[identifier].count <= RATE_LIMIT;
}

export default async function handler(req, res) {
  // ── CORS ──
  const origin = req.headers.origin || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Secret, X-Tenant-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Apenas POST permitido' });
  }

  // ── Rate Limit ──
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ ok: false, error: 'Rate limit excedido (30 req/min)' });
  }

  // ── Validar Webhook Secret ──
  const webhookSecret = process.env.FIREFLIES_WEBHOOK_SECRET;
  const providedSecret = req.headers['x-webhook-secret'];

  if (!webhookSecret) {
    console.error('[Fireflies Webhook] FIREFLIES_WEBHOOK_SECRET não configurado');
    return res.status(500).json({ ok: false, error: 'Webhook secret não configurado no servidor' });
  }

  if (!providedSecret || providedSecret !== webhookSecret) {
    return res.status(401).json({ ok: false, error: 'Webhook secret inválido' });
  }

  // ── Validar Tenant ID ──
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) {
    return res.status(400).json({ ok: false, error: 'X-Tenant-Id header obrigatório' });
  }

  // ── Parsear body ──
  const body = req.body;
  if (!body || !body.fireflies_id) {
    return res.status(400).json({
      ok: false,
      error: 'Payload inválido. Campos obrigatórios: fireflies_id, title',
      expected: {
        fireflies_id: 'string (obrigatório)',
        title: 'string',
        date: 'ISO 8601 datetime',
        duration: 'number (minutos)',
        participants: '[{email, displayName}]',
        summary: 'string',
        transcript_url: 'string'
      }
    });
  }

  // ── Inicializar Supabase server-side ──
  const supabaseUrl = process.env.SUPABASE_URL || 'https://olnndpultyllyhzxuyxh.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    console.error('[Fireflies Webhook] SUPABASE_SERVICE_ROLE_KEY não configurado');
    return res.status(500).json({ ok: false, error: 'Configuração do servidor incompleta' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // ── Validar tenant existe ──
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      return res.status(400).json({ ok: false, error: `Tenant ${tenantId} não encontrado` });
    }

    // ── Mapear dados do payload para formato meetings ──
    const meetingData = {
      tenant_id: tenantId,
      fireflies_id: body.fireflies_id,
      title: body.title || 'Reunião via Zapier',
      date: body.date ? new Date(body.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      time: body.date ? new Date(body.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null,
      duration_minutes: body.duration || 0,
      summary: body.summary || null,
      short_summary: body.summary || null,
      fireflies_url: body.transcript_url || null,
      audio_url: body.audio_url || null,
      organizer_email: body.organizer_email || null,
      host_email: body.host_email || null,
      meeting_link: body.transcript_url || null,
      status: 'concluida',
      sync_source: 'zapier',
      synced_at: new Date().toISOString()
    };

    // Detectar categoria pelo título
    const catRules = [
      { key: 'daily_socios', patterns: ['daily sócios', 'daily socios', 'daily'] },
      { key: 'cliente', patterns: ['alinhamento semanal', 'reunião cliente', 'cliente -'] },
      { key: 'review_projeto', patterns: ['review', 'revisão', 'aprovação'] },
      { key: 'alinhamento_interno', patterns: ['alinhamento', 'sync', 'standup', 'kickoff'] }
    ];
    const lower = (body.title || '').toLowerCase();
    meetingData.category = 'geral';
    for (const rule of catRules) {
      if (rule.patterns.some(p => lower.includes(p))) {
        meetingData.category = rule.key;
        break;
      }
    }

    // ── Upsert meeting (ON CONFLICT tenant_id + fireflies_id) ──
    // Verificar se já existe
    const { data: existing } = await supabase
      .from('meetings')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('fireflies_id', body.fireflies_id)
      .maybeSingle();

    let meeting;
    let isNew;

    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('meetings')
        .update({
          ...meetingData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      meeting = data;
      isNew = false;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('meetings')
        .insert(meetingData)
        .select()
        .single();
      if (error) throw error;
      meeting = data;
      isNew = true;
    }

    // ── Salvar participantes ──
    const participants = body.participants || [];
    if (participants.length > 0 && meeting?.id) {
      const participantRows = participants.map(p => ({
        tenant_id: tenantId,
        meeting_id: meeting.id,
        email: typeof p === 'string' ? p : (p.email || null),
        display_name: typeof p === 'object' ? (p.displayName || p.name || null) : null,
        is_tbo: (typeof p === 'string' ? p : (p.email || '')).toLowerCase().endsWith('@agenciatbo.com.br')
      })).filter(p => p.email);

      if (participantRows.length > 0) {
        await supabase
          .from('meeting_participants')
          .upsert(participantRows, { onConflict: 'meeting_id,email', ignoreDuplicates: false });
      }
    }

    // ── Detectar elogios no resumo/transcrição ──
    let praisesDetected = 0;
    const textToScan = [body.summary, body.transcript, body.notes].filter(Boolean).join('\n\n');

    if (textToScan && meeting?.id) {
      try {
        const praises = detectPraises(textToScan, participants, 0.8);

        for (const praise of praises) {
          // Resolver target para user_id via profiles
          let toUserId = null;
          if (praise.targetEmail) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('supabase_uid')
              .eq('tenant_id', tenantId)
              .eq('email', praise.targetEmail)
              .maybeSingle();
            toUserId = profile?.supabase_uid || null;
          }

          // Inserir reconhecimento auto-detectado (reviewed=false)
          await supabase.from('recognitions').insert({
            tenant_id: tenantId,
            from_user: null,
            to_user: toUserId,
            value_id: 'colaboracao',
            value_name: 'Colaboração',
            value_emoji: '🤝',
            message: `Elogio detectado: "${praise.matchedText}" ${praise.targetName ? 'para ' + praise.targetName : ''}`,
            points: 1,
            source: 'fireflies',
            reviewed: false,
            meeting_id: meeting.id,
            detection_context: praise.context,
            created_at: new Date().toISOString()
          });
          praisesDetected++;
        }

        if (praisesDetected > 0) {
          console.log(`[Fireflies Webhook] ${praisesDetected} elogio(s) detectado(s) na reunião ${body.fireflies_id}`);
        }
      } catch (praiseErr) {
        console.error('[Fireflies Webhook] Erro na detecção de elogios:', praiseErr.message);
        // Não falhar o webhook por causa de erro na detecção
      }
    }

    // ── Auto-match com 1:1 (Sprint 2.2.3) ──
    let linkedOneOnOneId = null;
    if (meeting?.id && participants.length > 0) {
      try {
        const participantEmails = participants
          .map(p => typeof p === 'string' ? p : (p.email || ''))
          .filter(Boolean);

        if (participantEmails.length >= 2 && participantEmails.length <= 4) {
          // Reuniões com 2-4 participantes são candidatas a 1:1
          const meetingDate = body.date || new Date().toISOString();

          // Buscar 1:1 agendada proxima da data com participantes coincidentes
          const dayBefore = new Date(meetingDate);
          dayBefore.setDate(dayBefore.getDate() - 2);
          const dayAfter = new Date(meetingDate);
          dayAfter.setDate(dayAfter.getDate() + 2);

          // Resolver emails para supabase_uids
          const { data: profiles } = await supabase
            .from('profiles')
            .select('supabase_uid, email')
            .eq('tenant_id', tenantId)
            .in('email', participantEmails.map(e => e.toLowerCase()));

          const profileUids = (profiles || []).map(p => p.supabase_uid).filter(Boolean);

          if (profileUids.length >= 2) {
            const { data: candidateOneOnOnes } = await supabase
              .from('one_on_ones')
              .select('id, leader_id, collaborator_id, scheduled_at')
              .eq('tenant_id', tenantId)
              .is('fireflies_meeting_id', null)
              .gte('scheduled_at', dayBefore.toISOString())
              .lte('scheduled_at', dayAfter.toISOString())
              .in('status', ['scheduled', 'completed'])
              .limit(10);

            if (candidateOneOnOnes?.length) {
              // Melhor match: ambos leader e collaborator nos participantes
              const bestMatch = candidateOneOnOnes.find(oo =>
                profileUids.includes(oo.leader_id) && profileUids.includes(oo.collaborator_id)
              ) || candidateOneOnOnes.find(oo =>
                profileUids.includes(oo.leader_id) || profileUids.includes(oo.collaborator_id)
              );

              if (bestMatch) {
                const updateData = {
                  fireflies_meeting_id: meeting.id,
                  status: 'completed',
                  updated_at: new Date().toISOString()
                };
                if (body.summary) updateData.transcript_summary = body.summary;

                await supabase
                  .from('one_on_ones')
                  .update(updateData)
                  .eq('id', bestMatch.id)
                  .eq('tenant_id', tenantId);

                linkedOneOnOneId = bestMatch.id;
                console.log(`[Fireflies Webhook] 1:1 ${bestMatch.id} vinculada ao meeting ${meeting.id}`);

                // Disparar processamento de transcrição assíncrono (Sprint 2.2.4)
                try {
                  const proto = req.headers['x-forwarded-proto'] || 'https';
                  const host = req.headers.host;
                  const processUrl = `${proto}://${host}/api/process-1on1-transcript`;
                  fetch(processUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-Webhook-Secret': webhookSecret,
                      'X-Tenant-Id': tenantId
                    },
                    body: JSON.stringify({
                      one_on_one_id: bestMatch.id,
                      meeting_id: meeting.id,
                      tenant_id: tenantId
                    })
                  }).catch(err => console.warn('[Fireflies Webhook] Trigger process-transcript falhou:', err.message));
                  console.log(`[Fireflies Webhook] Processamento de transcrição disparado para 1:1 ${bestMatch.id}`);
                } catch (triggerErr) {
                  console.warn('[Fireflies Webhook] Erro ao disparar processamento:', triggerErr.message);
                }
              }
            }
          }
        }
      } catch (linkErr) {
        console.error('[Fireflies Webhook] Erro no auto-link 1:1:', linkErr.message);
        // Não falhar o webhook por causa de erro no linking
      }
    }

    // ── Registrar sync log ──
    await supabase.from('fireflies_sync_log').insert({
      tenant_id: tenantId,
      status: 'success',
      meetings_fetched: 1,
      meetings_created: isNew ? 1 : 0,
      meetings_updated: isNew ? 0 : 1,
      trigger_source: 'zapier',
      finished_at: new Date().toISOString()
    });

    return res.status(200).json({
      ok: true,
      meeting_id: meeting.id,
      action: isNew ? 'created' : 'updated',
      fireflies_id: body.fireflies_id,
      praises_detected: praisesDetected,
      linked_one_on_one: linkedOneOnOneId
    });

  } catch (err) {
    console.error('[Fireflies Webhook] Erro:', err.message);

    // Registrar erro no sync log
    try {
      await supabase.from('fireflies_sync_log').insert({
        tenant_id: tenantId,
        status: 'error',
        trigger_source: 'zapier',
        errors: [{ error: err.message, payload_id: body.fireflies_id }],
        finished_at: new Date().toISOString()
      });
    } catch { /* ignore */ }

    return res.status(500).json({
      ok: false,
      error: 'Erro ao processar webhook',
      details: err.message
    });
  }
}

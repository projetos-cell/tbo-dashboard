// Vercel Serverless Function — Webhook para Fireflies via Zapier
// PRD v1.2: Recebe notificações de novas reuniões/transcrições
// Deduplicação garantida por UNIQUE INDEX (tenant_id, fireflies_id)
// Auth: X-Webhook-Secret header + X-Tenant-Id header

import { createClient } from '@supabase/supabase-js';

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
      fireflies_id: body.fireflies_id
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

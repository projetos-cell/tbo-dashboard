/**
 * TBO OS — Client Portal Repository
 *
 * CRUD for client portal access, deliveries, messages, and activity log.
 * Task #21 — Portal do Cliente
 * Follows RepoBase pattern with tenant isolation.
 */

const ClientPortalRepo = (() => {
  'use strict';

  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  // ── Access Management ────────────────────────────────────────────────────

  async function listClients() {
    const { data, error } = await _db().from('client_portal_access')
      .select('*')
      .eq('tenant_id', _tid())
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function getClient(id) {
    const { data, error } = await _db().from('client_portal_access')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', _tid())
      .single();
    if (error) throw error;
    return data;
  }

  async function createAccess({ client_name, client_email, client_id }) {
    const tid = _tid();
    const { data, error } = await _db().from('client_portal_access')
      .insert({
        tenant_id: tid,
        client_id: client_id || null,
        client_name,
        client_email,
        is_active: true
      })
      .select()
      .single();
    if (error) throw error;
    // Log activity
    if (data) {
      await logActivity(data.id, 'access_created', `Acesso criado para ${client_name} (${client_email})`).catch(() => {});
    }
    return data;
  }

  async function updateAccess(id, updates) {
    const { data, error } = await _db().from('client_portal_access')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', _tid())
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function generateAccessLink(clientId) {
    // Regenerate access token
    const newToken = crypto.randomUUID ? crypto.randomUUID() : _uuidv4();
    const { data, error } = await _db().from('client_portal_access')
      .update({ access_token: newToken })
      .eq('id', clientId)
      .eq('tenant_id', _tid())
      .select()
      .single();
    if (error) throw error;
    await logActivity(clientId, 'link_generated', 'Link de acesso regenerado').catch(() => {});
    return data;
  }

  // ── Deliveries ───────────────────────────────────────────────────────────

  async function listDeliveries(clientId) {
    let query = _db().from('client_deliveries')
      .select('*')
      .eq('tenant_id', _tid())
      .order('created_at', { ascending: false });
    if (clientId) query = query.eq('client_id', clientId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async function createDelivery({ client_id, project_id, title, description, files }) {
    const tid = _tid();
    const { data, error } = await _db().from('client_deliveries')
      .insert({
        tenant_id: tid,
        client_id,
        project_id: project_id || null,
        title,
        description: description || '',
        status: 'pending',
        files: files || [],
        delivered_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    if (data) {
      await logActivity(client_id, 'delivery_created', `Entrega criada: ${title}`).catch(() => {});
    }
    return data;
  }

  async function updateDeliveryStatus(deliveryId, status, reviewNotes) {
    const updates = { status };
    if (status === 'approved' || status === 'revision') {
      updates.reviewed_at = new Date().toISOString();
    }
    if (reviewNotes !== undefined) {
      updates.review_notes = reviewNotes;
    }
    const { data, error } = await _db().from('client_deliveries')
      .update(updates)
      .eq('id', deliveryId)
      .eq('tenant_id', _tid())
      .select()
      .single();
    if (error) throw error;
    if (data) {
      const actionMap = { approved: 'delivery_approved', revision: 'delivery_revision', pending: 'delivery_reset' };
      await logActivity(data.client_id, actionMap[status] || 'delivery_updated', `Entrega "${data.title}" — ${status}`).catch(() => {});
    }
    return data;
  }

  // ── Messages ─────────────────────────────────────────────────────────────

  async function listMessages(clientId) {
    const { data, error } = await _db().from('client_messages')
      .select('*')
      .eq('tenant_id', _tid())
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function sendMessage({ client_id, sender_type, sender_name, content }) {
    const tid = _tid();
    const { data, error } = await _db().from('client_messages')
      .insert({
        tenant_id: tid,
        client_id,
        sender_type,
        sender_name,
        content
      })
      .select()
      .single();
    if (error) throw error;
    if (data) {
      await logActivity(client_id, 'message_sent', `Mensagem de ${sender_name} (${sender_type})`).catch(() => {});
    }
    return data;
  }

  // ── Activity Log ─────────────────────────────────────────────────────────

  async function listActivity(clientId) {
    const { data, error } = await _db().from('client_activity_log')
      .select('*')
      .eq('tenant_id', _tid())
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data || [];
  }

  async function logActivity(clientId, action, description) {
    const tid = _tid();
    const { error } = await _db().from('client_activity_log')
      .insert({
        tenant_id: tid,
        client_id: clientId,
        action,
        description: description || ''
      });
    if (error) console.warn('[ClientPortalRepo] logActivity error:', error.message);
  }

  // ── UUID fallback ────────────────────────────────────────────────────────
  function _uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  return {
    // Access
    listClients,
    getClient,
    createAccess,
    updateAccess,
    generateAccessLink,
    // Deliveries
    listDeliveries,
    createDelivery,
    updateDeliveryStatus,
    // Messages
    listMessages,
    sendMessage,
    // Activity
    listActivity,
    logActivity
  };
})();

if (typeof window !== 'undefined') {
  window.ClientPortalRepo = ClientPortalRepo;
}

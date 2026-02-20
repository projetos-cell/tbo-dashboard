/**
 * TBO OS — RLS Policies Documentation
 *
 * Este arquivo documenta as policies RLS aplicadas no Supabase.
 * NÃO executa nada — serve como referência para o time.
 *
 * A fonte da verdade são as migrations em supabase/migrations/.
 *
 * Padrão multi-tenant:
 * - SELECT: auth.uid() = user_id OR tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
 * - INSERT: tenant_id obrigatório, validado via check
 * - UPDATE: somente registros do tenant + role check
 * - DELETE: somente admin/founder do tenant
 */

const RLS_POLICIES = {
  // Tabelas com RLS ativo (migration v6+)
  tables: [
    'profiles',
    'projects',
    'tasks',
    'task_assignments',
    'clients',
    'crm_deals',
    'crm_activities',
    'financial_transactions',
    'financial_categories',
    'cost_centers',
    'bank_accounts',
    'invoices',
    'budget_items',
    'payment_schedules',
    'chat_channels',
    'chat_messages',
    'chat_reactions',
    'notifications',
    'audit_log',
    'tenants',
    'tenant_members',
    'roles',
    'role_permissions',
    'integration_configs',
    'document_versions',
    'onboarding_steps',
    'colaboradores',
    'convites'
  ],

  // Helper functions no Postgres
  functions: [
    'fn_get_user_tenant_id()',       // Retorna tenant_id do auth.uid()
    'fn_user_has_role(role_name)',    // Verifica se user tem role
    'fn_audit_trigger()',            // Trigger de auditoria
    'check_module_access(module)',    // Verifica acesso a módulo
    'get_user_permissions(user_id)'  // Retorna permissões do user
  ]
};

// Exportar para referência
if (typeof window !== 'undefined') {
  window.RLS_POLICIES = RLS_POLICIES;
}

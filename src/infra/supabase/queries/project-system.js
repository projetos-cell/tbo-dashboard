/**
 * TBO OS — Project System Repository (Kanban + Tasks + Comments)
 *
 * CRUD para boards, tasks (com subtasks), comments.
 * Task #22 — Sistema de Projetos
 */

const ProjectSystemRepo = (() => {
  'use strict';

  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  function _userId() {
    if (typeof TBO_AUTH !== 'undefined') return TBO_AUTH.getCurrentUser()?.id || null;
    return null;
  }

  // ── Board CRUD ──────────────────────────────────────────────────────

  async function listBoards(projectId) {
    let query = _db().from('project_boards')
      .select('*')
      .eq('tenant_id', _tid())
      .order('created_at', { ascending: false });

    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async function getBoard(id) {
    const { data, error } = await _db().from('project_boards')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', _tid())
      .single();
    if (error) throw error;
    return data;
  }

  async function createBoard({ name, project_id, columns }) {
    const tid = _tid();
    const payload = {
      tenant_id: tid,
      name: name || 'Novo Board',
      created_by: _userId()
    };
    if (project_id) payload.project_id = project_id;
    if (columns) payload.columns = columns;

    const { data, error } = await _db().from('project_boards')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function updateBoard(id, updates) {
    const allowed = ['name', 'columns', 'project_id'];
    const clean = {};
    for (const k of allowed) {
      if (updates[k] !== undefined) clean[k] = updates[k];
    }

    const { data, error } = await _db().from('project_boards')
      .update(clean)
      .eq('id', id)
      .eq('tenant_id', _tid())
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function deleteBoard(id) {
    const { error } = await _db().from('project_boards')
      .delete()
      .eq('id', id)
      .eq('tenant_id', _tid());
    if (error) throw error;
  }

  // ── Task CRUD ──────────────────────────────────────────────────────

  async function listTasks(boardId, filters = {}) {
    let query = _db().from('project_tasks')
      .select('*')
      .eq('tenant_id', _tid())
      .eq('board_id', boardId)
      .order('order_index', { ascending: true });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.priority) query = query.eq('priority', filters.priority);
    if (filters.assignee_id) query = query.eq('assignee_id', filters.assignee_id);
    if (filters.client_id) query = query.eq('client_id', filters.client_id);
    if (filters.parent_task_id === null) query = query.is('parent_task_id', null);
    else if (filters.parent_task_id) query = query.eq('parent_task_id', filters.parent_task_id);
    if (filters.due_from) query = query.gte('due_date', filters.due_from);
    if (filters.due_to) query = query.lte('due_date', filters.due_to);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async function getTask(id) {
    const { data, error } = await _db().from('project_tasks')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', _tid())
      .single();
    if (error) throw error;
    return data;
  }

  async function createTask({ board_id, title, description, status, priority, assignee_id, due_date, order_index, parent_task_id, client_id, tags }) {
    const tid = _tid();
    const payload = {
      tenant_id: tid,
      board_id,
      title: title || 'Nova tarefa',
      created_by: _userId()
    };
    if (description !== undefined) payload.description = description;
    if (status) payload.status = status;
    if (priority) payload.priority = priority;
    if (assignee_id) payload.assignee_id = assignee_id;
    if (due_date) payload.due_date = due_date;
    if (order_index !== undefined) payload.order_index = order_index;
    if (parent_task_id) payload.parent_task_id = parent_task_id;
    if (client_id) payload.client_id = client_id;
    if (tags) payload.tags = tags;

    const { data, error } = await _db().from('project_tasks')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function updateTask(id, updates) {
    const allowed = ['title', 'description', 'status', 'priority', 'assignee_id', 'due_date', 'order_index', 'parent_task_id', 'client_id', 'tags'];
    const clean = {};
    for (const k of allowed) {
      if (updates[k] !== undefined) clean[k] = updates[k];
    }

    const { data, error } = await _db().from('project_tasks')
      .update(clean)
      .eq('id', id)
      .eq('tenant_id', _tid())
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function updateTaskOrder(id, status, order_index) {
    const clean = { status, order_index };
    const { data, error } = await _db().from('project_tasks')
      .update(clean)
      .eq('id', id)
      .eq('tenant_id', _tid())
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function deleteTask(id) {
    const { error } = await _db().from('project_tasks')
      .delete()
      .eq('id', id)
      .eq('tenant_id', _tid());
    if (error) throw error;
  }

  // ── Comments ──────────────────────────────────────────────────────

  async function listComments(taskId) {
    const { data, error } = await _db().from('project_task_comments')
      .select('*')
      .eq('task_id', taskId)
      .eq('tenant_id', _tid())
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function addComment({ task_id, content }) {
    const tid = _tid();
    const { data, error } = await _db().from('project_task_comments')
      .insert({
        tenant_id: tid,
        task_id,
        user_id: _userId(),
        content
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // ── Query helpers ──────────────────────────────────────────────────

  async function getTasksByAssignee(assigneeId) {
    const { data, error } = await _db().from('project_tasks')
      .select('*, project_boards!inner(name, project_id)')
      .eq('tenant_id', _tid())
      .eq('assignee_id', assigneeId)
      .order('due_date', { ascending: true, nullsFirst: false });
    if (error) throw error;
    return data || [];
  }

  async function getTasksByClient(clientId) {
    const { data, error } = await _db().from('project_tasks')
      .select('*, project_boards!inner(name, project_id)')
      .eq('tenant_id', _tid())
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // ── Public API ─────────────────────────────────────────────────────

  return {
    // Board
    listBoards,
    getBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    // Task
    listTasks,
    getTask,
    createTask,
    updateTask,
    updateTaskOrder,
    deleteTask,
    // Comments
    listComments,
    addComment,
    // Queries
    getTasksByAssignee,
    getTasksByClient
  };
})();

if (typeof window !== 'undefined') {
  window.ProjectSystemRepo = ProjectSystemRepo;
}

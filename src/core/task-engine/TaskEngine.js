/**
 * TBO OS — Task Engine
 *
 * Orchestrates task, section, and field operations.
 * All mutations: optimistic Store update → async Repo persist → rollback on error.
 * Views call TaskEngine — never Repos directly.
 *
 * API:
 *   // Tasks
 *   TBO_TASK_ENGINE.createTask({ projectId, sectionId, title, insertAt? })
 *   TBO_TASK_ENGINE.updateTask(taskId, patch)
 *   TBO_TASK_ENGINE.deleteTask(taskId)
 *   TBO_TASK_ENGINE.completeTask(taskId)
 *   TBO_TASK_ENGINE.uncompleteTask(taskId)
 *   TBO_TASK_ENGINE.moveTask(taskId, { toSectionId, toIndex })
 *   TBO_TASK_ENGINE.reorderTasks(sectionId, orderedIds)
 *
 *   // Sections
 *   TBO_TASK_ENGINE.createSection({ projectId, title, insertAt? })
 *   TBO_TASK_ENGINE.updateSection(sectionId, patch)
 *   TBO_TASK_ENGINE.deleteSection(sectionId, { moveTasksTo? })
 *   TBO_TASK_ENGINE.reorderSections(projectId, orderedIds)
 *
 *   // Fields
 *   TBO_TASK_ENGINE.createField({ projectId, name, type, config? })
 *   TBO_TASK_ENGINE.updateField(fieldId, patch)
 *   TBO_TASK_ENGINE.deleteField(fieldId)
 *   TBO_TASK_ENGINE.setFieldValue(taskId, fieldId, value)
 *
 *   // Bulk
 *   TBO_TASK_ENGINE.bulkUpdate(taskIds, patch)
 *   TBO_TASK_ENGINE.bulkMove(taskIds, { toSectionId })
 *   TBO_TASK_ENGINE.bulkSetField(taskIds, fieldId, value)
 *
 *   // Data loading
 *   TBO_TASK_ENGINE.load(projectId)
 */
const TBO_TASK_ENGINE = (() => {
  'use strict';

  // ── Helpers ──

  function _toast(msg, type) {
    if (typeof TBO_TOAST !== 'undefined' && TBO_TOAST[type]) TBO_TOAST[type](msg);
    else if (typeof TBO_LOGGER !== 'undefined') TBO_LOGGER.warn('[TaskEngine] ' + msg);
  }

  function _now() { return new Date().toISOString(); }

  function _getUserId() {
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      return u ? u.id : null;
    }
    return null;
  }

  // ═══════════════════════════════════════════════════════════════════
  // Data Loading
  // ═══════════════════════════════════════════════════════════════════

  async function load(projectId) {
    return TBO_STORE.load(projectId);
  }

  // ═══════════════════════════════════════════════════════════════════
  // Task Actions
  // ═══════════════════════════════════════════════════════════════════

  async function createTask({ projectId, sectionId, title, insertAt }) {
    const tid = RepoBase.requireTenantId();
    const siblings = TBO_STORE.getTasksBySection(sectionId || null);
    const orderIndex = (insertAt != null) ? insertAt : siblings.length;

    // Optimistic with temp id
    const tempId = crypto.randomUUID();
    const optimistic = {
      id: tempId,
      tenant_id: tid,
      project_id: projectId,
      section_id: sectionId || null,
      title: title || '',
      status: 'todo',
      order_index: orderIndex,
      is_completed: false,
      created_by: _getUserId(),
      created_at: _now(),
      updated_at: _now(),
    };
    TBO_STORE.setTask(optimistic);

    try {
      const real = await OsTasksRepo.create({
        project_id: projectId,
        section_id: sectionId || null,
        title: title || '',
        status: 'todo',
        order_index: orderIndex,
        is_completed: false,
        created_by: _getUserId(),
      });
      TBO_STORE.removeTask(tempId);
      TBO_STORE.setTask(real);
      return real;
    } catch (err) {
      TBO_STORE.removeTask(tempId);
      _toast('Erro ao criar tarefa', 'error');
      throw err;
    }
  }

  async function updateTask(taskId, patch) {
    const prev = TBO_STORE.getTask(taskId);
    if (!prev) throw new Error('Task não encontrada: ' + taskId);

    // Optimistic
    TBO_STORE.setTask({ ...prev, ...patch, updated_at: _now() });

    try {
      const updated = await OsTasksRepo.update(taskId, patch);
      TBO_STORE.setTask(updated);
      return updated;
    } catch (err) {
      TBO_STORE.setTask(prev); // rollback
      _toast('Erro ao atualizar tarefa', 'error');
      throw err;
    }
  }

  async function deleteTask(taskId) {
    const prev = TBO_STORE.getTask(taskId);
    if (!prev) return;

    // Optimistic
    TBO_STORE.removeTask(taskId);

    try {
      await OsTasksRepo.delete(taskId);
    } catch (err) {
      TBO_STORE.setTask(prev); // rollback
      _toast('Erro ao excluir tarefa', 'error');
      throw err;
    }
  }

  async function completeTask(taskId) {
    return updateTask(taskId, {
      is_completed: true,
      status: 'done',
      completed_at: _now(),
    });
  }

  async function uncompleteTask(taskId) {
    return updateTask(taskId, {
      is_completed: false,
      status: 'todo',
      completed_at: null,
    });
  }

  async function moveTask(taskId, { toSectionId, toIndex }) {
    const task = TBO_STORE.getTask(taskId);
    if (!task) throw new Error('Task não encontrada: ' + taskId);

    const fromSectionId = task.section_id;
    const projectId = task.project_id;

    // Get tasks in target section (excluding the task being moved)
    const targetTasks = TBO_STORE.getTasksBySection(toSectionId)
      .filter(t => t.id !== taskId);

    // Insert at position
    const idx = Math.min(toIndex != null ? toIndex : targetTasks.length, targetTasks.length);
    targetTasks.splice(idx, 0, task);

    // Build batch updates
    const batchItems = [];
    for (let i = 0; i < targetTasks.length; i++) {
      const t = targetTasks[i];
      const updates = { id: t.id, order_index: i };
      if (t.id === taskId) updates.section_id = toSectionId;
      batchItems.push(updates);

      // Optimistic store update
      TBO_STORE.setTask({
        ...TBO_STORE.getTask(t.id),
        order_index: i,
        ...(t.id === taskId ? { section_id: toSectionId } : {}),
      });
    }

    // If moving between sections, reindex source section too
    if (fromSectionId !== toSectionId && fromSectionId) {
      const sourceTasks = TBO_STORE.getTasksBySection(fromSectionId)
        .filter(t => t.id !== taskId);
      for (let i = 0; i < sourceTasks.length; i++) {
        batchItems.push({ id: sourceTasks[i].id, order_index: i });
        TBO_STORE.setTask({ ...TBO_STORE.getTask(sourceTasks[i].id), order_index: i });
      }
    }

    try {
      await OsTasksRepo.batchUpdateOrder(batchItems);
    } catch (err) {
      // Rollback by reloading
      _toast('Erro ao mover tarefa', 'error');
      try { await load(projectId); } catch { /* best effort */ }
      throw err;
    }
  }

  async function reorderTasks(sectionId, orderedIds) {
    const projectId = TBO_STORE.getProjectId();
    const batchItems = [];

    // Optimistic
    for (let i = 0; i < orderedIds.length; i++) {
      batchItems.push({ id: orderedIds[i], order_index: i });
      const task = TBO_STORE.getTask(orderedIds[i]);
      if (task) TBO_STORE.setTask({ ...task, order_index: i });
    }

    try {
      await OsTasksRepo.batchUpdateOrder(batchItems);
    } catch (err) {
      _toast('Erro ao reordenar tarefas', 'error');
      try { await load(projectId); } catch { /* best effort */ }
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // Section Actions
  // ═══════════════════════════════════════════════════════════════════

  async function createSection({ projectId, title, insertAt, color }) {
    const tid = RepoBase.requireTenantId();
    const siblings = TBO_STORE.getSections(projectId);
    const orderIndex = (insertAt != null) ? insertAt : siblings.length;

    const tempId = crypto.randomUUID();
    const optimistic = {
      id: tempId,
      tenant_id: tid,
      project_id: projectId,
      title: title || 'Nova seção',
      order_index: orderIndex,
      color: color || null,
      created_at: _now(),
      updated_at: _now(),
    };
    TBO_STORE.setSection(optimistic);

    try {
      const real = await OsSectionsRepo.create({
        project_id: projectId,
        title: title || 'Nova seção',
        order_index: orderIndex,
        color: color || null,
      });
      TBO_STORE.removeSection(tempId);
      TBO_STORE.setSection(real);
      return real;
    } catch (err) {
      TBO_STORE.removeSection(tempId);
      _toast('Erro ao criar seção', 'error');
      throw err;
    }
  }

  async function updateSection(sectionId, patch) {
    const prev = TBO_STORE.getSection(sectionId);
    if (!prev) throw new Error('Seção não encontrada: ' + sectionId);

    TBO_STORE.setSection({ ...prev, ...patch, updated_at: _now() });

    try {
      const updated = await OsSectionsRepo.update(sectionId, patch);
      TBO_STORE.setSection(updated);
      return updated;
    } catch (err) {
      TBO_STORE.setSection(prev);
      _toast('Erro ao atualizar seção', 'error');
      throw err;
    }
  }

  async function deleteSection(sectionId, { moveTasksTo } = {}) {
    const section = TBO_STORE.getSection(sectionId);
    if (!section) return;

    const projectId = section.project_id;
    const tasksInSection = TBO_STORE.getTasksBySection(sectionId);

    // If moveTasksTo is specified, reassign tasks first
    if (moveTasksTo && tasksInSection.length > 0) {
      const targetTasks = TBO_STORE.getTasksBySection(moveTasksTo);
      let nextOrder = targetTasks.length;

      const batchItems = [];
      for (const task of tasksInSection) {
        batchItems.push({ id: task.id, order_index: nextOrder, section_id: moveTasksTo });
        TBO_STORE.setTask({ ...task, section_id: moveTasksTo, order_index: nextOrder });
        nextOrder++;
      }

      try {
        await OsTasksRepo.batchUpdateOrder(batchItems);
      } catch (err) {
        _toast('Erro ao mover tarefas da seção', 'error');
        try { await load(projectId); } catch { /* best effort */ }
        throw err;
      }
    }

    // Remove section (optimistic)
    TBO_STORE.removeSection(sectionId);

    try {
      await OsSectionsRepo.delete(sectionId);
    } catch (err) {
      TBO_STORE.setSection(section);
      _toast('Erro ao excluir seção', 'error');
      throw err;
    }
  }

  async function reorderSections(projectId, orderedIds) {
    const batchItems = [];

    for (let i = 0; i < orderedIds.length; i++) {
      batchItems.push({ id: orderedIds[i], order_index: i });
      const section = TBO_STORE.getSection(orderedIds[i]);
      if (section) TBO_STORE.setSection({ ...section, order_index: i });
    }

    try {
      await OsSectionsRepo.batchUpdateOrder(batchItems);
    } catch (err) {
      _toast('Erro ao reordenar seções', 'error');
      try { await load(projectId); } catch { /* best effort */ }
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // Field Actions
  // ═══════════════════════════════════════════════════════════════════

  async function createField({ projectId, name, type, config }) {
    // Validate type
    if (!TBO_FIELD_ENGINE.getRegisteredTypes().includes(type)) {
      throw new Error('Tipo de campo inválido: ' + type);
    }

    const tid = RepoBase.requireTenantId();
    const siblings = TBO_STORE.getFields(projectId);
    const orderIndex = siblings.length;

    const tempId = crypto.randomUUID();
    const optimistic = {
      id: tempId,
      tenant_id: tid,
      scope: 'project',
      project_id: projectId,
      name: name,
      type: type,
      config_json: config || {},
      order_index: orderIndex,
      is_visible: true,
      created_at: _now(),
      updated_at: _now(),
    };
    TBO_STORE.setField(optimistic);

    try {
      const real = await OsFieldsRepo.createField({
        scope: 'project',
        project_id: projectId,
        name: name,
        type: type,
        config_json: config || {},
        order_index: orderIndex,
        is_visible: true,
      });
      TBO_STORE.removeField(tempId);
      TBO_STORE.setField(real);
      return real;
    } catch (err) {
      TBO_STORE.removeField(tempId);
      _toast('Erro ao criar campo', 'error');
      throw err;
    }
  }

  async function updateField(fieldId, patch) {
    const prev = TBO_STORE.getField(fieldId);
    if (!prev) throw new Error('Campo não encontrado: ' + fieldId);

    TBO_STORE.setField({ ...prev, ...patch, updated_at: _now() });

    try {
      const updated = await OsFieldsRepo.updateField(fieldId, patch);
      TBO_STORE.setField(updated);
      return updated;
    } catch (err) {
      TBO_STORE.setField(prev);
      _toast('Erro ao atualizar campo', 'error');
      throw err;
    }
  }

  async function deleteField(fieldId) {
    const prev = TBO_STORE.getField(fieldId);
    if (!prev) return;

    TBO_STORE.removeField(fieldId);

    try {
      await OsFieldsRepo.deleteField(fieldId);
    } catch (err) {
      TBO_STORE.setField(prev);
      _toast('Erro ao excluir campo', 'error');
      throw err;
    }
  }

  async function setFieldValue(taskId, fieldId, value) {
    const field = TBO_STORE.getField(fieldId);
    if (!field) throw new Error('Campo não encontrado: ' + fieldId);

    // Validate
    const validation = TBO_FIELD_ENGINE.validate(field.type, value, field.config_json);
    if (!validation.ok) {
      _toast(validation.error || 'Valor inválido', 'error');
      throw new Error(validation.error || 'Valor inválido');
    }

    // Serialize
    const serialized = TBO_FIELD_ENGINE.serialize(field.type, value);

    // Optimistic
    const prevValue = TBO_STORE.getFieldValue(taskId, fieldId);
    TBO_STORE.setFieldValue(taskId, fieldId, serialized);

    try {
      await OsFieldsRepo.upsertValue(taskId, fieldId, serialized);
    } catch (err) {
      // Rollback
      if (prevValue != null) TBO_STORE.setFieldValue(taskId, fieldId, prevValue);
      else TBO_STORE.removeFieldValue(taskId, fieldId);
      _toast('Erro ao salvar valor do campo', 'error');
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // Bulk Actions
  // ═══════════════════════════════════════════════════════════════════

  async function bulkUpdate(taskIds, patch) {
    const results = [];
    for (const id of taskIds) {
      try {
        const r = await updateTask(id, patch);
        results.push(r);
      } catch (err) {
        if (typeof TBO_LOGGER !== 'undefined') TBO_LOGGER.warn('[TaskEngine] bulkUpdate failed for ' + id, err);
      }
    }
    return results;
  }

  async function bulkMove(taskIds, { toSectionId }) {
    const projectId = TBO_STORE.getProjectId();
    const targetTasks = TBO_STORE.getTasksBySection(toSectionId)
      .filter(t => !taskIds.includes(t.id));
    let nextOrder = targetTasks.length;

    const batchItems = [];
    for (const id of taskIds) {
      batchItems.push({ id, order_index: nextOrder, section_id: toSectionId });
      const task = TBO_STORE.getTask(id);
      if (task) TBO_STORE.setTask({ ...task, section_id: toSectionId, order_index: nextOrder });
      nextOrder++;
    }

    try {
      await OsTasksRepo.batchUpdateOrder(batchItems);
    } catch (err) {
      _toast('Erro ao mover tarefas em lote', 'error');
      try { await load(projectId); } catch { /* best effort */ }
      throw err;
    }
  }

  async function bulkSetField(taskIds, fieldId, value) {
    for (const id of taskIds) {
      try {
        await setFieldValue(id, fieldId, value);
      } catch (err) {
        if (typeof TBO_LOGGER !== 'undefined') TBO_LOGGER.warn('[TaskEngine] bulkSetField failed for ' + id, err);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════

  return {
    // Data loading
    load,
    // Tasks
    createTask, updateTask, deleteTask,
    completeTask, uncompleteTask,
    moveTask, reorderTasks,
    // Sections
    createSection, updateSection, deleteSection, reorderSections,
    // Fields
    createField, updateField, deleteField, setFieldValue,
    // Bulk
    bulkUpdate, bulkMove, bulkSetField,
  };
})();

if (typeof window !== 'undefined') window.TBO_TASK_ENGINE = TBO_TASK_ENGINE;

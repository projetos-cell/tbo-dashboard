/**
 * TBO OS — Normalized Reactive Store
 *
 * Holds tasks, sections, fields, and field values in normalized maps.
 * Emits events on change so views can re-render.
 *
 * API:
 *   TBO_STORE.load(projectId)                    — fetch & hydrate from repos
 *   TBO_STORE.getTask(id)                        — single task
 *   TBO_STORE.getTasks(projectId)                — array sorted by order_index
 *   TBO_STORE.getTasksBySection(sectionId)       — filtered + sorted
 *   TBO_STORE.getSection(id)                     — single section
 *   TBO_STORE.getSections(projectId)             — array sorted by order_index
 *   TBO_STORE.getFields(projectId)               — array sorted by order_index
 *   TBO_STORE.getFieldValue(taskId, fieldId)     — value_json
 *   TBO_STORE.getFieldValues(taskId)             — Map(fieldId → value_json)
 *   TBO_STORE.setTask(task) / removeTask(id)     — mutate + emit
 *   TBO_STORE.setSection(s) / removeSection(id)  — mutate + emit
 *   TBO_STORE.setField(f) / removeField(id)      — mutate + emit
 *   TBO_STORE.setFieldValue(taskId, fieldId, v)  — mutate + emit
 *   TBO_STORE.on(event, cb) / off(event, cb)     — subscribe
 *   TBO_STORE.clear()                            — reset all
 *   TBO_STORE.getProjectId()                     — current loaded project
 *
 * Events: 'tasks:change', 'sections:change', 'fields:change',
 *         'fieldValues:change', 'loaded'
 */
const TBO_STORE = (() => {
  'use strict';

  // ── Normalized maps ──
  const _tasks = {};       // id → task object
  const _sections = {};    // id → section object
  const _fields = {};      // id → field definition object
  const _fieldValues = {}; // "taskId:fieldId" → { task_id, field_id, value_json }
  let _projectId = null;
  let _loading = false;

  // ── Event emitter ──
  const _listeners = {};

  function _emit(event, data) {
    const cbs = _listeners[event];
    if (!cbs) return;
    for (let i = 0; i < cbs.length; i++) {
      try { cbs[i](data); } catch (e) {
        if (typeof TBO_LOGGER !== 'undefined') TBO_LOGGER.warn('[Store] listener error on ' + event, e);
      }
    }
  }

  function on(event, cb) {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(cb);
  }

  function off(event, cb) {
    const cbs = _listeners[event];
    if (!cbs) return;
    const idx = cbs.indexOf(cb);
    if (idx !== -1) cbs.splice(idx, 1);
  }

  // ── Tasks ──

  function setTask(task) {
    if (!task || !task.id) return;
    _tasks[task.id] = task;
    _emit('tasks:change', { type: 'set', task });
  }

  function removeTask(id) {
    const prev = _tasks[id];
    if (!prev) return;
    delete _tasks[id];
    // Clean up field values for this task
    const prefix = id + ':';
    for (const key in _fieldValues) {
      if (key.startsWith(prefix)) delete _fieldValues[key];
    }
    _emit('tasks:change', { type: 'remove', id, prev });
  }

  function getTask(id) {
    return _tasks[id] || null;
  }

  function getTasks(projectId) {
    const pid = projectId || _projectId;
    const result = [];
    for (const id in _tasks) {
      if (_tasks[id].project_id === pid) result.push(_tasks[id]);
    }
    result.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    return result;
  }

  function getTasksBySection(sectionId) {
    const result = [];
    for (const id in _tasks) {
      if (_tasks[id].section_id === sectionId) result.push(_tasks[id]);
    }
    result.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    return result;
  }

  // ── Sections ──

  function setSection(section) {
    if (!section || !section.id) return;
    _sections[section.id] = section;
    _emit('sections:change', { type: 'set', section });
  }

  function removeSection(id) {
    const prev = _sections[id];
    if (!prev) return;
    delete _sections[id];
    _emit('sections:change', { type: 'remove', id, prev });
  }

  function getSection(id) {
    return _sections[id] || null;
  }

  function getSections(projectId) {
    const pid = projectId || _projectId;
    const result = [];
    for (const id in _sections) {
      if (_sections[id].project_id === pid) result.push(_sections[id]);
    }
    result.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    return result;
  }

  // ── Fields ──

  function setField(field) {
    if (!field || !field.id) return;
    _fields[field.id] = field;
    _emit('fields:change', { type: 'set', field });
  }

  function removeField(id) {
    const prev = _fields[id];
    if (!prev) return;
    delete _fields[id];
    // Clean up field values for this field
    const suffix = ':' + id;
    for (const key in _fieldValues) {
      if (key.endsWith(suffix)) delete _fieldValues[key];
    }
    _emit('fields:change', { type: 'remove', id, prev });
  }

  function getField(id) {
    return _fields[id] || null;
  }

  function getFields(projectId) {
    const pid = projectId || _projectId;
    const result = [];
    for (const id in _fields) {
      const f = _fields[id];
      if (f.project_id === pid || f.scope === 'global') result.push(f);
    }
    result.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    return result;
  }

  // ── Field Values ──

  function _fvKey(taskId, fieldId) { return taskId + ':' + fieldId; }

  function setFieldValue(taskId, fieldId, valueJson) {
    const key = _fvKey(taskId, fieldId);
    _fieldValues[key] = { task_id: taskId, field_id: fieldId, value_json: valueJson };
    _emit('fieldValues:change', { type: 'set', taskId, fieldId, value: valueJson });
  }

  function removeFieldValue(taskId, fieldId) {
    const key = _fvKey(taskId, fieldId);
    delete _fieldValues[key];
    _emit('fieldValues:change', { type: 'remove', taskId, fieldId });
  }

  function getFieldValue(taskId, fieldId) {
    const rec = _fieldValues[_fvKey(taskId, fieldId)];
    return rec ? rec.value_json : null;
  }

  function getFieldValues(taskId) {
    const result = {};
    const prefix = taskId + ':';
    for (const key in _fieldValues) {
      if (key.startsWith(prefix)) {
        const rec = _fieldValues[key];
        result[rec.field_id] = rec.value_json;
      }
    }
    return result;
  }

  // ── Load from repos ──

  async function load(projectId) {
    if (!projectId) throw new Error('[Store] load requires projectId');
    _loading = true;
    _projectId = projectId;

    try {
      // Parallel fetch from all repos
      const [sections, tasks, fields, fieldValues] = await Promise.all([
        typeof OsSectionsRepo !== 'undefined' ? OsSectionsRepo.list(projectId) : [],
        typeof OsTasksRepo !== 'undefined' ? OsTasksRepo.list(projectId) : [],
        typeof OsFieldsRepo !== 'undefined' ? OsFieldsRepo.listFields(projectId) : [],
        typeof OsFieldsRepo !== 'undefined' ? OsFieldsRepo.listValuesByProject(projectId) : [],
      ]);

      // Clear previous data
      _clearMaps();

      // Hydrate
      for (const s of sections) _sections[s.id] = s;
      for (const t of tasks) _tasks[t.id] = t;
      for (const f of fields) _fields[f.id] = f;
      for (const fv of fieldValues) {
        _fieldValues[_fvKey(fv.task_id, fv.field_id)] = fv;
      }

      _loading = false;
      _emit('loaded', { projectId, counts: { tasks: tasks.length, sections: sections.length, fields: fields.length } });
    } catch (err) {
      _loading = false;
      if (typeof TBO_LOGGER !== 'undefined') TBO_LOGGER.error('[Store] load failed', err);
      throw err;
    }
  }

  // ── Utilities ──

  function _clearMaps() {
    for (const k in _tasks) delete _tasks[k];
    for (const k in _sections) delete _sections[k];
    for (const k in _fields) delete _fields[k];
    for (const k in _fieldValues) delete _fieldValues[k];
  }

  function clear() {
    _clearMaps();
    _projectId = null;
    _loading = false;
    _emit('tasks:change', { type: 'clear' });
    _emit('sections:change', { type: 'clear' });
    _emit('fields:change', { type: 'clear' });
    _emit('fieldValues:change', { type: 'clear' });
  }

  function getProjectId() { return _projectId; }
  function isLoading() { return _loading; }

  return {
    // Load
    load, clear, getProjectId, isLoading,
    // Tasks
    getTask, getTasks, getTasksBySection, setTask, removeTask,
    // Sections
    getSection, getSections, setSection, removeSection,
    // Fields
    getField, getFields, setField, removeField,
    // Field Values
    getFieldValue, getFieldValues, setFieldValue, removeFieldValue,
    // Events
    on, off,
  };
})();

if (typeof window !== 'undefined') window.TBO_STORE = TBO_STORE;

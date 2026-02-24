/**
 * TBO OS — Capability Matrix
 *
 * Declares which actions are available in each view mode.
 * Views query this to decide what to render and bind.
 *
 * API:
 *   TBO_CAPABILITY_MATRIX.can(viewName, capability) → boolean
 *   TBO_CAPABILITY_MATRIX.getCapabilities(viewName)  → string[]
 *   TBO_CAPABILITY_MATRIX.VIEWS                      → list of view names
 */
const TBO_CAPABILITY_MATRIX = (() => {
  'use strict';

  const _matrix = {
    list: [
      'create_task_inline',
      'edit_title_inline',
      'toggle_complete',
      'assign_people',
      'set_due_date',
      'edit_custom_fields',
      'add_custom_field',
      'multi_select',
      'context_menu',
      'drag_reorder',
    ],
    kanban: [
      'create_task_inline',
      'edit_title_inline',
      'toggle_complete',
      'assign_people',
      'set_due_date',
      'edit_custom_fields',
      'add_custom_field',
      'multi_select',
      'context_menu',
      'drag_reorder',
    ],
    gantt: [
      'edit_title_inline',
      'toggle_complete',
      'assign_people',
      'set_due_date',
      'edit_custom_fields',
      'add_custom_field',
      'drag_time',
      'resize_time',
    ],
    sectionList: [
      'group_by_status',
      'collapse_group',
      'open_project',
    ],
  };

  const VIEWS = Object.keys(_matrix);

  /**
   * Check if a view supports a capability.
   * @param {string} viewName - 'list', 'kanban', 'gantt', 'sectionList'
   * @param {string} capability - e.g. 'create_task_inline', 'drag_reorder'
   * @returns {boolean}
   */
  function can(viewName, capability) {
    const caps = _matrix[viewName];
    return caps ? caps.includes(capability) : false;
  }

  /**
   * Get all capabilities for a view.
   * @param {string} viewName
   * @returns {string[]}
   */
  function getCapabilities(viewName) {
    return _matrix[viewName] ? [..._matrix[viewName]] : [];
  }

  return { can, getCapabilities, VIEWS };
})();

if (typeof window !== 'undefined') window.TBO_CAPABILITY_MATRIX = TBO_CAPABILITY_MATRIX;

/**
 * TBO OS — Core Barrel Export
 *
 * Carrega todos os módulos cross-cutting na ordem correta.
 * Incluir via <script src="src/core/index.js"> no HTML.
 *
 * Dependências internas: nenhuma (core é standalone)
 */

// Nota: Em vanilla JS com script tags, os barrel exports servem como
// documentação da ordem de carregamento. Os scripts são incluídos
// individualmente no HTML.
//
// Ordem de carregamento:
// 1. src/core/observability/logger.js
// 2. src/core/observability/errors.js
// 3. src/core/security/sanitize.js
// 4. src/core/validation/schemas.js
// 5. src/core/permissions/engine.js

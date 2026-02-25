-- TBO OS -- Migration 050: Remove modulo Biblioteca
-- Remove sidebar item e permissoes do modulo "biblioteca" de todos os tenants.

-- 1. Remove sidebar item
DELETE FROM sidebar_items WHERE route = 'biblioteca';

-- 2. Remove role_permissions
DELETE FROM role_permissions WHERE module = 'biblioteca';

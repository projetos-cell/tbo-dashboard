---
description: Rules for tables, data grids, and property types (Notion-style)
globs: ["**/*table*", "**/*grid*", "**/*column*", "**/*property*", "**/*filter*", "**/*sort*"]
---

# Table Rules (Modelo Notion)

## Required Features
- Horizontal D&D for column reordering
- Persistent filters per view (saved to Supabase, not session)
- Combinable sort (sort by A then B, asc/desc)
- Inline cell editing per property type

## 18 Required Property Types
text, number, select, multi_select, status, person, checkbox, phone, date,
files, url, email, relation, rollup, formula, id, created_at, updated_at

## Each Type Must Have
- Proper input component (DatePicker for date, UserPicker for person, etc.)
- Validation (email format, URL format, phone mask BR, min/max for number)
- Readonly for computed types (rollup, formula, id, created_at, updated_at)

## Filter Persistence
```
Save: supabase.from('view_filters').upsert({ view_id, filters: JSON.stringify(filters) })
Load: useQuery(['view-filters', viewId], () => supabase.from('view_filters').select('*').eq('view_id', viewId))
```

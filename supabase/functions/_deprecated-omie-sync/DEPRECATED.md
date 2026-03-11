# DEPRECATED — omie-sync Edge Function

**Deprecated since:** 2026-03-11

**Canonical replacement:** `frontend/app/api/finance/sync-omie/route.ts`

## Do NOT redeploy this function

This Edge Function was decommissioned because it was a parallel implementation
of the Omie sync logic that could cause data inconsistency with the canonical
Next.js API route. Specific issues:

- Different entity count (the Edge Function synced a different set of entities
  than the canonical route)
- Different status mappings (field values were mapped differently between the
  two implementations)
- Running both simultaneously could produce conflicting data in the same tables

The directory is prefixed with `_` so that `supabase functions deploy` ignores it.
The code is kept for reference only.

export interface ProfilePreferences {
  bio?: string
  workspace?: {
    name?: string
    logo_url?: string
    tagline?: string
    industry?: string
    website?: string
    primary_color?: string
  }
  [key: string]: unknown
}

/** Safely extract typed preferences from a profile row's Json field */
export function parsePreferences(raw: unknown): ProfilePreferences {
  if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as ProfilePreferences
  }
  return {}
}

export interface ProfileInfo {
  name: string;
  avatarUrl?: string;
  email?: string;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function buildProfileMap(
  profiles: { id: string; full_name: string | null; avatar_url: string | null; email: string | null }[],
): Record<string, ProfileInfo> {
  const map: Record<string, ProfileInfo> = {};
  for (const p of profiles) {
    map[p.id] = {
      name: p.full_name ?? "Usuário",
      avatarUrl: p.avatar_url ?? undefined,
      email: p.email ?? undefined,
    };
  }
  return map;
}

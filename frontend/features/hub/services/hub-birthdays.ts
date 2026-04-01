import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface BirthdayPerson {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: string | null;
  birthDate: string;
}

export async function getTodayBirthdays(
  supabase: SupabaseClient<Database>
): Promise<BirthdayPerson[]> {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const todayMmDd = `${mm}-${dd}`;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, birth_date")
    .not("birth_date", "is", null);

  if (error) throw error;

  return ((data ?? []) as Array<Record<string, unknown>>)
    .filter((p) => {
      const bd = p.birth_date as string | null;
      if (!bd) return false;
      // birth_date format: YYYY-MM-DD
      const parts = bd.split("-");
      return parts.length >= 3 && `${parts[1]}-${parts[2]}` === todayMmDd;
    })
    .map((p) => ({
      id: p.id as string,
      fullName: p.full_name as string,
      avatarUrl: p.avatar_url as string | null,
      role: p.role as string | null,
      birthDate: p.birth_date as string,
    }));
}

export async function getUpcomingBirthdays(
  supabase: SupabaseClient<Database>,
  days = 7
): Promise<BirthdayPerson[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, birth_date")
    .not("birth_date", "is", null);

  if (error) throw error;

  const now = new Date();
  const upcoming: Array<BirthdayPerson & { daysUntil: number }> = [];

  for (const p of (data ?? []) as Array<Record<string, unknown>>) {
    const bd = p.birth_date as string | null;
    if (!bd) continue;
    const parts = bd.split("-");
    if (parts.length < 3) continue;

    const thisYearBday = new Date(
      now.getFullYear(),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
    // If birthday already passed this year, check next year
    if (thisYearBday < now) {
      thisYearBday.setFullYear(now.getFullYear() + 1);
    }
    const diff = Math.ceil(
      (thisYearBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff > 0 && diff <= days) {
      upcoming.push({
        id: p.id as string,
        fullName: p.full_name as string,
        avatarUrl: p.avatar_url as string | null,
        role: p.role as string | null,
        birthDate: bd,
        daysUntil: diff,
      });
    }
  }

  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
}

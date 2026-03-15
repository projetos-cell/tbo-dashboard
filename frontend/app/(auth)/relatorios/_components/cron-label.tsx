const CRON_MAP: Record<string, string> = {
  "0 8 * * *": "Diario as 08:00",
  "0 8 * * 1": "Segunda as 08:00",
  "0 8 * * 5": "Sexta as 08:00",
  "0 8 1 * *": "Dia 1 do mes as 08:00",
  "0 9 * * *": "Diario as 09:00",
  "0 9 * * 1": "Segunda as 09:00",
  "0 9 * * 5": "Sexta as 09:00",
  "0 9 1 * *": "Dia 1 do mes as 09:00",
  "0 8 * * 1-5": "Dias uteis as 08:00",
  "0 9 * * 1-5": "Dias uteis as 09:00",
  "0 8 15 * *": "Dia 15 do mes as 08:00",
};

const WEEKDAYS: Record<string, string> = {
  "0": "Domingo", "1": "Segunda", "2": "Terca", "3": "Quarta",
  "4": "Quinta", "5": "Sexta", "6": "Sabado", "7": "Domingo",
};

function parseCron(cron: string): string {
  if (CRON_MAP[cron]) return CRON_MAP[cron];

  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return cron;

  const [min, hour, dayMonth, , dayWeek] = parts;
  const time = `${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;

  if (dayMonth !== "*" && dayWeek === "*") {
    return `Dia ${dayMonth} do mes as ${time}`;
  }
  if (dayWeek !== "*" && dayMonth === "*") {
    if (dayWeek.includes("-")) return `${dayWeek} as ${time}`;
    const day = WEEKDAYS[dayWeek];
    return day ? `${day} as ${time}` : `${dayWeek} as ${time}`;
  }
  if (dayMonth === "*" && dayWeek === "*") return `Diario as ${time}`;

  return cron;
}

interface CronLabelProps {
  cron: string | null;
}

export function CronLabel({ cron }: CronLabelProps) {
  if (!cron) return <span className="text-muted-foreground">-</span>;

  const label = parseCron(cron);
  const isRaw = label === cron;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-sm">{label}</span>
      {isRaw && (
        <code className="rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">
          {cron}
        </code>
      )}
    </span>
  );
}

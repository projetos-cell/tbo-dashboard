"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Skill {
  id: string;
  name: string;
  category: "hard_skill" | "soft_skill";
  currentLevel: number;
  targetLevel: number;
  timeframe: "short" | "medium" | "long";
}

interface PDISkillCardProps {
  skills: Skill[];
}

const TIMEFRAME_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  short: { label: "Curto Prazo", variant: "default" },
  medium: { label: "Médio Prazo", variant: "secondary" },
  long: { label: "Longo Prazo", variant: "outline" },
};

const DEFAULT_SKILLS: Skill[] = [
  { id: "1", name: "Branding Imobiliário", category: "hard_skill", currentLevel: 45, targetLevel: 80, timeframe: "short" },
  { id: "2", name: "Visualização 3D", category: "hard_skill", currentLevel: 30, targetLevel: 70, timeframe: "medium" },
  { id: "3", name: "Comunicação Estratégica", category: "soft_skill", currentLevel: 60, targetLevel: 90, timeframe: "short" },
  { id: "4", name: "Gestão de Projetos", category: "soft_skill", currentLevel: 25, targetLevel: 60, timeframe: "long" },
];

function SkillGroup({ title, skills }: { title: string; skills: Skill[] }) {
  if (skills.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
      {skills.map((skill) => {
        const badge = TIMEFRAME_BADGE[skill.timeframe];
        const pct = Math.round(
          (skill.currentLevel / skill.targetLevel) * 100
        );
        return (
          <div key={skill.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{skill.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{pct}%</span>
                <Badge variant={badge.variant} className="text-[10px]">
                  {badge.label}
                </Badge>
              </div>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        );
      })}
    </div>
  );
}

export function PDISkillCard({ skills }: PDISkillCardProps) {
  const data = skills.length > 0 ? skills : DEFAULT_SKILLS;
  const hardSkills = data.filter((s) => s.category === "hard_skill");
  const softSkills = data.filter((s) => s.category === "soft_skill");

  return (
    <div className="rounded-2xl border border-border/30 bg-secondary/20 p-6 backdrop-blur-sm">
      <div className="space-y-5">
        <SkillGroup title="Hard Skills" skills={hardSkills} />
        <SkillGroup title="Soft Skills" skills={softSkills} />
      </div>
    </div>
  );
}

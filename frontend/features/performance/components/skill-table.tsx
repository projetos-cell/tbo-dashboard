"use client";

import { useMemo } from "react";
import { SCORECARD_SKILLS, SKILL_MAP } from "@/features/performance/utils/performance-constants";
import type { SkillScoreRow } from "@/features/performance/services/performance";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Skill Table — shows 10 skills with actual vs expected + gap
// ---------------------------------------------------------------------------

interface SkillTableProps {
  scores: SkillScoreRow[];
}

export function SkillTable({ scores }: SkillTableProps) {
  const scoreMap = useMemo(
    () => new Map(scores.map((s) => [s.skill_id, s])),
    [scores]
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Habilidade</TableHead>
          <TableHead className="text-center">Atual (%)</TableHead>
          <TableHead className="text-center">Esperado (%)</TableHead>
          <TableHead className="text-center">Gap</TableHead>
          <TableHead className="text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SCORECARD_SKILLS.map((skill) => {
          const score = scoreMap.get(skill.id);
          const actual = score?.level_percentage ?? 0;
          const expected = score?.expected_level ?? 70;
          const gap = actual - expected;
          const hasScore = score != null;

          return (
            <TableRow key={skill.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{skill.name}</span>
                  <Badge variant="outline" className="text-[9px]">
                    {skill.category === "technical" ? "Técnica" : "Comportamental"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-center">
                {hasScore ? (
                  <span className="font-semibold">{actual}%</span>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </TableCell>
              <TableCell className="text-center text-gray-500">
                {expected}%
              </TableCell>
              <TableCell className="text-center">
                {hasScore ? (
                  <span
                    className={`font-medium ${
                      gap >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {gap > 0 ? "+" : ""}
                    {gap}%
                  </span>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {hasScore ? (
                  gap >= 0 ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-0 text-[10px]">
                      Manter
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-0 text-[10px]">
                      Melhorar
                    </Badge>
                  )
                ) : (
                  <span className="text-gray-500 text-xs">Sem avaliação</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

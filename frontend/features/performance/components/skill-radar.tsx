"use client";

import { useMemo } from "react";
import { SCORECARD_SKILLS, SKILL_MAP } from "@/features/performance/utils/performance-constants";
import type { SkillScoreRow } from "@/features/performance/services/performance";

// ---------------------------------------------------------------------------
// Skill Radar — SVG radar chart for 10 skills
// ---------------------------------------------------------------------------

interface SkillRadarProps {
  scores: SkillScoreRow[];
  size?: number;
}

export function SkillRadar({ scores, size = 280 }: SkillRadarProps) {
  const center = size / 2;
  const radius = (size / 2) - 30;
  const skills = SCORECARD_SKILLS;
  const n = skills.length;

  const scoreMap = useMemo(
    () => new Map(scores.map((s) => [s.skill_id, s])),
    [scores]
  );

  // Compute points for each skill
  const getPoint = (index: number, value: number): [number, number] => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (value / 100) * radius;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };

  // Grid lines at 25%, 50%, 75%, 100%
  const gridLevels = [25, 50, 75, 100];

  // Build polygon paths
  const actualPoints = skills.map((s, i) => {
    const score = scoreMap.get(s.id);
    return getPoint(i, score?.level_percentage ?? 0);
  });

  const expectedPoints = skills.map((s, i) => {
    const score = scoreMap.get(s.id);
    return getPoint(i, score?.expected_level ?? 70);
  });

  const actualPath = actualPoints.map((p) => p.join(",")).join(" ");
  const expectedPath = expectedPoints.map((p) => p.join(",")).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Grid circles */}
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={Array.from({ length: n }, (_, i) => getPoint(i, level).join(",")).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-border"
          opacity={0.4}
        />
      ))}

      {/* Axis lines */}
      {skills.map((_, i) => {
        const [x, y] = getPoint(i, 100);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-border"
            opacity={0.3}
          />
        );
      })}

      {/* Expected area (dashed) */}
      <polygon
        points={expectedPath}
        fill="hsl(220 70% 50% / 0.08)"
        stroke="hsl(220 70% 50%)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />

      {/* Actual area */}
      <polygon
        points={actualPath}
        fill="hsl(160 60% 45% / 0.15)"
        stroke="hsl(160 60% 45%)"
        strokeWidth="2"
      />

      {/* Dots + Labels */}
      {skills.map((s, i) => {
        const [x, y] = getPoint(i, 105);
        const [dx, dy] = actualPoints[i];
        const shortName = s.name.length > 14 ? s.name.slice(0, 12) + "..." : s.name;

        return (
          <g key={s.id}>
            <circle cx={dx} cy={dy} r="3" fill="hsl(160 60% 45%)" />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground"
              fontSize="8"
            >
              {shortName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

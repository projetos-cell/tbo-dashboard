"use client";

import { useEffect, useRef, useState } from "react";
import { IconTrophy } from "@tabler/icons-react";

interface PointsBalanceCardProps {
  totalPoints: number;
}

export function PointsBalanceCard({ totalPoints }: PointsBalanceCardProps) {
  const [displayPoints, setDisplayPoints] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (totalPoints === 0) {
      setDisplayPoints(0);
      return;
    }

    const duration = 1200;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPoints(Math.round(eased * totalPoints));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [totalPoints]);

  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <IconTrophy className="mb-3 h-10 w-10 text-yellow-500" />
      <p className="text-4xl font-bold">
        {displayPoints.toLocaleString("pt-BR")}
      </p>
      <p className="text-sm text-muted-foreground">pontos acumulados</p>
    </div>
  );
}

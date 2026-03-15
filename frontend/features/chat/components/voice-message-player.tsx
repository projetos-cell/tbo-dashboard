"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconPlayerPlay, IconPlayerPause } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceMessagePlayerProps {
  url: string;
  className?: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceMessagePlayer({ url, className }: VoiceMessagePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [url]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    audio.currentTime = ratio * audio.duration;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2 w-full max-w-[260px]",
        className,
      )}
    >
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-8 w-8 rounded-full shrink-0 hover:bg-primary/10"
        onClick={togglePlay}
      >
        {isPlaying ? (
          <IconPlayerPause size={16} className="text-primary" />
        ) : (
          <IconPlayerPlay size={16} className="text-primary" />
        )}
      </Button>

      <div className="flex flex-col flex-1 gap-1 min-w-0">
        {/* Progress bar */}
        <div
          className="relative h-1.5 bg-muted rounded-full cursor-pointer hover:h-2 transition-all"
          onClick={handleSeek}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary shadow opacity-0 hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 5px)` }}
          />
        </div>

        {/* Times */}
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{duration > 0 ? formatTime(duration) : "--:--"}</span>
        </div>
      </div>

      {/* Voice icon indicator */}
      <div className="flex items-end gap-px h-5 shrink-0">
        {[3, 5, 7, 5, 3, 7, 4].map((h, i) => (
          <div
            key={i}
            className={cn(
              "w-[2px] rounded-full transition-colors",
              isPlaying ? "bg-primary animate-pulse" : "bg-muted-foreground/40",
            )}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
    </div>
  );
}

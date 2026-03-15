"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconMicrophone, IconPlayerStop, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  disabled?: boolean;
  onRecordingComplete: (file: File) => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceRecorder({ disabled, onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(12).fill(4));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopAnimation = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  function animateWaveform() {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    function loop() {
      analyser!.getByteFrequencyData(dataArray);
      const bucketSize = Math.floor(dataArray.length / 12);
      const newBars = Array.from({ length: 12 }, (_, i) => {
        const slice = dataArray.slice(i * bucketSize, (i + 1) * bucketSize);
        const avg = slice.reduce((sum, v) => sum + v, 0) / slice.length;
        return Math.max(4, Math.min(28, (avg / 255) * 28));
      });
      setBars(newBars);
      animFrameRef.current = requestAnimationFrame(loop);
    }
    loop();
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContext = window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext as typeof window.AudioContext;
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const file = new File([blob], `voice-message-${Date.now()}.webm`, {
          type: mimeType,
        });
        onRecordingComplete(file);
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        analyserRef.current = null;
      };

      mr.start(100);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      animateWaveform();
    } catch {
      // Microphone access denied or not available
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    stopAnimation();
    stopTimer();
    setIsRecording(false);
    setDuration(0);
    setBars(Array(12).fill(4));
  }

  function cancelRecording() {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    stopAnimation();
    stopTimer();
    chunksRef.current = [];
    setIsRecording(false);
    setDuration(0);
    setBars(Array(12).fill(4));
  }

  // Override ondataavailable to discard when cancelling
  useEffect(() => {
    return () => {
      stopAnimation();
      stopTimer();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [stopAnimation, stopTimer]);

  if (isRecording) {
    return (
      <div className="flex items-center gap-2 bg-destructive/10 rounded-lg px-2 py-1">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
        </span>

        {/* Waveform bars */}
        <div className="flex items-center gap-0.5 h-7">
          {bars.map((h, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-destructive/80 transition-all duration-75"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>

        <span className="text-xs font-mono text-destructive font-medium min-w-[36px]">
          {formatDuration(duration)}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={cancelRecording}
          title="Cancelar gravação"
        >
          <IconX size={14} />
        </Button>

        <Button
          type="button"
          size="icon"
          className="h-7 w-7 rounded-lg bg-destructive hover:bg-destructive/90"
          onClick={stopRecording}
          title="Parar gravação"
        >
          <IconPlayerStop size={14} className="text-white" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      disabled={disabled}
      onClick={startRecording}
      title="Gravar mensagem de voz"
    >
      <IconMicrophone size={18} />
    </Button>
  );
}

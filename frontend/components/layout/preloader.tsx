"use client";

import { useEffect, useRef, useState } from "react";

export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    // Only run once & skip if already shown this session
    if (hasRun.current) return;
    hasRun.current = true;

    if (sessionStorage.getItem("preloader-shown")) {
      setDone(true);
      setHidden(true);
      return;
    }

    document.body.style.overflow = "hidden";

    // Simulate progress that accelerates
    let current = 0;
    const interval = setInterval(() => {
      const increment = current < 30 ? 2 : current < 60 ? 3 : current < 85 ? 1.5 : 0.5;
      current = Math.min(current + increment, 92);
      setProgress(current);
    }, 50);

    // When page is fully loaded, complete the bar
    const onLoad = () => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setDone(true);
        document.body.style.overflow = "";
        sessionStorage.setItem("preloader-shown", "1");
      }, 400);
    };

    if (document.readyState === "complete") {
      // Page already loaded, give video a moment to play
      setTimeout(onLoad, 1200);
    } else {
      window.addEventListener("load", () => setTimeout(onLoad, 600));
    }

    // Safety fallback — never block more than 4s
    const fallback = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setDone(true);
        document.body.style.overflow = "";
        sessionStorage.setItem("preloader-shown", "1");
      }, 300);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(fallback);
    };
  }, []);

  // After fade-out transition, remove from DOM
  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => setHidden(true), 600);
      return () => clearTimeout(timer);
    }
  }, [done]);

  if (hidden) return null;

  return (
    <div
      className="preloader"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        opacity: done ? 0 : 1,
        visibility: done ? "hidden" : "visible",
        transition:
          "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.5s",
        pointerEvents: done ? "none" : "auto",
      }}
    >
      {/* Video logo animation */}
      <video
        ref={videoRef}
        src="/assets/preloader-motion.mp4"
        autoPlay
        muted
        playsInline
        style={{
          maxWidth: 280,
          width: "50vw",
          height: "auto",
          pointerEvents: "none",
        }}
      />

      {/* Progress bar */}
      <div
        style={{
          width: 200,
          height: 1,
          background: "rgba(234, 234, 234, 0.08)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "#606060",
            borderRadius: 2,
            transition: "width 0.1s linear",
          }}
        />
      </div>
    </div>
  );
}

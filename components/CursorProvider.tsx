"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const TargetCursor = dynamic(() => import("@/components/TargetCursor"), { ssr: false });

export default function CursorProvider() {
  const [hasPointer, setHasPointer] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine) and (min-width: 1280px)");
    const sync = () => setHasPointer(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);

    return () => {
      mediaQuery.removeEventListener("change", sync);
    };
  }, []);

  if (!hasPointer) return null;
  return <TargetCursor spinDuration={2} hideDefaultCursor parallaxOn hoverDuration={0.2} />;
}

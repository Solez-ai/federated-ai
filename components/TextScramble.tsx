"use client";

import React, { useEffect, useState, useRef } from "react";
import { useInView, motion } from "framer-motion";
import { playSound } from "react-sounds";

const CHARS = "!@#$%>*^ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export default function TextScramble({
  text,
  className = "",
  as: Component = "span",
}: {
  text: string;
  className?: string;
  as?: any;
}) {
  const [displayText, setDisplayText] = useState("");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) {
      setDisplayText(text.replace(/./g, "\u00A0")); // Preserve spacing
      return;
    }

    let iterations = 0;
    let playingAudio = false;

    const interval = setInterval(() => {
      // Play a tiny fast click occasionally while scrambling
      if (iterations < text.length && Math.random() > 0.8 && !playingAudio) {
        playingAudio = true;
        playSound("/sounds/click.mp3", { volume: 0.05, rate: 2.5 });
        setTimeout(() => { playingAudio = false; }, 40);
      }

      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (index < iterations) return char;
            if (char === " " || char === "\n") return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iterations >= text.length) {
        clearInterval(interval);
      }
      iterations += 1 / 2; // Decrypt speed
    }, 35);

    return () => clearInterval(interval);
  }, [inView, text]);

  return (
    <Component ref={ref} className={className}>
      {displayText.split("\n").map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i !== text.split("\n").length - 1 && <br />}
        </React.Fragment>
      ))}
    </Component>
  );
}

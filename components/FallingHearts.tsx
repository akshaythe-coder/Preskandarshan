"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import "./FallingHearts.css";

export default function FallingHearts() {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const update = () => setPaused(document.hidden);
    update(); document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  if (reduced) return null;
  return <div className={`falling-hearts ${paused ? "is-paused" : ""}`} aria-hidden="true">
    {Array.from({ length: 14 }, (_, index) => <span key={index} style={{
      "--heart-left": `${(index * 37 + 4) % 98}%`,
      "--heart-duration": `${12 + index % 6 * 2}s`,
      "--heart-delay": `${-index * 2.7}s`,
      "--heart-drift": `${index % 2 ? -16 : 18}px`,
      "--heart-size": `${9 + index % 5 * 2}px`,
      "--heart-color": ["#f4ead7", "#d5b16f", "#e8a8af"][index % 3],
    } as CSSProperties}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21 3.3 12.4C-2.6 6.3 5.6-1 12 5.8 18.4-1 26.6 6.3 20.7 12.4Z" /></svg></span>)}
  </div>;
}

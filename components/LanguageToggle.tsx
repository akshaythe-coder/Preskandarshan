"use client";
import { useId, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { preloadHindiFonts, useT } from "./I18nProvider";
export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useT(); const id = useId(); const reduced = useReducedMotion();
  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => { const next = event.key === "Home" ? "en" : event.key === "End" ? "hi" : ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key) ? language === "en" ? "hi" : "en" : null; if (next) { event.preventDefault(); setLanguage(next); document.getElementById(`${id}-${next}`)?.focus(); } };
  return <div role="radiogroup" aria-label="Language / भाषा" className={`language-toggle ${className}`} onPointerEnter={() => void preloadHindiFonts()} onFocus={() => void preloadHindiFonts()}>{(["en", "hi"] as const).map(value => <button type="button" role="radio" id={`${id}-${value}`} key={value} aria-checked={language === value} tabIndex={language === value ? 0 : -1} onClick={() => setLanguage(value)} onKeyDown={onKey} lang={value}>{language === value && <motion.span className="language-toggle-active" layoutId={`language-${id}`} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }} />}<span>{value === "en" ? "English" : "हिंदी"}</span></button>)}</div>;
}

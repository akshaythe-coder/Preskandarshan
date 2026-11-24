"use client";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { type DressSwatch, type WeddingEvent } from "@/data/content";
import { getAllEvents } from "@/lib/calendar";
import "./DressCode.css";
import { useT } from "./I18nProvider";

function Swatch({ swatch, index, metallic }: { swatch: DressSwatch; index: number; metallic: boolean }) {
  const reduced = useReducedMotion();
  const tooltipId = useId();
  const [tip, setTip] = useState(false);
  const [ripple, setRipple] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  useEffect(() => () => clear(), []);
  return <motion.button type="button" className="dress-swatch-target" aria-label={swatch.name} aria-describedby={tip ? tooltipId : undefined} initial={reduced ? false : { scale: .75, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 18, delay: index * .08 }} onContextMenu={event => event.preventDefault()} onPointerDown={() => { clear(); timer.current = setTimeout(() => setTip(true), 450); }} onPointerUp={clear} onPointerCancel={() => { clear(); setTip(false); }} onPointerLeave={() => { clear(); setTip(false); }} onClick={event => { event.stopPropagation(); if (!reduced) setRipple(value => value + 1); }} onFocus={() => setTip(true)} onBlur={() => setTip(false)} onKeyDown={event => { if (event.key === "Escape") setTip(false); }}>
    <span className={`dress-swatch ${metallic ? "is-metallic" : ""}`} style={{ "--swatch-color": swatch.color } as CSSProperties}>{ripple > 0 && !reduced && <i key={ripple} className="dress-ripple" aria-hidden="true" />}</span>
    {tip && <span id={tooltipId} role="tooltip" className="dress-tooltip">{swatch.name}</span>}
  </motion.button>;
}
export default function DressCode({ event, large = false, compact = false }: { event: WeddingEvent; large?: boolean; compact?: boolean }) {
  const { content } = useT();
  const palette = { "--dress-ink": content.dressCodeUI.ink, "--dress-gold": content.dressCodeUI.gold, "--dress-cream": content.dressCodeUI.cream, "--dress-sparkle": content.dressCodeUI.sparkleGold } as CSSProperties;
  const reduced = useReducedMotion();
  const code = event.dressCode;
  if (!code) return null;
  const sparkle = code.style === "sparkle";
  return <div style={palette} className={`dress-code ${large ? "dress-code-large" : ""} ${compact ? "dress-code-compact" : ""} ${sparkle ? "dress-code-sparkle" : ""}`}>
    <div className="dress-code-top"><span className="dress-code-label">{content.dressCodeUI.label}</span>{!!code.swatches?.length && <div className="dress-swatches">{code.swatches.map((swatch, index) => <Swatch key={swatch.name} swatch={swatch} index={index} metallic={sparkle} />)}{sparkle && !reduced && !compact && <span className="dress-stars" aria-hidden="true">{Array.from({ length: 4 }, (_, i) => <i key={i} style={{ "--star": i } as CSSProperties}>✧</i>)}</span>}</div>}</div>
    {large && code.image && <img className="dress-outfit-image" src={code.image.src} alt={code.image.alt} width={180} height={160} loading="lazy" />}
    <div className="dress-code-copy"><span>{code.text}</span></div>
    {large && code.styleNote && <p className="dress-style-note">{code.styleNote}</p>}
  </div>;
}
export function DressCodeGuide() {
  const { content, language } = useT();
  const palette = { "--dress-ink": content.dressCodeUI.ink, "--dress-gold": content.dressCodeUI.gold, "--dress-cream": content.dressCodeUI.cream, "--dress-sparkle": content.dressCodeUI.sparkleGold } as CSSProperties;
  return <details className="dress-guide" style={palette}><summary>{content.dressCodeUI.guide}</summary><ul>{getAllEvents(language).map(entry => <li key={entry.number}><div className="dress-guide-event"><time dateTime={new Date(entry.start).toISOString()}>{entry.event.time}</time><strong>{entry.event.title}</strong></div><DressCode event={entry.event} compact /></li>)}</ul></details>;
}

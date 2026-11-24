"use client";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Josefin_Sans } from "next/font/google";
import { I18nProvider, useT } from "./I18nProvider";
import "./FamilyBlessings.css";
import LanguageToggle from "./LanguageToggle";
const headingFont = Josefin_Sans({ weight: ["300", "400"], subsets: ["latin"], display: "swap", variable: "--blessing-heading", preload: false });

export function SectionHeading({ children, id }: { children: string; id?: string }) {
  return <h2 id={id} className="blessings-heading">{children}</h2>;
}
export function OrnamentDivider() {
  const reduced = useReducedMotion();
  return <motion.div className="blessings-divider" aria-hidden="true" initial={reduced ? false : { scaleX: .1, opacity: 0 }} whileInView={{ scaleX: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: reduced ? 0 : .7 }}><svg viewBox="0 0 180 28" fill="none"><path d="M0 14h62m56 0h62" stroke="currentColor" strokeWidth=".7"/><path d="M69 14s10-12 21-12 21 12 21 12-10 12-21 12-21-12-21-12Z" stroke="currentColor" strokeWidth=".8"/><path d="M75 14h30M90 5v18m-10-9 10-5 10 5-10 5-10-5Z" stroke="currentColor" strokeWidth=".7"/><circle cx="90" cy="14" r="2" fill="currentColor"/></svg></motion.div>;
}
export function NameList({ names }: { names: readonly string[] }) {
  const reduced = useReducedMotion();
  return <motion.ul className="blessings-names" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .12 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : .06 } } }}>{names.map((name, index) => <motion.li key={index} variants={{ hidden: { opacity: 0, y: reduced ? 0 : 8 }, visible: { opacity: 1, y: 0, transition: { duration: reduced ? .15 : .45 } } }}>{name}</motion.li>)}</motion.ul>;
}
function Diya() {
  return <svg className="blessings-diya" viewBox="0 0 88 72" fill="none" aria-hidden="true"><path className="blessings-flame" d="M44 8c-1 13-10 14-10 25a10 10 0 0 0 20 0c0-10-8-15-10-25Z" fill="currentColor"/><path d="M44 24c-1 6-5 8-5 13a5 5 0 0 0 10 0c0-5-4-8-5-13Z" fill="#fff2cf"/><path d="M15 43h58c-5 15-14 21-29 21S20 58 15 43Z" stroke="currentColor" strokeWidth="1.2"/><path d="M22 47c12 8 32 8 44 0M28 68h32M44 43v-5" stroke="currentColor" strokeWidth=".8"/></svg>;
}
export function PetalField({ active }: { active: boolean }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => { const update = () => setHidden(document.hidden); update(); document.addEventListener("visibilitychange", update); return () => document.removeEventListener("visibilitychange", update); }, []);
  return <div className={`blessings-petals ${!active || hidden ? "is-paused" : ""}`} aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} className={index % 3 === 0 ? "is-speck" : ""} style={{ "--left": `${(index * 37 + 5) % 100}%`, "--duration": `${18 + index % 7 * 3}s`, "--delay": `${-index * 3.7}s`, "--drift": `${index % 2 ? -35 : 40}px`, "--particle": ["#f6ecd9", "#e9b8bd", "#d9b44a"][index % 3], "--size": `${6 + index % 5}px` } as CSSProperties} />)}</div>;
}
export function LittleHeartsCards({ muted }: { muted: boolean }) {
  const { content } = useT(); const reduced = useReducedMotion();
  const [burst, setBurst] = useState<{ index: number; key: number } | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const data = content.familyBlessings.littleHearts;
  useEffect(() => { if (muted) audio.current?.pause(); }, [muted]);
  useEffect(() => () => audio.current?.pause(), []);
  useEffect(() => { if (!burst) return; const timeout = setTimeout(() => setBurst(null), 1600); return () => clearTimeout(timeout); }, [burst]);
  const celebrate = (index: number) => {
    if (!reduced) setBurst(current => ({ index, key: (current?.key ?? 0) + 1 }));
    if (muted) return;
    try { audio.current?.pause(); const clip = new Audio(content.familyBlessings.chime); clip.volume = .16; audio.current = clip; clip.play().catch(() => undefined); } catch {}
  };
  return <div className="blessings-little-cards">{data.quotes.map((quote, index) => <motion.button type="button" className="blessings-quote-card" key={index} onClick={() => celebrate(index)} whileTap={reduced ? undefined : { scale: .98 }} style={{ "--card-tilt": `${index ? 1.5 : -1.5}deg` } as CSSProperties}>
    <svg className="blessings-corner-heart" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20 3 11C-2 4 8 0 12 7c4-7 14-3 9 4l-9 9Z" stroke="currentColor" strokeWidth="1"/></svg>
    <q>{quote.text.replace("{invitation}", data.repeatInvitation)}</q><span className="blessings-child-name">— {quote.by}</span>
    {burst?.index === index && <span className="blessings-heart-burst" aria-hidden="true" key={burst.key}>{Array.from({length:7},(_,i)=><i key={i} style={{"--heart-x":`${(i-3)*16}px`,"--heart-delay":`${i*45}ms`} as CSSProperties}>♥</i>)}</span>}
  </motion.button>)}</div>;
}
export default function FamilyBlessings({ muted }: { muted: boolean }) {
  return <I18nProvider scope="family"><FamilyBlessingsContent muted={muted} /></I18nProvider>;
}
function FamilyBlessingsContent({ muted }: { muted: boolean }) {
  const { content, language } = useT(); const reduced = useReducedMotion(); const section = useRef<HTMLElement>(null); const id = useId();
  const near = useInView(section, { margin: "300px 0px" }); const active = useInView(section);
  const [mountedPetals, setMountedPetals] = useState(false);
  useEffect(() => { if (near) setMountedPetals(true); }, [near]);
  const data = content.familyBlessings;
  return <section id="family-blessings" lang={language} ref={section} className={`family-blessings ${headingFont.variable}`} aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`} className="blessings-sr-only">{data.sectionLabel}</h2>
    {!reduced && mountedPetals && <PetalField active={active} />}
    <div className="blessings-language"><LanguageToggle /></div>
    <div className="blessings-content">{data.groups.map((group,index)=><div key={index}>
      {index > 0 && <OrnamentDivider />}
      <motion.div className="blessings-group" initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }} transition={{ duration: reduced ? .15 : .65 }}>
        <SectionHeading>{group.heading}</SectionHeading>{group.memorial && <Diya />}
        {group.names.length > 0 && <NameList names={group.names} />}
        {group.paragraph && <p className="blessings-welcome">{group.paragraph}</p>}
      </motion.div>
    </div>)}
      <OrnamentDivider /><motion.div className="blessings-group" initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }} transition={{ duration: .5 }}><SectionHeading>{data.littleHearts.heading}</SectionHeading><LittleHeartsCards muted={muted} /></motion.div>
    </div>
  </section>;
}

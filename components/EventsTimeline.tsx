"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { type WeddingEvent } from "@/data/content";
import { useT } from "./I18nProvider";
import { allEvents, getAllEvents, downloadCalendar, googleCalendarLink } from "@/lib/calendar";
import "./EventsTimeline.css";
import DressCode, { DressCodeGuide } from "./DressCode";

const emojiLabels: Record<string, string> = { "🌈": "rainbow", "💛": "yellow heart", "🪩": "disco ball", "🥁": "drum", "🌅": "sunrise", "❤️": "red heart" };
type Entry = typeof allEvents[number];

export function DayTabs({ day, select }: { day: number; select: (day: number) => void }) {
  const { content, t, language } = useT();
  const keyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let next: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") next = 1 - day;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = 1;
    if (next !== undefined) { event.preventDefault(); select(next); document.getElementById(`day-tab-${next}`)?.focus(); }
  };
  return <div className="days-tabs-sticky"><div role="tablist" aria-label={t("Wedding day")} className="days-tabs">{content.events.map((item, index) => <button key={item.date} id={`day-tab-${index}`} type="button" role="tab" aria-selected={day === index} aria-controls={`day-panel-${index}`} tabIndex={day === index ? 0 : -1} onKeyDown={keyDown} onClick={() => select(index)}>{item.tab}</button>)}</div></div>;
}

export function AddToCalendar({ entry }: { entry?: Entry }) {
  const { content, t, language } = useT();
  return <div className="days-calendar"><button type="button" onClick={() => downloadCalendar(entry ? [entry] : getAllEvents(language), language)}>{t(entry ? "Add to calendar" : "Add all events to calendar")}</button>{!entry && <a href={googleCalendarLink(language)} target="_blank" rel="noreferrer">{t("Carnival on Google Calendar")}</a>}</div>;
}

export function EventTicket({ entry, sound }: { entry: Entry; sound: () => void }) {
  const { content, t, language } = useT();
  const [flipped, setFlipped] = useState(false);
  const [petals, setPetals] = useState(false);
  const reduced = useReducedMotion();
  const event: WeddingEvent = entry.event;
  const ceremony = entry.number === 6;
  useEffect(() => { if (!petals) return; const timeout = setTimeout(() => setPetals(false), 1800); return () => clearTimeout(timeout); }, [petals]);
  const flip = () => { setFlipped(!flipped); sound(); if (ceremony && !flipped && !reduced) setPetals(true); };
  const flipLabel = `${event.title}, ${event.time}. ${t(flipped ? "Hide details" : "Show details")}`;
  return <div className={`days-ticket-wrap ${ceremony ? "days-ceremony" : ""} ${flipped ? "is-flipped" : ""}`}>
    <div className="days-ticket days-ticket-with-dress">
      <div className="days-ticket-rotator">
        <div className="days-ticket-front" aria-hidden={flipped} inert={flipped}>
          <button type="button" className="days-ticket-toggle days-ticket-front-main" aria-expanded={flipped} aria-controls={`ticket-details-${entry.number}`} aria-label={flipLabel} onClick={flip}><span className="days-ticket-number">{t("No.")} {String(entry.number).padStart(2, "0")}</span><time dateTime={new Date(entry.start).toISOString()}>{event.time}</time><span className="days-ticket-name">{event.title}<small>{t("Tap for details")}</small></span></button>
          <span className="days-barcode" aria-hidden="true" />
        </div>
        <div className="days-ticket-back" id={`ticket-details-${entry.number}`} aria-hidden={!flipped} inert={!flipped}>
          <button type="button" className="days-ticket-toggle days-ticket-back-main" aria-expanded={flipped} aria-controls={`ticket-details-${entry.number}`} aria-label={flipLabel} onClick={flip}><strong>{event.title}</strong>{event.description && <span>{event.description}</span>}{event.venueNote && <span>{event.venueNote}</span>}</button>
          <DressCode event={event} large />
        </div>
      </div>
    </div>
    {flipped && <AddToCalendar entry={entry} />}
    {petals && <span className="days-petals" aria-hidden="true">{Array.from({ length: 15 }, (_, index) => <i key={index} style={{ "--x": `${(index * 29) % 100}%`, "--drift": `${(index % 2 ? 1 : -1) * (20 + index * 3)}px`, "--delay": `${index * 35}ms` } as CSSProperties} />)}</span>}
  </div>;
}

export function TimelineNode({ entry, index, active, status, sound }: { entry: Entry; index: number; active: boolean; status: string; sound: () => void }) {
  const { content, t, language } = useT();
  const reduced = useReducedMotion();
  return <motion.li data-timeline-node className={`days-node ${active ? "is-nearest" : ""} ${status === "past" ? "is-past" : ""}`} initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: reduced ? .15 : .45, delay: reduced ? 0 : index * .12 }}>
    <span className="days-node-dot"><motion.span role="img" aria-label={emojiLabels[entry.event.emoji] ? t(emojiLabels[entry.event.emoji] as "rainbow") : entry.event.title} initial={false} whileInView={reduced ? {} : { y: [0, -9, 0] }} viewport={{ once: true }} transition={{ duration: .55, delay: index * .12 }}>{entry.event.emoji}</motion.span></span>
    <div className="days-node-card" style={{ "--tilt": `${[-1.5, 1, -0.75][index]}deg` } as CSSProperties}>{(status === "now" || status === "next") && <p className={`days-status ${status === "now" ? "is-live" : ""}`}>{t(status === "now" ? "HAPPENING NOW" : "UP NEXT")}</p>}<EventTicket entry={entry} sound={sound} /></div>
  </motion.li>;
}

export default function EventsTimeline({ muted, now }: { muted: boolean; now: number }) {
  const { content, t, language } = useT();
  const [day, setDay] = useState(0);
  const [nearest, setNearest] = useState(-1);
  const list = useRef<HTMLUListElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(muted); mutedRef.current = muted;
  const reduced = useReducedMotion();
  useEffect(() => { if (muted) audio.current?.pause(); }, [muted]);
  useEffect(() => () => audio.current?.pause(), []);
  const play = (src: string) => {
    if (mutedRef.current) return;
    audio.current?.pause(); const clip = new Audio(src); audio.current = clip; clip.volume = .2;
    clip.play().catch(() => undefined);
  };
  const scrollFrame = useRef<number | null>(null);
  useEffect(() => () => { if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current); }, []);
  const select = (next: number) => {
    if (next !== day) { setDay(next); setNearest(-1); play(content.timeline.tabSound); }
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    // Wait for the selected day's tickets to render before returning to the section top.
    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = null;
      document.getElementById("the-days")?.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
    });
  };
  useEffect(() => {
    let frame = 0;
    const update = () => { frame = 0; const nodes = list.current?.querySelectorAll<HTMLElement>("[data-timeline-node]"); if (!nodes) return;
      let closest = -1; let distance = Infinity;
      nodes.forEach((node, index) => { const rect = node.getBoundingClientRect(); const d = Math.abs(rect.top + rect.height / 2 - innerHeight / 2); if (d < distance && rect.bottom > 0 && rect.top < innerHeight) { distance = d; closest = index; } }); setNearest(closest);
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update(); window.addEventListener("scroll", scroll, { passive: true }); window.addEventListener("resize", scroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", scroll); window.removeEventListener("resize", scroll); };
  }, [day]);
  const starts = new Date(content.date.start).getTime();
  const weddingEnd = new Date("2027-02-01T00:00:00+05:30").getTime();
  // With no end times supplied, a live event lasts until the following event,
  // except across days. The final event lasts through the end of its wedding day.
  const live = now >= starts && now < weddingEnd;
  const localDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(now));
  const current = live ? getAllEvents(language).findLast(item => item.start <= now && item.date === localDate) : undefined;
  const next = live ? getAllEvents(language).find(item => item.start > now) : undefined;
  const entries = getAllEvents(language).filter(entry => entry.date === content.events[day].date);
  return <section id="the-days" className="events-timeline section-dark" aria-labelledby="the-days-title">
    <div className="section-heading"><p className="small-caps">{t("THE DAYS")}</p><h2 id="the-days-title" className="script">{t("Two days. One celebration.")}</h2></div>
    <DayTabs day={day} select={select} />
    <div role="tabpanel" id={`day-panel-${day}`} aria-labelledby={`day-tab-${day}`} tabIndex={0} className="days-panel" onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={event => { if (!touch.current) return; const dx = event.changedTouches[0].clientX - touch.current.x; const dy = event.changedTouches[0].clientY - touch.current.y; touch.current = null; if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) select(dx < 0 ? 1 : 0); }}>
      {day === 1 && <p className="days-arrival">{t("…and then the baraat arrives")}</p>}
      <h3 className="days-date">{content.events[day].label}</h3>
      <p className="days-starts" aria-live="polite">{now < starts ? t("Starts in {days} days", { days: Math.ceil((starts - now) / 86400000) }) : live ? t("Let the celebrations unfold · All times IST") : t("Two days to remember, forever")}</p>
      <ul className="days-timeline-list" key={day} ref={list}>
        <motion.li aria-hidden="true" className="days-timeline-line" initial={{ scaleY: reduced ? 1 : 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: reduced ? 0 : 1 }} />
        {entries.map((entry, index) => <TimelineNode key={entry.number} entry={entry} index={index} active={index === nearest} status={current?.number === entry.number ? "now" : next?.number === entry.number ? "next" : entry.start < now ? "past" : ""} sound={() => play(content.timeline.flipSound)} />)}
      </ul>
    </div>
    <DressCodeGuide />
    <AddToCalendar />
  </section>;
}

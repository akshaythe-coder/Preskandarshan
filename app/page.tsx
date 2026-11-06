"use client";

import Image from "next/image";
import { AnimatePresence, MotionConfig, motion, useDragControls } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { content } from "@/data/content";

type CollageName = "ticket" | "postcard" | "strip" | "envelope";
const eventTarget = new Date(content.date.start).getTime();
const pad = (value: number) => String(value).padStart(2, "0");

function StaticCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;
    canvas.width = 160;
    canvas.height = 120;
    const frame = () => {
      const image = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < image.data.length; i += 4) {
        const value = 75 + Math.floor(Math.random() * 150);
        image.data[i] = value;
        image.data[i + 1] = value;
        image.data[i + 2] = value;
        image.data[i + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
    };
    frame();
    const interval = window.setInterval(frame, 67);
    return () => window.clearInterval(interval);
  }, [active]);
  return <canvas ref={canvasRef} className="static-canvas" aria-hidden="true" />;
}

function Barcode({ className = "" }: { className?: string }) {
  const bars = "101101110010110100110111010010101101001011101001101101001011010";
  return (
    <svg className={`barcode ${className}`} viewBox={`0 0 ${bars.length * 2} 38`} role="img" aria-label="Decorative invitation barcode">
      {bars.split("").map((bit, index) => bit === "1" ? <rect key={index} x={index * 2} y="0" width="1.5" height="32" fill="currentColor" /> : null)}
    </svg>
  );
}

function InitialsMark({ className = "" }: { className?: string }) {
  return <span className={`initials-mark ${className}`} aria-hidden="true"><b>P</b><i>&amp;</i><b>D</b></span>;
}

function HeartYarn() {
  const strokes = Array.from({ length: 31 }, (_, i) => {
    const shift = (i - 15) * 1.22;
    return <path key={i} d="M180 311 C146 278 47 215 47 128 C47 76 109 50 145 96 C160 116 169 134 180 149 C191 134 200 116 215 96 C251 50 313 76 313 128 C313 215 214 278 180 311Z" transform={`translate(${shift * 0.32} ${Math.abs(shift) * 0.08})`} stroke={i % 4 === 0 ? "#ffb1a0" : i % 3 === 0 ? "#a91620" : "#d92b32"} strokeWidth={i % 5 === 0 ? 2.2 : 1.4} strokeDasharray={`${10 + (i % 5) * 2} ${4 + (i % 3)}`} fill="none" opacity={i % 4 === 0 ? 0.8 : 0.55} />;
  });
  return <svg className="yarn-heart" viewBox="0 0 360 360" aria-hidden="true">{strokes}</svg>;
}

function PaperTicket({ large = false }: { large?: boolean }) {
  return (
    <div className={`ticket-paper ${large ? "ticket-paper-large" : ""}`}>
      <span className="paper-pin" aria-hidden="true" />
      <div className="ticket-photo"><Image src={content.collage.ticketPhoto} alt="Preksha and Darshan together" width={720} height={960} sizes="(max-width: 700px) 78vw, 460px" /></div>
      <p className="ticket-overline">A LITTLE CELEBRATION FOR</p>
      <h3>{content.couple.first} <span>&amp;</span> {content.couple.second}</h3>
      <div className="ticket-meta"><p><small>THE DAYS</small><b>30 &amp; 31 JAN 2027</b></p><p><small>THE PLACE</small><b>{content.venue.name}<br />{content.venue.city}</b></p></div>
      <Barcode />
      <small className="barcode-digits">P&amp;D · 30 · 31 · 2027</small>
    </div>
  );
}

function Postcard() {
  return (
    <div className="postcard-paper">
      <div className="postcard-script">Save<br />our date!</div>
      <div className="postcard-detail"><span className="stamp-mark"><InitialsMark /></span><span className="postmark">JASOL<br />RAJASTHAN</span><p>{content.venue.name}<br />{content.venue.city}<br />30 &amp; 31 January 2027<br />Saturday &amp; Sunday</p></div>
      <span className="wax-seal" aria-label="P and D wax seal"><InitialsMark /></span>
    </div>
  );
}

function ScrapItem({ name, active, children, onOpen, className = "" }: { name: CollageName; active: boolean; children: ReactNode; onOpen: () => void; className?: string }) {
  const controls = useDragControls();
  const [isPhone, setIsPhone] = useState(false);
  const timer = useRef<number | null>(null);
  const dragged = useRef(false);
  useEffect(() => { setIsPhone(window.matchMedia("(max-width: 760px)").matches); }, []);
  const onDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isPhone) timer.current = window.setTimeout(() => { dragged.current = true; controls.start(event.nativeEvent); }, 250);
  };
  const onUp = () => {
    if (timer.current) window.clearTimeout(timer.current);
  };
  const click = () => { if (dragged.current) { dragged.current = false; return; } onOpen(); };
  return (
    <motion.div
      className={`scrap-item scrap-${name} ${className}`}
      style={{ rotate: name === "ticket" ? -3 : name === "postcard" ? 2.8 : name === "strip" ? 5 : 0 }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${name === "strip" ? "photo strip" : name}`}
      drag
      dragListener={!isPhone}
      dragControls={controls}
      dragMomentum
      dragElastic={0.14}
      onDragStart={() => { dragged.current = true; }}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onClick={click}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(); } }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.985 }}
      layout
      data-active={active}
    >{children}</motion.div>
  );
}

function CollageModal({ name, onClose }: { name: CollageName; onClose: () => void }) {
  const [frame, setFrame] = useState(0);
  const touchX = useRef<number | null>(null);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (name === "strip" && event.key === "ArrowRight") setFrame((value) => (value + 1) % content.collage.strip.length);
      if (name === "strip" && event.key === "ArrowLeft") setFrame((value) => (value + content.collage.strip.length - 1) % content.collage.strip.length);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [name, onClose]);
  return (
    <motion.div className="collage-modal" role="dialog" aria-modal="true" aria-label={`Enlarged ${name}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close enlarged item">×</button>
      <motion.div className={`modal-paper modal-${name}`} initial={{ scale: 0.84, y: 20, rotate: name === "postcard" ? -2 : 0 }} animate={{ scale: 1, y: 0, rotate: 0 }} onClick={(event) => event.stopPropagation()}>
        {name === "ticket" && <PaperTicket large />}
        {name === "postcard" && <Postcard />}
        {name === "envelope" && <div className="envelope-letter"><span className="wax-seal"><InitialsMark /></span><p className="script">A little note for you</p><p>Formal invitation to follow.</p><p>Kindly share your WhatsApp number so we can send your invitation.</p></div>}
        {name === "strip" && <div className="strip-viewer" onTouchStart={(event) => { touchX.current = event.touches[0].clientX; }} onTouchEnd={(event) => { if (touchX.current === null) return; const delta = event.changedTouches[0].clientX - touchX.current; if (Math.abs(delta) > 35) setFrame((value) => (value + (delta < 0 ? 1 : content.collage.strip.length - 1)) % content.collage.strip.length); touchX.current = null; }}><button onClick={() => setFrame((value) => (value + content.collage.strip.length - 1) % content.collage.strip.length)} aria-label="Previous photo">‹</button><Image src={content.collage.strip[frame].src} alt={content.collage.strip[frame].alt} width={900} height={1200} sizes="80vw" /><button onClick={() => setFrame((value) => (value + 1) % content.collage.strip.length)} aria-label="Next photo">›</button><small>{pad(frame + 1)} / {pad(content.collage.strip.length)}</small></div>}
      </motion.div>
    </motion.div>
  );
}

function CalendarLinks() {
  const title = `${content.couple.first} & ${content.couple.second} wedding celebration`;
  const details = `Celebrate with us at ${content.venue.name}, ${content.venue.city}.`;
  const query = new URLSearchParams({ action: "TEMPLATE", text: title, dates: "20270130T000000/20270201T000000", details, location: `${content.venue.name}, ${content.venue.city}`, ctz: "Asia/Kolkata" });
  const google = `https://calendar.google.com/calendar/render?${query}`;
  return <div className="calendar-links"><a href={google} target="_blank" rel="noreferrer" className="button button-outline">Add to Calendar</a></div>;
}

function ScratchDates() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !context) return;
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(bounds.width * ratio);
    canvas.height = Math.round(bounds.height * ratio);
    context.scale(ratio, ratio);
    const gradient = context.createLinearGradient(0, 0, bounds.width, bounds.height);
    gradient.addColorStop(0, "#f6eee0");
    gradient.addColorStop(.48, "#fffaf1");
    gradient.addColorStop(1, "#ead9c2");
    context.fillStyle = gradient;
    context.fillRect(0, 0, bounds.width, bounds.height);
    context.strokeStyle = "rgba(135, 20, 30, .18)";
    context.lineWidth = 1;
    context.strokeRect(13, 13, bounds.width - 26, bounds.height - 26);
    const compactStub = bounds.width < 600;
    const stubX = bounds.width * (compactStub ? .77 : .84);
    context.save();
    context.fillStyle = "rgba(117, 12, 19, .62)";
    context.textAlign = "center";
    context.font = compactStub ? "600 7px Arial, sans-serif" : "600 8px Arial, sans-serif";
    context.letterSpacing = compactStub ? ".5px" : "1.5px";
    context.fillText(compactStub ? "LUCKY" : "LUCKY TICKET", (stubX + bounds.width) / 2, bounds.height * .37);
    context.fillStyle = "#8b1720";
    context.font = compactStub ? "italic 15px Georgia, serif" : "italic 18px Georgia, serif";
    context.letterSpacing = "0px";
    context.fillText("P & D", (stubX + bounds.width) / 2, bounds.height * .49);
    context.fillStyle = "rgba(117, 12, 19, .55)";
    context.font = compactStub ? "600 6px Arial, sans-serif" : "600 7px Arial, sans-serif";
    context.letterSpacing = compactStub ? ".5px" : "1px";
    context.fillText(compactStub ? "NO. 01" : "NO. 001", (stubX + bounds.width) / 2, bounds.height * .59);
    context.restore();
    context.fillStyle = "#8b1720";
    context.font = "600 12px Arial, sans-serif";
    context.textAlign = "center";
    context.letterSpacing = "3px";
    context.fillText("RUB TO REVEAL", bounds.width / 2, bounds.height / 2 - 2);
    context.fillStyle = "#9d7c59";
    context.font = "italic 15px Georgia, serif";
    context.letterSpacing = "0px";
    context.fillText("our wedding dates", bounds.width / 2, bounds.height / 2 + 25);
  }, []);

  const scratch = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !context || !drawing.current || revealed) return;
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    context.globalCompositeOperation = "destination-out";
    context.lineWidth = 100;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(lastPoint.current?.x ?? x, lastPoint.current?.y ?? y);
    context.lineTo(x, y);
    context.stroke();
    lastPoint.current = { x, y };
  };

  const finishScratch = () => {
    drawing.current = false;
    lastPoint.current = null;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !context || revealed) return;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < pixels.length; i += 32 * 4) { total++; if (pixels[i] < 30) clear++; }
    if (total && clear / total > .05) {
      setRevealed(true);
      setBurst((value) => value + 1);
    }
  };

  const confetti = Array.from({ length: 90 }, (_, index) => {
    const angle = (index / 90) * Math.PI * 2 + (index % 5) * .17;
    const distance = 90 + ((index * 47) % 180);
    return <i key={`${burst}-${index}`} style={{ "--fly-x": `${Math.cos(angle) * distance}px`, "--fly-y": `${Math.sin(angle) * distance - 65}px`, "--spin": `${(index * 137) % 720}deg`, "--delay": `${(index % 9) * 18}ms`, "--paper": index % 2 ? "#fffaf2" : "#c51e2b" } as React.CSSProperties} />;
  });

  return <div className="date-reveal-wrap">
    <div className={`date-scratch-card ${revealed ? "date-scratch-revealed" : ""}`}>
      <div className="date-pair">
        <div><span>Saturday &amp; Sunday</span><strong>30<sup>th</sup> &amp; 31<sup>st</sup></strong><small>JANUARY 2027</small><p>Two days, one forever.</p><p>We can’t wait to celebrate with you.</p></div>
      </div>
      {!revealed && <canvas ref={canvasRef} className="date-scratch-cover" aria-label="Scratch to reveal the wedding dates" onPointerDown={(event) => { drawing.current = true; lastPoint.current = null; event.currentTarget.setPointerCapture(event.pointerId); scratch(event); }} onPointerMove={scratch} onPointerUp={finishScratch} onPointerCancel={finishScratch} />}
    </div>
    {burst > 0 && <div className="date-confetti" key={burst} aria-hidden="true">{confetti}</div>}
    {revealed && <CalendarLinks />}
  </div>;
}

export default function Invitation() {
  const [tvPhotoReady, setTvPhotoReady] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [opened, setOpened] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [time, setTime] = useState(eventTarget);
  const [musicOn, setMusicOn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<CollageName | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [replay, setReplay] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const startedSong = useRef(false);
  const [whatsappUrl, setWhatsappUrl] = useState("https://wa.me/");

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const returnToWelcome = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    returnToWelcome();
    window.addEventListener("pageshow", returnToWelcome);
    return () => {
      window.removeEventListener("pageshow", returnToWelcome);
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    setTvPhotoReady(false);
    const revealTimer = window.setTimeout(() => setTvPhotoReady(true), 500);
    const glitchTimer = window.setInterval(() => {
      setGlitch(true);
      window.setTimeout(() => setGlitch(false), 210);
    }, 8000);
    return () => { window.clearTimeout(revealTimer); window.clearInterval(glitchTimer); };
  }, [replay]);
  useEffect(() => {
    document.body.classList.toggle("invitation-locked", !opened);
    return () => document.body.classList.remove("invitation-locked");
  }, [opened]);
  useEffect(() => {
    setTime(Date.now());
    const tick = window.setInterval(() => setTime(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, []);
  useEffect(() => {
    const message = `Hi! Please send us the formal invitation for Preksha & Darshan's wedding. My name is: `;
    const target = content.whatsappNumber ? `https://wa.me/${content.whatsappNumber}` : "https://wa.me/";
    setWhatsappUrl(`${target}?text=${encodeURIComponent(message)}`);
  }, []);
  useEffect(() => {
    const visibility = () => { if (document.hidden) audioRef.current?.pause(); else if (startedSong.current && musicOn) audioRef.current?.play().catch(() => undefined); };
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, [musicOn]);
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") setPhotoIndex((value) => (value + 1) % content.moments.length);
      if (event.key === "ArrowLeft") setPhotoIndex((value) => (value + content.moments.length - 1) % content.moments.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  const startMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || startedSong.current) return;
    startedSong.current = true;
    audio.volume = 0;
    audio.play().then(() => {
      setMusicOn(true);
      let step = 0;
      const fade = window.setInterval(() => {
        step += 1;
        if (audioRef.current) audioRef.current.volume = Math.min(0.36, step * 0.015);
        if (step >= 24) window.clearInterval(fade);
      }, 55);
    }).catch(() => { startedSong.current = false; setMusicOn(false); });
  }, []);

  const openInvitation = () => {
    if (opened) return;
    setOpened(true);
    setTransitioning(true);
    startMusic();
    window.setTimeout(() => document.querySelector("#introduction")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }), 460);
    window.setTimeout(() => setTransitioning(false), 1500);
  };
  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!startedSong.current) { startMusic(); return; }
    if (musicOn) { audio.pause(); setMusicOn(false); }
    else { audio.play().then(() => setMusicOn(true)).catch(() => undefined); }
  };
  const diff = Math.max(0, eventTarget - time);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000) % 24;
  const minutes = Math.floor(diff / 60000) % 60;
  const seconds = Math.floor(diff / 1000) % 60;
  const countdown = [[days, "DAYS"], [hours, "HOURS"], [minutes, "MINUTES"], [seconds, "SECONDS"]] as const;

  return (
    <MotionConfig reducedMotion="user">
    <div className="invitation">
      <audio ref={audioRef} src={content.music} preload="none" loop />
      <header className="site-header">
        <a className="monogram" href="#tv" aria-label="Preksha and Darshan, return to the beginning"><InitialsMark /></a>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}><i /><i /><i /></button>
        <nav className={menuOpen ? "nav-open" : ""} aria-label="Main navigation" onClick={() => setMenuOpen(false)}>
          <a href="#introduction">Families</a><a href="#moments">Moments</a><a href="#days">The days</a><a href="#location">Location</a>
        </nav>
      </header>

      <main>
        <section className={`tv-hero ${transitioning ? "tv-hero-leaving" : ""}`} id="tv" aria-label="Wedding invitation television">
          <div className="hero-grain" aria-hidden="true" />
          <div className="tv-hero-copy">
            <p className="small-caps">YOU’RE INVITED TO THE WEDDING OF</p>
            <h1><span>{content.couple.first} &amp;</span><span>{content.couple.second}</span></h1>
          </div>
          <div className="television-wrap">
            <div className="tv-antennas" aria-hidden="true"><i /><i /></div>
            <div
              className={`television ${glitch ? "tv-glitch" : ""}`}
              role="button"
              tabIndex={0}
              aria-label="Open the wedding invitation"
              onClick={openInvitation}
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openInvitation(); } }}
            >
              <div className="tv-screen-frame">
                <div className={`tv-screen ${tvPhotoReady ? "photo-ready" : ""}`} style={{ top: content.tv.screen.top, left: content.tv.screen.left, width: content.tv.screen.width, height: content.tv.screen.height }}>
                  <Image src={content.tv.image} alt={content.tv.alt} fill sizes="(max-width: 600px) 65vw, 440px" priority className="tv-photo" />
                  <StaticCanvas active={!tvPhotoReady} />
                  <span className="tv-save-label">Save the date</span>
                  <span className="tv-scanlines" />
                  <span className="tv-glass" />
                </div>
              </div>
              <div className="tv-side" aria-hidden="true"><span className="tv-speaker" /><span className="tv-knob" /><span className="tv-tiny-knob" /></div>
              <span className="tv-brand"><InitialsMark /></span>
            </div>
            <div className="tv-side-knob" role="button" tabIndex={0} aria-label="Open the invitation" onClick={openInvitation} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openInvitation(); } }} />
          </div>
          <button className="click-more" type="button" onClick={openInvitation}>CLICK FOR MORE DETAILS</button>
          <span className="hero-edition">A WEDDING WEEKEND</span>
        </section>

        <section className="family-intro-section section-dark" id="introduction">
          <div className="section-heading">
            <p className="small-caps">TWO FAMILIES · ONE PROMISE</p>
            <h2 className="script">{content.familyIntroduction.title}</h2>
            <p>With love, we bring our families together.</p>
          </div>
          <figure className="family-intro-photo">
            <Image src="/photos/family-introduction.jpeg" alt="Preksha and Darshan together beneath the palace arch" width={960} height={1280} sizes="(max-width: 760px) 82vw, 460px" loading="lazy" />
          </figure>
          <div className="family-ticket" aria-label="Introducing the families of Preksha and Darshan">
            {[content.familyIntroduction.bride, content.familyIntroduction.groom].map((person, index) => (
              <article className={`family-ticket-panel ${index === 0 ? "family-bride" : "family-groom"}`} key={person.name}>
                <div className="family-ticket-copy">
                  <p className="small-caps">THE {index === 0 ? "BRIDE" : "GROOM"}</p>
                  <h3>{person.name}</h3>
                  <span className="family-rule" aria-hidden="true" />
                  {person.family.map((line) => <p className="family-line" key={line}>{line}</p>)}
                  <p className="family-home">{person.home}</p>
                </div>
              </article>
            ))}
            <div className="family-ticket-seal"><InitialsMark /></div>
          </div>
          <p className="family-intro-closing script">A celebration made sweeter by the people who raised us.</p>
        </section>

        <section className="moments-section section-dark" id="moments">
          <div className="section-heading"><p className="small-caps">LITTLE PIECES OF FOREVER</p><h2 className="script">Moments we keep</h2><p>Favorite memories, kept close.</p></div>
          <div className="gallery-rail" ref={galleryRef} onTouchStart={(event) => { touchX.current = event.touches[0].clientX; }} onTouchEnd={(event) => { if (touchX.current === null) return; const delta = event.changedTouches[0].clientX - touchX.current; if (Math.abs(delta) > 40) galleryRef.current?.scrollBy({ left: delta < 0 ? 260 : -260, behavior: "smooth" }); touchX.current = null; }}>
            {content.moments.map((photo, index) => <motion.button className={`moment-card tone-${photo.tone}`} type="button" key={photo.src} onClick={() => { setPhotoIndex(index); setLightboxOpen(true); }} whileHover={{ y: -8, rotate: 0 }} whileTap={{ scale: 0.98 }} aria-label={`View photo: ${photo.caption}`}>
              <span className="moment-image"><Image src={photo.src} alt={photo.caption} width={900} height={1200} sizes="(max-width: 700px) 76vw, 340px" loading="lazy" /></span><span className="moment-caption">{photo.caption}</span>
            </motion.button>)}
          </div>
          <p className="small-caps swipe-hint">SWIPE TO WANDER</p>
        </section>

        <section className="days-section section-dark" id="days">
          <div className="section-heading"><p className="small-caps">A LITTLE CELEBRATION</p><h2 className="script">Scratch for our dates</h2></div>
          <ScratchDates />
        </section>

        <section className="countdown-section section-dark" id="countdown">
          <p className="small-caps">THE DAYS ARE DRAWING NEAR</p>
          <h2 className="script">Until we say “I do”</h2>
          <div className="heart-countdown">
            <HeartYarn />
            <div className="countdown-inner"><p className="small-caps">COUNTING DOWN</p><div className="countdown-numbers">{countdown.map(([value, label]) => <div className="count-unit" key={label}><motion.strong key={value} initial={{ y: -8, opacity: 0.6 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.22 }}>{pad(value)}</motion.strong><span>{label}</span></div>)}</div></div>
          </div>
        </section>

        <section className="location-section section-dark" id="location">
          <div className="section-heading"><p className="small-caps">THE PLACE</p><h2 className="script">Meet us here</h2></div>
          <article className="location-postcard">
            <div className="postcard-heading"><p className="script location-invitation-line"><span>Join us in Rajasthan</span><small>where two souls unite</small></p><div className="location-stamp"><InitialsMark /></div></div>
            <span className="location-postmark">WEDDING WEEKEND<br />30 · 31 JAN 2027</span>
            <h3>{content.venue.name}</h3><p>{content.venue.city}</p>
            <a className="button button-red" href={content.venue.mapLink} target="_blank" rel="noreferrer">GET DIRECTIONS</a>
          </article>
        </section>

        <section className={`scrapbook section-dark ${opened ? "scrapbook-open" : ""}`} id="scrapbook">
          <div className="section-heading"><h2 className="script">We are getting married!</h2></div>
          <article className="still-invitation" aria-label="Wedding invitation">
            <span className="still-invitation-seal"><InitialsMark /></span>
            <p className="small-caps">TOGETHER WITH OUR FAMILIES</p>
            <h3>{content.couple.first}<span>&amp;</span>{content.couple.second}</h3>
            <p className="still-invitation-copy">joyfully invite you to celebrate their wedding</p>
            <div className="still-invitation-rule"><i /></div>
            <p className="still-invitation-date">30<sup>th</sup> &amp; 31<sup>st</sup> January 2027</p>
            <p className="still-invitation-place">{content.venue.name}<br />{content.venue.city}</p>
          </article>
        </section>

      </main>

      <AnimatePresence>{activeItem && <CollageModal name={activeItem} onClose={() => setActiveItem(null)} />}</AnimatePresence>
      <AnimatePresence>{lightboxOpen && <motion.div className="moment-lightbox" role="dialog" aria-modal="true" aria-label="Moments photo viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightboxOpen(false)}>
        <button className="lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Close photo viewer">×</button>
        <button className="lightbox-prev" onClick={(event) => { event.stopPropagation(); setPhotoIndex((value) => (value + content.moments.length - 1) % content.moments.length); }} aria-label="Previous photo">‹</button>
        <figure onClick={(event) => event.stopPropagation()} onTouchStart={(event) => { touchX.current = event.touches[0].clientX; }} onTouchEnd={(event) => { if (touchX.current === null) return; const delta = event.changedTouches[0].clientX - touchX.current; if (Math.abs(delta) > 35) setPhotoIndex((value) => (value + (delta < 0 ? 1 : content.moments.length - 1)) % content.moments.length); touchX.current = null; }}>
          <Image src={content.moments[photoIndex].src} alt={content.moments[photoIndex].caption} width={1200} height={1600} sizes="90vw" />
          <figcaption>{content.moments[photoIndex].caption}<small>{String(photoIndex + 1).padStart(2, "0")} / {String(content.moments.length).padStart(2, "0")}</small></figcaption>
        </figure>
        <button className="lightbox-next" onClick={(event) => { event.stopPropagation(); setPhotoIndex((value) => (value + 1) % content.moments.length); }} aria-label="Next photo">›</button>
      </motion.div>}</AnimatePresence>
    </div>
    </MotionConfig>
  );
}

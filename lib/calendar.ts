import { content, type WeddingEvent } from "@/data/content";
import { getContent, translate, type Language } from "@/data/i18n";

export const weddingLocation = `${content.venue.name}, ${content.venue.city}`;
export function eventStart(date: string, time: string): Date {
  const match = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(time);
  if (!match) throw new Error(`Invalid event time: ${time}`);
  const hour = Number(match[1]) % 12 + (match[3] === "PM" ? 12 : 0);
  return new Date(`${date}T${String(hour).padStart(2, "0")}:${match[2]}:00+05:30`);
}
export const getAllEvents = (language: Language = "en") => getContent(language).events.flatMap((day, dayIndex) => day.items.map((event, index) => ({
  event: event as WeddingEvent, date: day.date, number: dayIndex * 3 + index + 1, start: eventStart(day.date, event.time).getTime(),
})));
export const allEvents = getAllEvents();
// End times are not supplied: calendar entries default to one hour, capped by the next event.
export function eventEnd(date: string, event: WeddingEvent): Date {
  const start = eventStart(date, event.time).getTime();
  const next = allEvents.find(item => item.start > start);
  return new Date(Math.min(start + 3600000, next?.start ?? Infinity));
}
const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escapeText = (text: string) => text.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/[,;]/g, "\\$&");
// Fold at 75 UTF-8 octets, without splitting a Unicode character.
function fold(line: string): string {
  const parts: string[] = []; let part = ""; let bytes = 0;
  for (const char of line) { const size = new TextEncoder().encode(char).length;
    if (bytes + size > 75) { parts.push(part); part = " "; bytes = 1; }
    part += char; bytes += size;
  }
  parts.push(part); return parts.join("\r\n");
}
export function generateICS(entries = allEvents, now = new Date(), language: Language = "en"): string {
  const copy = getContent(language);
  const location = `${copy.venue.name}, ${copy.venue.city}`;
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Preksha and Darshan//The Days//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-TIMEZONE:Asia/Kolkata"];
  for (const item of entries) lines.push("BEGIN:VEVENT", `UID:preksha-darshan-${item.date}-${item.number}@wedding.local`, `DTSTAMP:${stamp(now)}`, `DTSTART:${stamp(new Date(item.start))}`, `DTEND:${stamp(eventEnd(item.date, item.event))}`, `SUMMARY:${escapeText(translate(language, "{event} — Preksha & Darshan", { event: item.event.title }))}`, `LOCATION:${escapeText(location)}`, `DESCRIPTION:${escapeText([item.event.description, item.event.dressCode && translate(language, "Dress code: {text}", { text: item.event.dressCode.text }), item.event.venueNote].filter(Boolean).join("\n") || translate(language, "More details coming soon ♥"))}`, "END:VEVENT");
  return [...lines, "END:VCALENDAR"].map(fold).join("\r\n") + "\r\n";
}
export function downloadCalendar(entries = allEvents, language: Language = "en") {
  const url = URL.createObjectURL(new Blob([generateICS(entries, new Date(), language)], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = entries.length === 1 ? `${entries[0].event.title.toLowerCase().replace(/\s+/g, "-")}.ics` : "preksha-darshan-the-days.ics";
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function googleCalendarLink(language: Language = "en") {
  const first = getAllEvents(language)[0];
  const copy = getContent(language);
  const query = new URLSearchParams({ action: "TEMPLATE", text: translate(language, "{event} — Preksha & Darshan", { event: first.event.title }), dates: `${stamp(new Date(first.start))}/${stamp(eventEnd(first.date, first.event))}`, ctz: "Asia/Kolkata", location: `${copy.venue.name}, ${copy.venue.city}` });
  return `https://calendar.google.com/calendar/render?${query}`;
}

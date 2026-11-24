export type BlessingGroup = { heading: string; names: readonly string[]; paragraph: string; memorial: boolean };
export type FamilyBlessingsData = { sectionLabel: string; chime: string; groups: readonly BlessingGroup[]; littleHearts: { heading: string; repeatInvitation: string; quotes: readonly { text: string; by: string }[] } };
export type DressSwatch = { name: string; color: string };
export type DressCode = { text: string; swatches?: readonly DressSwatch[]; style?: string; styleNote?: string; image?: { src: string; alt: string } };
export type WeddingEvent = { emoji: string; time: string; title: string; description?: string; dressCode?: DressCode; venueNote?: string };
export type WeddingDay = { date: string; label: string; tab: string; items: readonly WeddingEvent[] };

export const keepWeekdaysEnglish = true;
export { contentEn as content } from "./content.en";

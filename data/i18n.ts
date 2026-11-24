import { contentEn, messagesEn } from "./content.en";
import { contentHi, messagesHi } from "./content.hi";
type Widen<T> = T extends string ? string : T extends readonly unknown[] ? { readonly [K in keyof T]: Widen<T[K]> } : T extends object ? { [K in keyof T]: Widen<T[K]> } : T;
export type Content = Widen<typeof contentEn>;
export type MessageKey = keyof typeof messagesEn;
export type Messages = { [K in MessageKey]: string };
export type Language = "en" | "hi";
export const getContent = (language: Language): Content => language === "hi" ? contentHi : contentEn;
export const getMessages = (language: Language): Messages => language === "hi" ? messagesHi : messagesEn;
export function translate(language: Language, key: MessageKey, values: Record<string, string | number> = {}) {
  return getMessages(language)[key].replace(/\{(\w+)\}/g, (match, name: string) => String(values[name] ?? match));
}

import { getContent, getMessages, type Language } from "@/data/i18n";
export async function requestLanguage(): Promise<Language> { return "en"; }
export function localizedMetadata(language: Language) {
 const content = getContent(language), messages = getMessages(language);
 return { title: content.title, description: messages["A little note, a love story, and two days of celebration. Join Preksha and Darshan for their wedding."], openGraph: { title: content.title, description: messages["Save the date for Preksha and Darshan."], locale: language === "hi" ? "hi_IN" : "en_IN", type: "website" as const, images: [{ url: "/og.png", width: 1200, height: 630, alt: messages["Preksha and Darshan's wedding invitation"] }] }, twitter: { card: "summary_large_image" as const, title: content.title, description: messages["Save the date for Preksha and Darshan."], images: [{ url: "/og.png", alt: messages["Preksha and Darshan's wedding invitation"] }] } };
}

"use client";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { getContent, translate, type Language, type MessageKey } from "@/data/i18n";
import { useReducedMotion } from "framer-motion";
export const preloadHindiFonts = () => import("./HindiFonts").then(module => module.installHindiFonts()).catch(() => undefined);
const Context = createContext<{ language: Language; setLanguage: (language: Language) => void } | null>(null);
export function I18nProvider({ children, initialLanguage = "en", scope = "site" }: { children: ReactNode; initialLanguage?: Language; scope?: "site" | "family" }) {
  const [selected, update] = useState<Language>(scope === "family" ? initialLanguage : "en");
  const language = scope === "family" ? selected : "en";
  const scrollPosition = useRef<{x:number;y:number} | null>(null); const reduced = useReducedMotion();
  const setLanguage = useCallback((next: Language) => {
    if (scope !== "family") return;
    scrollPosition.current = {x:scrollX,y:scrollY}; update(next);
    try { localStorage.setItem("wedding-family-language",next); } catch {}
  },[scope]);
  useLayoutEffect(() => {
    if (scope === "site") document.documentElement.lang = "en";
    const position=scrollPosition.current;
    if(position){window.scrollTo({left:position.x,top:position.y,behavior:"instant"});scrollPosition.current=null;}
  },[language,scope]);
  useEffect(() => {
    if(scope === "family") { try { if(localStorage.getItem("wedding-family-language")==="hi") update("hi"); } catch {} }
    else { const url=new URL(location.href); if(url.searchParams.has("lang")){url.searchParams.delete("lang");history.replaceState(history.state,"",url);} }
  },[scope]);
  useEffect(() => {
    if(scope !== "family") return;
    if(language === "hi") void preloadHindiFonts();
    if(!reduced) document.querySelectorAll('#family-blessings .blessings-heading,#family-blessings .blessings-names,#family-blessings .blessings-welcome,#family-blessings .blessings-little-cards').forEach(element=>element.animate([{opacity:.5},{opacity:1}],{duration:250,easing:"ease-out"}));
  },[language,reduced,scope]);
  return <Context.Provider value={{language,setLanguage}}>{children}</Context.Provider>;
}
export function useT() { const context=useContext(Context);if(!context)throw new Error("useT requires I18nProvider");return {...context,content:getContent(context.language),t:(key:MessageKey,values?:Record<string,string|number>)=>translate(context.language,key,values)}; }

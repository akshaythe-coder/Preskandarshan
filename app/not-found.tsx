"use client";
import Link from "next/link";
import { useT } from "@/components/I18nProvider";
export default function NotFound() { const { t, language } = useT(); return <main style={{minHeight:"100dvh",display:"grid",placeContent:"center",padding:24,textAlign:"center"}}><h1>404</h1><p>{t("Page not found")}</p><Link href={`/?lang=${language}`}>{t("Return to invitation")}</Link></main>; }

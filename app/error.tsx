"use client";
import { useT } from "@/components/I18nProvider";
export default function ErrorPage({reset}: {reset:()=>void}) { const {t}=useT(); return <main role="alert" style={{padding:40,textAlign:"center"}}><h1>{t("Something went wrong")}</h1><button onClick={reset}>{t("Try again")}</button></main>; }

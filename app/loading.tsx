"use client";
import { useT } from "@/components/I18nProvider";
export default function Loading() { const {t}=useT(); return <p role="status" style={{padding:40}}>{t("Loading…")}</p>; }

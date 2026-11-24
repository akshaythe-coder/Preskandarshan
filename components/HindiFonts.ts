import { Amita, Tiro_Devanagari_Hindi, Hind } from "next/font/google";
const script = Amita({ weight: ["400", "700"], subsets: ["devanagari", "latin"], display: "swap", preload: false, variable: "--hindi-script" });
const serif = Tiro_Devanagari_Hindi({ weight: "400", style: ["normal", "italic"], subsets: ["devanagari", "latin"], display: "swap", preload: false, variable: "--hindi-serif" });
const ui = Hind({ weight: ["400", "500", "600"], subsets: ["devanagari", "latin"], display: "swap", preload: false, variable: "--hindi-ui" });
export async function installHindiFonts() { document.documentElement.classList.add(script.variable, serif.variable, ui.variable); await Promise.all([document.fonts.load('400 20px ' + script.style.fontFamily), document.fonts.load('400 18px ' + serif.style.fontFamily), document.fonts.load('500 15px ' + ui.style.fontFamily)]); }

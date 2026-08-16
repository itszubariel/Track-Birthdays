import type { Birthday } from "../services/store";
import { t } from "../services/i18n";

export const LETTER_COLORS: Record<string, string> = {
  A: "#FF6B6B",
  B: "#FF8E53",
  C: "#FFC300",
  D: "#A8FF3E",
  E: "#3EFF8B",
  F: "#3EFFD4",
  G: "#3EC4FF",
  H: "#3E8BFF",
  I: "#6B3EFF",
  J: "#B03EFF",
  K: "#FF3EE0",
  L: "#FF3E8B",
  M: "#FF5733",
  N: "#FF9F1C",
  O: "#CBFF8C",
  P: "#52FFAB",
  Q: "#52E5FF",
  R: "#5271FF",
  S: "#9B52FF",
  T: "#FF52D9",
  U: "#FF6B9B",
  V: "#FFB347",
  W: "#B8FF52",
  X: "#52FFD0",
  Y: "#FF52A0",
  Z: "#52B8FF",
};

export function getLetterColor(name: string): string {
  if (!name || name.trim().length === 0) return "#ffb3b0";
  const letter = name.trim()[0].toUpperCase();
  return LETTER_COLORS[letter] || "#ffb3b0";
}

export function parseStoredDate(dateStr: string): {
  month: number;
  day: number;
  year: number | null;
} {
  const parts = dateStr.split("-");
  const year = parseInt(parts[0]);
  return {
    year: year === 1 ? null : year,
    month: parseInt(parts[1]) - 1,
    day: parseInt(parts[2]),
  };
}

export function getZodiac(dateStr: string): string {
  const { month, day } = parseStoredDate(dateStr);
  const m = month + 1;
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19))
    return t("zodiac_aries");
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20))
    return t("zodiac_taurus");
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20))
    return t("zodiac_gemini");
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22))
    return t("zodiac_cancer");
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return t("zodiac_leo");
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22))
    return t("zodiac_virgo");
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22))
    return t("zodiac_libra");
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21))
    return t("zodiac_scorpio");
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21))
    return t("zodiac_sagittarius");
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19))
    return t("zodiac_capricorn");
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18))
    return t("zodiac_aquarius");
  return t("zodiac_pisces");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateICS(birthdays: Birthday[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Track Birthdays//EN",
  ];
  for (const b of birthdays) {
    const parts = b.date.split("-");
    const year = parseInt(parts[0]);
    const month = parts[1];
    const day = parts[2];
    const displayYear = year === 1 ? "2000" : String(year);
    const dtStart = `${displayYear}${month}${day}`;
    const now = new Date();
    const nowStr = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const description = [];
    const zodiac = getZodiac(b.date);
    if (zodiac !== "—") description.push(zodiac);
    if (b.groups?.name) description.push(b.groups.name);
    if (year > 1) {
      const age = now.getFullYear() - year;
      description.push(`${age} years old`);
    }
    lines.push("BEGIN:VEVENT");
    lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    lines.push(`DTSTAMP:${nowStr}`);
    lines.push("RRULE:FREQ=YEARLY");
    lines.push(`SUMMARY:${b.name}'s Birthday`);
    if (description.length > 0) {
      lines.push(`DESCRIPTION:${description.join(" - ")}`);
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function parseHHMM(time: string): number {
  const parts = time.split(":");
  const h = parseInt(parts[0]) || 0;
  const m = parseInt(parts[1]) || 0;
  return h * 60 + m;
}

export function formatHHMM(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
    m % 60,
  ).padStart(2, "0")}`;
}

export function utcToLocalMinutes(utcMinutes: number): number {
  return (utcMinutes - new Date().getTimezoneOffset() + 1440) % 1440;
}

export function localToUtcMinutes(localMinutes: number): number {
  return (localMinutes + new Date().getTimezoneOffset() + 1440) % 1440;
}

export function getMonthName(i: number): string {
  return [
    t("month_january"),
    t("month_february"),
    t("month_march"),
    t("month_april"),
    t("month_may"),
    t("month_june"),
    t("month_july"),
    t("month_august"),
    t("month_september"),
    t("month_october"),
    t("month_november"),
    t("month_december"),
  ][i];
}

export interface VCardEntry {
  name: string;
  birthday: string;
}

function decodeQuotedPrintable(text: string): string {
  const decoded = text
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-F]{2})/gi, (_, hex: string) => `%${hex}`);
  try {
    return decodeURIComponent(decoded);
  } catch {
    return text.replace(/=\r?\n/g, "");
  }
}

function decodeVCardValue(value: string): string {
  return value
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .replace(/\\n/g, " ");
}

export function parseBdayToStored(bday: string): string | null {
  const s = bday.trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^(\d{4})(\d{2})(\d{2})$/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^--(\d{2})-(\d{2})$/.exec(s);
  if (m) return `0001-${m[1]}-${m[2]}`;
  m = /^--(\d{2})(\d{2})$/.exec(s);
  if (m) return `0001-${m[1]}-${m[2]}`;
  return null;
}

export function parseVCard(text: string): VCardEntry[] {
  const entries: VCardEntry[] = [];
  const unfolded = text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
  const blocks = unfolded.match(/BEGIN:VCARD[\s\S]*?END:VCARD/gi) || [];
  for (const block of blocks) {
    let name = "";
    let rawBday = "";
    const lines = block.split(/\r\n|\n/);
    for (const raw of lines) {
      const line = raw.trim();
      if (line.length === 0) continue;
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const header = line.slice(0, colonIdx);
      const value = line.slice(colonIdx + 1);
      const prop = header.split(";")[0].toUpperCase();
      const quoted = /ENCODING.*QUOTED-PRINTABLE/i.test(header);
      const decoded = quoted ? decodeQuotedPrintable(value) : value;
      if (prop === "FN") {
        if (!name) name = decodeVCardValue(decoded).trim();
      } else if (prop === "N") {
        if (!name) {
          const parts = decoded.split(";").map((p) => p.trim());
          name = [parts[1] || "", parts[2] || "", parts[0] || ""]
            .filter(Boolean)
            .join(" ")
            .trim();
        }
      } else if (prop === "BDAY") {
        rawBday = decoded;
      }
    }
    if (!name) continue;
    const birthday = parseBdayToStored(rawBday);
    if (!birthday) continue;
    entries.push({ name: name.replace(/\s+/g, " "), birthday });
  }
  const seen = new Set<string>();
  return entries.filter((e) => {
    const key = e.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

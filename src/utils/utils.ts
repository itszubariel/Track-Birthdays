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

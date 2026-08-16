import { Capacitor } from "@capacitor/core";
import { Contacts } from "@capacitor-community/contacts";
import { parseVCard } from "../utils/utils";
import type { VCardEntry } from "../utils/utils";

export interface ContactCandidate {
  name: string;
  birthday: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function parseContactBirthday(
  bday:
    | { year?: number | null; month?: number | null; day?: number | null }
    | null
    | undefined,
): string | null {
  if (!bday || !bday.month || !bday.day) return null;
  const month = pad2(bday.month);
  const day = pad2(bday.day);
  return bday.year
    ? `${String(bday.year).padStart(4, "0")}-${month}-${day}`
    : `0001-${month}-${day}`;
}

export async function pickTextFile(accept: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.style.display = "none";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error("no-file"));
        return;
      }
      file
        .text()
        .then(resolve)
        .catch(() => reject(new Error("read-failed")));
      input.remove();
    });
    document.body.appendChild(input);
    input.click();
  });
}

export async function pickContactsFile(): Promise<VCardEntry[]> {
  const text = await pickTextFile(".vcf,text/vcard,text/x-vcard");
  return parseVCard(text);
}

export async function readContactsWithBirthdays(): Promise<ContactCandidate[]> {
  if (Capacitor.isNativePlatform()) {
    let permission = await Contacts.checkPermissions();
    if (permission.contacts !== "granted") {
      permission = await Contacts.requestPermissions();
    }
    if (
      permission.contacts !== "granted" &&
      permission.contacts !== "limited"
    ) {
      throw new Error("permission-denied");
    }
    const result = await Contacts.getContacts({
      projection: { name: true, birthday: true },
    });
    const candidates: ContactCandidate[] = [];
    for (const c of result.contacts) {
      const name =
        c.name?.display ||
        [c.name?.given, c.name?.family].filter(Boolean).join(" ").trim();
      if (!name) continue;
      const birthday = parseContactBirthday(c.birthday);
      if (!birthday) continue;
      candidates.push({ name, birthday });
    }
    const seen = new Set<string>();
    return candidates.filter((c) => {
      const key = c.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const entries = await pickContactsFile();
  return entries.map((e) => ({ name: e.name, birthday: e.birthday }));
}

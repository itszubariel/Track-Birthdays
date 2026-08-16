import { supabase } from "./supabase";
import { getStore, refreshAll } from "./store";
import type { ContactCandidate } from "./contacts";
import { pickTextFile } from "./contacts";
import type { ImportCandidate, ImportBackupGroup } from "../core/nav-state";

export interface BackupBirthday {
  id?: string;
  name: string;
  date: string;
  group_id?: string | null;
  notes?: string | null;
  archived?: boolean;
  wished?: boolean;
  wished_at?: string | null;
  avatar_url?: string | null;
  gift_status?: string | null;
  notify?: boolean;
}

export interface BackupPayload {
  birthdays: BackupBirthday[];
  groups: ImportBackupGroup[];
}

function isValidStoredDate(date: unknown): date is string {
  if (typeof date !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [y, m, d] = date.split("-").map(Number);
  if (y < 1 || m < 1 || m > 12 || d < 1 || d > 31) return false;
  return true;
}

export function buildCandidates(
  people: {
    name: string;
    date: string;
    full?: Record<string, unknown> | null;
  }[],
): ImportCandidate[] {
  const existing = new Set(
    getStore().birthdays.map((b) => b.name.trim().toLowerCase()),
  );
  return people.map((p, i) => ({
    key: `${i}-${p.name.toLowerCase()}|${p.date}`,
    name: p.name,
    date: p.date,
    duplicate: existing.has(p.name.trim().toLowerCase()),
    full: p.full ?? null,
  }));
}

export async function importBirthdays(
  userId: string,
  people: ContactCandidate[],
): Promise<{ imported: number }> {
  if (people.length === 0) return { imported: 0 };
  const rows = people.map((p) => ({
    user_id: userId,
    name: p.name,
    date: p.birthday,
    group_id: null,
    notes: null,
  }));
  const { error } = await supabase.from("birthdays").insert(rows);
  if (error) throw error;
  await refreshAll(userId);
  return { imported: people.length };
}

export function validateBackupJson(text: string): BackupPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("invalid-json");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("invalid-json");
  }
  const obj = parsed as Record<string, unknown>;
  const birthdays = Array.isArray(obj.birthdays)
    ? obj.birthdays.filter(
        (b): b is BackupBirthday =>
          !!b &&
          typeof b === "object" &&
          typeof (b as BackupBirthday).name === "string" &&
          typeof (b as BackupBirthday).date === "string",
      )
    : [];
  const groups = Array.isArray(obj.groups)
    ? obj.groups.filter(
        (g): g is ImportBackupGroup =>
          !!g &&
          typeof g === "object" &&
          typeof (g as ImportBackupGroup).name === "string",
      )
    : [];
  return { birthdays, groups };
}

export async function pickBackupFile(): Promise<BackupPayload> {
  const text = await pickTextFile(".json,application/json");
  return validateBackupJson(text);
}

export async function importBackup(
  userId: string,
  rawBirthdays: BackupBirthday[],
  rawGroups: ImportBackupGroup[],
): Promise<{
  importedBirthdays: number;
  importedGroups: number;
  skipped: number;
}> {
  const existingGroups = getStore().groups;
  const resolvedNameToId = new Map<string, string>();
  const oldToNew = new Map<string, string>();
  const groupsToInsert: {
    id: string;
    user_id: string;
    name: string;
    color: string;
    avatar_url: string | null;
  }[] = [];

  for (const g of rawGroups) {
    if (typeof g.name !== "string" || !g.name.trim()) continue;
    const key = g.name.trim().toLowerCase();
    const existing = existingGroups.find(
      (x) => x.name.trim().toLowerCase() === key,
    );
    if (existing) {
      resolvedNameToId.set(key, existing.id);
      if (g.id) oldToNew.set(g.id, existing.id);
      continue;
    }
    if (!resolvedNameToId.has(key)) {
      const newId = crypto.randomUUID();
      resolvedNameToId.set(key, newId);
      groupsToInsert.push({
        id: newId,
        user_id: userId,
        name: g.name.trim(),
        color: typeof g.color === "string" && g.color ? g.color : "#FF6B6B",
        avatar_url: typeof g.avatar_url === "string" ? g.avatar_url : null,
      });
    }
    if (g.id) oldToNew.set(g.id, resolvedNameToId.get(key)!);
  }

  if (groupsToInsert.length > 0) {
    const { error } = await supabase.from("groups").insert(groupsToInsert);
    if (error) throw error;
  }

  let skipped = 0;
  const rows: Record<string, unknown>[] = [];
  for (const b of rawBirthdays) {
    if (typeof b.name !== "string" || !b.name.trim()) {
      skipped++;
      continue;
    }
    if (!isValidStoredDate(b.date)) {
      skipped++;
      continue;
    }
    const groupId = b.group_id ? oldToNew.get(b.group_id) ?? null : null;
    const row: Record<string, unknown> = {
      user_id: userId,
      name: b.name.trim(),
      date: b.date,
      group_id: groupId,
      notes: typeof b.notes === "string" && b.notes ? b.notes : null,
      archived: !!b.archived,
      wished: !!b.wished,
      wished_at: typeof b.wished_at === "string" ? b.wished_at : null,
      avatar_url: typeof b.avatar_url === "string" ? b.avatar_url : null,
      gift_status: typeof b.gift_status === "string" ? b.gift_status : null,
      notify: b.notify !== false,
    };
    rows.push(row);
  }

  let importedBirthdays = 0;
  if (rows.length > 0) {
    const { error } = await supabase.from("birthdays").insert(rows);
    if (error) throw error;
    importedBirthdays = rows.length;
  }

  await refreshAll(userId);
  return {
    importedBirthdays,
    importedGroups: groupsToInsert.length,
    skipped,
  };
}

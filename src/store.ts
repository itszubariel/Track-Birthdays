import { supabase } from "./supabase";

export interface Birthday {
  id: string;
  user_id: string;
  name: string;
  date: string;
  group_id: string | null;
  notes: string | null;
  archived: boolean;
  wished: boolean;
  wished_at: string | null;
  avatar_url: string | null;
  gift_status: string | null;
  notify: boolean;
  groups: { name: string; color: string } | null;
}

export interface Group {
  id: string;
  user_id: string;
  name: string;
  color: string;
  avatar_url: string | null;
  birthdays: { count: number }[];
}

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  birthday: string | null;
  notification_time: string | null;
  onboarding_complete: boolean | null;
}

interface Store {
  birthdays: Birthday[];
  groups: Group[];
  profile: Profile | null;
  isLoaded: boolean;
}

const store: Store = {
  birthdays: [],
  groups: [],
  profile: null,
  isLoaded: false,
};

export function getStore(): Store {
  return store;
}

export function updateBirthday(id: string, updates: Partial<Birthday>): void {
  const idx = store.birthdays.findIndex((b) => b.id === id);
  if (idx !== -1) {
    store.birthdays[idx] = { ...store.birthdays[idx], ...updates };
  }
}

export function replaceBirthday(id: string, replacement: Birthday): void {
  const idx = store.birthdays.findIndex((b) => b.id === id);
  if (idx !== -1) {
    store.birthdays[idx] = replacement;
  }
}

export function addBirthday(birthday: Birthday): void {
  store.birthdays.push(birthday);
}

export function removeBirthday(id: string): void {
  const idx = store.birthdays.findIndex((b) => b.id === id);
  if (idx !== -1) {
    store.birthdays.splice(idx, 1);
  }
}

export function restoreBirthdayAt(idx: number, birthday: Birthday): void {
  store.birthdays.splice(idx, 0, birthday);
}

export function updateGroup(id: string, updates: Partial<Group>): void {
  const idx = store.groups.findIndex((g) => g.id === id);
  if (idx !== -1) {
    store.groups[idx] = { ...store.groups[idx], ...updates };
  }
}

export function replaceGroup(id: string, replacement: Group): void {
  const idx = store.groups.findIndex((g) => g.id === id);
  if (idx !== -1) {
    store.groups[idx] = replacement;
  }
}

export function addGroup(group: Group): void {
  store.groups.push(group);
}

export function removeGroup(id: string): void {
  const idx = store.groups.findIndex((g) => g.id === id);
  if (idx !== -1) {
    store.groups.splice(idx, 1);
  }
}

export function restoreGroupAt(idx: number, group: Group): void {
  store.groups.splice(idx, 0, group);
}

export function clearGroupFromBirthdays(groupId: string): void {
  for (const b of store.birthdays) {
    if (b.group_id === groupId) {
      b.group_id = null;
      b.groups = null;
    }
  }
}

export function setProfile(profile: Profile | null): void {
  store.profile = profile;
}

async function ensureDefaultGroups(userId: string): Promise<void> {
  const { data: existing } = await supabase
    .from("groups")
    .select("id")
    .eq("user_id", userId)
    .limit(1);
  if (existing && existing.length > 0) return;
  await supabase.from("groups").insert([
    { user_id: userId, name: "Family", color: "#FF6B6B" },
    { user_id: userId, name: "Friends", color: "#FF8E53" },
    { user_id: userId, name: "Work", color: "#FFC300" },
  ]);
}

async function fetchAll(userId: string): Promise<void> {
  const [{ data: birthdays }, { data: groups }, { data: profile }] =
    await Promise.all([
      supabase.from("birthdays").select("*, groups(name, color)").order("date"),
      supabase.from("groups").select("*, birthdays(count)"),
      supabase.from("profiles").select("*").eq("id", userId).single(),
    ]);
  store.birthdays = (birthdays || []) as Birthday[];
  store.groups = (groups || []) as Group[];
  store.profile = (profile || null) as Profile | null;
  store.isLoaded = true;
}

export async function loadAll(userId: string): Promise<void> {
  await ensureDefaultGroups(userId);
  await fetchAll(userId);
}

export async function refreshAll(userId: string): Promise<void> {
  await fetchAll(userId);
}

export function clearStore(): void {
  store.birthdays = [];
  store.groups = [];
  store.profile = null;
  store.isLoaded = false;
}

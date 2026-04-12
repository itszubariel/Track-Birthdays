import { supabase } from './supabase'

interface Store {
  birthdays: any[]
  groups: any[]
  profile: any | null
  isLoaded: boolean
}

const store: Store = {
  birthdays: [],
  groups: [],
  profile: null,
  isLoaded: false,
}

export function getStore(): Readonly<Store> {
  return store
}

async function ensureDefaultGroups(userId: string): Promise<void> {
  const { data: existing } = await supabase.from('groups').select('id').eq('user_id', userId).limit(1)
  if (existing && existing.length > 0) return
  await supabase.from('groups').insert([
    { user_id: userId, name: 'Family', color: '#ff6b6b' },
    { user_id: userId, name: 'Friends', color: '#52dea2' },
    { user_id: userId, name: 'Work', color: '#4dabf7' },
  ])
}

async function fetchAll(userId: string): Promise<void> {
  const [{ data: birthdays }, { data: groups }, { data: profile }] = await Promise.all([
    supabase.from('birthdays').select('*, groups(name, color)').order('date'),
    supabase.from('groups').select('*, birthdays(count)'),
    supabase.from('profiles').select('*').eq('id', userId).single(),
  ])
  store.birthdays = birthdays || []
  store.groups = groups || []
  store.profile = profile || null
  store.isLoaded = true
}

export async function loadAll(userId: string): Promise<void> {
  await ensureDefaultGroups(userId)
  await fetchAll(userId)
}

export async function refreshAll(userId: string): Promise<void> {
  await fetchAll(userId)
}

export function clearStore(): void {
  store.birthdays = []
  store.groups = []
  store.profile = null
  store.isLoaded = false
}

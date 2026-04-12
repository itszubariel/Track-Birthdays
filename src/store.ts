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

export async function loadAll(userId: string): Promise<void> {
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

export async function refreshAll(userId: string): Promise<void> {
  return loadAll(userId)
}

export function clearStore(): void {
  store.birthdays = []
  store.groups = []
  store.profile = null
  store.isLoaded = false
}

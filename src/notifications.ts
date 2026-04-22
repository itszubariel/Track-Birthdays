const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; i++) {
    view[i] = rawData.charCodeAt(i)
  }
  return view
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    return reg
  } catch (err) {
    console.error('Service worker registration failed:', err)
    return null
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export async function subscribeToPush(userId: string) {
  const reg = await navigator.serviceWorker.ready
  try {
    const existing = await reg.pushManager.getSubscription()
    if (existing) {
      await saveSubscription(existing, userId)
      return existing
    }

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })

    await saveSubscription(subscription, userId)
    return subscription
  } catch (err) {
    console.error('Push subscription failed:', err)
    return null
  }
}

async function saveSubscription(subscription: PushSubscription, userId: string) {
  const { supabase } = await import('./supabase')
  const sub = subscription.toJSON()
  const endpoint = sub.endpoint

  const { data: existing } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('subscription->>endpoint', endpoint)
    .maybeSingle()

  if (!existing) {
    await supabase.from('push_subscriptions').insert({
      user_id: userId,
      subscription: sub
    })
  }
}

export async function initNotifications(userId: string) {
  const reg = await registerServiceWorker()
  if (!reg) return

  const granted = await requestNotificationPermission()
  if (!granted) return

  await subscribeToPush(userId)
}
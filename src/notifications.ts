import { Capacitor } from "@capacitor/core";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    view[i] = rawData.charCodeAt(i);
  }
  return view;
}

// ── Capacitor (Android native) path ──────────────────────────────────────

async function initCapacitorPush(userId: string) {
  const { PushNotifications } = await import("@capacitor/push-notifications");

  let permResult = await PushNotifications.checkPermissions();
  if (permResult.receive === "prompt" || permResult.receive === "prompt-with-rationale") {
    permResult = await PushNotifications.requestPermissions();
  }
  if (permResult.receive !== "granted") {
    return;
  }

  await PushNotifications.register();

  PushNotifications.addListener("registration", async (token) => {
    const { supabase } = await import("./supabase");
    const subscription = { token: token.value, platform: "android" };
    const { data: existing } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("subscription->>token", token.value)
      .maybeSingle();

    if (!existing) {
      await supabase.from("push_subscriptions").insert({
        user_id: userId,
        subscription,
      });
    }
  });
}

// ── Web (browser/PWA) path ──────────────────────────────────────────────

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    return reg;
  } catch (err) {
    console.error("Service worker registration failed:", err);
    return null;
  }
}

async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

async function subscribeToWebPush(userId: string) {
  const reg = await navigator.serviceWorker.ready;
  try {
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      await saveWebSubscription(existing, userId);
      return existing;
    }

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await saveWebSubscription(subscription, userId);
    return subscription;
  } catch (err) {
    console.error("Push subscription failed:", err);
    return null;
  }
}

async function saveWebSubscription(
  subscription: PushSubscription,
  userId: string,
) {
  const { supabase } = await import("./supabase");
  const sub = subscription.toJSON();
  const endpoint = sub.endpoint;

  const { data: existing } = await supabase
    .from("push_subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("subscription->>endpoint", endpoint)
    .maybeSingle();

  if (!existing) {
    await supabase.from("push_subscriptions").insert({
      user_id: userId,
      subscription: sub,
    });
  }
}

// ── Public API ──────────────────────────────────────────────────────────

export async function initNotifications(userId: string) {
  if (Capacitor.isNativePlatform()) {
    await initCapacitorPush(userId);
  } else {
    const reg = await registerServiceWorker();
    if (!reg) return;

    const granted = await requestNotificationPermission();
    if (!granted) return;

    await subscribeToWebPush(userId);
  }
}

import webpush from "npm:web-push";
import * as jose from "npm:jose@5";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
const vapidEmail = Deno.env.get("VAPID_EMAIL")!;

webpush.setVapidDetails(
  `mailto:${vapidEmail}`,
  vapidPublicKey,
  vapidPrivateKey,
);

function daysUntil(dateStr: string): number {
  const parts = dateStr.split("-");
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);
  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const next = new Date(today.getFullYear(), month, day);
  if (next < todayMidnight) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next.getTime() - todayMidnight.getTime()) / 86400000);
}

function getNotificationMessage(name: string, days: number) {
  if (days === 0)
    return {
      title: `🎂 It's ${name}'s birthday!`,
      body: `Today is ${name}'s birthday — don't forget to wish them!`,
    };
  if (days === 1)
    return {
      title: `🎁 ${name}'s birthday is tomorrow!`,
      body: `Get ready to celebrate ${name} tomorrow!`,
    };
  if (days === 7)
    return {
      title: `📅 ${name}'s birthday in a week`,
      body: `${name}'s birthday is in 7 days — plan ahead!`,
    };
  return null;
}

// ── FCM V1 (Android) ────────────────────────────────────────────────────

let fcmServiceAccount: any = null;
let fcmAccessToken: string | null = null;
let fcmTokenExpiry = 0;

async function getFCMServiceAccount() {
  if (!fcmServiceAccount) {
    fcmServiceAccount = JSON.parse(Deno.env.get("FCM_SERVICE_ACCOUNT")!);
  }
  return fcmServiceAccount;
}

async function getFCMAccessToken(): Promise<string> {
  if (fcmAccessToken && Date.now() < fcmTokenExpiry) {
    return fcmAccessToken;
  }

  const sa = await getFCMServiceAccount();
  const now = Math.floor(Date.now() / 1000);

  const jwt = await new jose.SignJWT({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: sa.token_uri,
    exp: now + 3600,
    iat: now,
  })
    .setProtectedHeader({ alg: "RS256" })
    .sign(await jose.importPKCS8(sa.private_key, "RS256"));

  const tokenRes = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`OAuth2 error: ${await tokenRes.text()}`);
  }

  const data = await tokenRes.json();
  fcmAccessToken = data.access_token;
  fcmTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return fcmAccessToken!;
}

async function sendFCMNotification(
  token: string,
  title: string,
  body: string,
): Promise<void> {
  const sa = await getFCMServiceAccount();
  const accessToken = await getFCMAccessToken();

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
        },
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`FCM error ${res.status}: ${errText}`);
  }
}

// ── Main ────────────────────────────────────────────────────────────────

Deno.serve(async () => {
  const birthdaysRes = await fetch(
    `${supabaseUrl}/rest/v1/birthdays?select=*,profiles(id,notification_time)`,
    {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    },
  );
  const birthdays = await birthdaysRes.json();
  console.log("Birthdays fetched:", birthdays.length);

  for (const birthday of birthdays) {
    const days = daysUntil(birthday.date);
    const msg = getNotificationMessage(birthday.name, days);
    if (!msg) {
      console.log(`No notification needed for ${birthday.name}`);
      continue;
    }

    const profile = birthday.profiles;
    if (!profile) {
      console.log(`No profile for ${birthday.name}`);
      continue;
    }

    const currentUTCHour = new Date().getUTCHours();
    const currentUTCMinute = new Date().getUTCMinutes();
    const [notifHour, notifMinute] = (profile.notification_time ?? "09:00")
      .split(":")
      .map(Number);

    if (currentUTCHour !== notifHour || currentUTCMinute !== notifMinute) {
      console.log(`Not time yet for ${birthday.name}`);
      continue;
    }

    const subRes = await fetch(
      `${supabaseUrl}/rest/v1/push_subscriptions?user_id=eq.${birthday.user_id}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );
    const subs = await subRes.json();
    if (!subs?.length) {
      console.log(`No subscriptions for ${birthday.name}`);
      continue;
    }

    for (const sub of subs) {
      try {
        if (sub.subscription?.platform === "android") {
          await sendFCMNotification(
            sub.subscription.token,
            msg.title,
            msg.body,
          );
          console.log("Sent FCM to", birthday.name);
        } else {
          await webpush.sendNotification(
            sub.subscription,
            JSON.stringify(msg),
          );
          console.log("Sent web push to", birthday.name);
        }
      } catch (err: any) {
        console.error("Failed:", birthday.name, err);
        if (err.statusCode === 410) {
          await fetch(
            `${supabaseUrl}/rest/v1/push_subscriptions?id=eq.${sub.id}`,
            {
              method: "DELETE",
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
            },
          );
          console.log("Deleted expired subscription for", birthday.name);
        }
      }
    }
  }

  return new Response("Done");
});

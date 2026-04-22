# 🎂 Track Birthdays

Never miss a birthday again. Your personal celebration companion.

**Web app:** [trackbirthdays.netlify.app](https://trackbirthdays.netlify.app)  
**Download / Home:** [trackbirthdaysland.netlify.app](https://trackbirthdaysland.netlify.app)

---

## What is it?

Track Birthdays is a progressive web app (and Android APK) that helps you remember and celebrate the birthdays of everyone you care about with smart push notifications, group organisation, AI gift ideas, and a clean dark UI.

---

## Features

- **Birthday tracking** — add birthdays with countdowns, zodiac signs, and upcoming date views
- **Groups** — colour-code contacts into groups (family, friends, colleagues, etc.)
- **Push notifications** — get notified 7 days before, 1 day before, and on the day itself, at your chosen time
- **Multi-device** — notifications work across all your browsers and devices simultaneously
- **AI gift ideas** — personalised gift suggestions for each person
- **Avatar uploads** — add photos for each birthday person and yourself
- **PWA** — install directly from your browser, works offline
- **Android APK** — download and install as a native-feeling Android app
- **Full auth flow** — sign up, log in, email verification, password reset

---

## How to use

### Web
Visit [trackbirthdays.netlify.app](https://trackbirthdays.netlify.app) in your browser, create an account and start adding birthdays.

### Android APK
Visit [trackbirthdaysland.netlify.app](https://trackbirthdaysland.netlify.app) to download the APK and install it on your Android device.

### Add to Home Screen (PWA)
On Android — open the web app in Chrome or Brave, tap the menu → "Add to Home Screen".  
On iOS — open in Safari, tap Share → "Add to Home Screen" (push notifications not supported on iOS).

---

## Push Notifications

Notifications are sent at your chosen time (set in your profile) for:
- 🎂 **Day of** birthday
- 🎁 **1 day before**
- 📅 **7 days before**

> **Note:** Notification time is in UTC. To find your UTC offset, search "UTC offset [your city]".

**Browser support:**
| Browser | Notifications |
|---|---|
| Chrome / Brave (desktop) | ✅ |
| Firefox / Zen (desktop) | ✅ |
| Chrome / Brave (Android) | ✅ |
| Firefox (Android) | ✅ |
| Android APK | ✅ |
| iOS Safari | ❌ (Apple limitation) |
| iOS Chrome / Brave | ❌ (Apple limitation) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | TypeScript, Vite |
| PWA | vite-plugin-pwa, Workbox |
| Auth & Database | Supabase |
| File Storage | Supabase Storage |
| Push Notifications | Supabase Edge Functions, web-push |
| Cron Scheduler | Cloudflare Workers |
| Hosting | Netlify |
| Android APK | Bubblewrap (TWA) |

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md)

---

## License

Copyright © 2026 Zubariel. All Rights Reserved.  
See [LICENSE](LICENSE) for details.
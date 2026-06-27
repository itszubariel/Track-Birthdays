# Track Birthdays

Never miss a birthday again. A PWA + Android app with push notifications, group management, AI gift ideas, and a clean dark UI.

**Web app:** [trackbirthdays.netlify.app](https://trackbirthdays.netlify.app)<br>
**Download:** [trackbirthdaysland.netlify.app](https://trackbirthdaysland.netlify.app)

## What is it?

Track Birthdays is a progressive web app (and Android APK) that helps you remember and celebrate the birthdays of everyone you care about with smart push notifications, group organisation, AI gift ideas, and a clean dark UI.

## Features

- **Birthday tracking:** add birthdays with countdowns, zodiac signs, and upcoming date views
- **Calendar view:** rolling 12-month calendar with birthday indicators and quick add
- **Wished tracking:** mark birthdays as wished with visual indicators
- **Groups:** color-code contacts into groups (family, friends, colleagues, etc.)
- **Push notifications:** 7 days before, 1 day before, and on the day itself, at your chosen time
- **Multi-device:** notifications across all browsers and devices simultaneously
- **AI gift ideas:** personalized gift suggestions for each person
- **Avatar uploads:** add photos for each birthday person and yourself
- **PWA:** install from browser, works offline
- **Android APK:** native-feeling Android app (Capacitor)
- **Full auth flow:** sign up, log in, email verification, password reset

## How to Use

**Web:** visit [trackbirthdays.netlify.app](https://trackbirthdays.netlify.app), create an account, and start adding birthdays.

**Android APK:** download from [trackbirthdaysland.netlify.app](https://trackbirthdaysland.netlify.app) and install on your device.

**PWA (Add to Home Screen):**
- **Android:** open in Chrome/Brave, tap menu > "Add to Home Screen"
- **iOS:** open in Safari, tap Share > "Add to Home Screen" (notifications not supported on iOS)

## Push Notifications

Sent at your chosen time for day of, 1 day before, and 7 days before. Time is in UTC.

| Browser | Notifications |
|---|---|
| Chrome / Brave (desktop) | Yes |
| Firefox / Zen (desktop) | Yes |
| Chrome / Brave (Android) | Yes |
| Firefox (Android) | Yes |
| Android APK | Yes |
| iOS (all browsers) | No (Apple limitation) |

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
| Android APK | Capacitor |

## License

Copyright 2026 Zubariel. All rights reserved. See [LICENSE](LICENSE) for details.

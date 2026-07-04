# Track Birthdays

Never miss a birthday again. A PWA + Android app with smart push notifications, calendar view, AI gift ideas, multi-language support, and a clean dark UI.

**Web app:** [trackbirthdays.netlify.app](https://trackbirthdays.netlify.app)<br>
**Landing page:** [trackbirthdaysland.netlify.app](https://trackbirthdaysland.netlify.app)

---

## Features

- **Calendar View**: Rolling 12-month calendar with birthday indicators
- **Push Notifications**: On the day, 1 day before, 7 days before, and up to 30 days out, at your chosen time. Uses Firebase Cloud Messaging on Android APK and Web Push on browser/PWA.
- **Android APK**: Native Capacitor build with FCM push notifications, system share sheet for data export, and no phone shell UI on device.
- **AI Gift Ideas**: Personalized suggestions powered by Groq AI
- **Groups**: Color-code contacts into groups and filter by group
- **Wished Tracking**: Mark birthdays as wished with visual indicators
- **Letter Avatar Colors**: Auto-assigned colors based on the first letter of each name (A-Z, 26 unique colors)
- **Multi-Language**: 8 languages: English, Spanish, French, German, Danish, Japanese, Korean, Chinese with instant switching
- **Data Export**: Export all birthdays as .ics calendar file or .json directly from the app
- **Native Color Picker**: Full color input for groups instead of preset swatches
- **Per-Birthday Notification Toggle**: Opt out of reminders for individual birthdays
- **Optimistic UI**: Instant updates synced in the background with automatic rollback on failure
- **PWA**: Installable from browser with offline support via Workbox
- **Full Auth**: Email sign-up, login, verification, password reset, account deletion

## Push Notification Support

| Browser / Platform | Notifications |
|---|---|
| Chrome / Brave (desktop) | Yes |
| Firefox / Zen (desktop) | Yes |
| Chrome / Brave (Android) | Yes |
| Firefox (Android) | Yes |
| Android APK | Yes (FCM) |
| iOS (any browser) | No |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | TypeScript, Vite |
| PWA | vite-plugin-pwa, Workbox |
| Auth & Database | Supabase |
| File Storage | Supabase Storage |
| Push Notifications | Supabase Edge Functions, web-push, Firebase Cloud Messaging |
| Cron Scheduler | Cloudflare Workers |
| AI | Groq AI |
| Hosting | Netlify |
| Android | Capacitor |
| i18n | Custom runtime translation engine (8 languages) |

## Links

- [Web App](https://trackbirthdays.netlify.app)
- [Landing Page / Download APK](https://trackbirthdaysland.netlify.app)
- [Changelog](https://trackbirthdaysland.netlify.app/changelog.html)

## License

All Rights Reserved. This repository is provided for viewing and reference purposes only. No permission is granted to copy, modify, redistribute, or use the code without explicit permission.

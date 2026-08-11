# Track Birthdays

> **A BOLD, NEOBRUTALIST BIRTHDAY TRACKING PLATFORM**
> _Flat ink shadows, high-contrast accents, and comprehensive platform integrations._

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](#)
[![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=flat-square&logo=capacitor&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](#)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](#)
[![Groq AI](https://img.shields.io/badge/Groq%20AI-orange?style=flat-square)](#)

Track Birthdays is a fully-featured Progressive Web App (PWA) and native Android platform completely redesigned from the ground up. It trades standard glassmorphism gradients for a sharp, loud **Neobrutalist Design System** emphasizing extreme readability, tactile interaction feedback, and robust functionality.

- **Web App:** [app.trackbds.zubs.me](https://app.trackbds.zubs.me)
- **Landing Page:** [trackbirthdays.zubs.me](https://trackbirthdays.zubs.me)

---

## The Neobrutalist UI/UX

The v1.7.0 overhaul establishes a solid, high-contrast aesthetic modeled after print design:

- **Ink-Shadow Aesthetics:** Every card, button, and popup features a flat `4px 4px 0` pitch-black ink shadow on a cream-colored paper background.
- **Thick Borders:** Components are bounded by thick ink borders to define a robust and modern outline.
- **Tactile Physics:** Clickable elements incorporate tactile `translate(2px, 2px)` plus shadow-collapse hover animations and instant `scale(0.95)` touch feedback.
- **Unified Accents:** Each functional section leverages a distinct accent color block:
  - **Orange:** Upcoming Birthdays Spotlight & Badge
  - **Lime:** Add Birthdays interface & success indicators
  - **Blue:** AI-driven Gift Ideas

---

## Core Features

### Advanced Birthday Engine

- **Passed/Upcoming Partitioning:** Birthday lists are intelligently partitioned. Passed entries dynamically sink to the bottom, ensuring immediate visibility of upcoming dates.
- **Calendar Matrix:** Rolling 12-month calendar featuring custom birthday indicators (up to 3 avatar bubbles per day) and a swipe-up neobrutalist bottom sheet.
- **Group Filtering:** Color-code your contacts with a full-color hex picker and filter lists on-the-fly.

### Groq AI Gift Ideas

- Stuck on a gift? Integrated serverless functions stream suggestions directly from **Groq AI**, personalizing suggestions by age, zodiac sign, group association, and specific preferences.

### Bulletproof Push Notifications

- Supports reminders on the day, 1 day prior, 7 days prior, or up to 30 days ahead at any specified UTC time.
- **PWA/Web:** High-reliability Web Push Protocol.
- **Android:** Native Capacitor implementation with foreground event dispatch and custom Android notification channels.
- **Granular Mute:** Disable notifications for specific entries without turning off overall system updates.

### Instant Multi-Language Support

- Translated natively across **8 languages** with instant hot-swapping:
  - English, Spanish, French, German, Danish, Japanese, Korean, and Chinese.
- Adaptive date-formatting and calendar labels that automatically match local locale standards.

### Data Sovereignty

- **ICS Export:** Download active calendars as standard recurring `.ics` files.
- **JSON Portability:** Instant backups containing all birthdays and custom color-coded groups.

---

## Technical Overview

Track Birthdays is built on a modern, decoupled cloud architecture designed for high availability and zero cold-start delay.

- **Frontend Core:** Single Page Application (SPA) compiled using Vite and TypeScript, running fully client-side with dynamic asset caching.
- **Native Shell:** Built using Capacitor to interface directly with native Android SDKs, including push receiver hooks and native sharing mechanics.
- **Data Tier:** Supabase Postgres instances running with Row Level Security (RLS) policies to secure individual user spaces.
- **Serverless Layer:** Vercel API routes hosting Groq AI endpoints and account-deletion workflows.

---

## Licensing

This project is licensed under the terms of the **PolyForm Strict License 1.0.0**.

Under this license, you are granted a copyright and patent license to use the software for any **permitted purpose**, which strictly includes:

- Any **noncommercial purpose** (use by charitable, educational, environmental, public research, or public safety/health organizations).
- Any **personal use** (such as personal study, private entertainment, hobby projects, testing, or amateur pursuits) without anticipated commercial application.

However, your license does **not** grant rights to:

- **Distribute** the software to others.
- **Make changes** or create derivative works based on the software (other than personal, noncommercial modifications for private use).

For details, please refer to the full [LICENSE](LICENSE) terms included in this repository.

# Changelog

All notable changes to Track Birthdays will be documented here.

---

## [1.1.2] - 2026-04-17

### Bug Fixes
- Fixed sign-out and delete account modals appearing at the top of the screen instead of centered over the visible viewport when the profile page is scrolled down
- Fixed archived birthday modal also mispositioned for the same reason — all modals now mount directly on the app root element, outside the scroll container
- Fixed navigation race condition where rapidly switching tabs could cause a blank screen (`TypeError: can't access property "style"`) — added a generation counter so stale async renders exit cleanly
- Fixed groups page fetching from Supabase on every visit instead of reading from the in-memory cache

### Improvements
- Added native-app-like animations throughout: page enter fade/slide, staggered list items, modal scale-in, bottom-sheet slide-up, nav tab bounce, and button press feedback
- Redesigned onboarding with per-slide accent colours, ambient background blobs, icon pulse animations, and smooth horizontal slide transitions between slides
- Zoom disabled on the Android APK — pinch-to-zoom and double-tap zoom are now locked to prevent the non-native feel
- App name corrected to "Track Birthdays" everywhere (was "Birthday Tracker" in some places)

---

## [1.1.1] - 2026-04-13

### Bug Fixes
- Fixed groups tab not being cached on first app load, which previously caused a brief delay when opening Groups for the first time
- Fixed occasional duplication of built-in groups (where default groups would randomly appear multiple times, e.g., 3 → 6)
- Fixed password reset flow not working correctly when using "Forgot Password"

---

## [1.1.0] - 2026-04-12

### Performance
- Added app-wide data caching — all data is fetched once on app load during a loading screen instead of per-tab, eliminating blank screen flashes between tab switches
- Background cache invalidation — when you make a change (add birthday, add group, etc.), affected data is silently refetched in the background during the save operation so the rest of the app stays in sync instantly

### UI
- Full landing page redesign
- Updated Privacy Policy and Terms of Service pages to match new landing page design

### Improvements
- Archived birthdays are now read-only — you must unarchive a birthday before you can edit it

---

## [1.0.0] - 2026-04-11

### Initial Release 🎉

#### Auth
- Email & password sign up with username
- Login via email or username
- Email verification flow
- Forgot password / reset password via email
- Onboarding slides on first launch
- Auto profile creation via database trigger

#### Birthdays
- Add, edit, and delete birthdays
- Store birthdays with or without birth year
- Countdown to next birthday
- Zodiac sign display
- Avatar upload per birthday person
- Archive birthdays

#### Groups
- Create colour-coded groups
- Assign birthdays to groups
- Filter birthdays by group

#### Push Notifications
- Browser push notifications via Web Push Protocol
- Notifications sent 7 days before, 1 day before, and on the day of a birthday
- User-configurable notification time (UTC)
- Multi-device support — all subscribed browsers notified simultaneously
- Auto-cleanup of expired push subscriptions
- Supported on Chrome, Brave, Firefox, Zen (desktop + Android)
- PWA and Android APK notification support

#### Profile
- Edit full name and username
- Upload profile avatar
- Set your own birthday
- Set notification time preference
- Change password
- Delete account with confirmation

#### App
- Progressive Web App (PWA) — installable from browser
- Android APK via Bubblewrap (TWA)
- Full offline support via Workbox service worker
- Dark theme UI
- Toast notifications for all actions
- Responsive mobile-first design

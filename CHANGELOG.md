# Changelog

All notable changes to Track Birthdays will be documented here.

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
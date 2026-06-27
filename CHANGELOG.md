# Changelog

All notable changes to Track Birthdays will be documented here.

---

## [1.4.0] - 2026-06-27

### Major Changes
- **Migrated from Bubblewrap (TWA) to Capacitor** for native Android builds
  - Replaced Bubblewrap-generated project with Capacitor's native Android project structure
  - Added Capacitor CLI and Android platform (`@capacitor/android`, `@capacitor/cli`, `@capacitor/core`)
  - New build workflow: `npm run cap:build` (build web + sync to native), then assemble via Gradle
  - Removed Bubblewrap-specific files: `twa-manifest.json`, Gradle wrappers in root, asset links, etc.
- **Updated Android SDK & Build Tools**, configured JDK 21 compatibility

### Improvements
- Simplified APK build process, no more `bubblewrap build`, direct Gradle builds via `./gradlew assembleRelease`
- Cleaner project structure, Android project now fully contained in `android/` directory
- Updated `.gitignore` for Capacitor project structure
- Replaced default Capacitor app icon with custom app icon
- Removed adaptive icon compositing, icon now renders directly without white padding
- Reverted splash screen to plain theme background (no more generated splash drawable)

### Documentation
- Updated README with corrected tech stack and build instructions

---

## [1.3.3] - 2026-05-08

### Features
- **Calendar View**, new calendar tab showing rolling 12-month view starting from current month
  - Tap dates with birthdays to see bottom sheet with birthday list
  - Tap empty dates to quickly add a birthday on that date
  - Birthday indicators show up to 3 avatar circles per day
  - Replaces Add tab in navigation (Add button now a floating action button)
- **Wished Tracking**, mark birthdays as wished with visual feedback
  - "Mark as Wished" button in birthday detail view (coral outlined, green filled)
  - Green badge with checkmark appears on birthday cards when wished
- **Floating Action Button**, quick add button on birthdays page
  - Coral circular FAB positioned bottom-right above nav bar
  - Only visible on main birthdays list (hidden in detail views and other tabs)

### Performance
- **Calendar lazy loading**, initial render shows 3 months, loads more on scroll using IntersectionObserver (70% faster initial load on mobile)
- **DOM caching**, calendar HTML cached after first render, instant restoration on tab switch
- **Smart cache invalidation**, cache automatically refreshes when month changes or birthday data updates

### Improvements
- **Toast stacking system**, multiple toasts now stack vertically (max 5 visible)
  - New toasts appear on top, existing ones shift down
  - Oldest toast removed when 6th arrives
- **Bottom sheet z-index fixes**, fixed calendar date tap sheets appearing with dark overlay blocking content
- **Back navigation improvements**, smooth navigation between calendar, add page, and birthday detail views with proper state management
- **Rolling 12-month window**, calendar always shows exactly 12 months from current month

---

## [1.2.3] - 2026-04-29

### Features
- **Letter-based avatar colors**, Each person now gets a unique color based on the first letter of their name (A-Z mapped to 26 distinct colors)
  - Birthday cards show personalized left border accent using letter color
  - Avatar backgrounds use letter color at 15% opacity
  - Avatar text uses full letter color
  - Detail view hero card uses letter color throughout
  - Live preview on Add Birthday page shows letter color as you type
  - Groups continue to use their own user-defined colors in filter pills

### Performance
- **Optimistic UI updates**, All save operations now update instantly without waiting for the server
  - Adding, editing, archiving, and deleting birthdays show immediate feedback
  - Creating, editing, and deleting groups update instantly
  - Success toasts appear immediately
  - Changes sync with Supabase in the background
  - Automatic rollback with error toast if server operation fails
  - No new caching layers or complexity, just faster, more responsive interactions

---

## [1.1.3] - 2026-04-22

### Bug Fixes
- Fixed bug where the date of the birthday was incorrect/bugged.
- Other Minor Bug Fixes also occured.

---

## [1.1.2] - 2026-04-17

### Bug Fixes
- Fixed sign-out and delete account modals appearing at the top of the screen instead of centered over the visible viewport when the profile page is scrolled down
- Fixed archived birthday modal also mispositioned for the same reason, all modals now mount directly on the app root element, outside the scroll container
- Fixed navigation race condition where rapidly switching tabs could cause a blank screen (`TypeError: can't access property "style"`), added a generation counter so stale async renders exit cleanly
- Fixed groups page fetching from Supabase on every visit instead of reading from the in-memory cache

### Improvements
- Added native-app-like animations throughout: page enter fade/slide, staggered list items, modal scale-in, bottom-sheet slide-up, nav tab bounce, and button press feedback
- Redesigned onboarding with per-slide accent colours, ambient background blobs, icon pulse animations, and smooth horizontal slide transitions between slides
- Zoom disabled on the Android APK, pinch-to-zoom and double-tap zoom are now locked to prevent the non-native feel
- App name corrected to "Track Birthdays" everywhere (was "Birthday Tracker" in some places)

---

## [1.1.1] - 2026-04-13

### Bug Fixes
- Fixed groups tab not being cached on first app load, which previously caused a brief delay when opening Groups for the first time
- Fixed occasional duplication of built-in groups (where default groups would randomly appear multiple times, e.g., 3, 6)
- Fixed password reset flow not working correctly when using "Forgot Password"

---

## [1.1.0] - 2026-04-12

### Performance
- Added app-wide data caching, all data is fetched once on app load during a loading screen instead of per-tab, eliminating blank screen flashes between tab switches
- Background cache invalidation, when you make a change (add birthday, add group, etc.), affected data is silently refetched in the background during the save operation so the rest of the app stays in sync instantly

### UI
- Full landing page redesign
- Updated Privacy Policy and Terms of Service pages to match new landing page design

### Improvements
- Archived birthdays are now read-only, you must unarchive a birthday before you can edit it

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
- Multi-device support, all subscribed browsers notified simultaneously
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
- Progressive Web App (PWA), installable from browser
- Android APK via Bubblewrap (TWA)
- Full offline support via Workbox service worker
- Dark theme UI
- Toast notifications for all actions
- Responsive mobile-first design
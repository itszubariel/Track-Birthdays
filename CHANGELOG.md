# Changelog

All notable changes to Track Birthdays will be documented here.

---

## [1.8.0] - 2026-08-16

### Major: Import Birthdays

Easily bring your existing people into the app instead of adding them one by one.

#### Import Contacts

- **Android APK**: scans your phone's contacts directly with a one-time permission prompt, pulling names and birthdays from anyone who has a birthday saved
- **Web/PWA**: imports a `.vcf` file (Google Contacts export or iOS share-a-contact)
- Robust vCard parsing: handles `FN`/`N` names, `BDAY` with or without year (including year-less `--MM-DD` and compact `YYYYMMDD` formats), quoted-printable encoding, and folded lines
- People without a birthday are silently skipped

#### Import Backup

- Restore a previously exported `.json` backup into any account
- Group memberships restored by name — existing groups are reused, missing ones are recreated
- Carries over names, dates, notes, wished/gift status, avatar URLs, and notification toggles

#### Shared Preview Screen

- Review every candidate before importing: select-all toggle, per-row checkboxes, and a "Already tracked" badge marking people you've already added (those are unchecked by default)
- Handles permission-denied, empty-list, and invalid-file states cleanly
- "Export JSON" renamed to **"Export Backup"** to match Import Backup

### Improved

- **State retention across tabs**: switching tabs no longer loses what you were doing — in-progress values in Add Birthday, Gift Ideas, birthday edit, and group add/edit all restore when you come back, and Birthdays, Calendar, and Profile remember your scroll position
- **Birthday list caching**: the list restores instantly on tab switch without a re-render
- **Reminder time is now local**: set your daily notification time in your own timezone instead of UTC (still stored in UTC behind the scenes, so nothing changes server-side)
- **Update checker is APK-only**: the "new version available" toast no longer shows in the web app

### Fixed

- Importing contacts on Android failed after granting permission (missing manifest permission declaration)
- Wished/gift status now resets automatically once the birthday for the year has passed, so flags don't go stale

### Internal

- Migrated serverless functions from Netlify to Vercel (`/api/groq`, `/api/delete-user`); removed Netlify config and functions
- Landing pages, app icon, and auth legal links moved to `trackbirthdays.zubs.me`
- Added `@capacitor-community/contacts`

---

## [1.7.0] - 2026-07-15

### Major: Complete UI Overhaul

Both the app and the landing page have been completely redesigned from scratch. The old dark glassmorphism aesthetic has been replaced with a bold neobrutalist design system.

#### Design System

- **Neobrutalist UI throughout**: flat `4px 4px 0` ink shadows, thick ink borders, pill-shaped and rounded-corner components, high-contrast accents on a cream/paper background
- **Consistent interaction model**: every clickable element has the same translate + shadow-collapse hover effect and `scale(0.95)` press feedback on touch, applied uniformly from buttons to filter chips to back buttons to modal actions
- **Light and dark mode** both fully styled with the new system, smooth theme transitions throughout

#### App

- **Birthdays page**: cards have flat ink shadows and a lift-on-hover animation; avatar circles have shadows; spotlight/hero card has shadow; header redesigned with pill icon buttons; group filter chips have hover and press effects; birthday entries that have already passed this year now appear at the bottom in a separate section so upcoming birthdays always show first; removed per-letter color system (26 random hex colors), cards now use a monochrome ink palette with orange accents for the initial letter and "COMING UP" badge; each page gets a single consistent accent color (birthdays: orange, add a birthday: lime, gift ideas: blue)
- **Calendar page**: bottom sheet popups redesigned: drag handle pill restored, no outer shadow ring, more bottom padding; date numbers sit more centered in their cells
- **Groups page**: group cards, detail hero card, and edit section card all have flat ink shadows; avatar circles match the profile page style
- **Profile page**: modal buttons, toggle knob rendering, edit button style all polished
- **Onboarding**: back button is transparent with border only, consistent with app style
- **Auth and Reset Password**: logo button and theme toggle have full hover effects
- **Toast notifications**: redesigned with paper background, ink border, colored left accent (lime/pink/orange by type), spring slide-in from top-right
- **Splash screen**: loading bar thicker and matches subtitle width; icon has cream border with theme-aware flat shadow

#### Landing Page

- **index.html fully redesigned**: cream background, Archivo Black headlines, neobrutalist component style matching the app; marquee ticker strip, floating feature badges, and app icon hero replacing the old phone mockup; nav updated with FAQ and About links, "Tech Stack" removed; FAQ section updated with the 5 most useful questions
- **changelog.html**: visual overhaul matching the new design system
- **policy.html and terms.html**: updated to mention Groq AI, per-birthday notification toggle, data export, multi-language support, and group data
- **license.html**: third-party dependencies list corrected, Groq SDK updated to "Groq AI via Vercel serverless function"
- **New: help.html**: 22 Q&A entries across 6 sections covering every feature of the app, written accurately against the source code
- **New: assets.html**: brand assets page with logo, color palette, typography, and usage guidelines
- **New: contact.html**: contact page
- **Comprehensive multi-language support**: All landing pages (index, changelog, policy, terms, license, help, assets, contact) are now fully localized into 8 languages.

### Internal

- **Structural Refactor**: Comprehensive reorganization of `src/` and `landing/` directories for improved modularity, maintainability, and clearer separation of concerns.

---

## [1.6.1] - 2026-07-04

### Fixed

- **Data export now works on Android APK**, replaced browser blob URL download with native file write via `@capacitor/filesystem` + system share sheet via `@capacitor/share`, previously the export button looked successful but no file was saved on device
- **Phone shell no longer visible on mobile**, the phone border/mockup wrapper is now entirely skipped when running natively on Capacitor, and the CSS breakpoint has been widened to 480px with the ::after element hidden
- **Push notifications now deliver on APK**, added explicit notification channel creation for Android 8+, added `data` payload alongside `notification` for reliable foreground event handling, and fixed listener ordering so the registration event is always captured
- **Marquee loop seam on landing page**, removed outer gap on `.marquee`/`.marquee-reverse`, set `flex-wrap: nowrap` and `width: max-content` so the animation scrolls the full content width, and added matching `padding-right` on child sets to eliminate the visual gap at the loop seam

---

## [1.6.0] - 2026-07-04

### Added

- **Native color picker for groups**: replaced the 6 preset color swatches with a full `<input type="color">`, pick any color, not just the defaults
- **Per-birthday notification toggle**: opt out of reminders for individual birthdays from the detail view without disabling all notifications, defaults to on for existing birthdays
- **.ics calendar export**: exports all birthdays as an iCalendar file with yearly recurrence, zodiac sign, group, and age, download from the new Data card on the Profile page
- **JSON data export**: downloads all birthdays, groups, and a timestamp as a `.json` file

### Fixed

- Birthday countdown on detail view now always shows the person's letter-color instead of only for dates within 7 days
- Floating action button no longer appears on the Gift Ideas page
- Phone shell inset border no longer obscured by composited layers from `backdrop-filter`
- Landing page "Privacy Policy" footer link was broken (`policy-policy.html` → `privacy-policy.html`)

### Refactored

- Removed dead files (`src/counter.ts`, `src/loading.ts`)
- Consolidated shared functions into `src/utils.ts` (`parseStoredDate`, `getZodiac`, `getInitials`, `getMonthName`)
- Replaced raw Supabase error strings with translated i18n keys
- Centralized store mutations (`updateBirthday`, `replaceBirthday`, `addBirthday`, `removeBirthday`, etc.)
- Extracted shared CSS classes (`.sticky-header`, `.back-btn`, `.avatar-img`, `.detail-action-btn`)

### Landing Page

- **Phone mockup redone**, replaced hand-crafted CSS phone shell with `<iphone-16-max>` web component for realistic rendering with dynamic island and status bar
- **Bottom nav updated**, Calendar tab replaces old Add tab with all 4 tabs (Birthdays, Calendar, Groups, Profile) fitting at 280px width
- **FAB added**, gradient floating action button positioned at bottom-right of the mockup
- **Birthday cards redone**, 3 entries (Phoebe, Chloe, Zoe) with month section headers ("July", "August"), spotlight card for the closest birthday, compact sizing matching app layout (4-line structure: name, age, date, zodiac)
- **Card colors sourced from `LETTER_COLORS`**, Phoebe (P → `#52FFAB`), Chloe (C → `#FFC300`), Zoe (Z → `#52B8FF`) matching the app's letter-to-color mapping
- **Content accuracy fixes**, badge "No Tracking" → "No Ads", hero description rephrased for web + Android, features headline and text updated, stats heading "Growing every day" → "By the numbers", CTA installation note corrected
- **Feature cards replaced**, Calendar View and Per-Birthday Toggle cards replace outdated tech cards
- **Legal docs updated**, privacy policy and terms of service now mention Groq AI, per-birthday notify toggle, data export, multi-language, group data, localStorage
- **Visual polish**, glow effects removed from FAB and cards, glassmorphism and shimmer hover restored, gradient text restored on titles

---

## [1.5.0] - 2026-07-03

### Major Changes

- **Multi-Language Support**, the entire app is now fully translated into 8 languages
  - English, Spanish, French, German, Danish, Japanese, Korean, and Chinese
  - Language selector on the Profile page with instant switch, no reload needed
  - Nav bar, birthdays, calendar, groups, profile, auth, everything translates on the fly
  - Date formatting uses each language's native locale (day/month names, date strings)
- **In-app update checker**, the app now checks for new APK versions on startup
  - Shows a toast with a download link when a newer version is available on GitHub Releases

### Improvements

- **Smoother animations**, bounce-style animations replaced with subtle, native-feeling fades and slides
  - Calendar birthday sheet now has staggered list item animations like the rest of the app
- **Nav bar text overflow**, long labels gracefully truncate with ellipsis instead of breaking the layout
- **Refined phone dimensions**, shell updated from 390×844 to 402×874 for a more accurate fit

### Bug Fixes

- Fixed navigation where going back from Gift Ideas in a calendar detail view landed on Birthdays instead of returning to the calendar
- Fixed white flash on page reload

---

## [1.4.1] - 2026-06-27

### Added

- **Android Push Notifications**, the Android APK now supports push notifications via Firebase Cloud Messaging
  - Notifications work even when the app is closed, showing the same birthday reminders as the web version
  - You can enable notifications from your Profile page (same toggle as browser push)
  - Notifications still sent 7 days before, 1 day before, and on the day of a birthday
  - Web push notifications for browser/PWA users remain unchanged

### Improvements

- **Fixed nav bar shifting**, switching between tabs no longer causes the entire page to shrink or the nav bar to resize
- **Cleaner nav bar**, active tab now only highlights with a color change (no pink background behind the button)
- **Removed FAB glow**, floating action button no longer has a glowing shadow effect

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

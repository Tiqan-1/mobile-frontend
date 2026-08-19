# Secondary Reviewer — Remaining Items (post T0 review)

> Created 2026-08-18. Excludes `.env` secrets and `Login` dummy test data (`m@m.com` / `Aa@123123`) per instruction — those belong to T0 C2/C8 and are treated as dummy/local-test only.
> Cross-references: `CLAUDE.md`, `docs/tasks/README.md`, `docs/tasks/T6-expo-hardening.md`, `docs/tasks/T2a-theme.md`, `docs/tasks/T0-hygiene.md`.

---

## Deferred Dependency / Migration Decisions (T6 own)

| Dep / Change | Status | File / Note |
|---|---|---|
| `react-native-fast-image` → `expo-image` | Deferred to T6 | Call sites: `MainScreen`, `Programs`, `AccessibleImage` atom. `resizeMode` → `contentFit`. Keep atom prop API unchanged for T2b. |
| `react-native-render-html` removed | T6 deletes from `package.json`; T2a removes `typography.ts` import/export. Confirmed dead weight (only import in `typography.ts`, nothing consumes `systemFonts`). |
| `react-native-restart` → `expo-updates` | Deferred to T6 | Used by language-change restart (`useI18n.ts`). Hot path; `expo-updates` also brings OTA — adopt restart API without enabling OTA if not wanted. |
| `react-native-mmkv` 3 → 4 | Deferred to T6 | Must verify autolink under CNG. Needed for T0 C3 `encryptionKey` fix. |
| `react-native-pdf` 6.7.7 → 7.x | Deferred to T6 | Load-bearing for PDF viewer. |
| `@sentry/react-native` 7.2.0 → 8.x | Deferred to T6 | Metro wrapper + Expo plugin must stay aligned. Android symbol upload started working because of plugin; don't regress. |

---

## Abandoned / Unowned Native Packages (no brief owns)

- `react-native-actionsheet` (^2.4.2) — abandoned 2022, no New Arch commitment. **Live** in `Login` (`useRef<ActionSheet>` at line 34, rendered at line 180). Not T0's job; no brief scopes replacement. Add to `docs/tasks/README.md` unowned list.

---

## Theme / Styling Architecture (T2a owns plumbing; T2b/T2e/T2f own consumers)

- `ThemeContext.tsx`: carries keyboard state (`isKeyboardVisible`, `keyboardHeight`) — should split into `useKeyboard` hook. `toggleTheme()` compares stale `isDark` (pre-update) and calls `toDark()`/`toLight()` which mutate `var PALETTE`. `enableDark` = `false` in `constants.ts` hides broken dark mode.
- `theme/colors.ts`: mutable `var PALETTE`. Roughly six screens import it directly; they never re-render on theme change. T2a must kill mutation (freeze objects, delete `toDark`/`toLight`).
- `theme/styles.ts`: `SHADOW` / `SHADOWINPUT` import `PALETTE` at module scope — same capture-at-load bug. Must become theme-aware factory.
- `theme/typography.ts`: `getFonts()` maps `medium` to `Cairo-Regular` (either missing `Cairo-Medium` font file or wrong mapping). `St` hardcodes `PALETTE.BLACK` at module scope. `tagsStylesHTML*` are module constants instead of theme functions.
- `Login/index.tsx` line 82: `backgroundColor: PALETTE.APP_BACKGROUND` (direct import). Same in other screens (not fully enumerated here — T2e/T2f should audit).

---

## Data Layer / State (T2d owns)

- `store/index.ts`: `new MMKV()` with no `encryptionKey`. Auth `token` + `refreshToken` in plaintext. T0 C3 blocked intentionally (file is T2d's `Owns`). `subscriptions` blacklisted from persist (`blacklist` includes it) — reducer is now fixed (`setSubscriptions` assigns `action.payload`), so blacklisting is a design choice, not dead code.
- `App.tsx`: no `QueryClientProvider`. `@tanstack/react-query` installed but only works inside test wrappers (`TestAppWrapper.tsx`) and `LessonChat`. Needs either export from `App.tsx` or rewrite of test wrapper.
- `LessonChat` (`molecules`): polls every 5s (`refetchInterval`) — stand-in for removed Pusher (`TODO(T4)`). Architecture decision unowned (not Expo hygiene, not T6). Must be resolved before realtime chat can work.

---

## Navigation / Types

- `navigation/types.ts`: imports `Lesson`, `Program`, `Subscription` without importing from `@/types/program`. Relies on implicit globals; produces `TS2307` noise.
- `navigation/Application.tsx`: uses `typography['text']` directly from `typography.ts` (old theme dependency). `BottomTabNavigation.tsx`: had hardcoded Arabic key `t('القائمة')` — fixed in uncommitted changes (`t('navigation.Menu')` + translations added). Should be committed.

---

## Testing / Harness (T0 owns config; T2b owns Skeleton test subject)

- `__tests__/App.test.tsx`: retargeted at real `src/App.tsx` (passes — full Redux + PersistGate + ThemeProvider + Sentry render).
- `Skeleton.test.tsx`: crashes because `__mocks__/TestAppWrapper.tsx` imports `queryClient, storage` from `@/App`, which exports neither. T2d fix: either export from `App.tsx` (add `QueryClientProvider`) or rewrite wrapper.
- No coverage thresholds set (correct — suite can't meet them yet).

---

## Build / Native Config Residue (T4 done; T6 continues)

- `app.json`: `icon` points to `assets/images/icon.png` — likely placeholder (neither platform has ever had a real 1024×1024 icon). `displayName` changed from pre-migration "مبادرة" (backend name, `CLAUDE.md` §1) to `Binaa`. Needs conscious confirmation (👤 human call) before shipping. `newArchEnabled: true` preserved.
- `android/` + `ios/`: generated, gitignored, absent from fresh checkout. `expo prebuild --clean` regenerates. No hand-edits after prebuild (T4 acceptance criterion 10).
- `metro.config.js`: uses `expo/metro-config`. Two silent-crash patterns fixed (wrong `mergeConfig` package, `react-native-svg-transformer` `/expo` entry point). Keep these notes in doc for future native changes.
- `.env` file: tracked deliberately (`.gitignore` removed entry in `06fa36e`). Contains live token (`TELEGRAM_BOT_TOKEN`). Not fixed by `.gitignore`; rotation is the only real fix. Excluded from this doc per user instruction.

---

## Cleanup / Leftover Files

- `package-old.json`: tracked, stale duplicate of pre-migration `package.json`. Not in T0 Part D deletion list. Should be deleted.
- `docs/reviews/` directory: `review-steps.md`, `T0-hygiene-pr-review.md`, `secondary-reviewer.md` (this file) — untracked (`??` in `git status`). Should be committed or added to `.gitignore` if not meant for repo.
- `.history/`: untracked (correct — removed from tracking during T4 cleanup).
- `Fastlane/APPCONST` / `Appfile`: bundle-ID mismatch (covered in T0 review). Not repeated here.

---

## Unowned Open Items (update `docs/tasks/README.md`)

1. Real-time replacement for `LessonChat` (polls 5s, `TODO(T4)`). Pick: Expo config plugin for Pusher, plain WebSocket, or different provider.
2. `react-native-actionsheet` — abandoned, live in `Login`. No brief owns replacement.
3. `ForgotPassword` and `signup` auth screens: same `__DEV__ ? 'm@m.com' : ''` and missing `.catch` pattern T0 fixed in `Login`. Outside T0 `Owns`.
4. `docs/reviews/` files — commit or `.gitignore`.

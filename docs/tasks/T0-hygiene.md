# T0 — Repo hygiene, CI, and high-severity fixes

**Depends on:** nothing. **Runs alone** — every other brief needs a verifiable baseline that only this one creates.

## Goal

Right now this repo **cannot be built by anyone except the original author**, and neither `yarn lint` nor `yarn test` passes on a clean checkout. Until that's fixed, no later task can verify its own work.

Done means: a fresh clone on a different machine runs `yarn install && yarn lint && yarn test` green and produces an Android debug APK, in CI.

## Owns

```
package.json            .prettierrc.js          .github/workflows/ci.yml   (new)
jest.config.js          .nvmrc          (new)   .env, .env.example
eslint.config.mjs       .gitignore              react-native.config.js
Fastlane/Fastfile
__tests__/App.test.tsx

src/store/subscriptionSlice.ts
src/services/API.ts
src/config/telegram.ts
src/config/pusher.ts
src/screens/Menu/index.tsx
src/screens/auth/Login/index.tsx
src/App.tsx                        (Sentry DSN only — do not restructure)

deletions listed below
```

Do not touch anything else. In particular, leave `android/` and `ios/` to T1b — except `android/gradle.properties`, which is yours for the keystore-secrets fix only.

---

## Part A — Make it install

### A1. Kill the machine-local dependency

`package.json` pins:

```json
"react-native-beautiful-timeline": "file:/Users/mshokry/PWS/ReactNative/react-native-beautiful-timeline"
```

`yarn install` fails anywhere else on earth. It is **imported nowhere in `src/`**. Remove it.

### A2. Remove dead dependencies

All verified unused by grep across `src/`:

`axios`, `ky` (apisauce is the real client), `redux-observable`, `redux-devtools-extension`, `crypto-js`, `@react-navigation/drawer`, `@react-native/new-app-screen`, `@react-native-masked-view/masked-view`, `react-native-actionsheet` (its only use is already commented out in `Login`), `react-native-youtube` (v2, dead since 2018 — `react-native-youtube-iframe` is the live one), `react-native-localize` (all usage commented out in `useI18n.ts`).

Also drop `@types/react-native-actionsheet` and `@react-native/eslint-config` (installed, never referenced by the flat config).

Re-run a grep for each before deleting — if one turns out to be used, keep it and note it in your report.

### A3. Fix the broken scripts

- `postinstall` runs `npx patch-package`, which isn't installed and there's no `patches/` dir → **remove the script**.
- `test:report` needs `jest-junit`, not installed → **add `jest-junit` as a devDependency** (CI will want the JUnit output).

### A4. Node version

Add `.nvmrc` containing `22`, matching `engines.node >= 20` and the Node in CI.

---

## Part B — Make lint and tests actually run

### B1. ESLint

`eslint.config.mjs` is a flat config and `eslint-plugin-unicorn@^61` + `typescript-eslint@^8` both require ESLint 9 — but `package.json` declares `eslint: ^8.19.0`. Bump to `eslint: ^9`.

Run `yarn lint:rules` afterwards. Expect a wall of findings. **Autofix what's safe (`--fix`), then triage the rest**: if a rule produces large mechanical churn across files owned by later briefs, disable that rule with a comment explaining why and note it in your report rather than touching those files. `perfectionist`'s alphabetical sorting is the likely offender.

### B2. Prettier

Bump `prettier` 2.8.8 → `^3`. `@ianvs/prettier-plugin-sort-imports` is installed but **not referenced** in `.prettierrc.js` — either wire it into `plugins` or remove the dependency. Wiring it in will reformat imports repo-wide; if that conflicts with B1's triage, prefer removing the dependency and note it.

### B3. Jest

`jest.config.js` is currently just `{ preset: 'react-native' }`. It needs:

- `moduleNameMapper` for the `@/` alias and for SVG imports (there's a `react-native-svg-transformer` in the Metro config with no Jest equivalent)
- `transformIgnorePatterns` covering the RN module set
- `setupFiles` / `setupFilesAfterEach` pointing at the **existing but never-loaded** mocks in `__mocks__/libs/` (`index.ts`, `react-native-reanimated.ts`, `react-native-safe-area-context.ts`) and `__mocks__/getAssetsContext.ts`

Then retarget `__tests__/App.test.tsx`: it currently renders the leftover **root** `/App.tsx` template file, not `src/App.tsx`, so it asserts nothing real.

`src/theme/OldThem/ThemeProvider/ThemeProvider.test.tsx` and `src/screens/Example/Example.test.tsx` both test code being deleted in Part D — remove them with their subjects.

Target: `yarn test` green. Do **not** add a coverage threshold.

---

## Part C — High-severity fixes

Eight items. Each is small; together they matter more than the RN upgrade.

### C1. A reducer that silently does nothing 🔴

`src/store/subscriptionSlice.ts` — `setSubscriptions` has its assignment **commented out**, so it accepts an action and changes no state. Restore it.

Then check the call sites: anything reading subscriptions from Redux has been reading an empty array. Note in your report whether any screen depended on this (`subscriptions` is also blacklisted from persistence, so it may be dead by design — if so, say so and propose removing the slice rather than fixing it).

### C2. Secrets out of source 🔴

| What | Where | Move to |
|---|---|---|
| Telegram bot token | `src/config/telegram.ts` | `.env` |
| Sentry DSN | `src/App.tsx` | `.env` |
| Keystore alias + passwords | `android/gradle.properties` | `~/.gradle/gradle.properties` |
| Huawei `client_secret` | `Fastlane/Fastfile` | Fastlane env var |

The project already uses `babel-plugin-inline-dotenv`, so `.env` values are available at build time — follow the existing pattern in `src/config/pusher.ts`.

Then untrack `.env` (`git rm --cached .env`), add it to `.gitignore`, and make sure `.env.example` lists every key with empty values. `.env.example` is currently missing `RCT_NEW_ARCH_ENABLED`.

> ### ⚠️ Human action required — cannot be done by an agent
>
> These credentials are **in git history**; removing them from the working tree does nothing. They must be rotated by someone with console access:
>
> 1. **Telegram bot token** — talk to `@BotFather` → `/revoke` → issue a new token → put it in `.env`.
> 2. **Huawei AppGallery client secret** — AppGallery Connect → the app's API client → regenerate → update the Fastlane env var.
> 3. **Android upload keystore** — the password is `12345678` and committed. Rotating an *upload* key means requesting a Play Console upload-key reset. Lower urgency than the two above, but schedule it.
> 4. Sentry DSNs aren't secret (they're embedded in clients by design) — moving it to `.env` is tidiness, not a breach.
>
> **Report these as outstanding.** Do not mark T0 complete while claiming the secrets issue is resolved — the code fix is only half of it.

### C3. Encrypt the auth token 🔴

`src/store/index.ts` does `new MMKV()` with no `encryptionKey`, and the persisted `auth` slice holds `token` + `refreshToken` in plaintext.

Add an `encryptionKey`. The key itself must not be a literal in source — derive it or pull it from `.env`. Note that adding encryption **invalidates existing stored data**, so users get logged out once on upgrade; confirm `persistor.purge()` handles that path cleanly rather than crashing on undecryptable data.

*(The unused `refreshToken` and missing 401 handling are T2d's job — just make storage safe here.)*

### C4. The app ships pointed at dev 🔴

`src/services/API.ts:7` — `export const isTest = true;` selects `dev-mubadarah.ce-svcs.cc`.

Move the base URL into `.env` (there's already an unused `API_URL` key) and drive it from the build configuration rather than a source-level boolean. `src/utils/constants.ts` already has `isDevApi = __DEV__` — reconcile with it, and keep the "Test API" banner in `Login` tied to whichever flag survives.

### C5. Pusher auth endpoint is an ngrok URL 🟠

`src/config/pusher.ts` defaults its auth endpoint to a hardcoded ngrok URL. Those are ephemeral — lesson chat auth is already broken or soon will be. Move it to `.env` (`PUSHER_AUTH_ENDPOINT` already exists as a key) and fail loudly if unset rather than falling back to a dead URL.

### C6. `setState` during render 🟠

`src/screens/Menu/index.tsx` — the admin-unlock swipe-sequence easter egg compares gestures with `_.isEqual` and dispatches `setisSUAuth(true)` **during render**. Move it into an effect or the gesture handler.

### C7. Fastlane Android lane crashes 🟠

`Fastlane/Fastfile`, android `build` lane:

```ruby
internalVersionCode = 5                       # hardcoded
nextVersionCode = internalVersionCode.max + 1 # .max on an Integer → NoMethodError
```

`Integer#max` doesn't exist — this raises. Derive the next version code from `google_play_track_version_codes` (or equivalent) instead of a hardcoded literal.

Also: `APP_VERSION_NAME = "1.0"` in the Fastfile vs `versionName "1.0.1"` in `android/app/build.gradle`. Make one the source of truth.

### C8. Unhandled promise rejection 🟠

`src/screens/auth/Login/index.tsx` — the login `POST` has no `.catch`. A network failure produces an unhandled rejection and no user feedback. Add error handling consistent with the other auth screens.

While here: the `__DEV__` block sets `initialValues` to real credentials (`m@m.com` / `Aa@123123`). Replace with empty strings or `.env` values.

---

## Part D — Deletions

Dead code, verified by grep:

| Path | Why |
|---|---|
| `src/App-old.tsx` | superseded by `src/App.tsx` |
| `src/store/user.ts` | 0 bytes |
| `src/theme/OldThem/**` | react-native-boilerplate theme, **zero imports from outside itself** (incl. its test) |
| `src/screens/Example/**` | boilerplate demo screen + test |
| `src/components/molecules/Field/` | empty directory |
| `.history/` | committed editor history — also add to `.gitignore` |

`src/screens/index.ts` exports `Example` — update it. `src/components/atoms/index.ts` exports `AssetByVariant`/`IconByVariant`, which `Example` was the main consumer of; **leave those components in place** (T2b decides their fate) but make sure nothing breaks.

Also in `react-native.config.js`: remove the `react-native-vector-icons` platform override — that package isn't a dependency.

Finally, `README.md` documents a theme API (`colors.primary`, `spacing.md`, `react-native-config`) that has **never existed** in this codebase. Replace that section with a pointer to `CLAUDE.md` rather than leaving active misinformation.

---

## Part E — CI

Add `.github/workflows/ci.yml`. There is no CI of any kind today.

```
on: [push, pull_request]

job: checks
  - checkout, setup-node (from .nvmrc), yarn cache
  - yarn install --frozen-lockfile
  - yarn lint:rules
  - yarn lint:type-check
  - yarn test --ci --reporters=default --reporters=jest-junit
  - upload junit results

job: android-build   (needs: checks)
  - setup-java 17, gradle cache
  - cd android && ./gradlew assembleDebug
```

Leave iOS out for now — it needs a macOS runner and signing setup. Note it as follow-up.

`--frozen-lockfile` is the point of the whole exercise: it's what catches a regression back into a machine-local dependency.

---

## Acceptance criteria

1. `git clone` into a **fresh directory**, `yarn install --frozen-lockfile` → succeeds with no local path references.
2. `yarn lint` → green (all three sub-steps).
3. `yarn test` → green.
4. `cd android && ./gradlew assembleDebug` → produces an APK.
5. CI runs all of the above on a PR and passes.
6. `git grep` finds no bot token, keystore password, Huawei secret, or hardcoded dev credentials in the working tree.
7. `.env` is untracked; `.env.example` lists every key.
8. App still launches and login works against whichever API the new configuration selects — verify manually.

## Report back

- Which lint rules you disabled and why.
- C1: whether `setSubscriptions` had real consumers or the slice is dead.
- **The three unrotated credentials from C2, listed as outstanding human actions.**
- Anything you found but didn't fix because it was outside `Owns`.

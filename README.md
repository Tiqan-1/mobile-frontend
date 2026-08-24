# Binaa (بناء)

An Arabic-first structured-learning app. Students browse multi-level programs, subscribe, follow a daily lesson schedule, consume PDF and video lessons in-app, track completion, and chat per lesson.

**Expo SDK 57 · React Native 0.86.2 · New Architecture on.**

> **Three names, one product.** The folder is `Mobadra`, the app is **Binaa** (`com.binaa`), and the backend is **Mubadarah** (`mubadarah.ce-svcs.cc`). They are not the same thing and the mix-up is the most disorienting part of this repo.

---

## Getting started

Requires **Node ≥ 20** (see `.nvmrc`) and **Yarn Classic**. There is only a `yarn.lock` — don't introduce `npm install`.

```bash
yarn install
npx expo prebuild        # generates android/ and ios/ — required on a fresh checkout
yarn android             # expo run:android
yarn ios                 # expo run:ios
```

**`android/` and `ios/` are generated output.** They're gitignored and absent from a fresh checkout. This project uses Expo's Continuous Native Generation: `app.json` is the source of truth for bundle IDs, permissions, fonts, Info.plist keys and Sentry, and `npx expo prebuild --clean` regenerates both platforms from it.

**Never hand-edit anything under `android/` or `ios/`** — prebuild will delete your work. A native change you can't express in `app.json` is a missing config plugin.

Copy `.env.example` to `.env` before first run. Env vars reach the bundle as `EXPO_PUBLIC_*`, which `babel-preset-expo` inlines at build time — meaning **they ship inside the app and are not secrets.**

## Scripts

```bash
yarn start                 # expo start (Metro)
yarn lint                  # lint:rules && lint:type-check && lint:format
yarn lint:rules            # eslint .
yarn lint:type-check       # tsc --noEmit
yarn lint:format           # prettier --check .
yarn test                  # jest

npx expo-doctor            # Expo health check
npx expo install --check   # audit deps against the SDK 57 pin
```

Install dependencies with **`npx expo install <pkg>`, not `yarn add`** — Expo pins versions per SDK, and `yarn add` fetches `latest`.

> `yarn lint:type-check` and `yarn lint:format` do not currently pass. Both are tracked as ratchets in CI rather than gates; the residual errors belong to refactors that haven't run yet. See `CLAUDE.md` §2 for the measured baseline.

## Layout

```
src/
├── assets/          fonts (Cairo), images, svg
├── components/      atoms / molecules / organisms / templates
├── config/          app-level config
├── hooks/           accessibility, PDF, i18n
├── navigation/      Application.tsx, BottomTabNavigation.tsx, paths.ts
├── screens/         one folder per screen
├── services/        API.ts (apisauce) + documentService, logger, …
├── store/           Redux Toolkit slices, persisted over MMKV
├── theme/           colors, typography, ThemeContext
├── translations/    ar.json, en.json, fr.json
├── types/           program.ts, pdf.ts, navigation.ts
└── utils/           constants, dateTime, helpers
```

The domain model is the spine of the app: **`Program → Level → Task → Lesson`**, plus `Subscription`. A `Task` is a *day*; a `Lesson` is a single item with a URL. Read it as *curriculum → unit → day → item*.

**State is deliberately split.** Redux Toolkit (persisted over MMKV) holds session and app state; `@tanstack/react-query` is for server state. There is no local database.

## Theming

`useTheme()` from `@/theme` is the only supported way to reach colors:

```ts
import { useTheme } from '@/theme';
const { colors, isDark, toggleTheme } = useTheme();
```

Styles are `getStyles(theme)` factories in a sibling `style.ts` — never module-scope `StyleSheet.create()` with theme values, which captures colors at import and can never re-render. **Never `import { PALETTE }` directly**; it's a mutable module-level `var` and importing it silently breaks theme changes.

Dark mode is currently gated off by `enableDark = false` in `src/utils/constants.ts`.

## Language and RTL

Arabic-first — `ar` is the fallback language and Cairo is the font throughout. `I18nManager.forceRTL()` runs at module load, so **changing language restarts the app** (by design, given the current architecture). Every user-facing string goes through `t()`.

## Releases

Fastlane lives in `Fastlane/` — **capital F**, which macOS's case-insensitive filesystem hides. It still expects `android/`/`ios/` to exist, so run `expo prebuild` before any lane:

```bash
bundle exec fastlane android build   # Play internal track + Huawei AppGallery
bundle exec fastlane ios beta        # TestFlight + Sentry dSYM upload
```

## Contributing

**Read [`CLAUDE.md`](CLAUDE.md) first — §0 especially.** It's the working agreement and the source of truth for conventions, theming, i18n and the known traps. It binds humans and agents alike; the most important rule is that **nothing gets committed without the repo owner's review**.

Planned work lives in [`docs/tasks/`](docs/tasks/README.md) as self-contained briefs, each naming the files it owns and tracking its own progress. Start there rather than guessing what needs doing.

The Family (parent control) feature has an API contract at [`docs/api/family-contract.md`](docs/api/family-contract.md) for the backend team.

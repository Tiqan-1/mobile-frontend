# Task briefs — Binaa upgrade, refactor, and Family feature

Fifteen self-contained briefs. Each one names the files it owns, what it depends on, the work, and how it's judged done. They're written to be handed to an agent or a developer cold — no other context required beyond `CLAUDE.md`.

Full reasoning behind the sequencing lives in the plan this was generated from; you shouldn't need it to execute a brief.

## Who runs what

| Briefs | Owner |
|---|---|
| **T1a–T1d** (the RN upgrade) | **Mahmoud, personally.** Written as a runbook, not agent tasks. T1d (react-navigation) is the most delegable of the four if you want to hand one off. |
| T0, T2*, T3* | Agents or devs. Use the `binaa-mobile` agent — it loads `CLAUDE.md` and the brief conventions automatically. |

## RN version — status as of 2026-08-17

**Settled at 0.86.2.** 0.87.0 was attempted and abandoned; the tree now runs 0.86.2, which is also exactly what Expo SDK 57 pins (relevant to T4).

Much of T1a/T1c's original risk analysis is now spent:

- **WatermelonDB** — was the headline risk (JSI, `simdjson` pod, unmoved since 0.28.0). Found to be **entirely unused** and removed. No longer a factor.
- **`react-native-render-html`** — still the open risk. Last published 2022, no New Arch commitment, load-bearing for lesson content.
- `react-native-fast-image` and `react-native-actionsheet` — also abandoned 2022, also still present.

The version-choice guidance in [T1c](T1c-js-deps.md#which-version-to-target) is kept for reference (and would apply again on any future jump), but it describes a decision already made.

---

## Running order

```
                        ┌──────────────────────────┐
                        │  T0  hygiene + CI +      │   ← must land alone, first
                        │      high-severity fixes │
                        └────────────┬─────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
        ┌───────────────────────┐        ┌────────────────────────┐
        │ T1a  0.87 risk spike  │        │ T1b  native upgrade    │   (parallel)
        │      (throwaway app)  │        │      android/ + ios/   │
        └───────────┬───────────┘        └────────────┬───────────┘
                    └────────────────┬────────────────┘
                                     ▼
                        ┌────────────────────────┐
                        │ T1c  JS dep upgrades   │
                        └────────────┬───────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
        ┌───────────────────────┐        ┌────────────────────────┐
        │ T1d  react-nav v6→v7  │        │ T2a  token layer +     │   (parallel)
        │                       │        │      single theme      │
        └───────────────────────┘        └────────────┬───────────┘
                                     ┌────────────────┴────────────────┐
                                     ▼                                 ▼
                         ┌───────────────────────┐      ┌──────────────────────┐
                         │ T2b  atoms/molecules  │      │ T2d  data layer      │  (parallel)
                         └───────────┬───────────┘      └──────────┬───────────┘
                                     │                             │
                          ┌──────────┴──────────┐                  │
                          ▼                     ▼                  │
              ┌────────────────────┐  ┌───────────────────┐        │
              │ T2c  Storybook     │  │ T3a  FocusPlayer  │        │
              └────────────────────┘  └─────────┬─────────┘        │
                                                │                  │
                          ┌─────────────────────┼──────────────────┤
                          ▼                     │                  ▼
              ┌────────────────────┐            │      ┌──────────────────────┐
              │ T2e  Programs,     │            │      │ T3b  Family types +  │
              │      MainScreen    │  (parallel)│      │      mock API        │
              ├────────────────────┤            │      └──────────┬───────────┘
              │ T2f  Program, …    │            │                  │
              └────────────────────┘            │       ┌──────────┴──────────┐
                                                │       ▼                     ▼
                                                │  ┌─────────────┐  ┌──────────────────┐
                                                └─▶│ T3c parent  │  │ T3d learner side │
                                                   │     screens │  │     + sync       │
                                                   └─────────────┘  └──────────────────┘
```

---

## The briefs

| # | Brief | Owns | Depends on | Parallel-safe with |
|---|---|---|---|---|
| T0 | [Repo hygiene, CI, high-severity fixes](T0-hygiene.md) | tooling configs, `Fastlane/Fastfile`, 5 source files, deletions | — | **none** |
| T1a | [RN upgrade risk spike](T1a-spike.md) 👤 | throwaway app + a findings note | T0 | T1b |
| T1b | [Native upgrade](T1b-native.md) 👤 | `android/**`, `ios/**` | T0 | T1a |
| T1c | [JS dependency upgrades](T1c-js-deps.md) 👤 | `package.json`, babel/metro/tsconfig | T1a, T1b | — |
| T1d | [react-navigation v6 → v7](T1d-navigation.md) 👤 | `src/navigation/**` | T1c | T2a |
| T2a | [Token layer + single theme](T2a-theme.md) | `src/theme/**` | T1c | T1d |
| T2b | [Normalize atoms & molecules](T2b-components.md) | `src/components/atoms/**`, `molecules/**` | T2a | T2c, T2d |
| T2c | [Storybook](T2c-storybook.md) | `.rnstorybook/**`, `*.stories.tsx` | T2b | T2d |
| T2d | [Data layer](T2d-data-layer.md) | `src/services/**`, `src/store/**`, `src/App.tsx` | T2a | T2b, T2c |
| T2e | [Screen refactor — Programs, MainScreen](T2e-screens-a.md) | those two dirs | T2b, T2d | T2f |
| T2f | [Screen refactor — Program, Library, Today, Subscription](T2f-screens-b.md) | those dirs | T2b, T2d | T2e |
| T3a | [FocusPlayer](T3a-focus-player.md) | `organisms/FocusPlayer/**` | T2b | T3b |
| T3b | [Family types + mock API](T3b-family-core.md) | `src/features/family/**` (incl. `storage/`) | T2d | T3a |
| T3c | [Parent screens](T3c-parent-screens.md) | `src/features/family/screens/**` | T3b | T3d |
| T3d | [Learner side + progress sync](T3d-learner-sync.md) | `src/features/family/sync/**`, `screens/TodayLessons/**` | T3b, T3a | T3c |
| T4 | [Migrate to Expo (SDK 57 / CNG)](T4-expo-migration.md) 👤 | `app.json`, `metro.config.js`, `android/**`, `ios/**`, `package.json` | a verifiable baseline | **nothing** — conflicts with T1b/T1c |

👤 = Mahmoud is running these personally.

**T4 (Expo) is now recommended** — the WatermelonDB blocker turned out to be dead code and was removed, and RN 0.86.2 matches Expo SDK 57 exactly, so no version movement is required. If you adopt it, T4 **replaces** most of T1b: `android/` and `ios/` become generated and the AGP/Gradle/Kotlin work stops being your problem. Decide between them before starting either.

**T1b is worth doing even if the RN upgrade is postponed** — the AGP 8.1.2 fix in it is already overdue for the RN version currently installed.

---

## Standing rules for every brief

1. **Do not touch files outside your `Owns` list.** If something elsewhere looks like it needs changing, stop and report it — don't fix it. Parallel briefs rely on this.
2. **Read [`CLAUDE.md`](../../CLAUDE.md) before writing code.**
3. **Do not open `/Users/mshokry/PWS/ReactNative/SDC/DesignSystem`.** It is a separate production app, not a library. Everything worth taking from it is either restated in `CLAUDE.md` or copied by T2a. Reading it costs time and yields nothing.
4. **Finish with `yarn lint && yarn test` green**, plus a build of at least one platform.
5. **Land several reviewable commits, not one.** A six-minor RN jump needs a `git bisect` that means something.
6. **Report honestly.** If a step is blocked or you skipped something, say so explicitly rather than reporting partial success as done.

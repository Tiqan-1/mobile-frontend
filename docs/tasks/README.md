# Task briefs — Binaa upgrade, refactor, and Family feature

Sixteen self-contained briefs plus a workflow reference ([T5](T5-parallel-workflow.md)). Each names the files it owns, what it depends on, the work, and how it's judged done. They're written to be handed to an agent or a developer cold.

## Read these two things before starting any brief

| | |
|---|---|
| **[`CLAUDE.md` §0](../../CLAUDE.md)** | The **working agreement**. Binding for every agent: don't commit without being asked, keep your brief's status current, never hand-edit `android/`/`ios/`, stay inside your `Owns` list, keep changes surgical, measure before/after, report honestly. Read it first. |
| Your brief | The work itself. Each one opens with a **Status & checkpoints** block — that's where progress is tracked, in the brief, not in a central file. Several also open with a **revision block**, which supersedes the sections below it. |

> **This is an Expo (CNG) project as of the 2026-08-17 T4 migration.** `android/` and `ios/` are generated, gitignored, and absent from a fresh checkout. That changed what several briefs mean; each affected one now says so at the top. If a brief tells you to edit a Gradle file or a Podfile, it is stale — check its revision block.

---

## Who runs what

| Briefs | Owner |
|---|---|
| **T1a–T1d** (the RN upgrade) and **T4** (Expo) | **Mahmoud, personally.** Written as runbooks, not agent tasks. T1d (react-navigation) is the most delegable. |
| T0, T2\*, T3\* | Agents or devs. Use the `binaa-mobile` agent — it loads `CLAUDE.md` and the brief conventions automatically. |

Running more than one tool at once? Read [T5](T5-parallel-workflow.md) first — worktree setup, which briefs are concurrency-safe, and the cross-tool review protocol. **T0 must land alone, first**, because its CI is the only objective arbiter between two disagreeing models.

---

## What's already happened

Two things landed after these briefs were written, and both changed the plan:

**RN 0.81.4 → 0.86.2**, by hand. 0.87.0 was attempted and abandoned. 0.86.2 is also exactly what Expo SDK 57 pins, which is what made T4 free. This retires most of **T1c**.

**T4, the Expo/CNG migration** — P1 and Phases A–C are done, D is done except the live Android build, E (iOS) is not started. This **supersedes T1b entirely**: `android/` and `ios/` became generated output, so the AGP/Gradle/Kotlin/Podfile work stopped existing as a task.

Three of T1a's four spike risks are also spent — **WatermelonDB** was found to be dead code and removed, **Pusher** was removed rather than migrated, and the **RN target** is settled. Only `react-native-render-html` is still unspiked.

Two things got *worse*: `LessonChat` lost realtime and now polls every 5s, and none of it has been committed yet. Both are in [unowned open items](#unowned-open-items) below.

---

## Running order

```
                        ┌──────────────────────────┐
                        │  T0  hygiene + CI +      │   ← must land alone, first
                        │      high-severity fixes │
                        └────────────┬─────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
   ✅ T1c  RN 0.86.2            🟣 T1b  native upgrade      🔵 T4  Expo / CNG
      (done by hand)               SUPERSEDED by T4            (owner; E–G left)
        │                                                          │
        └────────────────────────────┬─────────────────────────────┘
                                     ▼
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

**T1a** sits outside the graph now — what's left of it is one spike (`react-native-render-html`) that blocks nothing until T2f touches lesson content.

---

## The briefs

The Status column here is a **convenience snapshot and goes stale**. Each brief's own **Status & checkpoints** block is authoritative — that's where the work is tracked. If you change a brief's status, update it there; refresh this table when you happen to notice it drifting.

| # | Brief | Status | Owns | Depends on | Parallel-safe with |
|---|---|---|---|---|---|
| T0 | [Repo hygiene, CI, high-severity fixes](T0-hygiene.md) | ⚪ next | tooling configs, `Fastlane/Fastfile`, 6 source files, deletions | — | **none** |
| T1a | [RN upgrade risk spike](T1a-spike.md) 👤 | 🟣 mostly spent | a scratch app + a findings note | — | anything |
| T1b | [Native upgrade](T1b-native.md) | 🟣 **superseded by T4** | *nothing — `android/`/`ios/` are generated* | — | n/a |
| T1c | [JS dependency upgrades](T1c-js-deps.md) 👤 | ✅ mostly | `package.json`, babel/metro/tsconfig | — | — |
| T1d | [react-navigation v6 → v7](T1d-navigation.md) 👤 | ⚪ | `src/navigation/**` | T0 | T2a |
| T2a | [Token layer + single theme](T2a-theme.md) | ⚪ | `src/theme/**` | T0 | T1d |
| T2b | [Normalize atoms & molecules](T2b-components.md) | ⚪ | `src/components/atoms/**`, `molecules/**` | T2a | T2c, T2d |
| T2c | [Storybook](T2c-storybook.md) | ⚪ | `.rnstorybook/**`, `*.stories.tsx` | T2b | T2d |
| T2d | [Data layer](T2d-data-layer.md) | ⚪ | `src/services/**`, `src/store/**`, `src/App.tsx` | T2a | T2b, T2c |
| T2e | [Screens — Programs, MainScreen](T2e-screens-a.md) | ⚪ | those two dirs | T2b, T2d | T2f |
| T2f | [Screens — Program, Library, Today, Subscription](T2f-screens-b.md) | ⚪ | those dirs | T2b, T2d | T2e |
| T3a | [FocusPlayer](T3a-focus-player.md) | ⚪ | `organisms/FocusPlayer/**` | T2b | T3b |
| T3b | [Family types + mock API](T3b-family-core.md) | ⚪ | `src/features/family/**` (incl. `storage/`) | T2d | T3a |
| T3c | [Parent screens](T3c-parent-screens.md) | ⚪ | `src/features/family/screens/**` | T3b | T3d |
| T3d | [Learner side + progress sync](T3d-learner-sync.md) | ⚪ | `src/features/family/sync/**`, `screens/TodayLessons/**` | T3b, T3a | T3c |
| T4 | [Migrate to Expo (SDK 57 / CNG)](T4-expo-migration.md) 👤 | 🔵 E–G left | `app.json`, `metro.config.js`, `package.json` | a verifiable baseline | **nothing** |
| T5 | [Parallel workflow across Claude Code / opencode / Trae](T5-parallel-workflow.md) | ✅ | *reference doc — no deliverable* | — | n/a |

👤 = Mahmoud is running these personally. ⚪ not started · 🔵 in progress · ✅ done · 🟣 superseded

Note the dependency change: briefs that used to depend on **T1c** now depend on **T0**, since the RN upgrade already happened.

---

## Unowned open items

Real work that no brief owns. This is the only list of its kind — everything else is tracked inside its brief. **If you pick one up, move it into a brief or say who's doing it; if you find another, add it here.**

- [ ] **Rotate the Telegram bot token** — `@BotFather` → `/revoke`. Human-only, console access required. T0 cannot be honestly "done" while this is open.
- [ ] **Rotate the Huawei AppGallery client secret** — AppGallery Connect → regenerate. Human-only.
- [ ] **Reset the Android upload keystore** — the password `12345678` is in git history. Needs a Play Console upload-key reset. Human-only, lower urgency than the two above.
- [ ] **Pick a realtime story for `LessonChat`.** It polls every 5s as a stand-in, marked `TODO(T4)`. Options: an Expo config plugin for Pusher, a plain WebSocket client against Pusher's protocol, or a different provider with Expo support. This is a regression T4 knowingly took.
- [ ] **A real 1024×1024 app icon.** Neither platform has ever had one; `app.json`'s `icon` points at a placeholder.
- [ ] **Confirm the display name.** `app.json` now says `Binaa`; both platforms previously shipped **مبادرة** (the *backend's* name). User-visible under the icon — needs a conscious yes, not a silent default.
- [ ] **Ask the BE team whether a token-refresh endpoint exists.** T2d's 401 handling is blocked on the answer; `refreshToken` is stored today and never sent anywhere.
- [ ] **`react-native-actionsheet` is abandoned but live** in `Login`. No brief scopes replacing it.
- [ ] **Flip `expo.android.edgeToEdgeEnabled`** — deferred, not avoided; targetSdk 36 forces it on Android 15+. See [T1b](T1b-native.md) for the handover rule.
- [ ] **Commit the T4 migration.** It's sitting uncommitted on `feat/expo` pending the owner's review.

---

## History

Newest first. Add a line when something lands — this is the shared record; per-brief detail belongs in that brief's Status block.

- **2026-08-17** — Docs pass: `CLAUDE.md` §0 working agreement added (including the Karpathy guidelines as §0.8); per-brief **Status & checkpoints** blocks added to all 15 briefs; every brief updated for the post-Expo reality (T1b superseded, T1c largely done, Pusher/WatermelonDB references corrected, `npx expo install` and `EXPO_PUBLIC_*` propagated). T0 gained a Post-T4 revision block and a kickoff prompt. **Nothing committed.** Next: run T0.
- **2026-08-17** — [T5](T5-parallel-workflow.md) written; all three tools' CLI capabilities verified (Trae has no headless mode, so it's the human review seat).
- **2026-08-17** — T4 Expo migration: P1 + Phases A–D (static). Pusher removed rather than migrated. Two silent Metro failures found and fixed.
- **2026-08-17** — WatermelonDB found entirely unused and removed, clearing the last Expo blocker.
- **2026-08-17** — RN 0.81.4 → 0.86.2 landed by hand (0.87.0 attempted, abandoned).

---

## Standing rules

The rules used to live here. They are now **[`CLAUDE.md` §0](../../CLAUDE.md)**, so there is one copy rather than two that drift. In outline:

| | Rule |
|---|---|
| §0.1 | **Don't commit, push, or open a PR** unless asked in that session |
| §0.2 | **Keep your brief's own Status & checkpoints block current** — tick checkpoints only when verified |
| §0.3 | **Never hand-edit `android/`/`ios/`**; `app.json` + config plugins; `npx expo install`, not `yarn add`; `EXPO_PUBLIC_*` for env |
| §0.4 | **Stay inside your `Owns` list** — report what's outside it, don't fix it |
| §0.5 | **Measure before and after**; confirm the documented baselines rather than trusting them |
| §0.6 | **Report honestly** — partial work is partial |
| §0.7 | **Don't open the SDC repo** |

Plus, per brief: finish with `yarn lint && yarn test` and a build of at least one platform, and structure the work so it *could* be split into several reviewable commits — then hand it over for review rather than committing it.

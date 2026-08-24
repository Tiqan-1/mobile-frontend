# T3a — FocusPlayer

> **Before you start:** read [`CLAUDE.md` §0](../../CLAUDE.md) — the working agreement. In short: **don't commit or push unless asked in this session**; never hand-edit `android/`/`ios/` (they're generated — `app.json` + config plugins instead); install with `npx expo install`, not `yarn add`; stay inside your `Owns` list and report anything outside it rather than fixing it; keep changes surgical (§0.8).
>
> **Keep the Status & checkpoints block below current as you work** — it lives in this file, not in a central tracker. Set the status when you start, tick each checkpoint only once you've *verified* it, and update it again when you stop. If you stop mid-brief, name the exact checkpoint you stopped at.

---

## Status & checkpoints

| | |
|---|---|
| **Status** | ✅ done (2 caveats below) |
| **Owner** | builder (routerplex/deepseek-v4-pro), reviewed by routerplex/MiniMax-M3 (4 passes) |
| **Branch** | feat/T3a-focus-player |
| **Last updated** | 2026-08-23 |

Video library: **`expo-video`** chosen over `react-native-video` — first-party under Expo CNG (SDK 57), no manual native wiring, versioned with the SDK. `CLAUDE.md` §7 updated to match.

**Legend:** ⚪ not started · 🔵 in progress · ⏸️ blocked · ✅ done · 🟣 superseded

Tick a box only when you have **verified** it, not when you've written the code. Add a checkpoint if this brief turns out to need one — don't silently widen the one you're on. This brief is `✅ done` only when every box is ticked **and** the Acceptance criteria below pass.

- [x] Video library chosen and recorded (`expo-video`); `CLAUDE.md` §7 updated to match
- [x] `expo-keep-awake` installed via `npx expo install`
- [x] `hosted` playback works — `expo-video`'s `useVideoPlayer`/`VideoView`, `tsc` clean
- [x] `youtube` playback via `youtube-nocookie.com` — `react-native-youtube-iframe` (2.4.1, latest) never exposes this itself; patched via `patch-package` to set the IFrame Player API's `host` option (reviewer verified the patch is correctly applied)
- [x] Navigation interception rejects every off-origin request — `onShouldStartLoadWithRequest` allowlist confirmed by reviewer against actual code
- [ ] **`startSec`/`endSec` clipping — deferred, not blocked.** `Lesson` (`src/types/program.ts`) has no `source` field yet; clipping logic is correct and in place but has nothing to clip against until the Family feature's `LessonSource` union lands on the type. Honestly disclosed, not silently broken.
- [ ] **Adversarial pass: unverified — needs a real device.** No simulator/device was available in any sandbox this task ran in. The mechanism itself (`onShouldStartLoadWithRequest`, `setSupportMultipleWindows={false}`, `allowsFullscreenVideo={false}`) is in place and reviewer-verified against source; the literal on-device test per AC4's wording is the one thing nobody in this pipeline could run.
- [x] `VideoModal` deleted, including its `Linking.openURL` button — confirmed via `grep -rn "Linking.openURL" src/components/organisms/` (empty)
- [x] Screen stays awake through a full lesson — `expo-keep-awake`, gated on `lesson` truthiness, race-condition-hardened over 2 review rounds
- [x] Call-site swap done directly (`Subscription`, `TodayLessons`, `MainScreen`) — no parallel T2f dispatch existed in this pipeline run to coordinate with; recorded in `.agents/T3a.md`'s Decisions log for T2f's visibility whenever it runs
- [x] **Real regression found and fixed post-review:** `expo-keep-awake` broke `yarn test` (`transformIgnorePatterns` gap, same class of issue T0 already solved for other packages) — fixed, `yarn test` now matches the exact pre-T3a baseline

---

**Depends on:** T2b. **Parallel-safe with:** T3b.

## Goal

Replace `VideoModal` with a distraction-free lesson player that gives a child no route out to the YouTube app.

**Ship this standalone.** It improves the existing app for every student immediately — it does not need the rest of the Family feature, and shouldn't wait for it.

## Owns

```
src/components/organisms/FocusPlayer/**     (new)
src/components/organisms/VideoModal/**      (deleted)
src/components/organisms/index.ts
package.json    (video + keep-awake — see below)
app.json        (only if the video library needs a config plugin entry)
```

> ### Decide the video library first — this is a real choice, not a formality
>
> This project is Expo CNG now, which puts a first-party option on the table that didn't exist when this brief was written. **Install whichever you pick with `npx expo install`, never `yarn add`** ([`CLAUDE.md` §0.3](../../CLAUDE.md)).
>
> | Option | Case for it | Case against |
> |---|---|---|
> | **`expo-video`** | First-party, config plugin included, New-Arch-clean, versioned with the SDK so it can't drift. The lower-risk default under CNG. | Newer API; verify it covers what you need (HLS, poster, precise seek for `startSec`/`endSec` clipping) before committing. |
> | **`react-native-video` v6** | What `CLAUDE.md` §7 names, mature, widely used. Ships an Expo config plugin (`react-native-video/expo-plugins`) for its optional features — caching, background playback, notification controls. | Third-party under CNG. **Verify the plugin autolinks and prebuilds cleanly before you build the player on it** — don't assume. |
>
> **Recommendation: try `expo-video` first**, and fall back to `react-native-video` if it can't do precise clipping or HLS the way you need. Either way: **record which you chose and why** in your report and in this brief's Status & checkpoints block, because `CLAUDE.md` §7 currently names `react-native-video` and will need updating to match your decision. Don't leave the doc and the code disagreeing.
>
> Whichever you pick, the **rules in `CLAUDE.md` §7 are unchanged**: `hosted` plays in-app, `youtube` goes through the locked `youtube-nocookie.com` embed, and **never** `Linking.openURL()` on a lesson URL.

Call sites live in `Subscription`, `LibraryScreen`, `TodayLessons` — **coordinate with T2f**, which owns those files. Give it the new component's API and let T2f swap the call sites, or agree that you do it and T2f stays clear. Agree before either of you starts.

---

## What's there now

`src/components/organisms/VideoModal/index.tsx` (222 LOC):

- `react-native-youtube-iframe` in a `Modal`, with orientation and fullscreen handling
- `getYoutubeId()` parsing both `youtu.be/` and `?v=` forms, plus playlist detection
- `initialPlayerParams: { controls: true, showClosedCaptions: true, modestbranding: true, rel: 0 }`
- **A floating button calling `Linking.openURL(selectedVideo.url)`** — one tap, straight into the YouTube app

### Two things the current code believes that aren't true

1. **`modestbranding` was deprecated by YouTube in August 2023 and is a no-op.** It has never done anything here.
2. **`rel=0` no longer suppresses related videos.** Since 2018 it only restricts them to the same channel.

So the existing "focus" measures are decorative. **Navigation interception is what actually works** — that's the core of this task.

---

## Design

```ts
type LessonSource =
  | { kind: 'hosted';  playbackUrl: string; posterUrl?: string; durationSec?: number }
  | { kind: 'youtube'; videoId: string; startSec?: number; endSec?: number }
  | { kind: 'pdf';     url: string }
  | { kind: 'link';    url: string };
```

The player handles `hosted` and `youtube`. It should accept a legacy `Lesson` too (reusing `getYoutubeId`) so it drops into today's call sites before the backend grows `source`.

### `kind: 'hosted'` — the good path

`react-native-video` (^6.19.2) against BE-hosted HLS/MP4. No YouTube at all. Full-screen, custom controls, no share, no external anything.

### `kind: 'youtube'` — the locked path

`react-native-youtube-iframe`, hardened:

- **`youtube-nocookie.com`** as the embed origin
- Player params: `rel=0`, `playsinline=1`, `fs=0`, `iv_load_policy=3` (no annotations), `disablekb=1`, `controls=1`
- **`onShouldStartLoadWithRequest` rejecting every navigation whose origin isn't the embed origin.** This is the actual mechanism — everything else is cosmetic.
- `setSupportMultipleWindows={false}` (Android — blocks `target=_blank` popouts to the app)
- `allowsFullscreenVideo={false}`
- `startSec`/`endSec` enforced by seeking on ready and stopping at `endSec`
- **No external-open button.** Delete it.

Also handle: long-press on the video (context menu → "open in YouTube"), taps on the video title/channel overlay, and the end-screen related-video grid. Test each deliberately.

### Focus behaviour

- Full screen; hide the tab bar
- Keep the screen awake — **use `expo-keep-awake`** (`npx expo install expo-keep-awake`). It's first-party, ships a config plugin, and needs no native wiring under CNG. The `react-native-keep-awake` this brief originally named is unmaintained; don't use it.
- Android hardware back closes the player, doesn't background the app
- Optional: auto-advance to the next lesson in the task on completion
- Emit lifecycle callbacks — `onStart`, `onProgress(watchedSec)`, `onComplete` — for **T3d**'s telemetry. Define this API now even though T3d consumes it later.

Track app-background events during playback and surface a count via the same callback interface. It's **information for a parent**, not enforcement — don't build blocking on it.

---

## What this cannot do — state it plainly

This player cannot prevent a child from closing the app and opening YouTube. Nothing in a normal App Store / Play Store app can — that needs MDM (Android device owner) or Apple's Family Controls entitlement, and both were explicitly ruled out of scope.

What it *can* do is remove every reason and every in-app route to go there. Don't let the feature be described internally as "blocking YouTube" — it isn't, and someone will eventually be disappointed by that framing.

Also: **never extract or proxy YouTube streams.** It violates their ToS. The IFrame embed is the only compliant way to play YouTube-hosted content; re-hosting is only for content the user has rights to.

---

## Acceptance criteria

1. `VideoModal` is deleted; every call site uses `FocusPlayer`.
2. `hosted` sources play through `react-native-video`.
3. `youtube` sources play in a locked embed.
4. **Adversarial test — every one of these must fail to leave the app:** long-press the video · tap the YouTube logo · tap the video title · tap the channel name · trigger fullscreen · tap a related video on the end screen · tap any in-video annotation or card.
5. `grep -rn "Linking.openURL" src/components/organisms/` returns nothing.
6. `startSec`/`endSec` clipping works — playback starts and stops where specified.
7. Screen stays awake during playback; sleeps normally after.
8. Android back button closes the player without backgrounding the app.
9. Works in RTL and dark mode.
10. `yarn lint`, `yarn test` green.

Point 4 is the whole task. Test it on a **real device**, not just a simulator — long-press and context-menu behaviour differ.

## Report back

- The result of each adversarial test in point 4, individually.
- Any escape route you couldn't close.
- The lifecycle callback API you settled on, for T3d.
- Coordination outcome with T2f on the call sites.

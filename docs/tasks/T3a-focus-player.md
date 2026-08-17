# T3a — FocusPlayer

**Depends on:** T2b. **Parallel-safe with:** T3b.

## Goal

Replace `VideoModal` with a distraction-free lesson player that gives a child no route out to the YouTube app.

**Ship this standalone.** It improves the existing app for every student immediately — it does not need the rest of the Family feature, and shouldn't wait for it.

## Owns

```
src/components/organisms/FocusPlayer/**     (new)
src/components/organisms/VideoModal/**      (deleted)
src/components/organisms/index.ts
package.json    (react-native-video, keep-awake)
```

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
- Keep the screen awake (`react-native-keep-awake` or equivalent) — no sleep mid-lesson
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

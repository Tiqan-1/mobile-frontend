# T2f — Screen refactor: Program, LibraryScreen, TodayLessons, Subscription (+ auth, Menu)

**Depends on:** T2b, T2d. **Parallel-safe with:** T2e.

## Goal

The remaining screens. Same treatment as T2e — new theme layer, new data layer, extracted components — plus two closing jobs: the i18n sweep and turning dark mode on.

## Owns

```
src/screens/Program/**        src/screens/LibraryScreen/**
src/screens/TodayLessons/**   src/screens/Subscription/**
src/screens/Menu/**           src/screens/auth/**
src/screens/AccessibilitySettings/**   src/screens/PDFViewerScreen/**
src/translations/**           src/utils/constants.ts  (enableDark flag)
src/navigation/BottomTabNavigation.tsx  (the t('القائمة') fix only)
```

Coordinate with T2e on shared extractions — don't both create the same card component.

⚠️ **`TodayLessons` is also touched by T3d.** T2f runs first; T3d builds on your result. Leave the file in good shape and tell T3d what you changed.

---

## The screens

| Screen | LOC | Notes |
|---|---|---|
| `Program/index.tsx` | 297 | `DELETE`/`POST` subscription endpoints |
| `LibraryScreen/index.tsx` | 256 | YouTube content — **coordinate with T3a**, which owns the player |
| `TodayLessons/index.tsx` | 244 | `react-native-calendars`; T3d extends it later |
| `Subscription/index.tsx` + `lesson.tsx` | 164 + 129 | |
| `Menu/index.tsx` | 156 | account deletion, logout, the admin easter egg (T0 fixed its render-phase `setState`) |
| `auth/signup` · `Login` · `ForgotPassword` | 218 · 209 · 119 | Formik + yup |
| `AccessibilitySettings` | 142 | |
| `PDFViewerScreen/PDFViewer.tsx` | 102 | WatermelonDB progress |

---

## Work

### 1–4. Same as T2e

react-query instead of `REQUESTING`; `useTheme()` instead of `PALETTE`; `style.ts` per screen; extract inline components to molecules/organisms; route params by ID.

For `Subscription`, `Program` and `PDFViewer`, params were whole `Program`/`Subscription`/`Lesson` objects — now IDs, read from the query cache.

`PDFViewer` also reads/writes WatermelonDB progress via `useProgress`. **Leave the DB access as-is** — T3b owns that layer.

### 5. Auth screens

Formik + yup stay. Two specifics:

- **`signup`**: password-complexity messages are hardcoded Arabic — move to `ar.json`/`en.json` with real keys.
- **`Login`**: T0 removed the `__DEV__` credentials and added the missing `.catch`. Verify both survived, and that the "Test API" banner keys off the config value rather than the old `isTest` constant.

### 6. i18n sweep — repo-wide, yours to own

Every user-facing string goes through `t()`. Known offenders:

- signup validation messages (hardcoded Arabic)
- Menu buttons and the delete-account `Alert.alert` (hardcoded Arabic)
- **`BottomTabNavigation.tsx` passes `t('القائمة')`** — Arabic text used as a translation *key*. Give it a real key.

Then resolve the French inconsistency: `src/translations/fr.json` exists (19 lines) but is **not registered** in `resources`, while `SupportedLanguages` includes `FR`. Either wire it up properly or delete it and remove `FR`. Half-connected is the one option that isn't allowed.

Finally, verify `ar.json` and `en.json` have matching key sets.

### 7. Turn dark mode on — do this last

`src/utils/constants.ts` has `enableDark = false`. Flip it to `true` **only after every screen is migrated**, then walk the entire app in dark mode.

Expect to find problems — this is the first time dark mode will genuinely have worked, since the mutable-`PALETTE` bug meant it never re-rendered. T2c's Storybook report should list component-level issues; you're looking for screen-level ones.

If dark mode turns out to need more design work than you can resolve, **leave the flag `false`, file what you found, and say so.** Shipping a half-dark app is worse than shipping a light one.

---

## Acceptance criteria

1. No screen imports `PALETTE` or calls `REQUESTING`.
2. Every screen has a `style.ts`.
3. No hardcoded user-facing strings anywhere under `src/screens/`; `t('القائمة')` is gone.
4. `fr.json` either registered or removed.
5. Full manual pass, **both directions and both themes**: login → programs → subscribe → today's lessons → PDF (progress persists across restart) → video → library → menu → delete account → logout.
6. `yarn lint`, `yarn test` green.
7. `enableDark` is `true`, or it's `false` with a written explanation.

## Report back

- Dark mode verdict, with the list of what's still wrong if it isn't on.
- What you changed in `TodayLessons` — **T3d needs this**.
- Coordination outcome with T2e and T3a.
- Remaining i18n gaps, if any.

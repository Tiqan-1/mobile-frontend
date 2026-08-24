# PR Review Guide — feat/T0-hygiene (PR #6)

Target: `feat/expo` ← `feat/T0-hygiene`
50 files changed, +588 −1472 lines

---

## 1. The Diff at a Glance

### What this PR does

A tooling/hygiene sweep — no feature work. Adds CI, ESLint 9, Prettier 3,
Jest config, Fastlane, env-var cleanup, and deletes dead code (old Android/iOS
projects, `OldThem/`, `Example` screen, `react-native-youtube`).

### Key changes

| Area | File(s) | What changed |
|---|---|---|
| **CI** | `.github/workflows/ci.yml` | New — install → lint → typecheck → format → test → prebuild |
| **ESLint** | `eslint.config.mjs`, `package.json` | Migrated from ESLint 8 → 9 flat config. Rules disabled with T0 justification comments. Per-file overrides for pre-existing violations owned by other briefs. |
| **Prettier** | `package.json`, `.prettierrc.js` | 2.8.8 → ^3.0.0 |
| **Jest** | `jest.config.js`, `jest/resolver.js` | New resolver for Reanimated 4 + worklets. `moduleNameMapper` for `@/` and SVGs. `transformIgnorePatterns` for ESM. |
| **Env vars** | `.env`, `.env.example` | Secrets moved to `EXPO_PUBLIC_*` |
| **Login** | `src/screens/auth/Login/index.tsx` | Removed hardcoded `__DEV__` credentials. Added `.catch()` with logger. |
| **Menu** | `src/screens/Menu/index.tsx` | Swipe-activation moved into `useEffect` (was a side effect in render body). Formatting fixes. |
| **Deletions** | `android/`, `ios/`, `OldThem/`, `Example` screen, `react-native-youtube` dep | Dead code / generated dirs removed |
| **package.json** | dep bumps + removals | `react-native-youtube` removed. `react-native-localize` → `expo-localization`. `i18next` 25→26, `react-i18next` 15→17. `eslint` 8→9, `prettier` 2→3. |

### Things to verify

1. **CI workflow** — Does `ci.yml` actually gate on lint + typecheck + format?
2. **ESLint 9 flat config** — Any rules accidentally doubled or missing?
3. **Jest resolver** — Does `jest/resolver.js` handle the Reanimated + worklets path correctly?
4. **Login** — Removed hardcoded creds — confirm no fallback path re-exposes them.
5. **Menu useEffect** — The swipe detection was a side effect in the render body. Now it's in `useEffect([Swipe])`. Check that `console.log` + `setisSUAuth` still trigger correctly.
6. **Prettier 3** — Any formatting-only changes bundled in?
7. **Deleted files** — Confirm `android/`, `ios/` are in `.gitignore` (they are — Expo CNG).

---

## 2. How to Read This in Warp

### Scrolling back through output

- **Cmd + ↑** — scroll up one page
- **Cmd + ↓** — scroll down one page
- **Cmd + K** — clear the screen (if output scrolled away)
- **Shift + Cmd + S** — open the output search/filter panel

### Searching old output

Warp stores all command output. To find something from earlier:

1. Open the **Output Search**: `Cmd + Shift + S` (or click the magnifying glass)
2. Type your search term (e.g. "error", "warning", "147")
3. It highlights matches across all recent command outputs

### Re-running a previous command

- **Up arrow** — cycles through recent commands
- `Ctrl + R` — reverse search through command history (type to filter)

---

## 3. How to Use tmux (if you need parallel sessions)

tmux lets you split your terminal into panes and detach/reattach sessions.
Useful for running multiple agents or monitoring CI while still having a
shell open.

### Install

```bash
brew install tmux
```

### Basic usage

```bash
# Start a new session
tmux

# Split horizontally (top/bottom panes)
Ctrl + b, "

# Split vertically (left/right panes)
Ctrl + b, %

# Switch between panes
Ctrl + b, arrow key

# Detach from session (keeps it running)
Ctrl + b, d

# List sessions
tmux ls

# Reattach
tmux attach
# or attach to a named session
tmux attach -t mysession

# Kill a session
tmux kill-session -t mysession
```

### Useful workflow

```bash
# Create a named session for reviewing
tmux new -s review

# Left pane: run lint
yarn lint:rules

# Right pane: run typecheck
yarn lint:type-check

# Bottom pane: run tests
yarn test
```

### Quick reference

| Action | Shortcut |
|---|---|
| Split horizontal | `Ctrl+b, "` |
| Split vertical | `Ctrl+b, %` |
| Next pane | `Ctrl+b, o` |
| Kill pane | `Ctrl+b, x` |
| Detach | `Ctrl+b, d` |
| List sessions | `tmux ls` |
| Attach | `tmux a` |

---

## 4. Run the Review Locally

```bash
# 1. Make sure deps are installed
yarn install

# 2. Run the lint gate
yarn lint

# 3. Run tests
yarn test

# 4. Run typecheck (part of lint, but standalone)
yarn lint:type-check

# 5. Check formatting
yarn lint:format
```

These are the same checks CI runs. If they pass locally, the PR is sound
from a tooling perspective.

# T5 — Running Claude Code, opencode and Trae in parallel

**Reference doc, not a task.** Nothing here is a deliverable — it's how to distribute the other briefs across your three tools and review the results.

**Written:** 2026-08-17. Versions verified on this machine at that date: Claude Code **2.1.233**, opencode (Homebrew, `/opt/homebrew/bin/opencode`), Trae **3.5.78** (`/usr/local/bin/trae` → `Trae.app/.../marscode`). CLI flags below were checked against `--help`, not assumed. **Re-verify before trusting any exact flag** — these tools ship weekly.

---

## 1. The one idea

**Your briefs are the coordination protocol. CI is the arbiter. Neither is a framework.**

The hard part of running multiple agents is not launching them — it's stopping three of them producing three piles of plausible-but-wrong code in the same files. Two properties already solve that:

1. Every brief in `docs/tasks/` has an explicit **`Owns` file list**, and briefs marked parallel-safe have **no overlap**. That's what makes concurrent work safe.
2. Every brief has **written acceptance criteria**, so "done" is checkable rather than debatable.

Anything you add on top — an orchestrator, a master agent — is convenience, not safety. Don't build one until hand-rolling annoys you.

---

## 2. What each tool can actually do

Verified, not assumed:

| | Claude Code 2.1.233 | opencode | Trae 3.5.78 |
|---|---|---|---|
| Headless / scriptable | ✅ `-p/--print` | ✅ `opencode run` | ❌ **none** |
| Built-in git worktrees | ✅ `-w/--worktree [name]` | ❌ use `git worktree` | ❌ |
| Pick model per run | via config | ✅ `-m provider/model` | ❌ |
| Custom agents | ✅ `--agents`, `.claude/agents/` | ✅ `opencode agent create` | ❌ |
| Headless server | ✅ SDK | ✅ `opencode serve` / `--attach` | ❌ |
| JSON output (scripting) | ✅ `--output-format` | ✅ `--format json` | ❌ |
| Diff / merge UI | ❌ | ❌ | ✅ `--diff`, `--merge` |

**Trae is an IDE, not an agent runner.** Its binary is a VS Code-style launcher — the only flags are `--diff`, `--merge`, `--goto`, `--add`, `--new-window`. It cannot be scripted into a pipeline.

That's not a problem, it's a role assignment: **Trae is your human review seat.** `trae --diff a b` and `trae --merge` are genuinely good at the job the other two are bad at — you *looking* at a change and resolving a conflict.

### Multi-provider: check before relying on it

Cross-model review only works if opencode has a **non-Anthropic** provider configured. Otherwise you're having Claude review Claude, which mostly produces agreement.

```bash
opencode providers      # aka `opencode auth` — what's configured
opencode models         # what you can pass to -m
```

If only Anthropic is set up, add a second provider — that is the entire point of this workflow.

---

## 3. Do this first: T0, alone

**Do not start parallel work before [T0](T0-hygiene.md) lands.**

Not because it's urgent — because it creates the CI pipeline. Without a machine-checkable gate, cross-model review degenerates into three opinions with no tiebreaker, and you'll spend more time adjudicating than you saved.

T0 also owns `package.json`, jest, eslint and five source files, so it conflicts with nearly everything anyway.

Current baseline to be aware of (measured 2026-08-17): `tsc` **163 errors**, `yarn test` **4 suites fail / 0 tests run**. Until T0 fixes the Babel plugin, "the tests pass" is not an available signal for anyone.

---

## 4. Worktree mechanics

One brief = one worktree = one branch = one PR. Agents never share a working directory.

### Claude Code — built in

```bash
claude --worktree t2a-theme          # creates the worktree and starts there
claude --worktree t2a-theme --tmux   # plus a tmux session (iTerm2)
```

### opencode — plain git worktree

```bash
git worktree add ../binaa-t2a -b feat/T2a
cd ../binaa-t2a
opencode                              # interactive TUI
# or headless:
opencode run --dir . "Read docs/tasks/T2a-theme.md and execute it fully."
```

### Housekeeping

```bash
git worktree list
git worktree remove ../binaa-t2a
git worktree prune
```

⚠️ **Each worktree needs its own `node_modules`.** `yarn install` per worktree — it is not shared. For a React Native repo that's slow and disk-hungry; budget for it. This is the main practical tax of this workflow.

---

## 5. Who does what

### Right now (you're on `feat/expo` @ `fe4efa9`)

**Step 1 — one tool, alone:** T0.

**Step 2 — three streams, zero file overlap:**

| Stream | Brief | Owns | Why this tool |
|---|---|---|---|
| Claude Code + you | [T4](T4-expo-migration.md) Expo A–D | `app.json`, `metro.config.js`, `android/`, `ios/`, `package.json` | Highest risk, needs your Xcode/credentials |
| opencode | [T2a](T2a-theme.md) theme tokens | `src/theme/**` | Self-contained, crisp acceptance criteria |
| Trae (you driving) | [T2d](T2d-data-layer.md) data layer | `src/services/`, `src/store/`, `src/App.tsx` | Design judgement; worth a human in the loop |

Verified disjoint — no path appears in two rows.

### Deriving future splits

Read the dependency graph in [README.md](README.md), then apply one rule:

> **Two briefs may run concurrently only if their `Owns` lists share no path AND neither appears in the other's `Depends on`.**

When in doubt, diff the `Owns` columns literally. Don't reason about it.

---

## 6. Review protocol

Three rules. The first is the one that matters.

### Rule 1 — author tool ≠ reviewer tool

A model reviewing its own diff mostly agrees with itself. Different providers have different blind spots, and harvesting that is the whole reason you're running three tools.

| Authored by | Reviewed by |
|---|---|
| Claude Code | opencode on a **non-Anthropic** model |
| opencode | Claude Code `/code-review` |
| Trae / you | either CLI |

### Rule 2 — review the diff, not the repo

```bash
git diff main...feat/T2a > /tmp/t2a.diff
```

Cheap, bounded, and the one interface all three accept.

### Rule 3 — review against the brief, not against taste

"Does this satisfy criteria 1–7 of T2a?" beats "is this good code?" The criteria are already written; use them.

### Copy-paste prompts

**opencode reviewing (swap `-m` for a non-Anthropic model):**

```bash
opencode run -m openai/gpt-5 -f /tmp/t2a.diff \
  "Review this diff against the acceptance criteria in docs/tasks/T2a-theme.md.
   For each criterion: PASS / FAIL / UNVERIFIABLE with a one-line reason.
   Then list correctness bugs, most severe first, each with a concrete failure
   scenario (inputs -> wrong output). Ignore style. If a criterion cannot be
   judged from the diff alone, say UNVERIFIABLE rather than guessing."
```

**Claude Code reviewing:**

```bash
cd ../binaa-t2a && claude
# then:  /code-review high
```

**Trae (human seat):**

```bash
trae -n ../binaa-t2a           # open the worktree
trae --diff old.ts new.ts      # side-by-side
trae --merge ours theirs base result
```

### What to do with disagreement

CI decides facts. Humans decide taste.

1. Reviewer claims a bug → **reproduce it**. A failing test beats both models' opinions.
2. Can't reproduce → note it in the PR and move on. Do not rewrite code on an unverified model claim.
3. Style disagreement → `CLAUDE.md` wins. If `CLAUDE.md` is silent, the author wins.

**Never let one model rewrite another's work to satisfy a review it didn't verify.** That's how you get churn that looks like progress.

---

## 7. Integration

```bash
git checkout -b integration main
git merge feat/T2a && yarn lint && yarn test    # after each merge, not at the end
```

Merge order = dependency order from README.md. Merge one brief at a time and run the gate between each; a broken integration branch after five merges is very hard to attribute.

Every merged brief must leave `main` releasable. If a brief can't, it was scoped wrong.

---

## 8. Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Merge conflicts between "parallel-safe" briefs | An agent edited outside its `Owns` list | The standing rule exists for this. Re-read the brief's `Owns`, revert the stray edits. |
| Reviewer floods you with style nits | Prompt asked for "review" not "correctness" | Use the prompt in §6 — it explicitly says ignore style. |
| Both models confidently disagree | Neither verified | Write a test. Stop arguing. |
| Agent reports success, CI red | No baseline before starting | Always capture a before-state. This is why T0 comes first. |
| Costs spike | Three tools each re-reading the repo cold | Expected. See §10. |

---

## 9. Orchestrators, if hand-rolling gets old

Three streams is small enough to run manually. If you get tired of it:

| Tool | Drives | Shape |
|---|---|---|
| **Parallel Code** (johannesjo) | Claude Code, Codex, Gemini, **opencode**, Aider, Goose, Amp | Closest fit — the only one that speaks opencode |
| **Vibe Kanban** | agent-agnostic | Kanban board. Bloop shut down Apr 2026; now community-maintained, fully local |
| **Claude Squad** | Claude/Aider/Codex | tmux + worktrees TUI |
| **Conductor**, **Crystal** | Claude Code only | Desktop worktree apps |

**None of them will drive Trae** — no headless mode. Trae stays your review seat regardless.

Adopt **Parallel Code** first if you adopt anything; it's the only one covering two of your three tools.

---

## 10. The honest costs

Do not expect a 3× speedup.

- **Review load scales with output.** Three streams = three diffs you must actually read. Reviewing is the bottleneck, and it doesn't parallelise — you are the single reviewer.
- **Token cost goes up, not down.** Each tool reads the repo cold. There's no shared cache across providers.
- **`node_modules` per worktree** — slow installs, real disk on an RN project.
- **Integration is serial** regardless of how parallel the authoring was.

Where it genuinely wins: **wall-clock time on independent, well-specified work** — which is exactly what the briefs are. Where it loses: anything exploratory, anything where the spec is still moving.

Rule of thumb: **parallelise briefs whose acceptance criteria you'd be happy to have a stranger check. Serialise everything else.**

---

## Sources

Tool landscape as of Aug 2026 — re-check, this moves fast:

- [Best Tools for Managing Parallel AI Coding Agents in 2026 — Nimbalyst](https://nimbalyst.com/blog/best-agent-management-tools-2026/)
- [9 Open-Source Agent Orchestrators for AI Coding — Augment Code](https://www.augmentcode.com/tools/open-source-agent-orchestrators)
- [Vibe Kanban](https://www.vibekanban.com/)
- [Claude Code Git Worktrees: Run 5 AI Agents in Parallel — DevToolLab](https://devtoollab.com/blog/claude-code-git-worktrees-parallel-agents-guide)
- [awesome-agent-orchestrators — GitHub](https://github.com/andyrewlee/awesome-agent-orchestrators)

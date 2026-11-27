# Expererimental Herdr App plugin for pi-cowboy

## DISCLAIMER: This plugin is for demonstration purposes only it is not going to be maintained or supported

A standalone [pi-cowboy](https://github.com/electric-dragon-80000v/pi-cowboy) plugin that runs subagents in Herdr App terminals.

Herdr App runs pi inside a herdr-core (`hc`) terminal: `HC_TERMINAL_ID` is set and `HERDR_ENV` is not. Herdr-core has neither workspaces nor the legacy `herdr` pane API, so this plugin registers `herdr-core` as a multiplexer of its own, over the `hc` CLI.

## Install

From this repository, install the source directory with Pi:

```sh
pi install .
```

## Detection

A process is hosted by herdr-core when `HC_TERMINAL_ID` is non-empty and `HERDR_ENV` is not `1`.

Only one multiplexer drives a session, and herdr always wins. Pi-cowboy asks its built-in `herdr` first, and this plugin also declines whenever `HERDR_ENV=1`: a herdr session opened inside a Herdr App terminal carries both marks, and its children must stay filed under the herdr pane rather than under the desktop terminal beneath it. Naming `herdr-core` in `multiplexer` cannot override that.

## Behavior

- **Parentage.** Each subagent is started with `hc run --bg --no-notify --parent $HC_TERMINAL_ID`, where the id is the spawning process's own terminal. Herdr App shows the child beneath that chat, so two chats in one repository keep separate child trees. Parentage is never inferred from the repository, branch, names or the selected tab. Placement fails with a clear error when there is no `HC_TERMINAL_ID`.
- **Launch.** The terminal runs the account's own login shell — `$SHELL -l`, the shell a Herdr App terminal opens, with no rc-narrowing flags — in the spawn's worktree, and the harness's kind is typed into it, as for herdr panes. Worktree creation, harness selection and readiness go through pi-cowboy's normal spawn path.
- **Labels.** `cowboy=1`, `cowboy.agent=<branch>`, `cowboy.checkout`, `cowboy.repo`. Ownership requires both the terminal address and the agent label to match.
- **Status.** Read from the agent's OSC 7501 reports via `hc get`. A harness that reports nothing reads as `unknown`.
- **Steering.** Refused while the shell is in front, while the agent reports no status (an approval dialog cannot be ruled out), and while it reports `blocked`. Sends for `idle` and `working` are guarded by `hc send --if`.
- **Focus.** `herdr-app do agent.focus --terminal <id>`.
- **Cleanup.** Only the terminal the attempt started, still carrying its label, is killed, and only after `hc` reports it `finished`. The worktree is removed only once that terminal is gone and no other live cowboy terminal works in it. A terminal that survives the kill keeps its worktree, and the release reports failure. Pi-cowboy's worktree retention rules apply unchanged.

## Limitations

- **`HC_*` environment entries are not reserved.** Pi-cowboy reserves `HC_` for `harness.<id>.env` entries in the multiplexer it ships itself; a plugin cannot add a reserved prefix, so do not configure an `HC_*` entry. One named `HC_TERMINAL_ID` would point the child at a terminal other than the chat that spawned it.
- **A statusless program is not a cleanup refusal.** Pi-cowboy's recovered-cleanup gate treats a pane reporting no status as settled. The runtime reads such a program as `unknown`, so a recovered agent whose program reports no OSC 7501 status is removable rather than refused. Do not force cleanup of an agent you believe is still working.
- **Steering needs OSC 7501 status.** Pi 1.6.0 reports it. Claude Code, Codex and OpenCode do not unless configured to, so steering them is refused rather than guessed.
- **Start budget.** `start` waits up to 15 s for the agent to take the foreground. A harness that takes longer can be observed as already exited.
- **Cleanup order.** Release kills the terminal before removing the worktree. If git then fails to remove the worktree, it is no longer discoverable through `hc` labels, though `git worktree list` still shows it.
- **The placement shell is the machine's own.** Pi-cowboy's launchers are POSIX shell functions read back with `typeset -f`, so a shell that is not bash- or zsh-like (fish, nu) cannot take them. The built-in herdr multiplexer has the same constraint; neither chooses a shell for the user.
- **Sibling detection** counts only cowboy-labelled terminals, by their launch cwd.

## Development

```sh
pnpm run typecheck      # tsc6 --noEmit
pnpm test               # vitest run
pnpm run lint           # oxlint
pnpm run format:check   # prettier
pnpm run build          # plugin.js
```

`test/hc-host.test.ts` drives the runtime against an in-memory `hc` (`test/helpers/hc-fake.ts`), pinning the command lines it issues and what it does with the answers. Nothing there talks to a real core or starts a real agent; the suite that did that lived in pi-cowboy's own step-integration harness, whose scaffolding is not part of this repository.

/**
 * multiplexer.ts — herdr-core's identity and the answer to whether this
 * process runs inside it.
 *
 * herdr-core is the terminal core behind Herdr Desktop. It has no workspaces,
 * tabs or worktrees: it runs terminals, and a terminal started with a `parent`
 * is that terminal's child. A process running in one of those terminals carries
 * the terminal's own address in `HC_TERMINAL_ID`.
 *
 * Detection is environment-only, like every multiplexer's: a multiplexer that
 * cannot announce itself cannot host a session.
 */

/** herdr-core's multiplexer id, as the `multiplexer` config key and persisted addresses spell it. */
export const HERDR_CORE = "herdr-core";

/** The variable herdr sets in every process it starts. */
const HERDR_ENV_VAR = "HERDR_ENV";

/**
 * The variable herdr-core sets in every terminal it runs: that terminal's own
 * address, which is also the parent a child started from it is recorded under.
 */
export const HC_TERMINAL_ID_VAR = "HC_TERMINAL_ID";

/** The address of the herdr-core terminal this process runs in, or undefined outside one. */
export function hcTerminalId(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const value = env[HC_TERMINAL_ID_VAR];
  return value === undefined || value === "" ? undefined : value;
}

/**
 * Whether this process runs inside herdr-core.
 *
 * A legacy herdr pane is the nearer host whenever both announce themselves: a
 * herdr session run inside an herdr-core terminal hands its panes the
 * terminal's address too, and a child parented on that terminal would be filed
 * under the herdr session rather than under the chat that started it. Declining
 * here is what keeps herdr in charge — the registry resolves to the first host,
 * and herdr is registered first, so the plugin never has to outrank it.
 */
export function hostsHerdrCore(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[HERDR_ENV_VAR] !== "1" && hcTerminalId(env) !== undefined;
}

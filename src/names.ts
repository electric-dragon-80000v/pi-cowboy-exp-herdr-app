/**
 * names.ts — the agent-name grammar this runtime reads and writes.
 *
 * The grammar is pi-cowboy's, not this plugin's: a placement is named
 * `cow-<task-slug>-<spawn id>`, optionally followed by `-<index>` when one
 * checkout hosts several agents. The spawn id's alphabet and length are
 * restated here because a plugin package shares no module instance with
 * pi-cowboy, so the pattern cannot be imported; they are fixed by the spawn id
 * contract, not tuned here.
 */

/** Spawn-id alphabet (lowercase Crockford base32). */
const SPAWN_ID_ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz";

/** Exact length of every spawn id. */
const SPAWN_ID_LENGTH = 8;

const SPAWN_ID_PATTERN = `[${SPAWN_ID_ALPHABET}]{${SPAWN_ID_LENGTH}}`;

/** herdr caps an agent name at 32 characters — the one value every name-length rule reads. */
export const HERDR_AGENT_NAME_MAX_LENGTH = 32;

/** Highest per-checkout agent index. */
export const AGENT_NAME_INDEX_MAX = 9;

/** A placement's name: the worktree/branch base plus its index (hc names must be unique). */
export function agentNameWithIndex(base: string, index: number): string {
  if (!Number.isInteger(index) || index < 1 || index > AGENT_NAME_INDEX_MAX) {
    throw new Error(
      `agent index must be an integer in 1..${AGENT_NAME_INDEX_MAX}, got ${String(index)}`,
    );
  }
  const name = `${base}-${index}`;
  if (name.length > HERDR_AGENT_NAME_MAX_LENGTH) {
    throw new Error(
      `agent name "${name}" is ${name.length} characters, over the ${HERDR_AGENT_NAME_MAX_LENGTH}-character limit`,
    );
  }
  return name;
}

/**
 * Agent names are `cow-<slug>-<id>`, optionally followed by `-<index>`. The
 * slug boundary is explicit — `fix` must not match `fix-login-flow-<id>` — hence
 * the full anchored shape instead of a prefix test.
 */
export function isTaskAgentName(name: string, taskSlug: string): boolean {
  // taskSlug comes from pi-cowboy's buildTaskSlug: only [a-z0-9_-], no regex metacharacters.
  return new RegExp(`^cow-${taskSlug}-${SPAWN_ID_PATTERN}(-\\d+)?$`).test(name);
}

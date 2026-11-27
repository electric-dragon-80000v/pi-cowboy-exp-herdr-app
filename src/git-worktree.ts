/**
 * git-worktree.ts — the one git operation this runtime performs itself.
 *
 * The extension owns worktree creation; a multiplexer only has to remove the
 * checkout it adopted when the placement that worked in it is gone. pi-cowboy's
 * own removal helper is internal, so the same best-effort
 * `git worktree remove --force` is issued here through the session's own exec.
 */

import type { PiSession } from "./pi-session.js";

/** `git worktree remove` runs against a warm checkout and may have much to delete. */
const GIT_WORKTREE_TIMEOUT_MS = 60_000;

/** Best-effort `git worktree remove --force`; never throws. */
export async function removeGitWorktree(
  pi: PiSession,
  repoCwd: string,
  wtPath: string,
): Promise<void> {
  try {
    await pi.exec("git", ["worktree", "remove", "--force", wtPath], {
      cwd: repoCwd,
      timeout: GIT_WORKTREE_TIMEOUT_MS,
    });
  } catch {
    // Removal is best effort; the caller reads the checkout back to decide.
  }
}

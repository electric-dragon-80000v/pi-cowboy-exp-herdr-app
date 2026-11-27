/**
 * paths.ts — the one spelling the filesystem agrees a location has.
 *
 * A directory has as many names as there are routes to it — a symlinked home, a
 * bind mount, `/tmp` on macOS — and comparing those spellings as text reports
 * one place as several. Anything that compares or keys on a path canonicalizes
 * first.
 */

import fs from "node:fs";

/**
 * The canonical spelling of a path, or `undefined` when it has none. A path
 * that does not exist yet has no real spelling, so the caller decides what to
 * compare it with.
 */
export function canonicalPath(value: string): string | undefined {
  try {
    return fs.realpathSync.native(value);
  } catch {
    return undefined;
  }
}

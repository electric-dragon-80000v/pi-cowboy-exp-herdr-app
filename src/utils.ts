/** utils.ts — leaves every layer of this runtime shares. */

/** Await a delay. The timer is left ref'd so an awaited delay always resolves. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Line-based TUI output breaks on raw CR/LF. */
function toSingleLine(msg: string): string {
  return msg.replace(/[\r\n]+/g, " ").trim();
}

/** One line of an unknown failure, for a message or a log entry. */
export function errorMessage(err: unknown): string {
  return toSingleLine(err instanceof Error ? err.message : String(err));
}

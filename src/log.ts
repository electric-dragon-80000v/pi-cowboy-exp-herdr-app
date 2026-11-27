/**
 * log.ts — a small append-only file logger for this runtime's diagnostics.
 *
 * pi owns the terminal, so nothing here writes to stdout or stderr: a line
 * printed there lands in the TUI. Lines go to
 * `<agent dir>/pi-cowboy/herdr-app.log`, and a level below the configured
 * minimum is dropped before anything is written. Logging never throws — a
 * diagnostic must not be the reason a spawn fails.
 */

import { appendFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(msg: string, data?: Record<string, unknown>): void;
  info(msg: string, data?: Record<string, unknown>): void;
  warn(msg: string, data?: Record<string, unknown>): void;
  error(msg: string, data?: Record<string, unknown>): void;
}

const LEVELS: readonly LogLevel[] = ["debug", "info", "warn", "error"];
const AGENT_DIR_ENV_VAR = "PI_CODING_AGENT_DIR";
const MINIMUM_LEVEL = parseLevel(process.env.PI_COWBOY_LOG_LEVEL);

/** pi's agent dir: the env override wins, otherwise `~/.pi/agent`. */
function agentDir(): string {
  const override = process.env[AGENT_DIR_ENV_VAR];
  return override === undefined || override === ""
    ? join(homedir(), ".pi", "agent")
    : override;
}

const LOG_FILE = join(agentDir(), "pi-cowboy", "herdr-app.log");

function parseLevel(value: string | undefined): LogLevel {
  const normalized = value?.toLowerCase();
  return normalized !== undefined && LEVELS.includes(normalized as LogLevel)
    ? (normalized as LogLevel)
    : "info";
}

function serializeData(data: Record<string, unknown>): string {
  try {
    return ` ${JSON.stringify(data)}`;
  } catch {
    return "";
  }
}

function write(
  level: LogLevel,
  module: string,
  msg: string,
  data: Record<string, unknown> | undefined,
): void {
  if (LEVELS.indexOf(level) < LEVELS.indexOf(MINIMUM_LEVEL)) return;
  const suffix = data === undefined ? "" : serializeData(data);
  const line = `${new Date().toISOString()} ${level.toUpperCase().padEnd(5)} [${module}] ${msg}${suffix}\n`;
  try {
    mkdirSync(join(LOG_FILE, ".."), { recursive: true });
    appendFileSync(LOG_FILE, line);
  } catch {
    // An unwritable log is not a reason to fail an agent operation.
  }
}

export function createLogger(module: string): Logger {
  return {
    debug: (msg, data) => write("debug", module, msg, data),
    info: (msg, data) => write("info", module, msg, data),
    warn: (msg, data) => write("warn", module, msg, data),
    error: (msg, data) => write("error", module, msg, data),
  };
}

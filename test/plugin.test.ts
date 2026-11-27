/**
 * plugin.test.ts — what the entry module registers, and when herdr-core claims
 * to host the process.
 *
 * Detection is the one decision this plugin makes for the whole session: a
 * false positive takes the session away from herdr, and a false negative leaves
 * pi-cowboy unhosted inside Herdr Desktop.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import type { CowboyPluginApi } from "pi-cowboy/plugin";
import plugin, { herdrCoreMultiplexer } from "../src/plugin.js";
import { HERDR_CORE, hostsHerdrCore } from "../src/multiplexer.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("hostsHerdrCore", () => {
  it("hosts a process that carries a terminal address", () => {
    expect(hostsHerdrCore({ HC_TERMINAL_ID: "t7" })).toBe(true);
  });

  it("does not host a process with no terminal address", () => {
    expect(hostsHerdrCore({})).toBe(false);
    expect(hostsHerdrCore({ HC_TERMINAL_ID: "" })).toBe(false);
  });

  it("leaves the session to herdr whenever herdr marks the process", () => {
    expect(hostsHerdrCore({ HERDR_ENV: "1", HC_TERMINAL_ID: "t7" })).toBe(
      false,
    );
  });

  it("hosts under a non-herdr environment that also names a terminal", () => {
    expect(hostsHerdrCore({ HERDR_ENV: "", HC_TERMINAL_ID: "t7" })).toBe(true);
  });
});

describe("plugin factory", () => {
  it("registers the herdr-core multiplexer once", () => {
    const registerMultiplexer = vi.fn().mockReturnValue(true);
    plugin({ registerMultiplexer } as unknown as CowboyPluginApi);

    expect(registerMultiplexer).toHaveBeenCalledTimes(1);
    const registration = registerMultiplexer.mock.calls[0]![0] as {
      id: string;
    };
    expect(registration.id).toBe(HERDR_CORE);
  });

  it("answers for the process environment at detection time, not load time", () => {
    const multiplexer = herdrCoreMultiplexer();

    vi.stubEnv("HERDR_ENV", "");
    vi.stubEnv("HC_TERMINAL_ID", "");
    expect(multiplexer.hosts()).toBe(false);

    vi.stubEnv("HC_TERMINAL_ID", "t9");
    expect(multiplexer.hosts()).toBe(true);

    vi.stubEnv("HERDR_ENV", "1");
    expect(multiplexer.hosts()).toBe(false);
  });

  it("builds a runtime that records herdr-core as its multiplexer", () => {
    const runtime = herdrCoreMultiplexer().create({} as never);

    expect(runtime.multiplexer).toBe(HERDR_CORE);
    expect(runtime.pane.kind).toBe(HERDR_CORE);
    expect(runtime.placements.multiplexer).toBe(HERDR_CORE);
  });
});

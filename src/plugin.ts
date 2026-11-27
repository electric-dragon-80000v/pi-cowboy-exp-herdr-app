/**
 * plugin.ts — the `pi-cowboy` plugin entry: registers herdr-core as a
 * multiplexer.
 *
 * pi-cowboy loads this module once per session, after its own built-ins are
 * registered and before the first spawn. The registration is what makes a
 * session inside Herdr Desktop run at all: a session is hosted only where a
 * registered multiplexer's `hosts()` says so.
 *
 * Only one multiplexer drives a session, and herdr is always the nearer host.
 * The registry resolves to the first multiplexer that hosts this process, and
 * herdr is registered before any plugin; `hosts()` here also declines whenever
 * herdr's mark is present, so herdr keeps the session even when the
 * `multiplexer` config key names `herdr-core`. A herdr pane opened inside a
 * Herdr Desktop terminal carries both marks, and the child must stay filed
 * under the herdr session rather than under the desktop terminal beneath it.
 */

import type { CowboyPluginApi, PluginMultiplexer } from "pi-cowboy/plugin";
import { createHcRuntime, type HcRuntimeOptions } from "./hc-host.js";
import { HERDR_CORE, hostsHerdrCore } from "./multiplexer.js";

/** The multiplexer registration this plugin contributes, under herdr-core's id. */
export function herdrCoreMultiplexer(
  options: HcRuntimeOptions = {},
): PluginMultiplexer {
  return {
    id: HERDR_CORE,
    hosts: () => hostsHerdrCore(),
    create: (pi) => createHcRuntime(pi, options),
  };
}

export default function (api: CowboyPluginApi): void {
  api.registerMultiplexer(herdrCoreMultiplexer());
}

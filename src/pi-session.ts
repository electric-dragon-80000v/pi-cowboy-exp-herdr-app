/**
 * pi-session.ts — the slice of the session api a multiplexer runtime runs its
 * CLIs through.
 *
 * The type is read off the plugin contract rather than named from pi's own
 * package, so this repository's only compile-time dependency is
 * `pi-cowboy/plugin` — the surface a plugin is written against.
 */

import type { CowboyPluginApi } from "pi-cowboy/plugin";

/** The session api a runtime reaches `hc`, `herdr-app` and `git` through. */
export type PiSession = CowboyPluginApi["pi"];

/**
 * Pi's own entry for this package. Pi loads every installed package as an
 * extension and hands it Pi's extension API, which is not the `CowboyPluginApi`
 * a pi-cowboy plugin receives, so this factory registers nothing. The plugin
 * itself is declared under `pi-cowboy.plugin` in `package.json` and loaded by
 * pi-cowboy from there.
 */
export default function (): void {}

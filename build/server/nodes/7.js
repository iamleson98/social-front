import * as server from '../entries/pages/(app)/categories/_slug_/_page.server.ts.js';

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/categories/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/(app)/categories/[slug]/+page.server.ts";
export const imports = ["_app/immutable/nodes/7.CrrUdYPi.js","_app/immutable/chunks/scheduler.BdO_c8T1.js","_app/immutable/chunks/index.DuQZmDCs.js"];
export const stylesheets = [];
export const fonts = [];

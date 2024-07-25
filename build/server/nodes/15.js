import * as server from '../entries/pages/(app)/user/_userId_/_page.server.ts.js';

export const index = 15;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/user/_userId_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/(app)/user/[userId]/+page.server.ts";
export const imports = ["_app/immutable/nodes/15.B2GUnMZF.js","_app/immutable/chunks/scheduler.BdO_c8T1.js","_app/immutable/chunks/index.DuQZmDCs.js","_app/immutable/chunks/each.CRKCIZtP.js"];
export const stylesheets = ["_app/immutable/assets/15.CJ5rp3PE.css"];
export const fonts = [];

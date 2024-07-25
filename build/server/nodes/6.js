import * as server from '../entries/pages/(app)/categories/_page.server.ts.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/categories/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/(app)/categories/+page.server.ts";
export const imports = ["_app/immutable/nodes/6.ByisTT53.js","_app/immutable/chunks/scheduler.BdO_c8T1.js","_app/immutable/chunks/index.DuQZmDCs.js","_app/immutable/chunks/each.CRKCIZtP.js","_app/immutable/chunks/product.DPbdQpOO.js","_app/immutable/chunks/toast.DpDPwmto.js","_app/immutable/chunks/index.TIp4ptjY.js","_app/immutable/chunks/index.CiKvcTZw.js","_app/immutable/chunks/preload-helper.DyDGoheb.js"];
export const stylesheets = [];
export const fonts = [];

import * as universal from '../entries/pages/_page.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+page.ts";
export const imports = ["_app/immutable/nodes/5.szqCh1Vj.js","_app/immutable/chunks/consts.JQ69i4O5.js","_app/immutable/chunks/scheduler.BdO_c8T1.js","_app/immutable/chunks/index.DuQZmDCs.js","_app/immutable/chunks/icon.Cfg-3FdP.js"];
export const stylesheets = [];
export const fonts = [];

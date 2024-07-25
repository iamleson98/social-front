import * as server from '../entries/pages/(app)/products/_slug_/_page.server.ts.js';

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/products/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/(app)/products/[slug]/+page.server.ts";
export const imports = ["_app/immutable/nodes/11.CqOkOSpx.js","_app/immutable/chunks/scheduler.BdO_c8T1.js","_app/immutable/chunks/index.DuQZmDCs.js","_app/immutable/chunks/mingcute--home.1XGTgxN-.js","_app/immutable/chunks/icon.Cfg-3FdP.js","_app/immutable/chunks/index.CiKvcTZw.js","_app/immutable/chunks/preload-helper.DyDGoheb.js","_app/immutable/chunks/index.TIp4ptjY.js","_app/immutable/chunks/each.CRKCIZtP.js","_app/immutable/chunks/Input.svelte_svelte_type_style_lang.DhSNKVHg.js","_app/immutable/chunks/user.SBoXyvg1.js","_app/immutable/chunks/consts.JQ69i4O5.js","_app/immutable/chunks/toast.DpDPwmto.js","_app/immutable/chunks/product.DPbdQpOO.js","_app/immutable/chunks/stores.D4_T5i5p.js","_app/immutable/chunks/entry.wgEMl8FU.js"];
export const stylesheets = ["_app/immutable/assets/11.BIApt0q2.css","_app/immutable/assets/Input.BaLnswWH.css"];
export const fonts = [];

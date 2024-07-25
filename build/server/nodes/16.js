import * as server from '../entries/pages/auth/change-password/_page.server.ts.js';

export const index = 16;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/auth/change-password/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/auth/change-password/+page.server.ts";
export const imports = ["_app/immutable/nodes/16.BI7enAtD.js","_app/immutable/chunks/scheduler.BdO_c8T1.js","_app/immutable/chunks/index.DuQZmDCs.js","_app/immutable/chunks/forms.C96AWTIS.js","_app/immutable/chunks/consts.JQ69i4O5.js","_app/immutable/chunks/alert.svelte_svelte_type_style_lang.Kh5NAE2M.js","_app/immutable/chunks/entry.wgEMl8FU.js","_app/immutable/chunks/index.TIp4ptjY.js","_app/immutable/chunks/Input.svelte_svelte_type_style_lang.DhSNKVHg.js","_app/immutable/chunks/icon.Cfg-3FdP.js","_app/immutable/chunks/routes.B4_TBsYH.js","_app/immutable/chunks/stores.D4_T5i5p.js","_app/immutable/chunks/tabler--lock.DlV_MiZe.js"];
export const stylesheets = ["_app/immutable/assets/header.CE_c-rgi.css","_app/immutable/assets/alert.CZLR1Lj0.css","_app/immutable/assets/Input.BaLnswWH.css"];
export const fonts = [];



export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/products/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.DCqRgghT.js","_app/immutable/chunks/scheduler.BdO_c8T1.js","_app/immutable/chunks/index.DuQZmDCs.js"];
export const stylesheets = [];
export const fonts = [];

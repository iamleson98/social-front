import { c as create_ssr_component } from "./ssr.js";
const Tabler_eye_closed = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M21 9q-3.6 4-9 4T3 9m0 6l2.5-3.8M21 14.976L18.508 11.2M9 17l.5-4m5.5 4l-.5-4"></path>`;
});
const Tabler_open_eye = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0-4 0"></path><path d="M21 12q-3.6 6-9 6t-9-6q3.6-6 9-6t9 6"></path></g>`;
});
export {
  Tabler_open_eye as T,
  Tabler_eye_closed as a
};

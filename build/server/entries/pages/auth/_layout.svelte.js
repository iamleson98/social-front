import { c as create_ssr_component } from "../../../chunks/ssr.js";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="flex items-center justify-center w-full h-full">${slots.default ? slots.default({}) : ``}</div>`;
});
export {
  Layout as default
};

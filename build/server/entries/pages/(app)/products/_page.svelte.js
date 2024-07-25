import { c as create_ssr_component } from "../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${slots.default ? slots.default({}) : ``} <div data-svelte-h="svelte-1j79b38">products</div>`;
});
export {
  Page as default
};

import { c as create_ssr_component, v as validate_component } from "../../chunks/ssr.js";
import { I as Icon } from "../../chunks/icon.js";
const Tabler_access_point = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 12v.01m2.828-2.838a4 4 0 0 1 0 5.656m2.829-8.485a8 8 0 0 1 0 11.314m-8.489-2.829a4 4 0 0 1 0-5.656m-2.831 8.485a8 8 0 0 1 0-11.314"></path>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-1op357g_START -->${$$result.title = `<title>Sitename</title>`, ""}<!-- HEAD_svelte-1op357g_END -->`, ""} <div>${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_access_point }, {}, {})}</div>`;
});
export {
  Page as default
};

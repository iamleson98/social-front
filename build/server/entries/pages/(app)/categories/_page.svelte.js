import { c as create_ssr_component, a as each } from "../../../../chunks/ssr.js";
import "../../../../chunks/product.js";
import "../../../../chunks/toast.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-i60puk_START -->${$$result.title = `<title>Categories</title>`, ""}<!-- HEAD_svelte-i60puk_END -->`, ""} <div class="flex flex-row">${`${each(new Array(10), (_, idx) => {
    return `<div class="skeleton w-32 h-32"></div>`;
  })}`}</div> ${slots.default ? slots.default({}) : ``}`;
});
export {
  Page as default
};

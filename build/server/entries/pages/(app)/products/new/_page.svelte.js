import { c as create_ssr_component, e as escape, b as add_attribute } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let editorRoot;
  let now = /* @__PURE__ */ new Date();
  return `<div><h1 data-svelte-h="svelte-10a3vw8">Add new product</h1> <div class="m-auto rounded bg-white max-w-[800px] p-5"> <label class="form-control w-full"><div class="label" data-svelte-h="svelte-8o6h2u"><span class="label-text text-lg font-semibold">Product name</span> </div> <input type="text" placeholder="Enter the product name" class="input input-bordered w-full"> <div class="label"><span class="label-text-alt"></span> <span class="label-text-alt">${escape(now.toDateString())}</span></div></label>  <div class="label" data-svelte-h="svelte-yoo9tb"><span class="label-text text-lg font-semibold">Product description</span></div> <div contenteditable${add_attribute("this", editorRoot, 0)}></div></div></div>`;
});
export {
  Page as default
};

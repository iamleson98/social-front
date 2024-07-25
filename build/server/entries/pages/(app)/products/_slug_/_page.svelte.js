import { c as create_ssr_component, e as escape, a as each, v as validate_component, b as add_attribute } from "../../../../../chunks/ssr.js";
import { M as Mingcute_home } from "../../../../../chunks/mingcute--home.js";
import { I as Icon } from "../../../../../chunks/icon.js";
import "../../../../../chunks/index2.js";
import { B as Button } from "../../../../../chunks/Input.svelte_svelte_type_style_lang.js";
import { d as defaultChannel } from "../../../../../chunks/consts.js";
import { f as formatMoney, a as formatSelectedAttributeValue } from "../../../../../chunks/toast.js";
import "../../../../../chunks/product.js";
import { s as subscribe } from "../../../../../chunks/utils.js";
import { p as page } from "../../../../../chunks/stores.js";
const Tabler_map_pin = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<path fill="currentColor" d="M18.364 4.636a9 9 0 0 1 .203 12.519l-.203.21l-4.243 4.242a3 3 0 0 1-4.097.135l-.144-.135l-4.244-4.243A9 9 0 0 1 18.364 4.636M12 8a3 3 0 1 0 0 6a3 3 0 0 0 0-6"></path>`;
});
const Tabler_plus = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 5v14m-7-7h14"></path>`;
});
const Tabler_minus = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M5 12h14"></path>`;
});
const Tabler_shopping_bag_plus = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"><path d="M12.5 21H8.574a3 3 0 0 1-2.965-2.544l-1.255-8.152A2 2 0 0 1 6.331 8H17.67a2 2 0 0 1 1.977 2.304l-.263 1.708M16 19h6m-3-3v6"></path><path d="M9 11V6a3 3 0 0 1 6 0v5"></path></g>`;
});
const Tabler_chevron_left = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="m15 6l-6 6l6 6"></path>`;
});
const Tabler_chevron_right = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="m9 6l6 6l-6 6"></path>`;
});
const Tabler_star = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="m12 17.75l-6.172 3.245l1.179-6.873l-5-4.867l6.9-1l3.086-6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"></path>`;
});
const css = {
  code: ".prd-display-main.svelte-xakei3{width:100%;border-radius:0.25rem;background-size:cover;background-position:center;background-repeat:no-repeat;padding-top:100% !important\n}.prd-thumbnail.svelte-xakei3{border-radius:0.25rem;background-size:contain;background-position:center;background-repeat:no-repeat;padding-top:100% !important\n}.prd-slide.svelte-xakei3{position:relative;width:100%\n}.slide-btn.svelte-xakei3{position:absolute;top:50%;display:flex;height:1.75rem;width:1.75rem;--tw-translate-y:-50%;transform:translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));align-items:center;justify-content:center;border-radius:9999px;--tw-bg-opacity:1;background-color:rgb(249 250 251 / var(--tw-bg-opacity))\n}.slide-btn.svelte-xakei3:hover{--tw-bg-opacity:1;background-color:rgb(243 244 246 / var(--tw-bg-opacity))\n}",
  map: `{"version":3,"file":"product-slide-show-pannel.svelte","sources":["product-slide-show-pannel.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { ChevronLeft, ChevronRight, Icon } from \\"$lib/components/icons\\";\\nexport let medias = [];\\nexport let mainMedia = medias[0];\\n<\/script>\\n\\n<div class=\\"prd-display-main bg-white\\" style=\\"background-image: url('{mainMedia.url}');\\"></div>\\n\\n<div class=\\"prd-slide bg-white\\">\\n\\t<div class=\\"prd-slide-main\\">\\n\\t\\t<div>\\n\\t\\t\\t{#each medias as media (media.id)}\\n\\t\\t\\t\\t<div class=\\"inline-block p-1 w-1/5\\">\\n\\t\\t\\t\\t\\t<div class=\\"rounded relative overflow-hidden\\" tabindex=\\"0\\" role=\\"button\\">\\n\\t\\t\\t\\t\\t\\t<div class=\\"prd-thumbnail\\" style=\\"background-image: url('{media.url}');\\"></div>\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t{/each}\\n\\t\\t</div>\\n\\t</div>\\n\\n\\t<button class=\\"left-2 slide-btn\\" tabindex=\\"0\\">\\n\\t\\t<Icon icon={ChevronLeft} />\\n\\t</button>\\n\\n\\t<button class=\\"right-2 slide-btn\\" tabindex=\\"0\\">\\n\\t\\t<Icon icon={ChevronRight} />\\n\\t</button>\\n</div>\\n\\n<style lang=\\"postcss\\">\\n\\t.prd-display-main {\\n\\t\\twidth: 100%;\\n\\t\\tborder-radius: 0.25rem;\\n\\t\\tbackground-size: cover;\\n\\t\\tbackground-position: center;\\n\\t\\tbackground-repeat: no-repeat;\\n\\t\\tpadding-top: 100% !important\\n}\\n\\n\\t.prd-thumbnail {\\n\\t\\tborder-radius: 0.25rem;\\n\\t\\tbackground-size: contain;\\n\\t\\tbackground-position: center;\\n\\t\\tbackground-repeat: no-repeat;\\n\\t\\tpadding-top: 100% !important\\n}\\n\\n\\t.prd-slide {\\n\\t\\tposition: relative;\\n\\t\\twidth: 100%\\n}\\n\\t.slide-btn {\\n\\t\\tposition: absolute;\\n\\t\\ttop: 50%;\\n\\t\\tdisplay: flex;\\n\\t\\theight: 1.75rem;\\n\\t\\twidth: 1.75rem;\\n\\t\\t--tw-translate-y: -50%;\\n\\t\\ttransform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\\n\\t\\talign-items: center;\\n\\t\\tjustify-content: center;\\n\\t\\tborder-radius: 9999px;\\n\\t\\t--tw-bg-opacity: 1;\\n\\t\\tbackground-color: rgb(249 250 251 / var(--tw-bg-opacity))\\n}\\n\\t.slide-btn:hover {\\n\\t\\t--tw-bg-opacity: 1;\\n\\t\\tbackground-color: rgb(243 244 246 / var(--tw-bg-opacity))\\n}\\n</style>\\n"],"names":[],"mappings":"AA8BC,+BAAkB,CACjB,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,OAAO,CACtB,eAAe,CAAE,KAAK,CACtB,mBAAmB,CAAE,MAAM,CAC3B,iBAAiB,CAAE,SAAS,CAC5B,WAAW,CAAE,IAAI,CAAC;AACpB,CAEC,4BAAe,CACd,aAAa,CAAE,OAAO,CACtB,eAAe,CAAE,OAAO,CACxB,mBAAmB,CAAE,MAAM,CAC3B,iBAAiB,CAAE,SAAS,CAC5B,WAAW,CAAE,IAAI,CAAC;AACpB,CAEC,wBAAW,CACV,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI;AACb,CACC,wBAAW,CACV,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,GAAG,CACR,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,OAAO,CACf,KAAK,CAAE,OAAO,CACd,gBAAgB,CAAE,IAAI,CACtB,SAAS,CAAE,UAAU,IAAI,gBAAgB,CAAC,CAAC,CAAC,IAAI,gBAAgB,CAAC,CAAC,CAAC,OAAO,IAAI,WAAW,CAAC,CAAC,CAAC,MAAM,IAAI,WAAW,CAAC,CAAC,CAAC,MAAM,IAAI,WAAW,CAAC,CAAC,CAAC,OAAO,IAAI,YAAY,CAAC,CAAC,CAAC,OAAO,IAAI,YAAY,CAAC,CAAC,CAC/L,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,aAAa,CAAE,MAAM,CACrB,eAAe,CAAE,CAAC,CAClB,gBAAgB,CAAE,IAAI,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,IAAI,eAAe,CAAC,CAAC;AAC3D,CACC,wBAAU,MAAO,CAChB,eAAe,CAAE,CAAC,CAClB,gBAAgB,CAAE,IAAI,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,IAAI,eAAe,CAAC,CAAC;AAC3D"}`
};
const Product_slide_show_pannel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { medias = [] } = $$props;
  let { mainMedia = medias[0] } = $$props;
  if ($$props.medias === void 0 && $$bindings.medias && medias !== void 0) $$bindings.medias(medias);
  if ($$props.mainMedia === void 0 && $$bindings.mainMedia && mainMedia !== void 0) $$bindings.mainMedia(mainMedia);
  $$result.css.add(css);
  return `<div class="prd-display-main bg-white svelte-xakei3" style="${"background-image: url('" + escape(mainMedia.url, true) + "');"}"></div> <div class="prd-slide bg-white svelte-xakei3"><div class="prd-slide-main"><div>${each(medias, (media) => {
    return `<div class="inline-block p-1 w-1/5"><div class="rounded relative overflow-hidden" tabindex="0" role="button"><div class="prd-thumbnail svelte-xakei3" style="${"background-image: url('" + escape(media.url, true) + "');"}"></div></div> </div>`;
  })}</div></div> <button class="left-2 slide-btn svelte-xakei3" tabindex="0">${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_chevron_left }, {}, {})}</button> <button class="right-2 slide-btn svelte-xakei3" tabindex="0">${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_chevron_right }, {}, {})}</button> </div>`;
});
const Product_pricing_pannel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { productInformation } = $$props;
  let userDefaultShippingAddress = "please choose address";
  let quantitySelected = 1;
  if ($$props.productInformation === void 0 && $$bindings.productInformation && productInformation !== void 0) $$bindings.productInformation(productInformation);
  return `<div><h1 class="text-gray-700 text-xl font-medium mb-3">${escape(productInformation.name)}</h1> <div class="rating rating-sm mb-3 text-red-500"> ${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_star }, {}, {})} ${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_star }, {}, {})} ${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_star }, {}, {})} ${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_star }, {}, {})} ${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_star }, {}, {})}</div> <div class="mb-5 bg-gray-50 rounded">   <div class="stat place-items-start"> <div class="stat-value text-blue-500 font-semibold">${escape(formatMoney(productInformation.pricing?.priceRange?.start?.gross.currency || defaultChannel.currency, productInformation.pricing?.priceRange?.start?.gross.amount || 0, productInformation.pricing?.priceRange?.stop?.gross.amount))}</div> ${productInformation.pricing?.discount ? (() => {
    let { pricing: { discount: { gross: { amount, currency } } } } = productInformation;
    return `  <div class="stat-desc text-red-500 font-semibold">↘︎ Sale -${escape(formatMoney(currency, amount))}</div>`;
  })() : ``}</div>  </div> <div class="flex flex-row items-center mb-3"><span class="text-gray-400 w-1/5 text-xs" data-svelte-h="svelte-bt1ztv">Deliver to</span> <div class="w-4/5"><span class="text-gray-500 text-sm mr-1">${escape(userDefaultShippingAddress)}</span> <button class="btn btn-circle btn-xs bg-blue-100 hover:bg-blue-200 text-blue-500 border-none">${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_map_pin }, {}, {})}</button></div></div> <div class="flex flex-row items-center mb-3" data-svelte-h="svelte-aqpqns"><span class="text-gray-400 w-1/5 text-xs">Material</span> <div class="item-container flex w-4/5"></div></div> <div class="flex flex-row items-center mb-3" data-svelte-h="svelte-1a80y8u"><span class="text-gray-400 w-1/5 text-xs">Size</span> <div class="flex items-start w-4/5"></div></div> <div class="flex flex-row items-center mb-20"><span class="text-gray-400 w-1/5 text-xs" data-svelte-h="svelte-1jpkeas">Quantity</span> <div class="flex items-center justify-start w-4/5"><button class="btn btn-xs btn-square mr-1" ${"disabled"}>${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_minus }, {}, {})}</button> <input type="number" class="mr-1 outline-none focus:outline-none w-14 text-right"${add_attribute("value", quantitySelected, 0)}> <button class="btn btn-xs btn-square">${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_plus }, {}, {})}</button></div></div> <div>${validate_component(Button, "Button").$$render($$result, { variant: "filled", color: "blue" }, {}, {
    startIcon: () => {
      return `${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_shopping_bag_plus, slot: "startIcon" }, {}, {})}`;
    },
    default: () => {
      return `<span data-svelte-h="svelte-18hphpg">Add to Cart</span>`;
    }
  })}</div></div>`;
});
const Product_attribute_tab = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { selectedAttributes = [] } = $$props;
  if ($$props.selectedAttributes === void 0 && $$bindings.selectedAttributes && selectedAttributes !== void 0) $$bindings.selectedAttributes(selectedAttributes);
  return `<div>${each(selectedAttributes, (selectedAttribute) => {
    return `<div class="flex items-center mb-2 text-sm text-gray-500"><div class="w-1/6 font-normal"> ${escape(selectedAttribute.attribute.name)}</div> <div class="font-semibold">${escape(formatSelectedAttributeValue(selectedAttribute))}</div> </div>`;
  })}</div>`;
});
const Product_detail_pannel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { selectedAttributes = [] } = $$props;
  var TabType = /* @__PURE__ */ ((TabType2) => {
    TabType2["DESCRIPTION"] = "Description";
    TabType2["ATTRIBUTES"] = "Attributes";
    TabType2["CUSTOMER_FEEDBACK"] = "Customer Feedback";
    TabType2["PACKAGE"] = "Package";
    return TabType2;
  })(TabType || {});
  if ($$props.selectedAttributes === void 0 && $$bindings.selectedAttributes && selectedAttributes !== void 0) $$bindings.selectedAttributes(selectedAttributes);
  $$unsubscribe_page();
  return `<div><div class="text-gray-600 text-lg font-bold mb-4" data-svelte-h="svelte-wd3u6y">Product Information</div> <div role="tablist" class="tabs tabs-bordered"><a role="tab" class="tab"${add_attribute("href", `${$page.url.pathname}?tab=attributes`, 0)}> ${escape(TabType.ATTRIBUTES)}</a> <div role="tabpanel" class="tab-content p-10">${validate_component(Product_attribute_tab, "ProductAttributeTab").$$render($$result, { selectedAttributes }, {}, {})}</div>  <a role="tab" class="tab"${add_attribute("href", `${$page.url.pathname}?tab=customer-feedback`, 0)}>${escape(TabType.CUSTOMER_FEEDBACK)}</a> <div role="tabpanel" class="tab-content p-10" data-svelte-h="svelte-1pzsclx">Customer Feedback</div>  <a role="tab" class="tab"${add_attribute("href", `${$page.url.pathname}?tab=packaging`, 0)}>${escape(TabType.PACKAGE)}</a> <div role="tabpanel" class="tab-content p-10" data-svelte-h="svelte-1758x7p">Tab content 3</div></div></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const { media, ...productInformation } = data.data;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `<div class="m-auto max-w-6xl"> <div class="breadcrumbs text-sm"><ul><li><a href="/" class="text-blue-600">${validate_component(Icon, "Icon").$$render($$result, { icon: Mingcute_home, class: "mr-1" }, {}, {})}
        Home</a></li> <li data-svelte-h="svelte-1eyhhgu"><a href="/">Documents</a></li> <li data-svelte-h="svelte-adsm0o"><span>Pillow</span></li></ul></div> <div class="flex flex-row tablet:flex-col tablet:flex-wrap gap-1 w-full mb-1"> <div class="w-2/5 rounded tablet:w-full flex flex-col gap-1">${validate_component(Product_slide_show_pannel, "ProductMediaSlideShow").$$render($$result, { medias: media || [] }, {}, {})}</div>  <div class="bg-white w-3/5 rounded tablet:w-full p-4">${validate_component(Product_pricing_pannel, "ProductPricingPanel").$$render($$result, { productInformation }, {}, {})}</div></div>  <div class="bg-white w-full rounded p-4">${validate_component(Product_detail_pannel, "ProductDetailPanel").$$render(
    $$result,
    {
      selectedAttributes: productInformation.attributes
    },
    {},
    {}
  )}</div></div>`;
});
export {
  Page as default
};

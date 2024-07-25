import { c as compute_rest_props, d as compute_slots } from "./utils.js";
import { c as create_ssr_component, s as spread, d as escape_attribute_value, f as escape_object, b as add_attribute } from "./ssr.js";
const buttonActiveStates = {
  dark: "bg-gray-100",
  gray: "bg-gray-100",
  red: "bg-red-100",
  pink: "bg-pink-100",
  grape: "bg-purple-100",
  violet: "bg-violet-100",
  indigo: "bg-indigo-100",
  blue: "bg-blue-100",
  cyan: "bg-cyan-100",
  teal: "bg-teal-100",
  green: "bg-green-100",
  lime: "bg-lime-100",
  yellow: "bg-yellow-100",
  orange: "bg-orange-100"
};
const buttonVariantColorsMap = {
  filled: {
    dark: "text-white bg-gray-900",
    gray: "text-white bg-gray-500",
    red: "text-white bg-red-500",
    pink: "text-white bg-pink-500",
    grape: "text-white bg-purple-500",
    violet: "text-white bg-violet-500",
    indigo: "text-white bg-indigo-500",
    blue: "text-white bg-blue-500",
    cyan: "text-white bg-cyan-500",
    teal: "text-white bg-teal-500",
    green: "text-white bg-green-500",
    lime: "text-white bg-lime-500",
    yellow: "text-white bg-yellow-500",
    orange: "text-white bg-orange-500"
  },
  light: {
    dark: "text-gray-900 bg-gray-200",
    gray: "text-gray-500 bg-gray-200",
    red: "text-red-500 bg-red-200",
    pink: "text-pink-500 bg-pink-200",
    grape: "text-purple-500 bg-purple-200",
    violet: "text-violet-500 bg-violet-200",
    indigo: "text-indigo-500 bg-indigo-200",
    blue: "text-blue-500 bg-blue-200",
    cyan: "text-cyan-500 bg-cyan-200",
    teal: "text-teal-500 bg-teal-200",
    green: "text-green-500 bg-green-200",
    lime: "text-lime-500 bg-lime-200",
    yellow: "text-yellow-500 bg-yellow-200",
    orange: "text-orange-500 bg-orange-200"
  },
  outline: {
    dark: "text-gray-900 border-gray-900 border",
    gray: "text-gray-500 border-gray-500 border",
    red: "text-red-500 border-red-500 border",
    pink: "text-pink-500 border-pink-500 border",
    grape: "text-purple-500 border-purple-500 border",
    violet: "text-violet-500 border-violet-500 border",
    indigo: "text-indigo-500 border-indigo-500 border",
    blue: "text-blue-500 border-blue-500 border",
    cyan: "text-cyan-500 border-cyan-500 border",
    teal: "text-teal-500 border-teal-500 border",
    green: "text-green-500 border-green-500 border",
    lime: "text-lime-500 border-lime-500 border",
    yellow: "text-yellow-500 border-yellow-500 border",
    orange: "text-orange-500 border-orange-500 border"
  },
  subtle: {
    dark: "text-gray-900 bg-white hover:bg-gray-100",
    gray: "text-gray-500 bg-white hover:bg-gray-100",
    red: "text-red-500 bg-white hover:bg-red-100",
    pink: "text-pink-500 bg-white hover:bg-pink-100",
    grape: "text-purple-500 bg-white hover:bg-purple-100",
    violet: "text-violet-500 bg-white hover:bg-violet-100",
    indigo: "text-indigo-500 bg-white hover:bg-indigo-100",
    blue: "text-blue-500 bg-white hover:bg-blue-100",
    cyan: "text-cyan-500 bg-white hover:bg-cyan-100",
    teal: "text-teal-500 bg-white hover:bg-teal-100",
    green: "text-green-500 bg-white hover:bg-green-100",
    lime: "text-lime-500 bg-white hover:bg-lime-100",
    yellow: "text-yellow-500 bg-white hover:bg-yellow-100",
    orange: "text-orange-500 bg-white hover:bg-orange-100"
  },
  gradient: {
    dark: "text-white bg-gradient-to-r from-gray-900 to-gray-800",
    gray: "text-white bg-gradient-to-r from-gray-500 to-gray-400",
    red: "text-white bg-gradient-to-r from-red-500 to-red-400",
    pink: "text-white bg-gradient-to-r from-pink-500 to-pink-400",
    grape: "text-white bg-gradient-to-r from-purple-500 to-purple-400",
    violet: "text-white bg-gradient-to-r from-violet-500 to-violet-400",
    indigo: "text-white bg-gradient-to-r from-indigo-500 to-indigo-400",
    blue: "text-white bg-gradient-to-r from-blue-500 to-blue-400",
    cyan: "text-white bg-gradient-to-r from-cyan-500 to-cyan-400",
    teal: "text-white bg-gradient-to-r from-teal-500 to-teal-400",
    green: "text-white bg-gradient-to-r from-green-500 to-green-400",
    lime: "text-white bg-gradient-to-r from-lime-500 to-lime-400",
    yellow: "text-white bg-gradient-to-r from-yellow-500 to-yellow-400",
    orange: "text-white bg-gradient-to-r from-orange-500 to-orange-400"
  }
};
const css = {
  code: ".social-btn.svelte-z701x5{position:relative;display:flex;flex-grow:0;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-appearance:none;-moz-appearance:none;appearance:none;align-items:center;justify-content:center;text-align:center;font-weight:600;line-height:1;outline:2px solid transparent;outline-offset:2px}.social-btn.svelte-z701x5:active{--tw-scale-x:.98;--tw-scale-y:.98;transform:translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.social-btn.svelte-z701x5{-webkit-tap-highlight-color:transparent}.social-btn.svelte-z701x5:disabled,button.svelte-z701x5:disabled{cursor:not-allowed !important;user-select:none !important;-webkit-user-select:none !important;-moz-user-select:none !important;-ms-user-select:none !important;-khtml-user-select:none !important;pointer-events:none !important;-webkit-touch-callout:none !important;--tw-bg-opacity:1;background-color:rgb(229 231 235 / var(--tw-bg-opacity));--tw-text-opacity:1;color:rgb(156 163 175 / var(--tw-text-opacity))}.social-btn-xs.svelte-z701x5{height:30px;padding-top:0px;padding-bottom:0px;padding-left:14px;padding-right:14px;font-size:0.75rem;line-height:1rem}.social-btn-sm.svelte-z701x5{height:2.25rem;padding-top:0px;padding-bottom:0px;padding-left:18px;padding-right:18px;font-size:0.875rem;line-height:1.25rem}.social-btn-md.svelte-z701x5{height:42px;padding-top:0px;padding-bottom:0px;padding-left:22px;padding-right:22px;font-size:1rem;line-height:1.5rem}.social-btn-lg.svelte-z701x5{height:50px;padding-top:0px;padding-bottom:0px;padding-left:26px;padding-right:26px;font-size:1.125rem;line-height:1.75rem}.social-btn-xl.svelte-z701x5{height:60px;padding-top:0px;padding-bottom:0px;padding-left:2rem;padding-right:2rem;font-size:1.25rem;line-height:1.75rem}",
  map: '{"version":3,"file":"Button.svelte","sources":["Button.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { buttonActiveStates, buttonVariantColorsMap } from \\"./button.types\\";\\nexport let variant = \\"filled\\";\\nexport let ref = null;\\nexport let type = \\"button\\";\\nexport let tabIndex = \\"0\\";\\nexport let disabled = false;\\nexport let color = \\"blue\\";\\nexport let upper = false;\\nexport let size = \\"md\\";\\nexport let radius = \\"rounded-md\\";\\nexport let classes = \\"\\";\\nexport let loading = false;\\nexport let id = null;\\nexport let fullWidth = false;\\nexport let active = false;\\nconst activeBg = active ? buttonActiveStates[color] : \\"\\";\\n$: buttonProps = {\\n  tabIndex,\\n  ...$$restProps\\n};\\n<\/script>\\n\\n<button\\n\\tclass={`${activeBg} ${buttonVariantColorsMap[variant][color]} social-btn social-btn-${size} ${radius} ${classes}`}\\n\\tclass:uppercase={upper}\\n\\tclass:w-full={fullWidth}\\n\\t{type}\\n\\tbind:this={ref}\\n\\ton:click\\n\\ton:focus\\n\\ton:blur\\n\\ton:mouseover\\n\\ton:mouseenter\\n\\ton:mouseleave\\n\\t{disabled}\\n\\t{id}\\n\\t{...buttonProps}\\n>\\n\\t{#if loading}\\n\\t\\t<span class=\\"loading loading-dots loading-sm\\"></span>\\n\\t{:else}\\n\\t\\t{#if $$slots.startIcon}\\n\\t\\t\\t<span class=\\"mr-2 text-xl\\">\\n\\t\\t\\t\\t<slot name=\\"startIcon\\" />\\n\\t\\t\\t</span>\\n\\t\\t{/if}\\n\\t\\t<slot />\\n\\t\\t{#if $$slots.endIcon}\\n\\t\\t\\t<span class=\\"ml-2 text-xl\\">\\n\\t\\t\\t\\t<slot name=\\"endIcon\\" />\\n\\t\\t\\t</span>\\n\\t\\t{/if}\\n\\t{/if}\\n</button>\\n\\n<style lang=\\"postcss\\">\\n\\t.social-btn {\\n\\t\\tposition: relative;\\n\\t\\tdisplay: flex;\\n\\t\\tflex-grow: 0;\\n\\t\\tcursor: pointer;\\n\\t\\t-webkit-user-select: none;\\n\\t\\t   -moz-user-select: none;\\n\\t\\t        user-select: none;\\n\\t\\t-webkit-appearance: none;\\n\\t\\t   -moz-appearance: none;\\n\\t\\t        appearance: none;\\n\\t\\talign-items: center;\\n\\t\\tjustify-content: center;\\n\\t\\ttext-align: center;\\n\\t\\tfont-weight: 600;\\n\\t\\tline-height: 1;\\n\\t\\toutline: 2px solid transparent;\\n\\t\\toutline-offset: 2px;\\n}\\n.social-btn:active {\\n\\t\\t--tw-scale-x: .98;\\n\\t\\t--tw-scale-y: .98;\\n\\t\\ttransform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\\n}\\n\\t.social-btn {\\n\\t\\t-webkit-tap-highlight-color: transparent;\\n\\t}\\n\\t.social-btn:disabled,\\n\\tbutton:disabled {\\n\\t\\tcursor: not-allowed !important;\\n\\t\\tuser-select: none !important;\\n\\t\\t-webkit-user-select: none !important;\\n\\t\\t-moz-user-select: none !important;\\n\\t\\t-ms-user-select: none !important;\\n\\t\\t-khtml-user-select: none !important;\\n\\t\\tpointer-events: none !important;\\n\\t\\t-webkit-touch-callout: none !important;\\n\\t\\t--tw-bg-opacity: 1;\\n\\t\\tbackground-color: rgb(229 231 235 / var(--tw-bg-opacity));\\n\\t\\t--tw-text-opacity: 1;\\n\\t\\tcolor: rgb(156 163 175 / var(--tw-text-opacity));\\n\\t}\\n\\t.social-btn-xs {\\n\\t\\theight: 30px;\\n\\t\\tpadding-top: 0px;\\n\\t\\tpadding-bottom: 0px;\\n\\t\\tpadding-left: 14px;\\n\\t\\tpadding-right: 14px;\\n\\t\\tfont-size: 0.75rem;\\n\\t\\tline-height: 1rem;\\n}\\n\\t.social-btn-sm {\\n\\t\\theight: 2.25rem;\\n\\t\\tpadding-top: 0px;\\n\\t\\tpadding-bottom: 0px;\\n\\t\\tpadding-left: 18px;\\n\\t\\tpadding-right: 18px;\\n\\t\\tfont-size: 0.875rem;\\n\\t\\tline-height: 1.25rem;\\n}\\n\\t.social-btn-md {\\n\\t\\theight: 42px;\\n\\t\\tpadding-top: 0px;\\n\\t\\tpadding-bottom: 0px;\\n\\t\\tpadding-left: 22px;\\n\\t\\tpadding-right: 22px;\\n\\t\\tfont-size: 1rem;\\n\\t\\tline-height: 1.5rem;\\n}\\n\\t.social-btn-lg {\\n\\t\\theight: 50px;\\n\\t\\tpadding-top: 0px;\\n\\t\\tpadding-bottom: 0px;\\n\\t\\tpadding-left: 26px;\\n\\t\\tpadding-right: 26px;\\n\\t\\tfont-size: 1.125rem;\\n\\t\\tline-height: 1.75rem;\\n}\\n\\t.social-btn-xl {\\n\\t\\theight: 60px;\\n\\t\\tpadding-top: 0px;\\n\\t\\tpadding-bottom: 0px;\\n\\t\\tpadding-left: 2rem;\\n\\t\\tpadding-right: 2rem;\\n\\t\\tfont-size: 1.25rem;\\n\\t\\tline-height: 1.75rem;\\n}\\n</style>\\n"],"names":[],"mappings":"AAwDC,yBAAY,CACX,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,CAAC,CACZ,MAAM,CAAE,OAAO,CACf,mBAAmB,CAAE,IAAI,CACtB,gBAAgB,CAAE,IAAI,CACjB,WAAW,CAAE,IAAI,CACzB,kBAAkB,CAAE,IAAI,CACrB,eAAe,CAAE,IAAI,CAChB,UAAU,CAAE,IAAI,CACxB,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,UAAU,CAAE,MAAM,CAClB,WAAW,CAAE,GAAG,CAChB,WAAW,CAAE,CAAC,CACd,OAAO,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CAC9B,cAAc,CAAE,GAClB,CACA,yBAAW,OAAQ,CACjB,YAAY,CAAE,GAAG,CACjB,YAAY,CAAE,GAAG,CACjB,SAAS,CAAE,UAAU,IAAI,gBAAgB,CAAC,CAAC,CAAC,IAAI,gBAAgB,CAAC,CAAC,CAAC,OAAO,IAAI,WAAW,CAAC,CAAC,CAAC,MAAM,IAAI,WAAW,CAAC,CAAC,CAAC,MAAM,IAAI,WAAW,CAAC,CAAC,CAAC,OAAO,IAAI,YAAY,CAAC,CAAC,CAAC,OAAO,IAAI,YAAY,CAAC,CAChM,CACC,yBAAY,CACX,2BAA2B,CAAE,WAC9B,CACA,yBAAW,SAAS,CACpB,oBAAM,SAAU,CACf,MAAM,CAAE,WAAW,CAAC,UAAU,CAC9B,WAAW,CAAE,IAAI,CAAC,UAAU,CAC5B,mBAAmB,CAAE,IAAI,CAAC,UAAU,CACpC,gBAAgB,CAAE,IAAI,CAAC,UAAU,CACjC,eAAe,CAAE,IAAI,CAAC,UAAU,CAChC,kBAAkB,CAAE,IAAI,CAAC,UAAU,CACnC,cAAc,CAAE,IAAI,CAAC,UAAU,CAC/B,qBAAqB,CAAE,IAAI,CAAC,UAAU,CACtC,eAAe,CAAE,CAAC,CAClB,gBAAgB,CAAE,IAAI,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,IAAI,eAAe,CAAC,CAAC,CACzD,iBAAiB,CAAE,CAAC,CACpB,KAAK,CAAE,IAAI,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,IAAI,iBAAiB,CAAC,CAChD,CACA,4BAAe,CACd,MAAM,CAAE,IAAI,CACZ,WAAW,CAAE,GAAG,CAChB,cAAc,CAAE,GAAG,CACnB,YAAY,CAAE,IAAI,CAClB,aAAa,CAAE,IAAI,CACnB,SAAS,CAAE,OAAO,CAClB,WAAW,CAAE,IACf,CACC,4BAAe,CACd,MAAM,CAAE,OAAO,CACf,WAAW,CAAE,GAAG,CAChB,cAAc,CAAE,GAAG,CACnB,YAAY,CAAE,IAAI,CAClB,aAAa,CAAE,IAAI,CACnB,SAAS,CAAE,QAAQ,CACnB,WAAW,CAAE,OACf,CACC,4BAAe,CACd,MAAM,CAAE,IAAI,CACZ,WAAW,CAAE,GAAG,CAChB,cAAc,CAAE,GAAG,CACnB,YAAY,CAAE,IAAI,CAClB,aAAa,CAAE,IAAI,CACnB,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,MACf,CACC,4BAAe,CACd,MAAM,CAAE,IAAI,CACZ,WAAW,CAAE,GAAG,CAChB,cAAc,CAAE,GAAG,CACnB,YAAY,CAAE,IAAI,CAClB,aAAa,CAAE,IAAI,CACnB,SAAS,CAAE,QAAQ,CACnB,WAAW,CAAE,OACf,CACC,4BAAe,CACd,MAAM,CAAE,IAAI,CACZ,WAAW,CAAE,GAAG,CAChB,cAAc,CAAE,GAAG,CACnB,YAAY,CAAE,IAAI,CAClB,aAAa,CAAE,IAAI,CACnB,SAAS,CAAE,OAAO,CAClB,WAAW,CAAE,OACf"}'
};
const Button = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let buttonProps;
  let $$restProps = compute_rest_props($$props, [
    "variant",
    "ref",
    "type",
    "tabIndex",
    "disabled",
    "color",
    "upper",
    "size",
    "radius",
    "classes",
    "loading",
    "id",
    "fullWidth",
    "active"
  ]);
  let $$slots = compute_slots(slots);
  let { variant = "filled" } = $$props;
  let { ref = null } = $$props;
  let { type = "button" } = $$props;
  let { tabIndex = "0" } = $$props;
  let { disabled = false } = $$props;
  let { color = "blue" } = $$props;
  let { upper = false } = $$props;
  let { size = "md" } = $$props;
  let { radius = "rounded-md" } = $$props;
  let { classes = "" } = $$props;
  let { loading = false } = $$props;
  let { id = null } = $$props;
  let { fullWidth = false } = $$props;
  let { active = false } = $$props;
  const activeBg = active ? buttonActiveStates[color] : "";
  if ($$props.variant === void 0 && $$bindings.variant && variant !== void 0) $$bindings.variant(variant);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0) $$bindings.ref(ref);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0) $$bindings.type(type);
  if ($$props.tabIndex === void 0 && $$bindings.tabIndex && tabIndex !== void 0) $$bindings.tabIndex(tabIndex);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0) $$bindings.color(color);
  if ($$props.upper === void 0 && $$bindings.upper && upper !== void 0) $$bindings.upper(upper);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0) $$bindings.size(size);
  if ($$props.radius === void 0 && $$bindings.radius && radius !== void 0) $$bindings.radius(radius);
  if ($$props.classes === void 0 && $$bindings.classes && classes !== void 0) $$bindings.classes(classes);
  if ($$props.loading === void 0 && $$bindings.loading && loading !== void 0) $$bindings.loading(loading);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0) $$bindings.id(id);
  if ($$props.fullWidth === void 0 && $$bindings.fullWidth && fullWidth !== void 0) $$bindings.fullWidth(fullWidth);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0) $$bindings.active(active);
  $$result.css.add(css);
  buttonProps = { tabIndex, ...$$restProps };
  return `<button${spread(
    [
      {
        class: escape_attribute_value(`${activeBg} ${buttonVariantColorsMap[variant][color]} social-btn social-btn-${size} ${radius} ${classes}`)
      },
      { type: escape_attribute_value(type) },
      { disabled: disabled || null },
      { id: escape_attribute_value(id) },
      escape_object(buttonProps)
    ],
    {
      classes: (upper ? "uppercase" : "") + " " + (fullWidth ? "w-full" : "") + " svelte-z701x5"
    }
  )}${add_attribute("this", ref, 0)}>${loading ? `<span class="loading loading-dots loading-sm"></span>` : `${$$slots.startIcon ? `<span class="mr-2 text-xl">${slots.startIcon ? slots.startIcon({}) : ``}</span>` : ``} ${slots.default ? slots.default({}) : ``} ${$$slots.endIcon ? `<span class="ml-2 text-xl">${slots.endIcon ? slots.endIcon({}) : ``}</span>` : ``}`} </button>`;
});
export {
  Button as B
};

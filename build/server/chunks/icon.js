import { c as create_ssr_component, s as spread, d as escape_attribute_value, f as escape_object, e as escape, v as validate_component, m as missing_component } from "./ssr.js";
const Icon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { width = "1em" } = $$props;
  let { height = "1em" } = $$props;
  let { role = "img" } = $$props;
  let { ariaHidden = void 0 } = $$props;
  let { ariaLabel = void 0 } = $$props;
  let { ariaLabelledby = void 0 } = $$props;
  let { fill = "currentColor" } = $$props;
  let { title = null } = $$props;
  let { class: className = "" } = $$props;
  let { flipped = false } = $$props;
  let { icon } = $$props;
  if ($$props.width === void 0 && $$bindings.width && width !== void 0) $$bindings.width(width);
  if ($$props.height === void 0 && $$bindings.height && height !== void 0) $$bindings.height(height);
  if ($$props.role === void 0 && $$bindings.role && role !== void 0) $$bindings.role(role);
  if ($$props.ariaHidden === void 0 && $$bindings.ariaHidden && ariaHidden !== void 0) $$bindings.ariaHidden(ariaHidden);
  if ($$props.ariaLabel === void 0 && $$bindings.ariaLabel && ariaLabel !== void 0) $$bindings.ariaLabel(ariaLabel);
  if ($$props.ariaLabelledby === void 0 && $$bindings.ariaLabelledby && ariaLabelledby !== void 0) $$bindings.ariaLabelledby(ariaLabelledby);
  if ($$props.fill === void 0 && $$bindings.fill && fill !== void 0) $$bindings.fill(fill);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
  if ($$props.class === void 0 && $$bindings.class && className !== void 0) $$bindings.class(className);
  if ($$props.flipped === void 0 && $$bindings.flipped && flipped !== void 0) $$bindings.flipped(flipped);
  if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0) $$bindings.icon(icon);
  return `<svg${spread(
    [
      { role: escape_attribute_value(role) },
      {
        "aria-label": escape_attribute_value(ariaLabel)
      },
      {
        "aria-hidden": escape_attribute_value(ariaHidden)
      },
      {
        "aria-labelledby": escape_attribute_value(ariaLabelledby)
      },
      { xmlns: "http://www.w3.org/2000/svg" },
      { width: escape_attribute_value(width) },
      { height: escape_attribute_value(height) },
      { viewBox: "0 0 24 24" },
      escape_object($$props),
      { fill: escape_attribute_value(fill) },
      {
        class: escape(className, true) + " " + escape(flipped ? "-scale-x-100" : "", true)
      }
    ],
    {}
  )}>${title ? `<title>${escape(title)}</title>` : ``}${validate_component(icon || missing_component, "svelte:component").$$render($$result, {}, {}, {})}</svg>`;
});
export {
  Icon as I
};

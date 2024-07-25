import { c as create_ssr_component } from "./ssr.js";
const Tabler_alert_octagon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="m12.802 2.165l5.575 2.389c.48.206.863.589 1.07 1.07l2.388 5.574c.22.512.22 1.092 0 1.604l-2.389 5.575c-.206.48-.589.863-1.07 1.07l-5.574 2.388c-.512.22-1.092.22-1.604 0l-5.575-2.389a2.04 2.04 0 0 1-1.07-1.07l-2.388-5.574a2.04 2.04 0 0 1 0-1.604l2.389-5.575c.206-.48.589-.863 1.07-1.07l5.574-2.388a2.04 2.04 0 0 1 1.604 0M12 8v4m0 4h.01"></path>`;
});
const Tabler_info_circle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0m9-3h.01"></path><path d="M11 12h1v4h1"></path></g>`;
});
const Tabler_check = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="m5 12l5 5L20 7"></path>`;
});
const Tabler_alert_triangle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 9v4m-1.637-9.409L2.257 17.125a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636-2.87L13.637 3.59a1.914 1.914 0 0 0-3.274 0zM12 16h.01"></path>`;
});
const HTTPStatusSuccess = 200, HTTPStatusBadRequest = 400, HTTPStatusServerError = 500, HTTPStatusTemporaryRedirect = 307, HTTPStatusPermanentRedirect = 308;
const ACCESS_TOKEN_KEY = "sitename_token";
const CSRF_TOKEN_KEY = "sitename_csrf";
const REFRESH_TOKEN_KEY = "refreshToken";
const CHANNEL_KEY = "channel";
const defaultChannel = {
  name: "English",
  currency: "USD",
  locale: "en",
  slug: "default-channel",
  code: "en-US"
};
const SocialVariantIconsMap = {
  "error": Tabler_alert_octagon,
  "info": Tabler_info_circle,
  "warning": Tabler_alert_triangle,
  "success": Tabler_check
};
export {
  ACCESS_TOKEN_KEY as A,
  CHANNEL_KEY as C,
  HTTPStatusSuccess as H,
  REFRESH_TOKEN_KEY as R,
  SocialVariantIconsMap as S,
  HTTPStatusServerError as a,
  HTTPStatusBadRequest as b,
  HTTPStatusPermanentRedirect as c,
  defaultChannel as d,
  CSRF_TOKEN_KEY as e,
  HTTPStatusTemporaryRedirect as f
};

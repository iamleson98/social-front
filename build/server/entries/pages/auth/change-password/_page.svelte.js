import { s as subscribe } from "../../../../chunks/utils.js";
import { c as create_ssr_component, v as validate_component, b as add_attribute } from "../../../../chunks/ssr.js";
import "devalue";
import { g as goto } from "../../../../chunks/client2.js";
import { B as Button } from "../../../../chunks/Input.svelte_svelte_type_style_lang.js";
import { A as AppRoute } from "../../../../chunks/routes.js";
import { p as page } from "../../../../chunks/stores.js";
import { T as Tabler_lock } from "../../../../chunks/tabler--lock.js";
import { I as Icon } from "../../../../chunks/icon.js";
/* empty css                                                      */
import { A as Alert } from "../../../../chunks/alert.js";
import { H as HTTPStatusSuccess, b as HTTPStatusBadRequest, a as HTTPStatusServerError } from "../../../../chunks/consts.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { form } = $$props;
  let newPassword = "";
  let confirmNewPassword = "";
  let loading = false;
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (form?.status === HTTPStatusSuccess) {
        setTimeout(
          () => {
            goto(AppRoute.AUTH_SIGNIN, { invalidateAll: true });
          },
          3e3
        );
      }
    }
    $$rendered = `<div class="max-w-md min-w-80 rounded-md p-2"><h1 class="p-2 mb-4" data-svelte-h="svelte-1xnwy19">Set new password</h1> ${form && form?.status && [HTTPStatusBadRequest, HTTPStatusServerError].includes(form.status) ? `${validate_component(Alert, "Alert").$$render(
      $$result,
      {
        content: form?.error,
        variant: "error",
        classes: "mb-3"
      },
      {},
      {}
    )}` : `${form && form?.status === HTTPStatusSuccess ? `${validate_component(Alert, "Alert").$$render(
      $$result,
      {
        variant: "info",
        content: form?.data,
        classes: "mb-3"
      },
      {},
      {}
    )}` : ``}`} <form${add_attribute("action", `?email=${$page.url.searchParams.get("email")}&token=${$page.url.searchParams.get("token")}`, 0)} method="post"><label class="${[
      "input input-md flex w-full input-bordered items-center gap-2 mb-3",
      form?.error ? "input-error" : ""
    ].join(" ").trim()}" for="newPassword"><span>${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_lock }, {}, {})}</span> <input type="password" name="newPassword" class="grow" id="newPassword" placeholder="New Password" required ${loading ? "disabled" : ""}${add_attribute("value", newPassword, 0)}></label> <label class="${[
      "input input-md flex w-full input-bordered items-center gap-2 mb-3",
      form?.error ? "input-error" : ""
    ].join(" ").trim()}" for="confirmNewPassword"><span>${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_lock }, {}, {})}</span> <input type="password" name="confirmNewPassword" class="grow" id="confirmNewPassword" placeholder="Confirm New Password" required ${loading ? "disabled" : ""}${add_attribute("value", confirmNewPassword, 0)}></label> ${validate_component(Button, "Button").$$render(
      $$result,
      {
        variant: "filled",
        size: "sm",
        fullWidth: true,
        type: "submit",
        disabled: loading || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword,
        loading
      },
      {
        loading: ($$value) => {
          loading = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `Change Password`;
        }
      }
    )}</form></div>`;
  } while (!$$settled);
  $$unsubscribe_page();
  return $$rendered;
});
export {
  Page as default
};

import { s as subscribe } from "../../../../chunks/utils.js";
import { c as create_ssr_component, e as escape, v as validate_component, b as add_attribute } from "../../../../chunks/ssr.js";
import "devalue";
import "../../../../chunks/client2.js";
import { B as Button } from "../../../../chunks/Input.svelte_svelte_type_style_lang.js";
import { T as Tabler_email } from "../../../../chunks/tabler--email.js";
import { I as Icon } from "../../../../chunks/icon.js";
/* empty css                                                      */
import { A as Alert } from "../../../../chunks/alert.js";
import { b as HTTPStatusBadRequest, a as HTTPStatusServerError, H as HTTPStatusSuccess } from "../../../../chunks/consts.js";
import { d as t } from "../../../../chunks/index2.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $t, $$unsubscribe_t;
  $$unsubscribe_t = subscribe(t, (value) => $t = value);
  let { form } = $$props;
  let email = "";
  let loading = false;
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="max-w-md min-w-80 rounded-md p-2"><h1 class="p-2 mb-4">${escape($t("auth.resetPassword.title"))}</h1> ${form && form?.status && [HTTPStatusBadRequest, HTTPStatusServerError].includes(form.status) ? `${validate_component(Alert, "Alert").$$render(
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
        content: form?.data,
        variant: "info",
        classes: "mb-3"
      },
      {},
      {}
    )}` : ``}`} <form action="?/request_password_reset" method="post"><label class="${[
      "input input-md flex w-full input-bordered items-center gap-2 mb-3",
      form?.error ? "input-error" : ""
    ].join(" ").trim()}" for="email"><span>${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_email }, {}, {})}</span> <input type="email" name="email" class="grow" id="email"${add_attribute("placeholder", $t("auth.common.emailPlaceholder"), 0)} required ${loading ? "disabled" : ""}${add_attribute("value", email, 0)}></label> ${validate_component(Button, "Button").$$render(
      $$result,
      {
        variant: "filled",
        size: "sm",
        fullWidth: true,
        type: "submit",
        disabled: loading || !email.trim(),
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
          return `${escape($t("auth.resetPassword.btnText"))}`;
        }
      }
    )}</form></div>`;
  } while (!$$settled);
  $$unsubscribe_t();
  return $$rendered;
});
export {
  Page as default
};

import { s as subscribe } from "../../../../chunks/utils.js";
import { c as create_ssr_component, e as escape, v as validate_component, b as add_attribute } from "../../../../chunks/ssr.js";
import "devalue";
import "../../../../chunks/client2.js";
import { T as Tabler_email } from "../../../../chunks/tabler--email.js";
import { T as Tabler_open_eye, a as Tabler_eye_closed } from "../../../../chunks/tabler--open-eye.js";
import { T as Tabler_lock } from "../../../../chunks/tabler--lock.js";
import { I as Icon } from "../../../../chunks/icon.js";
import { B as Button } from "../../../../chunks/Input.svelte_svelte_type_style_lang.js";
import { A as AppRoute } from "../../../../chunks/routes.js";
import { b as HTTPStatusBadRequest, a as HTTPStatusServerError } from "../../../../chunks/consts.js";
import { A as Alert } from "../../../../chunks/alert.js";
import { d as t } from "../../../../chunks/index2.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let passwordDontMatch;
  let signupButtonDisabled;
  let $t, $$unsubscribe_t;
  $$unsubscribe_t = subscribe(t, (value) => $t = value);
  const passwordButtonIconsMap = { password: Tabler_open_eye, text: Tabler_eye_closed };
  let email = "";
  let password = "";
  let firstName = "";
  let lastName = "";
  let confirmPassword = "";
  let loading = false;
  let termAndPoliciesAgree = false;
  let passwordFieldType = "password";
  let { form } = $$props;
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    passwordDontMatch = password !== confirmPassword;
    signupButtonDisabled = loading || !firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword || !termAndPoliciesAgree;
    $$rendered = `<div class="max-w-md min-w-80 rounded-md p-2"><h1 class="p-2 mb-4">${escape($t("auth.signup.title"))}</h1> ${form && form.status && [HTTPStatusBadRequest, HTTPStatusServerError].includes(form.status) ? `${validate_component(Alert, "Alert").$$render(
      $$result,
      {
        variant: "error",
        content: form.error,
        classes: "mb-3"
      },
      {},
      {}
    )}` : ``} <form action="?/signup" method="post"><div class="mb-3"><div class="flex flex-row mobile-m:flex-col justify-between items-center"><label class="input input-md input-bordered w-[48%] flex mobile-m:w-full mb-3" for="first_name"><input type="text" class="grow" name="first_name" id="first_name"${add_attribute("placeholder", $t("auth.signup.firstNamePlaceholder"), 0)} required ${loading ? "disabled" : ""}${add_attribute("value", firstName, 0)}></label> <label class="input input-md input-bordered w-[48%] flex mobile-m:w-full mb-3" for="last_name"><input type="text" class="grow" name="last_name" id="last_name"${add_attribute("placeholder", $t("auth.signup.lastNamePlaceholder"), 0)} required ${loading ? "disabled" : ""}${add_attribute("value", lastName, 0)}></label></div> <label class="input input-md flex w-full input-bordered items-center gap-2 mb-3" for="email"><span>${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_email }, {}, {})}</span> <input type="email" class="grow" name="email" id="email"${add_attribute("placeholder", $t("auth.common.emailPlaceholder"), 0)} required ${loading ? "disabled" : ""}${add_attribute("value", email, 0)}></label> <label class="${[
      "input input-md flex w-full input-bordered items-center gap-2 mb-3",
      passwordDontMatch ? "input-error" : ""
    ].join(" ").trim()}" for="password"><span>${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_lock }, {}, {})}</span> <input${add_attribute("type", passwordFieldType, 0)} name="password" class="grow" id="password"${add_attribute("placeholder", $t("auth.common.passwordPlaceholder"), 0)}${add_attribute("value", password, 0)} required ${loading ? "disabled" : ""}> <button type="button" class="btn btn-xs btn-circle">${validate_component(Icon, "Icon").$$render(
      $$result,
      {
        icon: passwordButtonIconsMap[passwordFieldType]
      },
      {},
      {}
    )}</button></label> <label class="${[
      "input input-md flex w-full input-bordered items-center gap-2 mb-3",
      passwordDontMatch ? "input-error" : ""
    ].join(" ").trim()}" for="confirmPassword"><span>${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_lock }, {}, {})}</span> <input type="password" name="confirmPassword" class="grow" id="confirmPassword"${add_attribute("placeholder", $t("auth.signup.confirmPasswordPlaceholder"), 0)} required ${loading ? "disabled" : ""}${add_attribute("value", confirmPassword, 0)}></label> <label for="term_aggree" class="text-xs text-gray-500 select-none mr-1 mb-5 flex items-center"><span class="mr-2">${escape($t("auth.signup.agreeToTerms"))}</span> <input type="checkbox" class="toggle toggle-xs toggle-info" id="term_aggree" name="term_aggree"${add_attribute("checked", termAndPoliciesAgree, 1)}></label> ${validate_component(Button, "Button").$$render(
      $$result,
      {
        variant: "filled",
        type: "submit",
        size: "sm",
        fullWidth: true,
        disabled: signupButtonDisabled,
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
          return `${escape($t("auth.signup.signupButton"))}`;
        }
      }
    )}</div>  <div><span class="text-xs text-gray-500">${escape($t("auth.signup.alreadyHasAccount"))} <a${add_attribute("href", AppRoute.AUTH_SIGNIN, 0)} class="text-blue-600">${escape($t("auth.signin.title"))}</a></span></div></form></div>`;
  } while (!$$settled);
  $$unsubscribe_t();
  return $$rendered;
});
export {
  Page as default
};

import { s as subscribe } from "../../../../chunks/utils.js";
import { c as create_ssr_component, e as escape, v as validate_component, b as add_attribute } from "../../../../chunks/ssr.js";
import "devalue";
import { g as goto } from "../../../../chunks/client2.js";
import { B as Button } from "../../../../chunks/Input.svelte_svelte_type_style_lang.js";
import { u as userStore } from "../../../../chunks/user.js";
import { A as AppRoute } from "../../../../chunks/routes.js";
import { b as HTTPStatusBadRequest, a as HTTPStatusServerError } from "../../../../chunks/consts.js";
import { T as Tabler_email } from "../../../../chunks/tabler--email.js";
import { T as Tabler_open_eye, a as Tabler_eye_closed } from "../../../../chunks/tabler--open-eye.js";
import { T as Tabler_lock } from "../../../../chunks/tabler--lock.js";
import { I as Icon } from "../../../../chunks/icon.js";
/* empty css                                                      */
import { A as Alert } from "../../../../chunks/alert.js";
import { d as t } from "../../../../chunks/index2.js";
const Logo_facebook = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<path fill="white" d="M18 2a1 1 0 0 1 .993.883L19 3v4a1 1 0 0 1-.883.993L18 8h-3v1h3a1 1 0 0 1 .991 1.131l-.02.112l-1 4a1 1 0 0 1-.858.75L17 15h-2v6a1 1 0 0 1-.883.993L14 22h-4a1 1 0 0 1-.993-.883L9 21v-6H7a1 1 0 0 1-.993-.883L6 14v-4a1 1 0 0 1 .883-.993L7 9h2V8a6 6 0 0 1 5.775-5.996L15 2z"></path>`;
});
const Logo_google = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<path fill="white" d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1-1.265.06a6 6 0 1 0 2.103 6.836l.001-.004h-3.66a1 1 0 0 1-.992-.883L13 13v-2a1 1 0 0 1 1-1h6.945a1 1 0 0 1 .994.89q.06.55.061 1.11c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2"></path>`;
});
const Logo_twitter = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<path fill="white" d="M14.058 3.41c-1.807.767-2.995 2.453-3.056 4.38L11 7.972l-.243-.023C8.365 7.68 6.259 6.437 4.813 4.418a1 1 0 0 0-1.685.092l-.097.186l-.049.099c-.719 1.485-1.19 3.29-1.017 5.203l.03.273c.283 2.263 1.5 4.215 3.779 5.679l.173.107l-.081.043c-1.315.663-2.518.952-3.827.9c-1.056-.04-1.446 1.372-.518 1.878c3.598 1.961 7.461 2.566 10.792 1.6c4.06-1.18 7.152-4.223 8.335-8.433l.127-.495c.238-.993.372-2.006.401-3.024l.003-.332l.393-.779l.44-.862l.214-.434l.118-.247c.265-.565.456-1.033.574-1.43l.014-.056l.008-.018c.22-.593-.166-1.358-.941-1.358l-.122.007a1 1 0 0 0-.231.057l-.086.038a8 8 0 0 1-.88.36l-.356.115l-.271.08l-.772.214c-1.336-1.118-3.144-1.254-5.012-.554l-.211.084z"></path>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $t, $$unsubscribe_t;
  $$unsubscribe_t = subscribe(t, (value) => $t = value);
  const passwordButtonIconsMap = { password: Tabler_open_eye, text: Tabler_eye_closed };
  let rememberCheck = false;
  let passwordFieldType = "password";
  let email = "";
  let password = "";
  let loading = false;
  let { form } = $$props;
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (!form?.error && form?.user) {
        userStore.set(form.user);
        goto(AppRoute.HOME, { invalidateAll: true });
      }
    }
    $$rendered = `<div class="max-w-md min-w-80 rounded-md p-2"><h1 class="p-2 mb-4">${escape($t("auth.signin.title"))}</h1> ${form && form.status && [HTTPStatusBadRequest, HTTPStatusServerError].includes(form.status) ? `${validate_component(Alert, "Alert").$$render(
      $$result,
      {
        variant: "error",
        content: form.error,
        classes: "mb-3"
      },
      {},
      {}
    )}` : ``} <form action="?/signin" method="post"> <div class="mb-3"><label class="${[
      "input input-md flex w-full input-bordered items-center gap-2 mb-3",
      form?.error ? "input-error" : ""
    ].join(" ").trim()}" for="email"><span>${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_email }, {}, {})}</span> <input type="email" class="grow" name="email" id="email"${add_attribute("placeholder", $t("auth.common.emailPlaceholder"), 0)} required ${loading ? "disabled" : ""}${add_attribute("value", email, 0)}></label> <label class="${[
      "input input-md flex w-full input-bordered items-center gap-2 mb-1",
      form?.error ? "input-error" : ""
    ].join(" ").trim()}" for="password"><span>${validate_component(Icon, "Icon").$$render($$result, { icon: Tabler_lock }, {}, {})}</span> <input${add_attribute("type", passwordFieldType, 0)} name="password" class="grow" id="password"${add_attribute("placeholder", $t("auth.common.passwordPlaceholder"), 0)}${add_attribute("value", password, 0)} required ${loading ? "disabled" : ""}> <button type="button" class="btn btn-xs btn-circle">${validate_component(Icon, "Icon").$$render(
      $$result,
      {
        icon: passwordButtonIconsMap[passwordFieldType]
      },
      {},
      {}
    )}</button></label> <a${add_attribute("href", AppRoute.AUTH_RESET_PASSWORD, 0)} class="text-[10px] text-right block text-blue-600 mb-4">${escape($t("auth.signin.forgotPassword"))}</a> <label for="remember-me" class="text-xs text-gray-500 select-none mr-1 mb-5 flex items-center"><span class="mr-2">${escape($t("auth.signin.rememberMe"))}</span> <input type="checkbox" class="toggle toggle-xs toggle-info" id="remember-me" name="remember-me"${add_attribute("checked", rememberCheck, 1)}></label> ${validate_component(Button, "Button").$$render(
      $$result,
      {
        variant: "filled",
        type: "submit",
        size: "sm",
        fullWidth: true,
        disabled: loading || !email.trim() || !password,
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
          return `${escape($t("auth.signin.signinButton"))}`;
        }
      }
    )}</div> <div><span class="text-xs text-gray-500">${escape($t("auth.signin.noAccount"))} <a${add_attribute("href", AppRoute.AUTH_REGISTER, 0)} class="text-blue-600">${escape($t("auth.signup.title"))}</a></span></div></form> <div class="flex flex-row justify-between items-center">${validate_component(Button, "Button").$$render($$result, {}, {}, {
      default: () => {
        return `${validate_component(Icon, "Icon").$$render($$result, { icon: Logo_facebook }, {}, {})}`;
      }
    })} ${validate_component(Button, "Button").$$render($$result, {}, {}, {
      default: () => {
        return `${validate_component(Icon, "Icon").$$render($$result, { icon: Logo_google }, {}, {})}`;
      }
    })} ${validate_component(Button, "Button").$$render($$result, {}, {}, {
      default: () => {
        return `${validate_component(Icon, "Icon").$$render($$result, { icon: Logo_twitter }, {}, {})}`;
      }
    })}</div></div>`;
  } while (!$$settled);
  $$unsubscribe_t();
  return $$rendered;
});
export {
  Page as default
};

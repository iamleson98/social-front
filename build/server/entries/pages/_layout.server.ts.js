import { d as defaultChannel, H as HTTPStatusSuccess } from "../../chunks/consts.js";
import { l as locales, c as loadTranslations, t as translations } from "../../chunks/index2.js";
const load = async (event) => {
  let locale = (event.cookies.get("lang") || "").toLowerCase();
  if (!locale) {
    locale = `${`${event.request.headers.get("accept-language")}`.match(/[a-zA-Z]+?(?=-|_|,|;)/)}`.toLowerCase();
  }
  const supportedLocales = locales.get().map((l) => l.toLowerCase());
  if (!supportedLocales.includes(locale)) {
    locale = defaultChannel.locale;
  }
  await loadTranslations(locale, event.url.pathname);
  return {
    status: HTTPStatusSuccess,
    // user: meQueryResult.data?.me,
    i18n: { locale, route: event.url.pathname },
    translations: translations.get()
  };
};
export {
  load
};

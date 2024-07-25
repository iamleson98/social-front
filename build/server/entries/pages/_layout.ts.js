import { a as addTranslations, s as setRoute, b as setLocale } from "../../chunks/index2.js";
const load = async (event) => {
  const { i18n, translations } = event.data;
  const { locale, route } = i18n;
  addTranslations(translations);
  await setRoute(route);
  await setLocale(locale);
  return i18n;
};
export {
  load
};

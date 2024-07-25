import { defaultChannel, HTTPStatusSuccess } from "$lib/utils/consts";
import { loadTranslations, locales, translations } from "$lib/i18n";
import type { LayoutServerLoad } from "./$types";


export const load: LayoutServerLoad = async (event) => {
  // Try to get the locale from cookie
  let locale = (event.cookies.get('lang') || '').toLowerCase();
  // Get user preferred locale
  if (!locale) {
    locale = `${`${event.request.headers.get('accept-language')}`.match(/[a-zA-Z]+?(?=-|_|,|;)/)}`.toLowerCase();
  }
  // Get defined locales
  const supportedLocales = locales.get().map((l) => l.toLowerCase());
  // Use default locale if current locale is not supported
  if (!supportedLocales.includes(locale)) {
    locale = defaultChannel.locale;
  }

  await loadTranslations(locale, event.url.pathname); // keep this just before the `return`

  return {
    status: HTTPStatusSuccess,
    i18n: { locale, route: event.url.pathname },
    translations: translations.get(),
  };
}



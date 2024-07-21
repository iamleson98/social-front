import i18n, { type Config } from "sveltekit-i18n";


export const config: Config = {
  loaders: [
    {
      locale: "en",
      key: "lang",
      loader: async () => (await import("./lang.json")).default,
    },
    {
      locale: "vi",
      key: "auth",
      loader: async () => (await import("./vi/auth.json")).default,
    },
    {
      locale: "en",
      key: "auth",
      loader: async () => (await import("./en/auth.json")).default,
    }
  ],
};

export const { t, loading, locales, locale, loadTranslations, addTranslations, translations, setLocale, setRoute } = new i18n(config);

loading.subscribe(($loading) => $loading && console.log('Loading translations for the main instance...'));

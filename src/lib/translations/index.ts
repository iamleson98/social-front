import { dev } from '$app/environment';
import i18n, { type Config } from 'sveltekit-i18n';
import lang from './lang.json';

export const defaultLocal = 'en';

export const config: Config = {
  log: {
    level: dev ? 'warn' : 'error',
  },
  translations: {
    en: { lang },
    vi: { lang },
  },
  loaders: [
    {
      locale: 'en',
      key: 'auth',
      loader: async () => (await import('./en/auth.json')),
      routes: [],
    },
    {
      locale: 'vi',
      key: 'auth',
      loader: async () => (await import('./vi/auth.json')),
      routes: [],
    },
  ],
};

export const { t, loading, locales, locale, translations, loadTranslations, addTranslations, setLocale, setRoute } = new i18n(config);

loading.subscribe(($loading) => $loading && console.log('loading translations...'))

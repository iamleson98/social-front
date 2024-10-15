import { getCookieByKey } from "$lib/utils";
import { LANGUAGE_KEY } from "$lib/utils/consts";
import type { RequestEvent } from "@sveltejs/kit";
import { default as eng } from './en';
import { default as vie } from './vi';
import { LanguageCodeEnum } from "$lib/gql/graphql";


const placeholderRegex = /{{([a-zA-Z ]+)}}/g;

const findTemplatePlaceholders = (template: string): string[] => {
  const matches = template.matchAll(placeholderRegex);
  if (!matches) return [];

  const res = [];
  for (const value of matches) {
    res.push(value[1]);
  }

  return res;
};

const parseTranslationObject = (obj: Record<string, unknown>, trans: Translation, prefix: string = ""): Translation => {
  for (const key in obj) {
    const value = obj[key];
    const prf = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      const matches = findTemplatePlaceholders(value);
      trans[prf] = {
        template: value,
        args: matches.length ? new Set(matches) : null,
      }
    } else if (typeof value === 'object') {
      parseTranslationObject(value as Record<string, unknown>, trans, prf);
    }
  }

  return trans;
}


/**
 * Don't modify my content. I'm FROZEN
 */
const translations: Partial<Record<LanguageCodeEnum, Translation>> = {
  [LanguageCodeEnum.En]: parseTranslationObject(eng, {}),
  [LanguageCodeEnum.Vi]: parseTranslationObject(vie, {}),
};

/**
 * translation json should be in the format of:
 * @example
 *  {
 *    "key": "value",
 *    "key2": "this is template for {{myName}}",
 *    "key3":
 *    {
 *      "key4": "value4"
 *    }
 *  }
 */
type Translation = {
  [key: string]: {
    template: string;
    args: Set<string> | null;
  };
}

const commonTranslation = (language: LanguageCodeEnum, key: string, args?: Record<string, unknown>) => {
  const tranObject = translations[language]![key];
  if (tranObject === undefined) {
    throw new Error(`Translation key ${key} not found in ${language} translations`);
  }
  if (args && Object.keys(args).some(arg => !tranObject.args?.has(arg))) {
    throw new Error(`Translation key ${key} has no placeholders for ${Object.keys(args).join(', ')}`);
  }

  let result = tranObject.template;
  for (const key in args) {
    result = result.replace(`{{${key}}}`, args[key] as string);
  }

  return result;
};

/**
* Translate a key string to the current locale. Use
* @param key the key to the translation object
* @param args arguments for placeholders in the key. If key has no placeholders, this can be omitted.
* @returns translated string
*/
export const tClient = (key: string, args?: Record<string, unknown>): string => {
  const language: LanguageCodeEnum = (getCookieByKey(LANGUAGE_KEY) || LanguageCodeEnum.En) as LanguageCodeEnum;
  return commonTranslation(language, key, args);
};

/**
 * @param event svelte server load event
 * @param key translation key
 * @param args arguments for placeholders in the key. If key has no placeholders, this can be omitted.
 * @returns 
 */
export const tServer = (event: RequestEvent<Partial<Record<string, string>>, string | null>, key: string, args?: Record<string, unknown>): string => {
  const language = (event.cookies.get(LANGUAGE_KEY) || LanguageCodeEnum.En) as LanguageCodeEnum;
  return commonTranslation(language, key, args);
};

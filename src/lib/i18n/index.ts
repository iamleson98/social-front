import { default as english } from './en';
import { default as vietnamese } from './vi';
import { default as korean } from './ko';
import { default as japanese } from './ja';
import { LanguageCodeEnum } from "$lib/gql/graphql";
import { derived, writable } from "svelte/store";

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

export type LanguageCode = LanguageCodeEnum.Vi | LanguageCodeEnum.Ja | LanguageCodeEnum.Ko | LanguageCodeEnum.En | 'vi-VN' | 'en-US';

const englishTran = parseTranslationObject(english, {})

export const setTranslation = (language: LanguageCode) => {
  switch (language) {
    case LanguageCodeEnum.En:
    case 'en-US':
      innerStore.set(englishTran);
      break;
    case LanguageCodeEnum.Vi:
    case 'vi-VN':
      innerStore.set(parseTranslationObject(vietnamese, {}));
      break;
    case LanguageCodeEnum.Ko:
      innerStore.set(parseTranslationObject(korean, {}));
      break;
    case LanguageCodeEnum.Ja:
      innerStore.set(parseTranslationObject(japanese, {}));
      break;
  }
}

const innerStore = writable(englishTran);

export const tranFunc = derived(innerStore, ($trans) => {
  return (key: string, args?: Record<string, unknown>) => {
    const tranObject = $trans[key];
    if (tranObject === undefined) {
      throw new Error(`Translation key ${key} not found in translations`);
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
});

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

// const commonTranslation = (language: LanguageCode, key: string, args?: Record<string, unknown>) => {
//   const tranObject = translations[language][key];
//   if (tranObject === undefined) {
//     throw new Error(`Translation key ${key} not found in ${language} translations`);
//   }
//   if (args && Object.keys(args).some(arg => !tranObject.args?.has(arg))) {
//     throw new Error(`Translation key ${key} has no placeholders for ${Object.keys(args).join(', ')}`);
//   }

//   let result = tranObject.template;
//   for (const key in args) {
//     result = result.replace(`{{${key}}}`, args[key] as string);
//   }

//   return result;
// };

/**
* Translate a key string to the current locale.
* @NOTE you MUST use this function inside template
* @param key the key to the translation object
* @param args arguments for placeholders in the key. If key has no placeholders, this can be omitted.
* @returns translated string
*/
// export const tranFunc = (key: string, args?: Record<string, unknown>): string => {
//   const language = (getCookieByKey(LANGUAGE_KEY) || LanguageCodeEnum.En) as LanguageCode;
//   return commonTranslation(language, key, args);
// };

// export const tranFunc = readonly(tranFunc);

/**
 * @NOTE you MUST use this function inside server side code
 * @param event svelte server load event
 * @param key translation key
 * @param args arguments for placeholders in the key. If key has no placeholders, this can be omitted.
 * @returns 
 */
// export const tranFunc = (event: RequestEvent<Partial<Record<string, string>>, string | null>, key: string, args?: Record<string, unknown>): string => {
//   const language = (event.cookies.get(LANGUAGE_KEY) || LanguageCodeEnum.En) as LanguageCode;
//   return commonTranslation(language, key, args);
// };

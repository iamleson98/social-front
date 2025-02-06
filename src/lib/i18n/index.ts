import { default as english } from './en';
import { default as vietnamese } from './vi';
import { default as korean } from './ko';
import { default as japanese } from './ja';
import { LanguageCodeEnum } from "$lib/gql/graphql";
import { derived, writable } from "svelte/store";
import type { Component } from 'svelte';
import { JapanFlag, KoreaFlag, UsaFlag, VietnamFlag } from '$lib/components/icons/SvgOuterIcon';

const placeholderRegex = /{{([a-zA-Z ]+)}}/g;

type LanguageProps = { code: LanguageCode; name: string; icon: Component };

export const SUPPORTED_LANGUAGES: LanguageProps[] = [
  { icon: UsaFlag, name: 'English', code: LanguageCodeEnum.En },
  { icon: VietnamFlag, name: 'Tiếng Việt', code: LanguageCodeEnum.Vi },
  { icon: KoreaFlag, name: '한국어', code: LanguageCodeEnum.Ko },
  { icon: JapanFlag, name: '日本語', code: LanguageCodeEnum.Ja }
];

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
    const newPrefix = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      const matches = findTemplatePlaceholders(value);
      trans[newPrefix] = {
        template: value,
        args: matches.length ? new Set(matches) : null,
      }
    } else if (typeof value === 'object') {
      parseTranslationObject(value as Record<string, unknown>, trans, newPrefix);
    }
  }

  return trans;
}

export type LanguageCode = LanguageCodeEnum.Vi | LanguageCodeEnum.Ja | LanguageCodeEnum.Ko | LanguageCodeEnum.En | 'vi-VN' | 'en-US';

export const languageSupportInfer = (language: LanguageCode | LanguageCodeEnum) => {
  switch (language) {
    case LanguageCodeEnum.En:
    case 'en-US':
      return LanguageCodeEnum.En;
    case LanguageCodeEnum.Vi:
    case 'vi-VN':
      return LanguageCodeEnum.Vi;
    case LanguageCodeEnum.Ko:
      return LanguageCodeEnum.Ko;
    case LanguageCodeEnum.Ja:
      return LanguageCodeEnum.Ja;

    default:
      return null;
  }
}

const englishTran = parseTranslationObject(english, {})

export const switchLanguage = (language: LanguageCode) => {
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

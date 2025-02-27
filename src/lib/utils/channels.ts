import { CurrencyDollar, CurrencyDong, CurrencyEuror, CurrencyJpy, CurrencyKrw, type IconType } from "$lib/components/icons";
import { CountryCode, LanguageCodeEnum } from "$lib/gql/graphql";
import type { CurrencyCode } from "./consts";


export type ChannelProps = {
  slug: string;
  countries: CountryCode[];
  currency: CurrencyCode;
  currencySymbol: string;
  locale: LanguageCodeEnum;
  currencyIcon: IconType;
  defaultCountryCode: CountryCode;
}

export const DEFAULT_CHANNEL: ChannelProps = {
  slug: "vn",
  countries: [
    CountryCode.Vn,
  ],
  defaultCountryCode: CountryCode.Vn,
  currency: "VND",
  currencySymbol: "₫",
  locale: LanguageCodeEnum.Vi,
  currencyIcon: CurrencyDong
};

/**
 * NOTE: Those channels must match channels defined in bakend
 */
export const CHANNELS: ChannelProps[] = [
  DEFAULT_CHANNEL,
  {
    slug: "pl",
    countries: [
      CountryCode.Pl,
    ],
    currency: 'PLN',
    currencySymbol: "€",
    locale: LanguageCodeEnum.Pl,
    currencyIcon: CurrencyEuror,
    defaultCountryCode: CountryCode.Pl,
  },
  {
    slug: "us",
    countries: [
      CountryCode.Us,
    ],
    currency: "USD",
    currencySymbol: "$",
    locale: LanguageCodeEnum.En,
    currencyIcon: CurrencyDollar,
    defaultCountryCode: CountryCode.Us,
  },
  {
    slug: "kr",
    countries: [
      CountryCode.Kr,
    ],
    currency: "KRW",
    currencySymbol: "₩",
    locale: LanguageCodeEnum.Ko,
    currencyIcon: CurrencyKrw,
    defaultCountryCode: CountryCode.Kr,
  },
  {
    slug: "jp",
    countries: [
      CountryCode.Jp,
    ],
    currency: "JPY",
    currencySymbol: "¥",
    locale: LanguageCodeEnum.Ja,
    currencyIcon: CurrencyJpy,
    defaultCountryCode: CountryCode.Jp,
  }
];

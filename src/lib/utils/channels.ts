import { CurrencyDollar, CurrencyDong, CurrencyEuror, CurrencyJpy, CurrencyKrw, type IconType } from "$lib/components/icons";
import { CountryCode, LanguageCodeEnum } from "$lib/gql/graphql";
import type { CurrencyCode } from "./consts";


/**
 * NOTE: one channel has 1 country only
 */
export type ChannelProps = {
  slug: string;
  currency: CurrencyCode;
  currencySymbol: string;
  locale: LanguageCodeEnum;
  currencyIcon: IconType;
  defaultCountryCode: CountryCode;
  capitalLatLong: number[];
};

export const DEFAULT_CHANNEL: ChannelProps = {
  slug: "vn",
  defaultCountryCode: CountryCode.Vn,
  currency: "VND",
  currencySymbol: "₫",
  locale: LanguageCodeEnum.Vi,
  currencyIcon: CurrencyDong,
  capitalLatLong: [21.0278, 105.8342]
};

/**
 * NOTE: Those channels must match channels defined in bakend
 */
export const CHANNELS: ChannelProps[] = [
  DEFAULT_CHANNEL,
  {
    slug: "pl",
    currency: 'PLN',
    currencySymbol: "€",
    locale: LanguageCodeEnum.Pl,
    currencyIcon: CurrencyEuror,
    defaultCountryCode: CountryCode.Pl,
    capitalLatLong: [52.2297, 21.0122]
  },
  {
    slug: "us",
    currency: "USD",
    currencySymbol: "$",
    locale: LanguageCodeEnum.En,
    currencyIcon: CurrencyDollar,
    defaultCountryCode: CountryCode.Us,
    capitalLatLong: [47.7511, 120.7401]
  },
  {
    slug: "kr",
    currency: "KRW",
    currencySymbol: "₩",
    locale: LanguageCodeEnum.Ko,
    currencyIcon: CurrencyKrw,
    defaultCountryCode: CountryCode.Kr,
    capitalLatLong: [37.5503, 126.9971]
  },
  {
    slug: "jp",
    currency: "JPY",
    currencySymbol: "¥",
    locale: LanguageCodeEnum.Ja,
    currencyIcon: CurrencyJpy,
    defaultCountryCode: CountryCode.Jp,
    capitalLatLong: [35.6764, 139.6500]
  }
];

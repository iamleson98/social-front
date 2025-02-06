import { CurrencyDollar, CurrencyDong, CurrencyEuror, CurrencyJpy, CurrencyKrw } from "$lib/components/icons";
import { CountryCode, LanguageCodeEnum } from "$lib/gql/graphql";

export const DEFAULT_CHANNEL = {
  "slug": "channel-vietnam",
  "countries": [
    CountryCode.Vn,
  ],
  defaultCountryCode: CountryCode.Vn,
  "currency": "VND",
  "currencySymbol": "₫",
  "locale": LanguageCodeEnum.Vi,
  currencyIcon: CurrencyDong
};

type ChannelProps = typeof DEFAULT_CHANNEL;

/**
 * NOTE: When 
 */
export const CHANNELS = [
  DEFAULT_CHANNEL,
  {
    "slug": "channel-pln",
    "countries": [
      CountryCode.Pl,
    ],
    "currency": "PLN",
    "currencySymbol": "€",
    "locale": LanguageCodeEnum.Pl,
    currencyIcon: CurrencyEuror,
    defaultCountryCode: CountryCode.Pl,
  },
  {
    "slug": "default-channel",
    "countries": [
      CountryCode.Us,
    ],
    "currency": "USD",
    "currencySymbol": "$",
    "locale": LanguageCodeEnum.En,
    currencyIcon: CurrencyDollar,
    defaultCountryCode: CountryCode.Us,
  },
  {
    "slug": "channel-korea",
    "countries": [
      CountryCode.Kr,
    ],
    "currency": "KRW",
    "currencySymbol": "₩",
    "locale": LanguageCodeEnum.Ko,
    currencyIcon: CurrencyKrw,
    defaultCountryCode: CountryCode.Kr,
  },
  {
    "slug": "channel-japan",
    "countries": [
      CountryCode.Jp,
    ],
    "currency": "JPY",
    "currencySymbol": "¥",
    "locale": LanguageCodeEnum.Ja,
    currencyIcon: CurrencyJpy,
    defaultCountryCode: CountryCode.Jp,
  }
];

export const findChannel = (predicate: (chan: ChannelProps) => boolean, defaultChannel?: ChannelProps) => {
  return CHANNELS.find(predicate) ?? defaultChannel;
};

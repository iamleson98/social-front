import { CircleCheckFilled, CurrencyDollar, CurrencyDong, ExclamationCircleFilled, InfoCircleFilled, InfoTriangleFilled, type IconType } from "$lib/components/icons";
import { CountryCode } from "$lib/gql/graphql";

/**
 * all server methods MUST return this type, for consistency
 */
export type SocialResponse<T> = {
  status: number;
  error?: string;
  data?: T;
};

export const
  HTTPStatusSuccess = 200,
  HTTPStatusCreated = 201,
  HTTPStatusNoContent = 204,
  HTTPStatusBadRequest = 400,
  HTTPStatusUnauthorized = 401,
  HTTPStatusForbidden = 403,
  HTTPStatusNotFound = 404,
  HTTPStatusConflict = 409,
  HTTPStatusServerError = 500,
  HTTPStatusServiceUnavailable = 503,
  HTTPStatusGatewayTimeout = 504,
  HTTPStatusTemporaryRedirect = 307,
  HTTPStatusPermanentRedirect = 308;

export type SocialVariant = 'success' | 'error' | 'warning' | 'info';

export const ACCESS_TOKEN_KEY = "sitename_token";
export const CSRF_TOKEN_KEY = "sitename_csrf";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const CHANNEL_KEY = "channel";
export const LANGUAGE_KEY = "language";
export const COUNTRY_CODE_KEY = "country";


export type Channel = {
  name: string;
  currency: string;
  locale: string;
  slug: string;
  code: string;
  currencySymbol: Currency;
  countryCode: CountryCode;
};

export type Currency = '$' | '₫';

export const CurrencyIconMap: Record<Currency, IconType> = {
  '$': CurrencyDollar,
  '₫': CurrencyDong,
};

export const defaultChannel: Channel = {
  name: 'English',
  currency: 'USD',
  locale: 'en',
  slug: 'default-channel',
  code: 'en-US',
  currencySymbol: '$',
  countryCode: CountryCode.Us,
}

export const vnChannel: Channel = {
  name: 'Tiếng Việt',
  currency: 'VND',
  locale: 'vi',
  slug: 'vn',
  code: 'vi-VN',
  currencySymbol: '₫',
  countryCode: CountryCode.Vn,
}

export const channels = [
  defaultChannel,
  vnChannel,
]

export const SocialVariantIconsMap: Record<SocialVariant, IconType> = {
  'error': ExclamationCircleFilled,
  'info': InfoCircleFilled,
  'warning': InfoTriangleFilled,
  'success': CircleCheckFilled,
};

/**
 * Max prodyct point rating
 */
export const MAX_RATING = 5;

/** no rating yet  */
export const MIN_RATING = 0;

/** used for some input fields that requires event handling after a moment instead of always  */
export const DEBOUNCE_INPUT_TIME = 333;

import { CircleCheckFilled, CurrencyDollar, CurrencyDong, CurrencyEuror, ExclamationCircleFilled, InfoCircleFilled, InfoTriangleFilled, type IconType } from "$lib/components/icons";
import type { SocialSize } from "$lib/components/ui/common";
import { CountryCode, LanguageCodeEnum, type PaymentGatewayConfig } from "$lib/gql/graphql";
import { type PaymentMethodsResponse } from "@adyen/adyen-web";
import { AdyenCheckout } from "@adyen/adyen-web";


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


export type CurrencyCode = "USD" | "VND" | "PLN";
type CurrencySymbol = "$" | "₫" | "€";

export type Channel = {
  name: string;
  currency: CurrencyCode;
  locale: LanguageCodeEnum;
  slug: string;
  currencySymbol: CurrencySymbol;
  countryCode: CountryCode;
};

export const CurrencyIconMap: Record<CurrencyCode | string, IconType> = {
  'USD': CurrencyDollar,
  'VND': CurrencyDong,
  'PLN': CurrencyEuror,
};

export const CurrencyCodeSymbolMap: Record<CurrencyCode, CurrencySymbol> = {
  USD: '$',
  VND: '₫',
  PLN: '€',
};

export const defaultChannel: Channel = {
  name: 'English',
  currency: 'USD',
  locale: LanguageCodeEnum.EnUs,
  slug: 'default-channel',
  currencySymbol: '$',
  countryCode: CountryCode.Us,
};

export const vnChannel: Channel = {
  name: 'Tiếng Việt',
  currency: 'VND',
  locale: LanguageCodeEnum.Vi,
  slug: 'vn',
  currencySymbol: '₫',
  countryCode: CountryCode.Vn,
};

export const channels = [
  defaultChannel,
  vnChannel,
];

export const findChannelBySlug = (slug: string) => channels.find(channel => channel.slug === slug) || defaultChannel;

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

export const SIZE_MAP: Record<SocialSize, string> = {
  xs: 'h-7 text-xs',
  sm: 'h-9 text-sm',
  md: 'h-10 text-base',
  lg: 'h-12 text-lg',
  xl: 'h-14 text-xl',
};

export const ICON_BTN_SIZE_MAP: Record<SocialSize, string> = {
  xs: 'w-7!',
  sm: 'w-9!',
  md: 'w-10!',
  lg: 'w-12!',
  xl: 'w-14!',
};

export type PaymentStatus = "paidInFull" | "overpaid" | "none" | "authorized";

export const adyenGatewayId = "app.saleor.adyen";
export const stripeGatewayId = "app.saleor.stripe";
// export const adyenGatewayId = "mirumee.payments.adyen";

export type StripeGatewayId = typeof stripeGatewayId;
export type AdyenGatewayId = typeof adyenGatewayId;

export const supportedPaymentGateways = [adyenGatewayId, stripeGatewayId];
export const paidStatuses: PaymentStatus[] = ["overpaid", "paidInFull", "authorized"];

export interface AdyenGatewayInitializePayload extends Record<string, unknown> {
  paymentMethodsResponse: PaymentMethodsResponse;
  clientKey: string;
  environment: string;
}

export type ParsedAdyenGateway = ParsedPaymentGateway<AdyenGatewayId, AdyenGatewayInitializePayload>;
export type ParsedStripeGateway = ParsedPaymentGateway<StripeGatewayId, Record<string, unknown>>;

export type ParsedPaymentGateways = ReadonlyArray<ParsedAdyenGateway | ParsedStripeGateway>;

export interface ParsedPaymentGateway<ID extends string, TData extends Record<string, unknown>>
  extends Omit<PaymentGatewayConfig, "data" | "id"> {
  data: TData;
  id: ID;
};

export type AdyenCheckoutInstance = Awaited<ReturnType<typeof AdyenCheckout>>;

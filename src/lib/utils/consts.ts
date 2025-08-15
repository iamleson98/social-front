import { CircleCheckFilled, ExclamationCircleFilled, InfoCircleFilled, InfoTriangleFilled, type IconContent } from "$lib/components/icons";
import { CountryCode, LanguageCodeEnum, type PaymentGatewayConfig } from "$lib/gql/graphql";
import { type PaymentMethodsResponse } from "@adyen/adyen-web";
import { AdyenCheckout } from "@adyen/adyen-web";
import { CHANNELS } from "./channels";
import dayjs from "dayjs";

export const EASEPICK_CORE_STYLE_v1_2_1 = '/css/easepick-core/1.2.1.css';
export const EASEPICK_AMP_STYLE_v1_2_1 = '/css/easepick-amp/1.2.1.css';
export const EASEPICK_LOCK_STYLE_v1_2_1 = '/css/easepick-lock/1.2.1.css';
export const EASEPICK_TIME_STYLE_v1_2_1 = '/css/easepick-time/1.2.1.css';
export const EASEPICK_RANGE_STYLE_v1_2_1 = '/css/easepick-range/1.2.1.css';

export const IMAGE_EXTENSION_REGEX = /\.(jpg|jpeg|png|gif|bmp|tiff|webp|svg)$/g;

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


export type CurrencyCode = "USD" | "VND" | "PLN" | "EUR" | "JPY" | "KRW";
type CurrencySymbol = "$" | "₫" | "€" | "¥" | "₩";

export type Channel = {
  name: string;
  currency: CurrencyCode;
  locale: LanguageCodeEnum;
  slug: string;
  currencySymbol: CurrencySymbol;
  countryCode: CountryCode;
};

export type WeightUnit = 'kg' | 'lb' | 'g' | 'oz';

export const CurrencyIconMap = CHANNELS.reduce((acc, chan) => ({
  ...acc,
  [chan.currency as CurrencyCode]: chan.currencyIcon,
}), {} as Record<CurrencyCode, IconContent>);

export const SocialVariantIconsMap: Record<SocialVariant, IconContent> = {
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

export const LATITUDE = 'LATITUDE';
export const LONGITUDE = 'LONGITUDE';

export type NominatimOsmProps = {
  place_id: number;
  license: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: {
    village: string;
    county: string;
    city: string;
    country: string;
    country_code: string;
  };
  boundingbox: string[];
};

export const SitenameTimeFormat = 'MMM D, YYYY hh:mm A';
export const CommonEaseDatePickerFormat = 'YYYY-MM-DD hh:mm'
export const GiftcardUserEmailMetadataKey = 'customerEmail';
export const GiftcardChannelMetadataKey = 'channel';
export const ValidSlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const NOW = dayjs();
export const THIS_TIME_LAST_5_YEARS = NOW.subtract(5, 'year');
export const THIS_TIME_NEXT_5_YEARS = NOW.add(5, 'year');

import { Check, ErrorIcon, InforCircle, Warn, type IconType } from "$lib/components/icons";

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

export const defaultChannel = {
  name: 'English',
  currency: 'USD',
  locale: 'en',
  slug: 'default-channel',
  code: 'en-US'
}

export const vnChannel = {
  name: 'Tiếng Việt',
  currency: 'VND',
  locale: 'vi',
  slug: 'vn',
  code: 'vi-VN'
}

export const channels = [
  defaultChannel,
  vnChannel,
]

export const SocialVariantIconsMap: Record<SocialVariant, IconType> = {
  'error': ErrorIcon,
  'info': InforCircle,
  'warning': Warn,
  'success': Check,
};

/**
 * Max prodyct point rating
 */
export const MAX_RATING = 5;

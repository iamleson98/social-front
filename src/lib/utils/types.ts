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

/**
 * under the hood, this channel is `en-US`
 */
export const DEFAULT_CHANNEL_NAME = 'default-channel';
/**
 * The currency for default channel `en-US`
 */
export const DEFAULT_CURRENCY = "USD";

export const SocialVariantIconsMap: Record<SocialVariant, IconType> = {
  'error': ErrorIcon,
  'info': InforCircle,
  'warning': Warn,
  'success': Check,
};

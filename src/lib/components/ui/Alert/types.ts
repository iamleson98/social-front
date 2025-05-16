import type { SocialVariant } from "$lib/utils";


export const ALERT_VARIANT_STYLE_MAP: Record<SocialVariant, string> = {
  info: 'bg-blue-50 text-blue-600 border-blue-300 dark:bg-blue-700 dark:text-blue-400 dark:border-blue-400',
  success: 'bg-green-50 text-green-600 border-green-300 dark:bg-green-700 dark:text-green-400 dark:border-green-400',
  warning: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-700 dark:text-orange-400 dark:border-orange-400',
  error: 'bg-red-50 text-red-600 border-red-300 dark:bg-red-700 dark:text-red-400 dark:border-red-400',
};

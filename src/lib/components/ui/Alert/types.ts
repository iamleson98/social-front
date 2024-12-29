import type { SocialVariant } from "$lib/utils";
import type { SocialSize } from "../common";

export const ALERT_VARIANT_STYLE_MAP: Record<SocialVariant, string> = {
  info: 'bg-blue-50 text-blue-600 border-blue-300 dark:bg-blue-700 dark:text-blue-400 dark:border-blue-400',
  success: 'bg-green-50 text-green-600 border-green-300 dark:bg-green-700 dark:text-green-400 dark:border-green-400',
  warning: 'bg-yellow-50 text-yellow-600 border-yellow-300 dark:bg-yellow-700 dark:text-yellow-400 dark:border-yellow-400',
  error: 'bg-red-50 text-red-600 border-red-300 dark:bg-red-700 dark:text-red-400 dark:border-red-400',
};

export const ALERT_SIZE_STYLE_MAP: Record<SocialSize, Record<'icon' | 'container', string>> = {
  xs: {
    icon: 'w-[1rem] h-[1rem]',
    container: 'p-1 text-xs',
  },
  sm: {
    icon: 'w-[1.2rem] h-[1.2rem]',
    container: 'p-2 text-sm',
  },
  md: {
    icon: 'w-[1.5rem] h-[1.5rem]',
    container: 'p-3',
  },
  lg: {
    icon: 'w-[1.6rem] h-[1.6rem]',
    container: 'p-4 text-lg font-medium',
  },
  xl: {
    icon: 'w-[2rem] h-[2rem]',
    container: 'p-5 text-lg font-semibold',
  }
};

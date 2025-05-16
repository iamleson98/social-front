import type { IconContent } from "$lib/components/icons";
import type { HTMLAttributes } from "svelte/elements";
import type { ButtonVariant } from "../Button";
import type { SocialColor, SocialSize } from "../common";

export type BadgeVariant = ButtonVariant;

export type BadgeProps = {
  color?: SocialColor;
  text: string | number;
  onDismiss?: () => void;
  class?: string;
  variant?: BadgeVariant;
  ref?: HTMLSpanElement;
  startIcon?: IconContent;
  /** default to `sm` */
  size?: SocialSize;
  rounded?: boolean;
  disabled?: boolean | null;
} & HTMLAttributes<HTMLSpanElement>;

export const BADGE_SIZE_VARIANTS: Record<SocialSize, Record<'btn' | 'badge', string>> = {
  xs: {
    btn: 'p-[1px]',
    badge: 'text-[10px] py-0.5 px-1'
  },
  sm: {
    btn: 'p-[1.5px]',
    badge: 'text-xs py-[3px] px-1'
  },
  md: {
    btn: 'p-[2px]',
    badge: 'text-sm py-[3px] px-1.5'
  },
  lg: {
    btn: 'p-[2.5px]',
    badge: 'text-base py-1 px-1.5'
  },
  xl: {
    btn: 'p-[3px]',
    badge: 'text-lg py-1 px-2'
  }
};

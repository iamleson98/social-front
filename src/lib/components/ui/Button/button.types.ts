import type { ClickDebounceOpts } from '$lib/actions/input-debounce';
import type { IconContent } from '$lib/components/icons';
import type { SocialColor, SocialRadius, SocialSize } from '$lib/components/ui/common';
import { type Snippet } from 'svelte';
import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

export type ButtonVariant = 'filled' | 'light' | 'outline' | 'gradient';

export type ButtonProps = {
	/**
	 * @default filled
	 */
	variant?: ButtonVariant;
	ref?: HTMLButtonElement | HTMLAnchorElement;
	type?: 'button' | 'submit' | 'reset';
	color?: SocialColor;
	href?: string;
	/** weather to display text in uppercase */
	upper?: boolean;
	size?: SocialSize;
	radius?: SocialRadius;
	loading?: boolean;
	fullWidth?: boolean;
	children?: string | number | Snippet;
	startIcon?: IconContent;
	endIcon?: IconContent;
	clickDebounceOptions?: ClickDebounceOpts;
	/** to make your component interactive, in drag-drop supported places */
	['data-interactive']?: boolean;
} & HTMLButtonAttributes &
	HTMLAnchorAttributes;

export const ICON_BTN_SIZE_MAP: Record<SocialSize, string> = {
	xs: 'w-7!',
	sm: 'w-9!',
	md: 'w-10!',
	lg: 'w-12!',
	xl: 'w-14!',
};

export const INPUT_BUTTON_SIZE_MAP: Record<SocialSize | 'xxs', string> = {
	xxs: 'min-h-4 text-[11px]', // special case, for `xs` sized multi select that embed `xxs` input
	xs: 'min-h-7 text-xs',
	sm: 'min-h-9 text-sm',
	md: 'min-h-10 text-base',
	lg: 'min-h-12 text-lg',
	xl: 'min-h-14 text-xl',
};

/**
 * Variant/color combinations.
 *
 * Design notes (Sitename Design System v2):
 * - filled: solid tint + subtle inner shadow, darkens slightly on hover
 * - light: soft tinted background, saturates on hover
 * - outline: hairline border + colored text, fills softly on hover
 * - `blue` is the brand color and maps to the brand palette tokens
 */
export const BUTTON_VARIANT_COLORS_MAP: Record<ButtonVariant, Record<SocialColor, string>> = {
	filled: {
		dark: 'text-white bg-gray-900 shadow-xs hover:bg-gray-800',
		gray: 'text-white bg-gray-600 shadow-xs hover:bg-gray-700',
		red: 'text-white bg-red-600 shadow-xs hover:bg-red-700',
		pink: 'text-white bg-pink-600 shadow-xs hover:bg-pink-700',
		grape: 'text-white bg-purple-600 shadow-xs hover:bg-purple-700',
		violet: 'text-white bg-violet-600 shadow-xs hover:bg-violet-700',
		indigo: 'text-white bg-indigo-600 shadow-xs hover:bg-indigo-700',
		blue: 'text-white bg-brand-600 shadow-xs hover:bg-brand-700',
		cyan: 'text-white bg-cyan-600 shadow-xs hover:bg-cyan-700',
		teal: 'text-white bg-teal-600 shadow-xs hover:bg-teal-700',
		green: 'text-white bg-green-600 shadow-xs hover:bg-green-700',
		lime: 'text-lime-950 bg-lime-500 shadow-xs hover:bg-lime-600',
		yellow: 'text-yellow-950 bg-yellow-400 shadow-xs hover:bg-yellow-500',
		orange: 'text-white bg-orange-600 shadow-xs hover:bg-orange-700',
	},
	light: {
		dark: 'text-gray-900 bg-gray-100 hover:bg-gray-200',
		gray: 'text-gray-700 bg-gray-100 hover:bg-gray-200',
		red: 'text-red-700 bg-red-50 hover:bg-red-100',
		pink: 'text-pink-700 bg-pink-50 hover:bg-pink-100',
		grape: 'text-purple-700 bg-purple-50 hover:bg-purple-100',
		violet: 'text-violet-700 bg-violet-50 hover:bg-violet-100',
		indigo: 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100',
		blue: 'text-brand-700 bg-brand-50 hover:bg-brand-100',
		cyan: 'text-cyan-700 bg-cyan-50 hover:bg-cyan-100',
		teal: 'text-teal-700 bg-teal-50 hover:bg-teal-100',
		green: 'text-green-700 bg-green-50 hover:bg-green-100',
		lime: 'text-lime-700 bg-lime-50 hover:bg-lime-100',
		yellow: 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100',
		orange: 'text-orange-700 bg-orange-50 hover:bg-orange-100',
	},
	outline: {
		dark: 'text-gray-900 border border-gray-300 hover:border-gray-400 hover:bg-gray-50',
		gray: 'text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50',
		red: 'text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50',
		pink: 'text-pink-700 border border-pink-200 hover:border-pink-300 hover:bg-pink-50',
		grape: 'text-purple-700 border border-purple-200 hover:border-purple-300 hover:bg-purple-50',
		violet: 'text-violet-700 border border-violet-200 hover:border-violet-300 hover:bg-violet-50',
		indigo: 'text-indigo-700 border border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50',
		blue: 'text-brand-700 border border-brand-200 hover:border-brand-300 hover:bg-brand-50',
		cyan: 'text-cyan-700 border border-cyan-200 hover:border-cyan-300 hover:bg-cyan-50',
		teal: 'text-teal-700 border border-teal-200 hover:border-teal-300 hover:bg-teal-50',
		green: 'text-green-700 border border-green-200 hover:border-green-300 hover:bg-green-50',
		lime: 'text-lime-700 border border-lime-200 hover:border-lime-300 hover:bg-lime-50',
		yellow: 'text-yellow-700 border border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50',
		orange: 'text-orange-700 border border-orange-200 hover:border-orange-300 hover:bg-orange-50',
	},
	gradient: {
		dark: 'text-white bg-linear-to-r from-gray-900 to-gray-700 shadow-xs',
		gray: 'text-white bg-linear-to-r from-gray-600 to-gray-500 shadow-xs',
		red: 'text-white bg-linear-to-r from-red-600 to-red-500 shadow-xs',
		pink: 'text-white bg-linear-to-r from-pink-600 to-pink-500 shadow-xs',
		grape: 'text-white bg-linear-to-r from-purple-600 to-purple-500 shadow-xs',
		violet: 'text-white bg-linear-to-r from-violet-600 to-violet-500 shadow-xs',
		indigo: 'text-white bg-linear-to-r from-indigo-600 to-indigo-500 shadow-xs',
		blue: 'text-white bg-linear-to-r from-brand-600 to-brand-500 shadow-xs',
		cyan: 'text-white bg-linear-to-r from-cyan-600 to-cyan-500 shadow-xs',
		teal: 'text-white bg-linear-to-r from-teal-600 to-teal-500 shadow-xs',
		green: 'text-white bg-linear-to-r from-green-600 to-green-500 shadow-xs',
		lime: 'text-lime-950 bg-linear-to-r from-lime-500 to-lime-400 shadow-xs',
		yellow: 'text-yellow-950 bg-linear-to-r from-yellow-400 to-yellow-300 shadow-xs',
		orange: 'text-white bg-linear-to-r from-orange-600 to-orange-500 shadow-xs',
	},
};

/**
 * Icon size for ICON-ONLY buttons (no text inside). The glyph should fill
 * ~55-60% of the button face — the Material/DaisyUI convention for confident
 * tap targets — instead of matching the (smaller) text-baseline scale.
 */
export const ICON_ONLY_BUTTON_ICON_SIZE_MAP: Record<SocialSize | 'xxs', string> = {
	xxs: 'size-3', // 12px inside w-6
	xs: 'size-4.5', // 18px inside w-7 (28px) = 64%
	sm: 'size-5', // 20px inside w-9 (36px) = 56%
	md: 'size-6', // 24px inside w-10 (40px) = 60%
	lg: 'size-7', // 28px inside w-12 (48px) = 58%
	xl: 'size-8', // 32px inside w-14 (56px) = 57%
};

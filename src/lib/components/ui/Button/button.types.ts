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
} & HTMLButtonAttributes & HTMLAnchorAttributes;

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

export const BUTTON_VARIANT_COLORS_MAP: Record<ButtonVariant, Record<SocialColor, string>> = {
	filled: {
		dark: 'text-white bg-gray-900 focus:ring-gray-200',
		gray: 'text-white bg-gray-600 focus:ring-gray-200',
		red: 'text-white bg-red-600 focus:ring-red-200',
		pink: 'text-white bg-pink-600 focus:ring-pink-200',
		grape: 'text-white bg-purple-600 focus:ring-purple-200',
		violet: 'text-white bg-violet-600 focus:ring-violet-200',
		indigo: 'text-white bg-indigo-600 focus:ring-indigo-200',
		blue: 'text-white bg-blue-600 focus:ring-blue-200',
		cyan: 'text-white bg-cyan-600 focus:ring-cyan-200',
		teal: 'text-white bg-teal-600 focus:ring-teal-200',
		green: 'text-white bg-green-600 focus:ring-green-200',
		lime: 'text-white bg-lime-600 focus:ring-lime-200',
		yellow: 'text-white bg-yellow-600 focus:ring-yellow-200',
		orange: 'text-white bg-orange-600 focus:ring-orange-200',
	},
	light: {
		dark: 'text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-gray-400',
		gray: 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-400',
		red: 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-400',
		pink: 'text-pink-700 bg-pink-100 hover:bg-pink-200 focus:ring-pink-400',
		grape: 'text-purple-700 bg-purple-100 hover:bg-purple-200 focus:ring-purple-400',
		violet: 'text-violet-700 bg-violet-100 hover:bg-violet-200 focus:ring-violet-400',
		indigo: 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-400',
		blue: 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-400',
		cyan: 'text-cyan-700 bg-cyan-100 hover:bg-cyan-200 focus:ring-cyan-400',
		teal: 'text-teal-700 bg-teal-100 hover:bg-teal-200 focus:ring-teal-400',
		green: 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-400',
		lime: 'text-lime-700 bg-lime-100 hover:bg-lime-200 focus:ring-lime-400',
		yellow: 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:ring-yellow-400',
		orange: 'text-orange-700 bg-orange-100 hover:bg-orange-200 focus:ring-orange-400',
	},
	outline: {
		dark: 'text-gray-900 border-gray-900 border focus:ring-gray-200',
		gray: 'text-gray-700 border-gray-700 border focus:ring-gray-200',
		red: 'text-red-700 border-red-700 border focus:ring-red-200',
		pink: 'text-pink-700 border-pink-700 border focus:ring-pink-200',
		grape: 'text-purple-700 border-purple-700 border focus:ring-purple-200',
		violet: 'text-violet-700 border-violet-700 border focus:ring-violet-200',
		indigo: 'text-indigo-700 border-indigo-700 border focus:ring-indigo-200',
		blue: 'text-blue-700 border-blue-700 border focus:ring-blue-200',
		cyan: 'text-cyan-700 border-cyan-700 border focus:ring-cyan-200',
		teal: 'text-teal-700 border-teal-700 border focus:ring-teal-200',
		green: 'text-green-700 border-green-700 border focus:ring-green-200',
		lime: 'text-lime-700 border-lime-700 border focus:ring-lime-200',
		yellow: 'text-yellow-700 border-yellow-700 border focus:ring-yellow-200',
		orange: 'text-orange-700 border-orange-700 border focus:ring-orange-200',
	},
	gradient: {
		dark: 'text-white bg-linear-to-r from-gray-900 to-gray-800 focus:ring-gray-200',
		gray: 'text-white bg-linear-to-r from-gray-500 to-gray-400 focus:ring-gray-200',
		red: 'text-white bg-linear-to-r from-red-500 to-red-400 focus:ring-red-200',
		pink: 'text-white bg-linear-to-r from-pink-500 to-pink-400 focus:ring-pink-200',
		grape: 'text-white bg-linear-to-r from-purple-500 to-purple-400 focus:ring-purple-200',
		violet: 'text-white bg-linear-to-r from-violet-500 to-violet-400 focus:ring-violet-200',
		indigo: 'text-white bg-linear-to-r from-indigo-500 to-indigo-400 focus:ring-indigo-200',
		blue: 'text-white bg-linear-to-r from-blue-500 to-blue-400 focus:ring-blue-200',
		cyan: 'text-white bg-linear-to-r from-cyan-500 to-cyan-400 focus:ring-cyan-200',
		teal: 'text-white bg-linear-to-r from-teal-500 to-teal-400 focus:ring-teal-200',
		green: 'text-white bg-linear-to-r from-green-500 to-green-400 focus:ring-green-200',
		lime: 'text-white bg-linear-to-r from-lime-500 to-lime-400 focus:ring-lime-200',
		yellow: 'text-white bg-linear-to-r from-yellow-500 to-yellow-400 focus:ring-yellow-200',
		orange: 'text-white bg-linear-to-r from-orange-500 to-orange-400 focus:ring-orange-200',
	},
};

export const ICON_OF_BUTTON_SIZE_MAP: Record<SocialSize | 'xxs', string> = {
	xxs: 'size-2!',
	xs: 'size-4!',
	sm: 'size-4!',
	md: 'size-5!',
	lg: 'size-6!',
	xl: 'size-7!',
};

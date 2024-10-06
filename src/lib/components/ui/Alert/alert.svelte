<script lang="ts" module>
	import type { SocialSize } from '../common';
	const alertIconSizeMap: Record<SocialSize, number> = {
		xs: 1,
		sm: 1.2,
		md: 1.5,
		lg: 1.6,
		xl: 2
	};
</script>

<script lang="ts">
	import { Icon } from '$lib/components/icons';
	import { SocialVariantIconsMap, type SocialVariant } from '$lib/utils/consts';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { fly } from 'svelte/transition';

	type Props = {
		variant?: SocialVariant;
		children: Snippet;
		size?: SocialSize;
		bordered?: boolean;
	} & HTMLAttributes<HTMLDivElement>;

	let {
		variant = 'info',
		children,
		size = 'md',
		bordered = false,
		class: className = ''
	}: Props = $props();
</script>

<div
	class={`alert ${className} alert-${variant} alert-${size} ${bordered ? 'border' : '!border-none'}`}
	transition:fly={{ y: 10 }}
>
	<span class="flex items-center mr-2">
		<Icon
			icon={SocialVariantIconsMap[variant]}
			width={`${alertIconSizeMap[size]}rem`}
			height={`${alertIconSizeMap[size]}rem`}
		/>
	</span>
	{@render children()}
</div>

<style lang="postcss">
	.alert {
		@apply flex items-center rounded-lg;
	}
	.alert-info {
		@apply bg-blue-50 text-blue-600 border-blue-300 dark:bg-blue-700 dark:text-blue-400 dark:border-blue-400;
	}
	.alert-success {
		@apply bg-green-50 text-green-600 border-green-300 dark:bg-green-700 dark:text-green-400 dark:border-green-400;
	}
	.alert-warning {
		@apply bg-yellow-50 text-yellow-600 border-yellow-300 dark:bg-yellow-700 dark:text-yellow-400 dark:border-yellow-400;
	}
	.alert-error {
		@apply bg-red-50 text-red-600 border-red-300 dark:bg-red-700 dark:text-red-400 dark:border-red-400;
	}
	.alert-md {
		@apply p-3;
	}
	.alert-lg {
		@apply p-4 text-lg font-medium;
	}
	.alert-xl {
		@apply p-5 text-lg font-semibold;
	}
	.alert-xs {
		@apply p-1 text-xs;
	}
	.alert-sm {
		@apply p-2 text-sm;
	}
</style>

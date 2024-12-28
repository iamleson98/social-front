<script lang="ts">
	import { Icon } from '$lib/components/icons';
	import { SocialVariantIconsMap, type SocialVariant } from '$lib/utils/consts';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { fly } from 'svelte/transition';
	import { ALERT_VARIANT_STYLE_MAP, ALERT_SIZE_STYLE_MAP } from './types';
	import type { SocialSize } from '../common';

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
	class={`flex items-center rounded-lg ${className} ${ALERT_VARIANT_STYLE_MAP[variant]} ${ALERT_SIZE_STYLE_MAP[size].container} ${bordered ? 'border' : '!border-none'}`}
	transition:fly={{ y: 10 }}
>
	<span class="flex items-center mr-2">
		<Icon
			icon={SocialVariantIconsMap[variant]}
			class={`${ALERT_SIZE_STYLE_MAP[size].icon}`}
		/>
	</span>
	{@render children()}
</div>

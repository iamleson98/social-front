<script lang="ts">
	import { ChevronDown, ChevronUp, Icon } from '$lib/components/icons';
	import { slide } from 'svelte/transition';
	import type { AccordionProps } from './types';

	let {
		header,
		class: className = '',
		children,
		open = $bindable(true),
		fixed = false,
		headerIcon
	}: AccordionProps = $props();

	const toggle = () => {
		if (!fixed) open = !open;
	};
</script>

<div class={`${className} rounded-lg text-gray-800`}>
	<div
		class="flex items-center justify-between select-none cursor-pointer"
		role="button"
		tabindex="0"
		onclick={toggle}
		onkeyup={(evt) => evt.key === 'Enter' && toggle()}
	>
		<div class="text-sm font-semibold flex items-center">
			{#if headerIcon}
				<Icon icon={headerIcon} class="mr-2" />
			{/if}
			<div>
				{#if typeof header === 'string'}
					{header}
				{:else}
					{@render header()}
				{/if}
			</div>
		</div>
		<div>
			<Icon icon={open ? ChevronUp : ChevronDown} />
		</div>
	</div>

	{#if open}
		<div transition:slide class="mt-4 border-l-2 border-gray-200 pl-2">
			{@render children()}
		</div>
	{/if}
</div>

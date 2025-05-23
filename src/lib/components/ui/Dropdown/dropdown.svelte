<script lang="ts">
	import { Popover } from '$lib/components/ui/Popover';
	import MenuItem from './menuItem.svelte';
	import type { DropdownProps } from './types';

	let {
		children,
		options,
		open = $bindable(false),
		...rest
	}: DropdownProps = $props();
</script>

<Popover {...rest} bind:open>
	<div class="py-2 rounded-lg border border-gray-200 bg-white shadow-sm">
		{#if options}
			{#each options as option, idx (idx)}
				{@const { onclick, ...rest } = option}
				<MenuItem
					{...rest}
					onclick={() => {
						if (onclick) onclick();
						open = false;
					}}
				/>
			{/each}
		{:else}
			{@render children?.()}
		{/if}
	</div>
</Popover>

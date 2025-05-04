<script lang="ts">
	import { Popover } from '../Popover';
	import MenuItem from './menuItem.svelte';
	import type { DropdownProps } from './types';

	let { children, options, ...rest }: DropdownProps = $props();
</script>

<Popover {...rest}>
	<div class="py-2 rounded-lg border border-gray-200 bg-white shadow-sm">
		{#if options}
			{#each options as option}
				<MenuItem {...option} />
			{/each}
		{:else}
			{@render children?.()}
		{/if}
	</div>
</Popover>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import Dropdown, { type Props as DropDownProps } from './dropdown.svelte';

	type Props = {
		host: Snippet<[{ ref?: HTMLElement }]>;
	} & Omit<DropDownProps, 'parentRef'>;

	let parentRef = $state<HTMLElement>();

	let { host, ...rest }: Props = $props();
</script>

{@render host({ ref: parentRef })}

<!-- <Dropdown {...rest} {parentRef} /> -->

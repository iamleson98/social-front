<script lang="ts">
	import { shortcuts } from '$lib/actions/shortcut';
	import { SELECT_CLASSES, type SelectItemprops } from './types';

	let { disabled, optionClassName, onclick, label, ref }: SelectItemprops = $props();
</script>

<li
	aria-selected={false}
	role="option"
	aria-disabled={disabled}
	class={`${optionClassName} ${SELECT_CLASSES.selectOption}`}
	bind:this={ref}
	{onclick}
	onkeydown={(e) => e.key === 'Enter' && onclick?.()}
	tabindex="0"
	use:shortcuts={[
		{
			shortcut: { key: 'Enter' },
			onShortcut: () => onclick?.(),
		},
	]}
>
	{label}
</li>

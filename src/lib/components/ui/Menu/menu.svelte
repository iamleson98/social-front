<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { EventHandler } from 'svelte/elements';

	type Props = {
		trigger: Snippet<[TriggerIface]>;
		children: Snippet;
	};

	let { trigger, children }: Props = $props();
	let openMenu = $state(false);

	type TriggerIface = {
		onclick: EventHandler;
	};

	const handleClick = () => {
		console.log('clicked');
		openMenu = !openMenu;
	};
</script>

<div>
	{@render trigger({ onclick: handleClick })}

	{#if openMenu}
		{@render children()}
	{/if}
</div>

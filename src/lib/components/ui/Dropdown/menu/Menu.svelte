<script lang="ts" module>
	export type Props = {
		open: boolean;
		children?: any;
	};
</script>

<script lang="ts">
	let { open, children }: Props = $props();
</script>

{#if open}
	<div
		class="menu absolute top-full left-0 mt-1 pt-1 pb-1 bg-white shadow-md z-10 min-w-max rounded-md"
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}

<style>
	.menu {
		border: 1px solid #cdd7e1;
	}
</style>

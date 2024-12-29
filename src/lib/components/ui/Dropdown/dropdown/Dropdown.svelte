<script lang="ts" module>
	export type Props = {
		children?: any;
	};
</script>

<script lang="ts">
	let { children }: Props = $props();
</script>

<div class="relative inline-block">
	{#if children}
		{@render children()}
	{/if}
</div>

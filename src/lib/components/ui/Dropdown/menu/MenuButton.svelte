<script lang="ts" module>
	export type Props = {
		onClick?: () => void;
		children?: any;
		style?: string;
	};
</script>

<script lang="ts">
	let { onClick, children, style = 'bg-blue-500 text-white border-none ' }: Props = $props();
</script>

<button class="{style} py-2 px-4 cursor-pointer rounded-md" onclick={onClick}>
	{#if children}
		{@render children()}
	{/if}
</button>

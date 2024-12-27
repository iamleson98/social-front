<script lang="ts" module>
	export type Props = {
		onClick?: () => void;
		children?: any;
		style?: String;
	};
</script>

<script lang="ts">
	let { onClick, children, style = 'bg-blue-500 text-white border-none ' }: Props = $props();
</script>

<button class="{style} py-2 px-4 cursor-pointer rounded-md" onclick={onClick}>
	{@render children()}
</button>

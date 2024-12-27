<script lang="ts" module>
	export type Props = {
		onClick?: () => void;
		children?: any;
	};
</script>

<script lang="ts">
	let { onClick, children }: Props = $props();
</script>

<div class="menu-item py-1.5 px-4 cursor-pointer text-gray-700" onclick={onClick}>
	{@render children()}
</div>

<style>
	.menu-item:hover {
		background-color: #f0f3f8;
		color: black;
	}
</style>

<script lang="ts">
	export let width: string | number = '1em';
	export let height: string | number = '1em';
</script>

<svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 0 24 24" {...$$restProps}>
	<path
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="1.6"
		d="m5 12l5 5L20 7"
	/>
</svg>

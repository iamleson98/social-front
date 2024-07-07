<script lang="ts">
	export let width: string | number = '1em';
	export let height: string | number = '1em';
</script>

<svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 0 24 24" {...$$restProps}>
	<g
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="1.6"
	>
		<path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0-4 0" />
		<path d="M21 12q-3.6 6-9 6t-9-6q3.6-6 9-6t9 6" />
	</g>
</svg>

<script lang="ts">
  export let width: string | number = '1em';
  export let height: string | number = '1em';
</script>

<svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 0 24 24" {...$$props}>
	<g
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="1.6"
	>
		<path d="M5 12H3l9-9l9 9h-2M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
		<path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
	</g>
</svg>

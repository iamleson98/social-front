<script lang="ts">
  export let width: string | number = '1em';
  export let height: string | number = '1em';
</script>

<svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 0 24 24" {...$$props}>
	<path
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="1.6"
		d="M12 12v.01m2.828-2.838a4 4 0 0 1 0 5.656m2.829-8.485a8 8 0 0 1 0 11.314m-8.489-2.829a4 4 0 0 1 0-5.656m-2.831 8.485a8 8 0 0 1 0-11.314"
	/>
</svg>

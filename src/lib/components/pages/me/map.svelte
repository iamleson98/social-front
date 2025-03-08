<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';

	let L = $state<any>();
	let MAP = $state<any>();
	let mapContainer = $state<HTMLDivElement>();

	onMount(async () => {
		L = await import('leaflet');
		MAP = L.map(mapContainer).setView([51.505, -0.09], 13);
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(MAP);
	});
</script>

<div bind:this={mapContainer} class=" h-80 w-80"></div>

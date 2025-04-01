<script lang="ts">
	// import { onMount } from 'svelte';
	// import 'leaflet/dist/leaflet.css';
	import Map from '$lib/components/pages/settings/map.svelte';

	// let L = $state<any>();
	// let MAP = $state<any>();

	// onMount(async () => {
	// 	L = await import('leaflet');
	// 	MAP = L.map('map').setView([51.505, -0.09], 13);
	// 	L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	// 		attribution:
	// 			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	// 	}).addTo(MAP);
	// });
</script>

<!-- <div id="map" class=" h-80 w-80" /> -->

<Map />

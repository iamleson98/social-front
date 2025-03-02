<script lang="ts">
	import { onMount } from 'svelte';

	const lat = 52.22977;
	const lng = 21.01178;

	let config = {
		minZoom: 7,
		maxZoom: 18,
		zoomControl: false // zoom control off
	};
	const zoom = 18;

	// let mapRef = $state<HTMLDivElement>();
	let innerMap = $state<L.Map>();

	onMount(async () => {
		const ip = await import('leaflet')
    const L = ip.default;

		innerMap = L.map('map', config).setView([lat, lng], 13);

		// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		// 	attribution:
		// 		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		// }).addTo(innerMap);

		// L.control.zoom({ position: 'topright' }).addTo(innerMap);

		const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(innerMap);

		const marker = L.marker([51.5, -0.09])
			.addTo(innerMap)
			.bindPopup('<b>Hello world!</b><br />I am a popup.')
			.openPopup();

		const circle = L.circle([51.508, -0.11], {
			color: 'red',
			fillColor: '#f03',
			fillOpacity: 0.5,
			radius: 500
		})
			.addTo(innerMap)
			.bindPopup('I am a circle.');

		const polygon = L.polygon([
			[51.509, -0.08],
			[51.503, -0.06],
			[51.51, -0.047]
		])
			.addTo(innerMap)
			.bindPopup('I am a polygon.');

		const popup = L.popup()
			.setLatLng([51.513, -0.09])
			.setContent('I am a standalone popup.')
			.openOn(innerMap);
	});
</script>

<svelte:head>
	<!-- <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /> -->
	<!-- <link
		rel="stylesheet"
		href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
		integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
		crossorigin=""
	/>
	<script
		src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
		integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
		crossorigin=""
	></script> -->
</svelte:head>

<div id="map" class="overflow-hidden"></div>

<style>
	.leaflet-container {
		height: 400px;
		width: 600px;
		max-width: 100%;
		max-height: 100%;
	}
</style>

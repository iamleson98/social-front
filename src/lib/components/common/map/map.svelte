<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';

	type Props = {
		class?: string;
		canGetCurrentLocation?: boolean;
	};

	let { class: className = '', canGetCurrentLocation = false }: Props = $props();

	const config = {
		minZoom: 2,
		maxZoom: 18
	};

	// let L = $state<any>();
	let MAP = $state<any>();
	let mapContainer = $state<HTMLDivElement>();

	onMount(async () => {
		const L = await import('leaflet');

    // init map
		MAP = L.map(mapContainer!, config).setView(
			[51.505, -0.09],
			(config.maxZoom + config.minZoom) / 2
		);

    // add tile layer
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(MAP);

    // handle config props
    if (canGetCurrentLocation) {

    }
	});
</script>

<div id="map" class="{className} "></div>

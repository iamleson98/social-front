<script lang="ts">
	// import type {Hst} from '@histoire/plugin-svelte';
	import { LeafletMap, TileLayer } from 'svelte-leafletjs';
	import type { MapOptions } from 'leaflet';
	// import { DEFAULT_TILE_LAYER_OPTIONS, DEFAULT_TILE_URL } from './common.js';

	// export let Hst: Hst;

	const mapOptions: MapOptions = {
		center: [1.364917, 103.822872],
		zoom: 11
	};

	const options = {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	};
</script>

<!-- <Hst.Story group="top"> -->
<LeafletMap options={mapOptions}>
	<TileLayer url={`https://tile.openstreetmap.org/{z}/{x}/{y}.png`} {options} />
</LeafletMap>
<!-- </Hst.Story> -->

<style>
  @import 'leaflet/dist/leaflet.css';
</style>

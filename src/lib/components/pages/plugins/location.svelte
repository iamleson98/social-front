<script lang="ts">
	import { PUBLIC_NOMINATIM_OSM_API } from '$env/static/public';
	import {
		HTTPStatusSuccess,
		LATITUDE,
		LONGITUDE,
		type NominatimOsmProps
	} from '$lib/utils/consts';
	import { LOCATION_KEY } from '$lib/utils/preferences';
	import { onMount } from 'svelte';

	type Props = {
		forceAskLocation?: boolean;
		retryCount?: number;
		onSuccess?: (data: NominatimOsmProps) => void;
	};

	let { forceAskLocation = false, retryCount = 3, onSuccess }: Props = $props();

	const getLocationSuccess = async (
		{ coords: { latitude, longitude } }: GeolocationPosition,
		tryTime = 0
	) => {
		if (tryTime >= retryCount) return;

		// save local storage
		localStorage.setItem(
			LOCATION_KEY,
			JSON.stringify({
				latitude,
				longitude
			})
		);

		const fetchResult = await fetch(
			PUBLIC_NOMINATIM_OSM_API.replace(LATITUDE, latitude.toString()).replace(
				LONGITUDE,
				longitude.toString()
			)
		);

		if (fetchResult.status === HTTPStatusSuccess) {
			onSuccess?.(await fetchResult.json());
			return;
		}

		setTimeout(
			() =>
				getLocationSuccess({ coords: { latitude, longitude } } as GeolocationPosition, tryTime + 1),
			1100
		);
	};

	const getGeoLocationErr = (err: GeolocationPositionError) => {
		localStorage.setItem(LOCATION_KEY, 'false');
	};

	onMount(async () => {
		const location = localStorage.getItem(LOCATION_KEY);
		if (location === 'false') {
			if (!forceAskLocation) return;
		} else if (location?.length) {
			getLocationSuccess({ coords: JSON.parse(location) } as GeolocationPosition);
			return;
		}

		if (typeof navigator === 'undefined') return;

		navigator.geolocation.getCurrentPosition(getLocationSuccess, getGeoLocationErr, {
			enableHighAccuracy: true
		});
	});
</script>

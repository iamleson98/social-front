<script lang="ts">
	import { PUBLIC_NOMINATIM_OSM_API } from '$env/static/public';
	import { CountryCode } from '$lib/gql/graphql';
	import { CHANNELS } from '$lib/utils/channels';
	import {
		CHANNEL_KEY,
		HTTPStatusSuccess,
		LATITUDE,
		LONGITUDE,
		type NominatimOsmProps
	} from '$lib/utils/consts';
	import { clientSideSetCookie } from '$lib/utils/cookies';
	import { LOCATION_KEY } from '$lib/utils/preferences';
	import { onMount } from 'svelte';

	type Props = {
		/** when user denies browser location service, the `location` will be set to string 'false', in local storage.
		 * If this prop is set to `true`, the app gona asks user again for their permission on location access
		 */
		forceAskLocation?: boolean;
		/** Number of times to retry getting location via Open Street Api Call */
		retryCount?: number;
		onSuccess?: (data: NominatimOsmProps) => void;
		onError?: () => void;
	};

	let { forceAskLocation = false, retryCount = 3, onSuccess, onError }: Props = $props();

	const handleBrowserGetLocationSuccess = async (geoPosition: GeolocationPosition, tryTime = 0) => {
		if (tryTime >= retryCount) {
			onError?.();
			return;
		}

		const {
			coords: { latitude, longitude }
		} = geoPosition;

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
			const locationData: NominatimOsmProps = await fetchResult.json();
			onSuccess?.(locationData);

			// set default channel
			for (const chan of CHANNELS) {
				const countryCode = locationData.address?.country_code.toUpperCase();
				if (chan.countries.includes(countryCode as CountryCode)) {
					clientSideSetCookie(CHANNEL_KEY, chan.slug, {
						secure: true,
						expires: new Date(3000, 1, 1),
						sameSite: 'lax',
						path: '/'
					});
					return;
				}
			}
			return;
		}

		setTimeout(
			() => handleBrowserGetLocationSuccess(geoPosition as GeolocationPosition, tryTime + 1),
			1100 // Open Street API allows 1 request/sec
		);
	};

	const handleBrowserGetLocationError = (err: GeolocationPositionError) => {
		if (err.code === 1)
			// user deny location service
			localStorage.setItem(LOCATION_KEY, 'false');

		onError?.();
	};

	onMount(async () => {
		const location = localStorage.getItem(LOCATION_KEY);
		if (location === 'false') {
			if (!forceAskLocation) {
				onError?.();
				return;
			}
		} else if (location?.length) {
			handleBrowserGetLocationSuccess({ coords: JSON.parse(location) } as GeolocationPosition);
			return;
		}

		if (typeof navigator === 'undefined') {
			onError?.();
			return;
		}

		navigator.geolocation.getCurrentPosition(
			handleBrowserGetLocationSuccess,
			handleBrowserGetLocationError,
			{
				enableHighAccuracy: true
			}
		);
	});
</script>

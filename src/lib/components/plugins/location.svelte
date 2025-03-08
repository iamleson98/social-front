<script lang="ts">
	import { PUBLIC_NOMINATIM_OSM_API } from '$env/static/public';
	import { CountryCode } from '$lib/gql/graphql';
	import { CHANNELS, DEFAULT_CHANNEL } from '$lib/utils/channels';
	import {
		CHANNEL_KEY,
		COUNTRY_CODE_KEY,
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
		onError?: (type: 'timeout' | 'other' | 'user-deny') => void;
		askPosition?: boolean;
	};

	let { forceAskLocation = false, retryCount = 3, onSuccess, onError }: Props = $props();

	const handleBrowserGetLocationSuccess = async (geoPosition: GeolocationPosition, tryTime = 0) => {
		if (tryTime >= retryCount) {
			onError?.('timeout');
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

			let channelSlug = DEFAULT_CHANNEL.slug;
			let countryCode = DEFAULT_CHANNEL.defaultCountryCode;

			const suportedChannel = CHANNELS.find(
				(chan) =>
					chan.defaultCountryCode ===
					(locationData.address.country_code.toUpperCase() as CountryCode)
			);
			if (suportedChannel) {
				channelSlug = suportedChannel.slug;
				countryCode = locationData.address?.country_code.toUpperCase() as CountryCode;
			}

			clientSideSetCookie(CHANNEL_KEY, channelSlug, {
				secure: true,
				expires: new Date(3000, 1, 1),
				sameSite: 'lax',
				path: '/'
			});
			clientSideSetCookie(COUNTRY_CODE_KEY, countryCode, {
				secure: true,
				expires: new Date(3000, 1, 1),
				sameSite: 'lax',
				path: '/'
			});

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

		onError?.('user-deny');
	};

	onMount(() => {
		const location = localStorage.getItem(LOCATION_KEY);
		if (location === 'false') {
			if (!forceAskLocation) {
				onError?.('user-deny');
				return;
			}
		} else if (location?.length) {
			handleBrowserGetLocationSuccess({ coords: JSON.parse(location) } as GeolocationPosition);
			return;
		}

		if (typeof navigator === 'undefined') {
			onError?.('other');
			return;
		}

		// if (forceAskLocation)
		navigator.geolocation.getCurrentPosition(
			handleBrowserGetLocationSuccess,
			handleBrowserGetLocationError,
			{
				enableHighAccuracy: true
			}
		);
	});
</script>

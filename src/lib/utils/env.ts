import { browser } from '$app/environment';
import { env as publicEnv } from '$env/dynamic/public';

/**
 * Runtime-safe accessors for PUBLIC_ environment variables.
 *
 * Why not `$env/static/public`? Static env modules are resolved at BUILD time —
 * when a variable is absent from the build environment (e.g. a Cloudflare CI
 * worker without dashboard variables) the bundler fails the entire build with
 * `MISSING_EXPORT`. `$env/dynamic/public` resolves at RUNTIME instead:
 *
 *  - dev:        values come from local `.env*` files (unchanged behaviour)
 *  - SSR server: values come from the platform environment (Cloudflare vars)
 *  - browser:    values are serialized into the server-rendered bootstrap
 *
 * Missing variables therefore degrade gracefully through the fallbacks below
 * instead of breaking the build. Values that have no safe fallback return an
 * empty string and the callers already handle that case.
 *
 * `window.location.origin` is a sound fallback for "this site's own URL":
 * on the storefront the site IS the local/store-front URL, in dev and prod.
 */

const currentOrigin = (): string | undefined =>
	typeof window === 'undefined' ? undefined : window.location.origin;

/** Canonical public URL of the storefront (falls back to the current origin in the browser). */
export const getStoreFrontUrl = (): string => publicEnv.PUBLIC_STORE_FRONT_URL || currentOrigin() || '';

/** Base URL used for auth e-mail redirects (falls back to the current origin in the browser). */
export const getLocalUrl = (): string => publicEnv.PUBLIC_LOCAL_URL || currentOrigin() || '';

/** GraphQL API endpoint — no safe fallback exists; callers must handle the empty string. */
export const getGraphqlApiEndPoint = (): string => publicEnv.PUBLIC_GRAPHQL_API_END_POINT || '';

/** Default public Nominatim (OpenStreetMap) reverse-geocoding endpoint template. */
export const DEFAULT_NOMINATIM_OSM_API =
	'https://nominatim.openstreetmap.org/reverse?lat=LATITUDE&lon=LONGITUDE&format=json';

/**
 * Nominatim reverse-geocoding URL template with `{LATITUDE}`/`{LONGITUDE}` placeholders
 * (see `LATITUDE`/`LONGITUDE` in consts). Defaults to the public OSM endpoint.
 */
export const getNominatimOsmApi = (): string =>
	publicEnv.PUBLIC_NOMINATIM_OSM_API || DEFAULT_NOMINATIM_OSM_API;

import { PUBLIC_BOOKING_API_URL } from '$env/static/public';
import Client4 from './client4';

/**
 * Some python backend APIs return result with additional `errors` field. This type is for those `errors`
 */
export type PythonBackendError = {
	errors?:
		| {
				field?: string | null;
				message?: string | null;
		  }[]
		| null;
};

/**
 * Common result type for backend python call only.
 */
type PythonBackendResult = unknown & PythonBackendError;

/**
 * Common result type for svelte frontend side calls only.
 */
export type SvelteBackendResult<T extends PythonBackendResult> = {
	error?: string;
	data?: T | null;
	loading: boolean;
};

/**
 * http client for interacting with the backend.
 */
const BackendHttpClient = new Client4();
BackendHttpClient.setUrl(PUBLIC_BOOKING_API_URL);

export { BackendHttpClient };

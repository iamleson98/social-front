
declare namespace App {
	interface PageData {
		meta: {
			title: string;
			description: string;
			imageUrl?: string;
		};
	}

	interface Error {
		message: string;
		code?: number | string;
	}
}

declare module '$env/static/public' {
	export const VITE_GRAPHQL_API_END_POINT: string;
	export const VITE_LOCAL_URL: string;
}
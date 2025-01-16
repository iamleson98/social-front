export const AppRoute = {
	AUTH_SIGNIN: '/auth/signin',
	AUTH_REGISTER: '/auth/signup',
	AUTH_CHANGE_PASSWORD: '/auth/change-password',
	AUTH_RESET_PASSWORD: '/auth/reset-password',
	AUTH_REFRESH_TOKEN: '/auth/refresh-token',
	AUTH_SIGNOUT: '/auth/signout',
	APP_ROUTE_PREFIX: '/(app)',

	HOME: '/',
	TRENDING: '/trending',
	SETTINGS: '/settings',
	SHOPPING_CART: '/shopping-cart',

	PRODUCTS: '/products',
	CATEGORIES: '/categories',

	CHECKOUT: '/checkout',
	CHECKOUT_GET_OR_CREATE: '/checkout/get-or-create',
	CHECKOUT_ADD_LINES_TO_CART: '/checkout/add-lines-to-cart',

	/** API endpoint for custom graphql server */
	GRAPHQL_API: '/api/graphql'
};

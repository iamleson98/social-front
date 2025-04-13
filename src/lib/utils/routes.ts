import { buildHomePageLink, buildLinkWithRespectToChannel } from "./utils";

export const AppRoute = {
	AUTH_SIGNIN: () => buildLinkWithRespectToChannel('auth/signin'),
	AUTH_REGISTER: () => buildLinkWithRespectToChannel('auth/signup'),
	AUTH_CHANGE_PASSWORD: () => buildLinkWithRespectToChannel('auth/change-password'),
	AUTH_RESET_PASSWORD: () => buildLinkWithRespectToChannel('auth/reset-password'),
	AUTH_REFRESH_TOKEN: () => buildLinkWithRespectToChannel('auth/refresh-token'),
	AUTH_SIGNOUT: () => buildLinkWithRespectToChannel('auth/signout'),

	ME: () => buildLinkWithRespectToChannel('settings'),
	MY_ORDERS: () => buildLinkWithRespectToChannel('settings/orders'),
	ME_PREFERENCES: () => buildLinkWithRespectToChannel('settings/preferences'),
	ME_SUPPORT: () => buildLinkWithRespectToChannel('settings/supports'),
	ME_SUPPORT_NEW: () => buildLinkWithRespectToChannel('settings/supports/new-ticket'),
	SETTINGS_PRODUCTS: () => buildLinkWithRespectToChannel('settings/products'),
	SETTINGS_PRODUCTS_EDIT: (id: string) => buildLinkWithRespectToChannel(`settings/products/${id}`),
	SETTINGS_PRODUCTS_NEW: () => buildLinkWithRespectToChannel('settings/products/new'),
	SETTINGS_CONTRACTS: () => buildLinkWithRespectToChannel('settings/contracts'),
	SETTINGS_CONTRACTS_NEW: () => buildLinkWithRespectToChannel('settings/contracts/new'),
	SETTINGS_CONFIGS: () => buildLinkWithRespectToChannel('settings/configs'),
	SETTINGS_CONFIGS_CHANNELS: () => buildLinkWithRespectToChannel('settings/configs/channels'),
	SETTINGS_CONFIGS_STAFFS: () => buildLinkWithRespectToChannel('settings/configs/staffs'),

	HOME: () => buildHomePageLink(),
	TRENDING: () => buildLinkWithRespectToChannel('trending'),
	SETTINGS: () => buildLinkWithRespectToChannel('settings'),
	SHOPPING_CART: () => buildLinkWithRespectToChannel('shopping-cart'),

	PRODUCTS: () => buildLinkWithRespectToChannel('products'),
	PRODUCT_DETAILS: (slug: string) => buildLinkWithRespectToChannel(`products/${slug}`),
	PRODUCT_ATTRIBUTES: (slug: string) => buildLinkWithRespectToChannel(`products/${slug}/attributes`),
	PRODUCT_FEEDBACKS: (slug: string) => buildLinkWithRespectToChannel(`products/${slug}/customer-feedbacks`),
	PRODUCT_PACKAGING: (slug: string) => buildLinkWithRespectToChannel(`products/${slug}/packaging`),

	CATEGORIES: () => buildLinkWithRespectToChannel('categories'),
	CATEGORY_DETAILS: (slug: string) => buildLinkWithRespectToChannel(`categories/${slug}`),
	SUB_CATEGORIES: (slug: string) => buildLinkWithRespectToChannel(`categories/${slug}/sub-categories`),
	CATEGORY_INFO: (slug: string) => buildLinkWithRespectToChannel(`categories/${slug}/info`),

	CHECKOUT: () => buildLinkWithRespectToChannel('checkout'),

	/**
	 * uris below are for API calls
	 */
	CHECKOUT_GET_OR_CREATE: '/checkout/get-or-create',
	CHECKOUT_ADD_LINES_TO_CART: '/checkout/add-lines-to-cart',
	GRAPHQL_API: '/api/graphql'
};

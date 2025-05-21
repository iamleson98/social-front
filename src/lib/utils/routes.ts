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
	SETTINGS_CONFIGS_CHANNEL_DETAILS: (slug: string) => buildLinkWithRespectToChannel(`settings/configs/channels/${slug}`),
	SETTINGS_CONFIGS_CHANNEL_NEW: () => buildLinkWithRespectToChannel('settings/configs/channels/new-channel'),
	SETTINGS_CONFIGS_STAFFS: () => buildLinkWithRespectToChannel('settings/configs/staffs'),
	SETTINGS_CONFIGS_STAFF_DETAILS: (id: string) => buildLinkWithRespectToChannel(`settings/configs/staffs/${id}`),
	SETTINGS_CONFIGS_STAFF_NEW: () => buildLinkWithRespectToChannel('settings/configs/staffs/new'),
	SETTINGS_CONFIGS_USERS: () => buildLinkWithRespectToChannel('settings/configs/customers'),
	SETTINGS_CONFIGS_USER_DETAILS: (id: string) => buildLinkWithRespectToChannel(`settings/configs/customers/${id}`),
	SETTINGS_CONFIGS_USER_NEW: () => buildLinkWithRespectToChannel('settings/configs/customers/new'),
	SETTINGS_ORDERS: () => buildLinkWithRespectToChannel('settings/shop-orders'),
	SETTINGS_ORDERS_NEW: () => buildLinkWithRespectToChannel('settings/shop-orders/new'),
	SETTINGS_ORDERS_EDIT: (id: string) => buildLinkWithRespectToChannel(`settings/shop-orders/${id}`),
	SETTINGS_ORDERS_DETAILS: (id: string) => buildLinkWithRespectToChannel(`settings/shop-orders/${id}`),
	SETTINGS_CONFIGS_CATEGORIES: () => buildLinkWithRespectToChannel('settings/configs/categories'),
	SETTINGS_CONFIGS_CATEGORY_DETAILS: (id: string) => buildLinkWithRespectToChannel(`settings/configs/categories/${id}`),
	SETTINGS_CONFIGS_CATEGORY_NEW: () => buildLinkWithRespectToChannel('settings/configs/categories/new'),
	SETTINGS_CONFIGS_COLLECTIONS: () => buildLinkWithRespectToChannel('settings/configs/collections'),
	SETTINGS_CONFIGS_COLLECTION_DETAILS: (id: string) => buildLinkWithRespectToChannel(`settings/configs/collections/${id}`),
	SETTINGS_CONFIGS_COLLECTION_NEW: () => buildLinkWithRespectToChannel('settings/configs/collections/new'),
	SETTINGS_CONFIGS_WAREHOUSES: () => buildLinkWithRespectToChannel('settings/configs/warehouses'),
	SETTINGS_CONFIGS_WAREHOUSE_DETAILS: (id: string) => buildLinkWithRespectToChannel(`settings/configs/warehouses/${id}`),
	SETTINGS_CONFIGS_WAREHOUSE_NEW: () => buildLinkWithRespectToChannel('settings/configs/warehouses/new'),
	SETTINGS_CONFIGS_ATTRIBUTES: () => buildLinkWithRespectToChannel('settings/configs/attributes'),
	SETTINGS_CONFIGS_ATTRIBUTE_DETAILS: (id: string) => buildLinkWithRespectToChannel(`settings/configs/attributes/${id}`),
	SETTINGS_CONFIGS_ATTRIBUTE_NEW: () => buildLinkWithRespectToChannel('settings/configs/attributes/new'),

	SETTINGS_CONFIGS_GIFTCARDS: () => buildLinkWithRespectToChannel('settings/configs/giftcards'),
	SETTINGS_CONFIGS_GIFTCARD_NEW: () => buildLinkWithRespectToChannel('settings/configs/giftcards/new'),
	SETTINGS_CONFIGS_GIFTCARD_DETAIL: (id: string) => buildLinkWithRespectToChannel(`settings/configs/giftcards/${id}`),

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

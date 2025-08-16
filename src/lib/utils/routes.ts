import type { ShippingMethodTypeEnum } from "$lib/gql/graphql";
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
	SETTINGS_PRODUCTS_EDIT: (slug: string) => buildLinkWithRespectToChannel(`settings/products/${slug}`),
	SETTINGS_PRODUCTS_NEW: () => buildLinkWithRespectToChannel('settings/products/new'),

	SETTINGS_PRODUCT_TYPES: () => buildLinkWithRespectToChannel('settings/product-types'),
	SETTINGS_PRODUCT_TYPE_EDIT: (id: string) => buildLinkWithRespectToChannel(`settings/product-types/${id}`),
	SETTINGS_PRODUCT_TYPE_NEW: () => buildLinkWithRespectToChannel('settings/product-types/new'),

	SETTINGS_CONTRACTS: () => buildLinkWithRespectToChannel('settings/contracts'),
	SETTINGS_CONTRACTS_NEW: () => buildLinkWithRespectToChannel('settings/contracts/new'),

	// SETTINGS_CONFIGS: () => buildLinkWithRespectToChannel('settings/configs'),

	SETTINGS_CONFIGS_CHANNELS: () => buildLinkWithRespectToChannel('settings/channels'),
	SETTINGS_CONFIGS_CHANNEL_DETAILS: (slug: string) => buildLinkWithRespectToChannel(`settings/channels/${slug}`),
	SETTINGS_CONFIGS_CHANNEL_NEW: () => buildLinkWithRespectToChannel('settings/channels/new-channel'),

	SETTINGS_CONFIGS_STAFFS: () => buildLinkWithRespectToChannel('settings/staffs'),
	SETTINGS_CONFIGS_STAFF_DETAILS: (id: string) => buildLinkWithRespectToChannel(`settings/staffs/${id}`),
	SETTINGS_CONFIGS_STAFF_NEW: () => buildLinkWithRespectToChannel('settings/staffs/new'),

	SETTINGS_CONFIGS_USERS: () => buildLinkWithRespectToChannel('settings/customers'),
	SETTINGS_CONFIGS_USER_DETAILS: (id: string) => buildLinkWithRespectToChannel(`settings/customers/${id}`),
	SETTINGS_CONFIGS_USER_NEW: () => buildLinkWithRespectToChannel('settings/customers/new'),

	SETTINGS_ORDERS: () => buildLinkWithRespectToChannel('settings/shop-orders'),
	SETTINGS_ORDERS_NEW: () => buildLinkWithRespectToChannel('settings/shop-orders/new'),
	SETTINGS_ORDERS_DETAILS: (id: string) => buildLinkWithRespectToChannel(`settings/shop-orders/${id}`),

	SETTINGS_SHOP_DRAFT_ORDERS: () => buildLinkWithRespectToChannel('settings/draft-orders'),

	SETTINGS_CONFIGS_CATEGORIES: () => buildLinkWithRespectToChannel('settings/categories'),
	SETTINGS_CONFIGS_CATEGORY_DETAILS: (id: string) => buildLinkWithRespectToChannel(`settings/categories/${id}`),
	SETTINGS_CONFIGS_CATEGORY_NEW: () => buildLinkWithRespectToChannel('settings/categories/new'),

	SETTINGS_CONFIGS_COLLECTIONS: () => buildLinkWithRespectToChannel('settings/collections'),
	SETTINGS_CONFIGS_COLLECTION_DETAILS: (id: string) => buildLinkWithRespectToChannel(`settings/collections/${id}`),
	SETTINGS_CONFIGS_COLLECTION_NEW: () => buildLinkWithRespectToChannel('settings/collections/new'),

	SETTINGS_CONFIGS_WAREHOUSES: () => buildLinkWithRespectToChannel('settings/warehouses'),
	SETTINGS_CONFIGS_WAREHOUSE_DETAILS: (id: string) => buildLinkWithRespectToChannel(`settings/warehouses/${id}`),
	SETTINGS_CONFIGS_WAREHOUSE_NEW: () => buildLinkWithRespectToChannel('settings/warehouses/new'),

	SETTINGS_CONFIGS_SHIPPING_ZONES: () => buildLinkWithRespectToChannel('settings/shipping-zones'),
	SETTINGS_CONFIGS_SHIPPING_ZONE_DETAILS: (id: string) => buildLinkWithRespectToChannel(`settings/shipping-zones/${id}`),
	SETTINGS_CONFIGS_SHIPPING_ZONE_NEW: () => buildLinkWithRespectToChannel('settings/shipping-zones/new'),

	SETTINGS_CONFIGS_SHIPPING_ZONE_METHOD_DETAILS: (zoneId: string, id: string) => buildLinkWithRespectToChannel(`settings/shipping-zones/${zoneId}/methods/${id}`),
	SETTINGS_CONFIGS_SHIPPING_ZONE_METHOD_NEW: (zoneId: string, type: ShippingMethodTypeEnum) => buildLinkWithRespectToChannel(`settings/shipping-zones/${zoneId}/methods/new?type=${type}`),

	SETTINGS_CONFIGS_ATTRIBUTES: () => buildLinkWithRespectToChannel('settings/attributes'),
	SETTINGS_CONFIGS_ATTRIBUTE_DETAILS: (id: string) => buildLinkWithRespectToChannel(`settings/attributes/${id}`),
	SETTINGS_CONFIGS_ATTRIBUTE_NEW: () => buildLinkWithRespectToChannel('settings/attributes/new'),

	SETTINGS_CONFIGS_GIFTCARDS: () => buildLinkWithRespectToChannel('settings/giftcards'),
	SETTINGS_CONFIGS_GIFTCARD_NEW: (customerEmail?: string) => buildLinkWithRespectToChannel(customerEmail ? `settings/giftcards/new?customerEmail=${customerEmail}` : 'settings/giftcards/new'),
	SETTINGS_CONFIGS_GIFTCARD_DETAIL: (id: string) => buildLinkWithRespectToChannel(`settings/giftcards/${id}`),

	SETTINGS_CONFIGS_PROMOTIONS: () => buildLinkWithRespectToChannel('settings/promotions'),
	SETTINGS_CONFIGS_PROMOTION_NEW: () => buildLinkWithRespectToChannel('settings/promotions/new'),
	SETTINGS_CONFIGS_PROMOTION_DETAIL: (id: string) => buildLinkWithRespectToChannel(`settings/promotions/${id}`),

	SETTINGS_CONFIGS_VOUCHERS: () => buildLinkWithRespectToChannel('settings/vouchers'),
	SETTINGS_CONFIGS_VOUCHER_NEW: () => buildLinkWithRespectToChannel('settings/vouchers/new'),
	SETTINGS_CONFIGS_VOUCHER_DETAIL: (id: string) => buildLinkWithRespectToChannel(`settings/vouchers/${id}`),

	SETTINGS_CONFIGS_PERMISSION_GROUPS: () => buildLinkWithRespectToChannel('settings/permission-groups'),
	SETTINGS_CONFIGS_PERMISSION_GROUP_NEW: () => buildLinkWithRespectToChannel('settings/permission-groups/new'),
	SETTINGS_CONFIGS_PERMISSION_GROUP_DETAIL: (id: string) => buildLinkWithRespectToChannel(`settings/permission-groups/${id}`),

	HOME: () => buildHomePageLink(),
	TRENDING: () => buildLinkWithRespectToChannel('trending'),
	SETTINGS: () => buildLinkWithRespectToChannel('settings'),
	SHOPPING_CART: () => buildLinkWithRespectToChannel('shopping-cart'),

	STORE_SETTINGS: () => buildLinkWithRespectToChannel('settings/store-settings'),
	// TAX_SETTINGS: () => buildLinkWithRespectToChannel('settings/tax-settings'),
	TAX_SETTINGS_COUNTRIES: () => buildLinkWithRespectToChannel('settings/tax-settings/countries'),
	TAX_SETTINGS_TAX_CLASSES: () => buildLinkWithRespectToChannel('settings/tax-settings/tax-classes'),
	TAX_SETTINGS_CHANNELS: () => buildLinkWithRespectToChannel('settings/tax-settings/channels'),
	TAX_SETTINGS_CHANNEL_DETAILS: (id: string) => buildLinkWithRespectToChannel(`settings/tax-settings/channels/${id}`),
	TAX_SETTINGS_COUNTRY_DETAILS: (code: string) => buildLinkWithRespectToChannel(`settings/tax-settings/countries/${code}`),

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
	GRAPHQL_API: '/api/graphql'
};

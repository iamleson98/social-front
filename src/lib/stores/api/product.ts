import type { CategoryCountableConnection, CategoryFilterInput, CategorySortingInput, CategoryWhereInput, ThumbnailFormatEnum } from '$lib/gql/graphql';
import { gql } from '@urql/svelte';

export const PRODUCT_LIST_QUERY_STORE = gql`
	query ProductsList(
		$filter: ProductFilterInput
		$where: ProductWhereInput
		$sortBy: ProductOrder
		$search: String
		$channel: String
		$before: String
		$after: String
		$first: Int
		$last: Int
	) {
		products(
			filter: $filter
			where: $where
			sortBy: $sortBy
			search: $search
			channel: $channel
			before: $before
			after: $after
			first: $first
			last: $last
		) {
			pageInfo {
				startCursor
				endCursor
				hasPreviousPage
				hasNextPage
			}
			edges {
				cursor
				node {
					id
					name
					slug
					description
					created
					updatedAt
				}
			}
		}
	}
`;

export interface CategoryListInput {
	filter?: CategoryFilterInput;
	where?: CategoryWhereInput;
	sortBy?: CategorySortingInput;
	level?: number;
	first?: number;
	last?: number;
	before?: string;
	after?: string;
	backgroundSize?: number;
	backgroundFormat?: ThumbnailFormatEnum;
}

/**  
 * `level` starts at 0
 */
export const CATEGORIES_LIST_QUERY_STORE = gql<CategoryCountableConnection, CategoryListInput>`
	query Categories(
		$filter: CategoryFilterInput
		$where: CategoryWhereInput
		$sortBy: CategorySortingInput
		$level: Int
		$first: Int
		$last: Int
		$before: String
		$after: String
		$backgroundSize: Int
		$backgroundFormat: ThumbnailFormatEnum
	) {
		categories(
			filter: $filter
			where: $where
			sortBy: $sortBy
			level: $level
			first: $first
			last: $last
			before: $before
			after: $after
		) {
			pageInfo {
				startCursor
				endCursor
				hasPreviousPage
				hasNextPage
			}
			edges {
				cursor
				node {
					id
					name
					slug
					level
					backgroundImage(size: $backgroundSize, format: $backgroundFormat) {
						url
						alt
					}
				}
			}
		}
	}
`;

/**
 * @imageFormat default to WEBP
 * @backgroundSize default to 250
 * @first default to 10
 * @last default to 10
 */
export const CATEGORY_DETAIL_QUERY_STORE = gql`
	query Category(
		$slug: String
		$id: ID
		$backgroundSize: Int = 250
		$imageFormat: ThumbnailFormatEnum = WEBP
		$first: Int = 10
		$last: Int = 10
		$before: String
		$after: String
	) {
		category(slug: $slug, id: $id) {
			id
			name
			description
			backgroundImage(size: $backgroundSize, format: $imageFormat) {
				url
				alt
			}
			children(
				first: $first
				last: $last
				before: $before
				after: $after
			) {
				totalCount
				edges {
					node {
						id
						name
						slug
					}
				}
				pageInfo {
					startCursor
					endCursor
					hasPreviousPage
					hasNextPage
				}
			}
		}
	}
`;

export const PRODUCT_DETAIL_QUERY_STORE = gql`
	query Product($slug: String!, $channel: String!) {
		product(slug: $slug, channel: $channel) {
			id
			name
			slug
			description
			rating
			created
			isAvailableForPurchase
			channel # same as $channel
			category {
				id
				name
				level
				slug
				ancestors(first: 10) {
					edges {
						node {
							id
							name
							slug
							level
						}
					}
				}
			}
			weight {
				unit
				value
			}
			media {
				url
				alt
				type
				oembedData
				id
				sortOrder
			}
			attributes {
				attribute {
					id
					name
					slug
					type
					unit
					inputType
					# valueRequired
				}
				values {
					id
					name
					value
					slug
					boolean
					date
					dateTime
					richText
					plainText
				}
			}
			defaultVariant {
				id
				name
			}
			variants { # will be fetched separately
				id
			}
			pricing {
				onSale
				displayGrossPrices
				discount {
					tax {
						amount
						currency
					}
					net {
						amount
						currency
					}
					gross {
						amount
						currency
					}
					currency
				}
				priceRange {
					start {
						currency
						gross {
							amount
							currency
						}
						net {
							amount
							currency
						}
					}
					stop {
						currency
						gross {
							amount
							currency
						}
						net {
							amount
							currency
						}
					}
				}
			}
		}
	}
`;

/** query to fetch product variants */
export const PRODUCT_VARIANTS_QUERY_STORE = gql`
	query ProductVariants($ids: [ID!]!, $channel: String!, $first: Int!) {
		productVariants(channel: $channel, ids: $ids, first: $first) {
			edges {
				node {
					# quantityOrdered
					id
					name
					sku
					trackInventory
					quantityLimitPerCustomer
					quantityAvailable
					margin
					weight {
						unit
						value
					}
					preorder {
						globalThreshold
						globalSoldUnits
						endDate
					}
					media {
						url
						alt
						id
					}
					attributes(variantSelection: ALL) {
						attribute {
							slug
							name
							entityType
						}
						values {
							id
							name
							value
							plainText
							boolean
						}
					}
				}
			}
		}
	}
`;

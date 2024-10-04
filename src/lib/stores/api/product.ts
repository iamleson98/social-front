import type {
	CategoryCountableConnection,
	CategoryFilterInput,
	CategorySortingInput,
	CategoryWhereInput,
	ThumbnailFormatEnum
} from '$lib/gql/graphql';
import { gql } from '@urql/core';

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
					created
					updatedAt
					rating
					category {
						id
						name
					}
					thumbnail(size: 450, format: WEBP) {
						url
						alt
					}
					pricing {
						onSale
						priceRange {
							start {
								currency
								gross {
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
					
							}
						}
					}
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
		$backgroundSize: Int = 60
		$backgroundFormat: ThumbnailFormatEnum = WEBP
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

export type CategoryDetailQueryArgs = {
	slug?: string;
	id?: string;
	backgroundSize?: number;
	imageFormat?: ThumbnailFormatEnum;
	firstChildren?: number;
	lastChildren?: number;
	childrenBefore?: string;
	childrenAfter?: string;
	productFirst?: number;
	productLast?: number;
	productBefore?: string;
	productAfter?: string;
	productChannel?: string;
};

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
		$backgroundSize: Int = 300
		$imageFormat: ThumbnailFormatEnum = WEBP
		$firstChildren: Int = 10
		$lastChildren: Int = 10
		$childrenBefore: String
		$childrenAfter: String

		$productFirst: Int = 10
		$productLast: Int
		$productBefore: String
		$productAfter: String
		$productChannel: String
	) {
		category(slug: $slug, id: $id) {
			id
			name
			description
			backgroundImage(size: $backgroundSize, format: $imageFormat) {
				url
				alt
			}
			children(first: $firstChildren, last: $lastChildren, before: $childrenBefore, after: $childrenAfter) {
				totalCount
				edges {
					node {
						id
						name
						slug
						backgroundImage(size: 100, format: $imageFormat) {
							url
							alt
						}
					}
				}
				pageInfo {
					startCursor
					endCursor
					hasPreviousPage
					hasNextPage
				}
			}
			products(first: $productFirst, last: $productLast, before: $productBefore, after: $productAfter, channel: $productChannel) {
				# totalCount
				edges {
					node {
						id
						name
						slug
						description
						created
						updatedAt
						rating
						thumbnail(size: 300, format: $imageFormat) {
							url
							alt
						}
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
			seoDescription
			rating
			created
			isAvailableForPurchase
			channel # same as $channel
			thumbnail(size: 200, format: WEBP) {
				url
				alt
			}
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
				url(format: WEBP, size: 500)
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
			variants {
				# will be fetched separately
				id
				name
				quantityAvailable
				pricing {
					price {
						gross {
							currency
							amount
						}
					}
				}
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
						url(format: WEBP, size: 500)
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

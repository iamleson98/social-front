import type {
	CategoryFilterInput,
	CategorySortingInput,
	CategoryWhereInput,
	ThumbnailFormatEnum
} from '$lib/gql/graphql';
import { gql } from '@urql/core';

export const PRODUCT_LIST_QUERY = gql`
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
					channel
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
export const CATEGORIES_LIST_QUERY_STORE = gql`
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
 * @backgroundSize default to 300
 * @first default to 10
 * @last default to 10
 */
export const CATEGORY_DETAIL_QUERY = gql`
	query Category(
		$slug: String
		$id: ID
		$backgroundSize: Int = 300
		$imageFormat: ThumbnailFormatEnum = WEBP
		$firstChildren: Int = 10
		$lastChildren: Int = 10
		$childrenBefore: String
		$childrenAfter: String
	) {
		category(slug: $slug, id: $id) {
			id
			name
			description
			seoTitle
			seoDescription
			slug
			metadata {
				key
				value
			}
			privateMetadata {
				key
				value
			}
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
		}
	}
`;

export const PRODUCT_DETAIL_QUERY = gql`
	query Product($slug: String!, $channel: String, $countryCode: CountryCode) {
		product(slug: $slug, channel: $channel) {
			id
			name
			slug
			description
			seoDescription
			rating
			created
			isAvailableForPurchase
			availableForPurchaseAt
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
				ancestors(first: 20) {
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
				id
				name
				sku
				quantityAvailable(countryCode: $countryCode)
				quantityLimitPerCustomer
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
				pricing {
					onSale
					price {
						gross {
							currency
							amount
						}
					}
					priceUndiscounted {
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
export const PRODUCT_VARIANTS_QUERY = gql`
	query ProductVariants($ids: [ID!], $channel: String, $first: Int, $before: String, $last: Int, $after: String) {
		productVariants(channel: $channel, ids: $ids, first: $first, before: $before, last: $last, after: $after) {
			edges {
				node {
					id
					name
					sku
					trackInventory
					quantityLimitPerCustomer
					quantityAvailable
					margin
					product {
            id
            name
            slug
            thumbnail(size: 100, format: WEBP) {
              url
              alt
            }
          }
					weight {
						unit
						value
					}
					preorder {
						globalThreshold
						globalSoldUnits
						endDate
					}
				}
			}
			pageInfo {
				hasNextPage
				hasPreviousPage
				startCursor
				endCursor
			}
		}
	}
`;

export const PRODUCT_VARIANTS_BY_IDS = gql`
	query ProductVariants($ids: [ID!]!, $channel: String!, $first: Int!) {
		productVariants(channel: $channel, ids: $ids, first: $first) {
			edges {
				node {
					id
					name
					sku
					quantityAvailable
					quantityLimitPerCustomer
					margin
					pricing {
						price {
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
`;

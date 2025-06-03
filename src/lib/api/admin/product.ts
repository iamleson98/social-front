import { gql } from "@urql/core";


export type CategoryListForCreateProductInput = {
  first?: number;
  level?: number;
};

export const CATEGORIES_LIST_FOR_CREATE_PRODUCT = gql`
	query CategoriesWithChildren(
		$first: Int
		$level: Int
	) {
		categories(first: $first, level: $level) {
			edges {
				cursor
				node {
					id
					name
					level
					slug
					children(first: $first) {
						edges {
							node {
								id
								name
								level
								slug
								children(first: $first) {
									edges {
										node {
											id
											name
											level
											slug
										}
									}
									pageInfo {
										endCursor
										hasNextPage
									}
								}
							}
						}
						pageInfo {
							endCursor
							hasNextPage
						}
					}
				}
			}
			pageInfo {
				endCursor
				hasNextPage
			}
		}
	}
`

export const PRODUCT_TYPES_QUERY = gql`
query ProductTypes($first: Int, $after: String, $last: Int, $before: String, $sortBy: ProductTypeSortingInput, $filter: ProductTypeFilterInput) {
	productTypes(first: $first, after: $after, last: $last, before: $before, sortBy: $sortBy, filter: $filter) {
		edges {
			node {
				id
				name
				slug
				isShippingRequired
				isDigital
				kind
			}
		}
		pageInfo {
			hasNextPage
			endCursor
			hasPreviousPage
			startCursor
		}
	}
}`;

export const PRODUCT_TYPE_QUERY = gql`
query ProductType($id: ID!, $attributeChoicesFirst: Int!, $attributeChoicesAfter: String) {
	productType(id: $id) {
		id
		name
		isShippingRequired
		isDigital
		kind
		productAttributes {
			id
			name
			type
			valueRequired
			inputType
			entityType
			choices(first: $attributeChoicesFirst, after: $attributeChoicesAfter) {
				edges {
					node {
						id
						name
						value
					}
				}
				pageInfo {
					hasNextPage
					endCursor
				}
			}
		}
		taxClass {
			name
			id
		}
	}
}`;

export const CREATE_PRODUCT_MUTATION = gql`
mutation CreateProduct($input: ProductCreateInput!) {
	productCreate(input: $input) {
		errors {
			message
			field
		}
		product {
			id
		}
	}
}`;

export const UPDATE_PRODUCT_CHANNEL_LISTINGS_MUTATION = gql`
mutation UpdateChannelListings($id: ID!, $input: ProductChannelListingUpdateInput!) {
  productChannelListingUpdate(id: $id, input: $input) {
    product {
      id
    }
    errors {
      field
      message
    }
  }
}`;

export const PRODUCT_VARIANTS_BULK_CREATE_MUTATION = gql`
mutation ProductVariantsBulkCreate($product: ID!, $variants: [ProductVariantBulkCreateInput!]!) {
  productVariantBulkCreate(product: $product, variants: $variants) {
    count
    results {
      productVariant {
        id
      }
      errors {
        field
        message
      }
    }
    errors {
      field
      message
    }
  }
}`;


export const PRODUCT_DETAIL_QUERY = gql`
query Product($slug: String!, $channel: String) {
  product(slug: $slug, channel: $channel) {
    id
    name
    description
    slug
    taxClass {
      id
      name
    }
    availableForPurchaseAt
    isAvailableForPurchase
    collections {
      id
      name
      slug
    }
    category {
      id
      name
      slug
    }
    created
    updatedAt
    weight {
      unit
      value
    }
    defaultVariant {
      id
      name
      sku
    }
    rating
    attributes {
      attribute {
        id
        name
        slug
        inputType
        type
        unit
        valueRequired
        visibleInStorefront
        filterableInDashboard
        withChoices
        choices(first: 100) {
          edges {
            node {
              id
              name
              slug
              value
              inputType
              reference
              richText
              plainText
              boolean
              date
              dateTime
              externalReference
            }
          }
        }
      }
      values {
        id
        name
        slug
        value
        inputType
        reference
        richText
        plainText
        boolean
        date
        dateTime
        externalReference
      }
    }
    variants {
      id
      name
      sku
      trackInventory
      quantityLimitPerCustomer
      weight {
        value
        unit
      }
      preorder {
        globalThreshold
        globalSoldUnits
        endDate
      }
      channelListings {
        id
        channel {
          id
          name
          slug
        }
        price {
          amount
          currency
        }
        costPrice {
          amount
          currency
        }
        margin
        preorderThreshold {
          quantity
          soldUnits
        }
      }
    }
    productType {
      id
      name
      slug
    }
    channelListings {
      id
      publishedAt
      isPublished
      channel {
        slug
        id
        name
      }
      visibleInListings
      availableForPurchaseAt
      discountedPrice {
        amount
        currency
      }
      purchaseCost {
        start {
          amount
          currency
        }
        stop {
          amount
          currency
        }
      }
      margin {
        start
        stop
      }
      isAvailableForPurchase
    }
    metadata {
      key
      value
    }
    seoTitle
    seoDescription
  }
}`;

export const PRODUCT_MEDIA_CREATE_MUTATION = gql`
  mutation ProductMediaCreate($input: ProductMediaCreateInput!) {
    productMediaCreate(
      input: $input
    ) {
      errors {
        field
        message
      }
      media {
        id
      }
    }
  }
`;

/**
 * specifically for admin
 */
export const PRODUCT_LIST_QUERY_ADMIN = gql`
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
          collections {
            id
          }
					thumbnail(size: 100, format: WEBP) {
						url
						alt
					}
          channelListings {
            id
            isPublished
            publishedAt
            isAvailableForPurchase
            availableForPurchaseAt
            visibleInListings
            channel {
              id
              name
              slug
              currencyCode
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
	}
`;

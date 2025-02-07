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
query ProductTypes($first: Int, $after: String, $last: Int, $before: String) {
	productTypes(first: $first, after: $after, last: $last, before: $before) {
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

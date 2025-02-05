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

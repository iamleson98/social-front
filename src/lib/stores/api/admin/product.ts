import { gql } from "@urql/core";


export type CategoryListForCreateProductInput = {
  first?: number;
  level?: number;
  after?: string;
  childrenLevelOneAfter?: string;
  childrenLevelTwoAfter?: string;
};

export const CATEGORIES_LIST_FOR_CREATE_PRODUCT = gql`
	query CategoriesWithChildren(
		$first: Int
		$level: Int
		$after: String
		$childrenLevelOneAfter: String
		$childrenLevelTwoAfter: String
	) {
		categories(first: $first, level: $level, after: $after) {
			edges {
				cursor
				node {
					id
					name
					level
					slug
					children(first: $first, after: $childrenLevelOneAfter) {
						edges {
							node {
								id
								name
								level
								slug
								children(first: $first, after: $childrenLevelTwoAfter) {
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

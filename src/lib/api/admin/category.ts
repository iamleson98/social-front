import { gql } from "@urql/core";

export const CATEGORIES_LIST_QUERY = gql`
query Categories($first: Int, $after: String, $last: Int, $before: String, $level: Int, $filter: CategoryFilterInput, $sortBy: CategorySortingInput) {
  categories(first: $first, last: $last, after: $after, before: $before, filter: $filter, sortBy: $sortBy, level: $level) {
    edges {
      node {
        id
        name
        slug
        level
        backgroundImage(size: 100, format: WEBP) {
          url
          alt
        }
        products {
          totalCount
        }
        children {
          totalCount
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
}`;

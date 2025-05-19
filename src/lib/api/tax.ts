import { gql } from "@urql/core"

export const TAX_CLASSES_QUERY = gql`
query TaxClasses($first: Int, $after: String, $last: Int, $before: String, $sortBy: TaxClassSortingInput) {
  taxClasses(first: $first, after: $after, before: $before, last: $last, sortBy: $sortBy) {
    edges {
      node {
        id
        name
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

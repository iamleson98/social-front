import { gql } from "@urql/core"

export const TAX_CLASSES_QUERY = gql`
query TaxClasses($first: Int!, $after: String) {
  taxClasses(first: $first, after: $after) {
    edges {
      node {
        id
        name
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;

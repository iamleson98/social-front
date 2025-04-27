import { gql } from "@urql/core";

export const QUERY_CUSTOMERS = gql`
query Customers($filter: CustomerFilterInput, $sortBy: UserSortingInput, $first: Int, $after: String, $last: Int, $before: String) {
  customers(filter: $filter, sortBy: $sortBy, first: $first, after: $after, last: $last, before: $before) {
    edges {
      node {  
        id
        firstName
        lastName
        email
        isStaff
        isActive
        dateJoined
        avatar(size: 100, format: WEBP) {
          url
          alt
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}`;

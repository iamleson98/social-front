import { gql } from "@urql/core";


export const GIFTCARD_LIST_QUERY = gql`
query Giftcards($first: Int, $last: Int, $before: String, $after: String, $sortBy: GiftCardSortingInput, $filter: GiftCardFilterInput, $search: String) {
  giftCards(first: $first, last: $last, before: $before, after: $after, sortBy: $sortBy, search: $search, filter: $filter) {
    edges {
      node {
        id
        code
        displayCode
        isActive
        created
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

import { gql } from "@urql/core";

export const COLLECTIONS_QUERY = gql`
query Collections($after: String, $first: Int!, $query: String, $channel: String) {
  collections(
    after: $after
    first: $first
    filter: {search: $query}
    channel: $channel
  ) {
    edges {
      node {
        id
        name
      }
    }
    pageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
    }
  }
}`;

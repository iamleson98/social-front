import { gql } from "@urql/core";

export const COLLECTIONS_QUERY = gql`
query Collections($after: String, $first: Int!, $channel: String, $sortBy: CollectionSortingInput, $filter: CollectionFilterInput) {
  collections(
    after: $after
    first: $first
    filter: $filter
    sortBy: $sortBy
    channel: $channel
  ) {
    edges {
      node {
        id
        name
        channelListings {
          isPublished
          publishedAt
          channel {
            id
            name
          }
        }
        products {
          totalCount
        }
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

export const COLLECTION_DELETE_MUTATION = gql`
mutation CollectionDelete($id: ID!) {
  collectionDelete(id: $id) {
    errors {
      field
      message
      code
    }
  }
}`;

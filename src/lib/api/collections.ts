import { gql } from "@urql/core";

export const COLLECTIONS_QUERY = gql`
query Collections($after: String, $first: Int!, $channel: String, $sortBy: CollectionSortingInput, $filter: CollectionFilterInput, $where: CollectionWhereInput) {
  collections(
    after: $after
    first: $first
    filter: $filter
    sortBy: $sortBy
    channel: $channel
    where: $where
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
        backgroundImage(size: 100, format: WEBP) {
          url
          alt
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

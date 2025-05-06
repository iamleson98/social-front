import { gql } from "@urql/core";

/** Query products list of given colections */
export const COLLECTION_PRODUCTS_QUERY = gql`
query CollectionProducts($id: ID!, $first: Int, $last: Int, $before: String, $after: String) {
  collection(id: $id) {
    id
    products(
      first: $first
      after: $after
      before: $before
      last: $last
      sortBy: {field: COLLECTION, direction: ASC}
    ) {
      edges {
        node {
          id
          name
          thumbnail(size: 100, format: WEBP) {
            url
            alt
          }
          category {
            id
            name
          }
          channelListings {
            id
            isPublished
            publishedAt
            isAvailableForPurchase
            availableForPurchaseAt
            visibleInListings
            channel {
              id
              name
              currencyCode
            }
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
  }
}`;

export const REORDER_PRODUCTS_IN_COLLECTION_MUTATION = gql`
mutation ReorderProductsInCollection($collectionId: ID!, $moves: [MoveProductInput!]!, $first: Int, $after: String, $last: Int, $before: String) {
  collectionReorderProducts(collectionId: $collectionId, moves: $moves) {
    collection {
      id
      products(
        first: $first
        after: $after
        before: $before
        last: $last
        sortBy: {field: COLLECTION, direction: ASC}
      ) {
        edges {
          node {
            id
            name
            category {
              id
              name
            }
            thumbnail(size: 100, format: WEBP) {
              url
              alt
            }
            channelListings {
              id
              isPublished
              publishedAt
              isAvailableForPurchase
              availableForPurchaseAt
              visibleInListings
              channel {
                id
                name
                currencyCode
              }
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
    }
  }
}`;

export const COLLECTION_DETAIL_QUERY = gql`
query CollectionDetail($id: ID!) {
  collection(id: $id) {
    id
    name
    slug
    channelListings {
      id
      isPublished
      publishedAt
      # isAvailableForPurchase
      # availableForPurchaseAt
      # visibleInListings
      channel {
        id
        name
        currencyCode
      }
    }
    seoTitle
    seoDescription
    description
    backgroundImage(size: 300, format: WEBP) {
      url
      alt
    }
    metadata {
      key
      value
    }
    privateMetadata {
      key
      value
    }
  }
}`;

export const ASSIGN_PRODUCTS_TO_COLLECTION_MUTATION = gql`
mutation AssignProductsToCollection($collectionId: ID!, $products: [ID!]!) {
  collectionAddProducts(collectionId: $collectionId, products: $products) {
    collection {
      id
    }
    errors {
      field
      message
    }
  }
}`


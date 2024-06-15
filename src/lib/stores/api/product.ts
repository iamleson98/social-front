import { graphql } from "$houdini";

export const PRODUCT_LIST_QUERY_STORE = graphql(`query ProductsList(
  $filter: ProductFilterInput,
  $where: ProductWhereInput,
  $sortBy: ProductOrder,
  $search: String,
  $channel: String,
  $before: String,
  $after: String,
  $first: Int,
  $last: Int
) {
  products(
    filter: $filter, 
    where: $where, 
    sortBy: $sortBy, 
    search: $search, 
    channel: $channel, 
    before: $before, 
    after: $after, 
    first: $first, 
    last: $last
  ) {
    pageInfo {
      startCursor
      endCursor
      hasPreviousPage
      hasNextPage
    }
    edges {
      cursor
      node {
        id
        name
        slug
        description
        created
        updatedAt
      }
    }
  }
}`);

export const CATEGORIES_LIST_QUERY_STORE = graphql(`query Categories(
  $filter: CategoryFilterInput,
  $where: CategoryWhereInput,
  $sortBy: CategorySortingInput,
  $level: Int,
  $first: Int,
  $last: Int,
  $before: String,
  $after: String,
  $backgroundSize: Int,
  $backgroundFormat: ThumbnailFormatEnum
) {
  categories(
    filter: $filter,
    where: $where,
    sortBy: $sortBy,
    level: $level,
    first: $first,
    last: $last,
    before: $before,
    after: $after
  ) {
    pageInfo {
      startCursor
      endCursor
      hasPreviousPage
      hasNextPage
    }
    edges {
      cursor
      node {
        id
        name
        slug
        backgroundImage(size: $backgroundSize, format: $backgroundFormat) {
          url
          alt
        }
      }
    }
  }
}`);

/**
 * @imageFormat default to WEBP
 * @backgroundSize default to 250
 * @firstNumOfChildren default to 10
 * @lastNumOfChildren default to 10
 */
export const CATEGORY_DETAIL_QUERY_STORE = graphql(`query Category(
  $slug: String,
  $id: ID,
  $backgroundSize: Int = 250,
  $imageFormat: ThumbnailFormatEnum = WEBP,
  $firstNumOfChildren: Int = 10,
  $lastNumOfChildren: Int = 10,
  $before: String,
  $after: String,
) {
  category(slug: $slug, id: $id) {
    id
    name
    description
    backgroundImage(size: $backgroundSize, format: $imageFormat) {
      url
      alt
    }
    children(first: $firstNumOfChildren, last: $lastNumOfChildren, before: $before, after: $after) {
      totalCount
      edges {
        node {
          id
          name
          slug
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
      }
    }
  }
}`);

export const PRODUCT_DETAIL_QUERY_STORE = graphql(`query Product($slug: String!, $channel: String!) {
  product(slug: $slug, channel: $channel) {
    id
    name
    slug
    description
    rating
    created
    updatedAt
    isAvailableForPurchase
    weight {
      unit
      value
    }
    attributes {
      attribute {
        id
        name
        slug
        type
        unit
        visibleInStorefront
        type
      }
      values {
        id
        name
        value
        slug
        boolean
        date
        dateTime
        richText
        plainText
      }
    }
    defaultVariant {
      id
      name
    }
    variants {
      id
    }
    pricing {
      onSale
      displayGrossPrices
      discount {
        tax {
          amount
          currency
        }
        net {
          amount
          currency
        }
        gross {
          amount
          currency
        }
        currency
      }
      priceRange {
        start {
          currency
          gross {
            amount
            currency
          }
          net {
            amount
            currency
          }
        }
        stop {
          currency
          gross {
            amount
            currency
          }
          net {
            amount
            currency
          }
        }
      }
    }
  }
}`);

export const PRODUCT_VARIANTS_QUERY_STORE = graphql(`query ProductVariants($ids: [ID!]!, $channel: String!, $first: Int!) {
  productVariants(channel: $channel, ids: $ids, first: $first) {
    edges {
      node {
        id
        name
        sku
        trackInventory
        quantityLimitPerCustomer
        quantityAvailable
        margin
        quantityOrdered
        media {
          url
          alt
          id
        }
        attributes(variantSelection:ALL) {
          attribute {
            slug
            name
            entityType
          }
          values {
            id
            name
            value
            plainText
            boolean
          }
        }
      }
    }
  }
}`);

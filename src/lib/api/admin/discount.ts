import { gql } from "@urql/core";


export const VOUCHER_LIST_QUERY = gql`
query Vouchers($first: Int!, $after: String, $last: Int, $before: String, $channel: String, $filter: VoucherFilterInput, $sortBy: VoucherSortingInput) {
  vouchers(filter: $filter, first: $first, after: $after, last: $last, before: $before, channel: $channel, sortBy: $sortBy) {
    edges {
      node {
        id
        name
        code
        endDate
        startDate
        # minSpent
        discountValue
        usageLimit
        type
        discountValueType
        channelListings {
          id
          channel {
            name
            id
            slug
            currencyCode
          }
          discountValue
          currency
          minSpent {
            amount
            currency
          }
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

export const PROMOTION_LIST_QUERY = gql`
query Promotions($first: Int!, $after: String, $last: Int, $before: String, $sortBy: PromotionSortingInput, $where: PromotionWhereInput) {
  promotions(first: $first, after: $after, last: $last, before: $before, sortBy: $sortBy, where: $where) {
    edges {
      node {
        id
        name
        startDate
        endDate
        type
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

export const VOUCHER_DETAIL_QUERY = gql`
query VoucherDetail($id: ID!) {
  voucher(id: $id) {
    id
    name
    code
    endDate
    startDate
    discountValue
    usageLimit
    type
    used
    discountValueType
    singleUse
    onlyForStaff
    minCheckoutItemsQuantity
    applyOncePerOrder
    applyOncePerCustomer
    metadata {
      key
      value
    }
    privateMetadata {
      key
      value
    }
    channelListings {
      id
      channel {
        name
        id
        slug
        currencyCode
      }
      discountValue
      currency
      minSpent {
        amount
        currency
      }
    }
  }
}`;

export const PROMOTION_DETAIL_QUERY = gql`
query Promotion($id: ID!) {
  promotion(id: $id) {
    id
    name
    type
    description
    startDate
    endDate
    rules {
      id
      name
    }
    metadata {
      key
      value
    }
    privateMetadata {
      key
      value
    }
    rules {
      id
      name
      description
      giftIds
      rewardType
      rewardValueType
      rewardValue
      cataloguePredicate
      orderPredicate
      channels {
        id
        isActive
        name
        slug
        currencyCode
        defaultCountry {
          code
          country
        }
      }
    }
  }
}`;

export const VOUCHER_CODE_LIST_QUERY = gql`
query VoucherCodes($id: ID!, $first: Int, $after: String, $last: Int, $before: String) {
  voucher(id: $id) {
    codes(first: $first, after: $after, last: $last, before: $before) {
      edges {
        node {
          used
          code
          isActive
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
}`;

export const VOUCHER_COLLECTIONS_QUERY = gql`
query VoucherCollections($voucherId: ID!, $first: Int, $after: String, $last: Int, $before: String) {
  voucher(id: $voucherId) {
    collections(first: $first, after: $after, last: $last, before: $before) {
      edges {
        node {
          id
          name
          slug
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
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
}`;

export const VOUCHER_PRODUCTS_QUERY = gql`
query VoucherProducts($voucherId: ID!, $first: Int, $after: String, $last: Int, $before: String) {
  voucher(id: $voucherId) {
    products(first: $first, after: $after, last: $last, before: $before) {
      edges {
        node {
          id
          name
          slug
          thumbnail(size: 100, format: WEBP) {
            url
            alt
          }
          productType {
            id
            name
          }
          channelListings {
            id
            isPublished
            channel {
              id
              name
              slug
            }
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
  }
}`;

export const VOUCHER_CATEGORIES_QUERY = gql`
query VoucherCategories($voucherId: ID!, $first: Int, $after: String, $last: Int, $before: String) {
  voucher(id: $voucherId) {
    categories(first: $first, after: $after, last: $last, before: $before) {
      edges {
        node {
          id
          name
          slug
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
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
}`;

export const VOUCHER_VARIANTS_QUERY = gql`
query VoucherVariants($voucherId: ID!, $first: Int, $after: String, $last: Int, $before: String) {
  voucher(id: $voucherId) {
    variants(first: $first, after: $after, last: $last, before: $before) {
      edges {
        node {
          id
          name
          product {
            id
            name
            slug
            thumbnail(size: 100, format: WEBP) {
              url
              alt
            }
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
  }
}`;

export const VOUCHER_DELETE_MUTATION = gql`
mutation VoucherDelete($id: ID!) {
  voucherDelete(id: $id) {
    errors {
      field
      message
    }
  }
}`;

export const PROMOTION_DELETE_MUTATION = gql`
mutation PromotionDelete($id: ID!) {
  promotionDelete(id: $id) {
    errors {
      field
      message
    }
  }
}`;

export const PROMOTION_UPDATE_MUTATION = gql`
mutation PromotionUpdate($id: ID!, $input: PromotionUpdateInput!) {
  promotionUpdate(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

export const PROMOTION_RULE_DELETE_MUTATION = gql`
mutation PromotionRuleDelete($id: ID!) {
  promotionRuleDelete(id: $id) {
    errors {
      field
      message
    }
  }
}`;

export const RuleConditionsSelectedOptionsDetails = gql`
query RuleConditionsSelectedOptionsDetails($categoriesIds: [ID!], $collectionsIds: [ID!], $productsIds: [ID!], $variantsIds: [ID!]) {
  categories(first: 100, ids: $categoriesIds) {
    edges {
      node {
        id
        name
        slug
      }
    }
  }
  collections(first: 100, ids: $collectionsIds) {
    edges {
      node {
        id
        name
        slug
      }
    }
  }
  products(first: 100, ids: $productsIds) {
    edges {
      node {
        id
        name
        slug
      }
    }
  }
  variants(first: 100, ids: $variantsIds) {
    edges {
      node {
        id
        name
      }
    }
  }
}`;

export const VOUCHER_UPDATE_MUTATION = gql`
mutation UpdateVoucher($id: ID!, $input: VoucherInput!) {
  voucherUpdate(id: $id, input: $input) {
    errors {
      field
      message
      code
    }
  }
}`;

export const VOUCHER_CREATE_MUTATION = gql`
mutation CreateVoucher($input: VoucherInput!) {
  voucherCreate(input: $input) {
    errors {
      field
      message
    }
    voucher {
      id
    }
  }
}`;

export const VOUCHER_CHANNEL_LISTING_UPDATE_MUTATION = gql`
mutation VoucherChannelListingUpdate($id: ID!, $input: VoucherChannelListingInput!) {
  voucherChannelListingUpdate(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

export const VOUCHER_CATALOGUES_ADD_MUTATION = gql`
mutation VoucherCataloguesAdd($id: ID!, $input: CatalogueInput!) {
  voucherCataloguesAdd(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

export const VOUCHER_CATALOGUES_REMOVE_MUTATION = gql`
mutation VoucherCataloguesRemove($id: ID!, $input: CatalogueInput!) {
  voucherCataloguesRemove(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;


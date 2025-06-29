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
    discountValueType
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

export const VOUCHER_CODE_LIST_QUERY = gql`
query VoucherCodes($id: ID!, $first: Int!, $after: String, $last: Int, $before: String) {
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

// export const PROMOTION_LIST_QUERY = gql`
// query Vouchers($first: Int!, $after: String, $last: Int, $before: String, $where: PromotionWhereInput, $sortBy: PromotionSortingInput) {
//   vouchers(filter: $filter, first: $first, after: $after, last: $last, before: $before, sortBy: $sortBy) {
//     edges {
//       node {
//         id
//         name
//         code
//         endDate
//         startDate
//         type
//       }
//     }
//     pageInfo {
//       hasNextPage
//       hasPreviousPage
//       startCursor
//       endCursor
//     }
//   }
// }`;

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
        }
      }
      totalCount
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
      totalCount
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
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
}`;



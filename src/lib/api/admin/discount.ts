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
query Vouchers($first: Int!, $after: String, $last: Int, $before: String, $where: PromotionWhereInput, $sortBy: PromotionSortingInput) {
  vouchers(filter: $filter, first: $first, after: $after, last: $last, before: $before, sortBy: $sortBy) {
    edges {
      node {
        id
        name
        code
        endDate
        startDate
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

import { gql } from "@urql/core";

export const PROMOTIONS_QUERY = gql`
  query Promotions(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $sortBy: PromotionSortingInput
    $where: PromotionWhereInput
  ) {
    promotions(
      first: $first
      after: $after
      last: $last
      before: $before
      sortBy: $sortBy
      where: $where
    ) {
      totalCount
      edges {
        cursor
        node {
          id
          name
          createdAt
          startDate
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
`;

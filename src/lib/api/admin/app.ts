import { gql } from "@urql/core";

export const APPS_QUERY = gql`
query Apps($first: Int, $after: String, $last: Int, $before: String, $sortBy: AppSortingInput, $filter: AppFilterInput) {
  apps(first: $first, after: $after, last: $last, before: $before, sortBy: $sortBy, filter: $filter) {
    edges {
      node {
        id
        name
        # slug
        appUrl
        # permissions {
        #   name
        #   code
        # }
        tokens {
          id
          name
          authToken
        }
        accessToken
        extensions {
          accessToken
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

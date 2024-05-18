import { graphql } from "$houdini";

export const productListStore = graphql(`query ProductsList(
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
        created
        updatedAt
      }
    }
  }
}`);

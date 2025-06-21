import { gql } from "@urql/core";

export const CATEGORIES_LIST_QUERY = gql`
query Categories($first: Int, $after: String, $last: Int, $before: String, $level: Int, $filter: CategoryFilterInput, $sortBy: CategorySortingInput) {
  categories(first: $first, last: $last, after: $after, before: $before, filter: $filter, sortBy: $sortBy, level: $level) {
    edges {
      node {
        id
        name
        slug
        level
        updatedAt
        backgroundImage(size: 100, format: WEBP) {
          url
          alt
        }
        products {
          totalCount
        }
        children {
          totalCount
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

export const CATEGORY_DELETE_MUTATION = gql`
mutation DeleteCategory($id: ID!) {
  categoryDelete(id: $id) {
    errors {
      field
      message
    }
  }
}`;

export const CATEGORY_UPDATE_MUTATION = gql`
mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
  categoryUpdate(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

export const CATEGORY_CHILDREN_LIST_QUERY = gql`
query CategoryChildren($id: ID!, $first: Int, $last: Int, $before: String, $after: String) {
  category(id: $id) {
    children(first: $first, last: $last, before: $before, after: $after) {
      edges {
        node {
          id
          name
          slug
          level
          backgroundImage(size: 100, format: WEBP) {
            url
            alt
          }
          products {
            totalCount
          }
          children {
            totalCount
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

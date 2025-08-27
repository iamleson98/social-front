import { gql } from "@urql/core";

export const PAGE_LIST_QUERY = gql`
query Pages($first: Int, $last: Int, $before: String, $after: String, $filter: PageFilterInput, $sortBy: PageSortingInput) {
  pages(first: $first, last: $last, before: $before, after: $after, filter: $filter, sortBy: $sortBy) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    edges {
      node {
        id
        title
        isPublished
        publishedAt
        slug
      }
    }
  }
}`;

export const PAGE_DETAIL_QUERY = gql`
query Page($id: String!) {
  page(id: $id) {
    id
    title
    isPublished
    publishedAt
    slug
    seoTitle
    seoDescription
    metadata {
      key
      value
    }
    privateMetadata {
      key
      value
    }
    content
    pageType
    created
    # attributes {
      # attribute {
      #   id
      #   name
      #   slug
      # }
      # values {
      #   id
      #   name
      #   slug
      # }
    # }
  }
}`;

export const PAGE_TYPES_QUERY = gql`
query PageTypes($first: Int, $last: Int, $before: String, $after: String, $sortBy: PageTypeSortingInput, $filter: PageTypeFilterInput) {
  pageTypes(first: $first, last: $last, before: $before, after: $after, sortBy: $sortBy, filter: $filter) {
    edges {
      node {
        id
        name
        slug
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

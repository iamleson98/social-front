import { gql } from '@urql/core';


export const PRODUCT_ATTRIBUTES_QUERY = gql`
query Attributes(
  $first: Int,
  $last: Int,
  $before: String,
  $after: String,
  $channel: String, 
  $where: AttributeWhereInput,
  $filter: AttributeFilterInput,
  $sortBy: AttributeSortingInput,
) {
  attributes(first: $first, channel: $channel, where: $where, before: $before, after: $after, last: $last, filter: $filter, sortBy: $sortBy) {
    edges {
      node {
        id
        name
        type
        valueRequired
        inputType
        entityType
        visibleInStorefront
        # choices(first: $choiceFirst, after: $choiceAfter) {
        #   edges {
        #     node {
        #       id
        #       name
        #       value
        #     }
        #   }
        #   pageInfo {
        #     hasNextPage
        #     endCursor
        #   }
        # }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
    }
  }
}`;

export const ATTRIBUTE_DETAILS_QUERY = gql`
query Attribute($id: ID!) {
  attribute(id: $id) {
    id
    name
    slug
    type
    inputType
    entityType
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

export const ATTRIBUTE_DELETE_MUTATION = gql`
mutation DelAttribute($id: ID!) {
  attributeDelete(id: $id) {
    errors {
      field
      message
    }
  }
}`

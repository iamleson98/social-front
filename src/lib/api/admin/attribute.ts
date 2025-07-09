// import type { QueryAttributesArgs } from '$lib/gql/graphql';
import { gql } from '@urql/core';

// export type CustomAttributesQueryArgs = {
//   /** number of choices to query for given attribute  */
//   choiceFirst: number;
//   /** cursor to query choices after */
//   choiceAfter?: string;
// } & QueryAttributesArgs;

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

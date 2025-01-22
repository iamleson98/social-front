import type { QueryAttributesArgs } from '$lib/gql/graphql';
import { gql } from '@urql/core';

export type CustomAttributesQueryArgs = {
  /** number of choices to query for given attribute  */
  choiceFirst: number;
  /** cursor to query choices after */
  choiceAfter?: string;
} & QueryAttributesArgs;

export const PRODUCT_ATTRIBUTES_QUERY = gql`
query Attributes(
  $first: Int!, 
  $channel: String, 
  $where: AttributeWhereInput,
	$choiceFirst: Int,
  $choiceAfter: String
) {
  attributes(first: $first, channel: $channel, where: $where) {
    edges {
      node {
        id
        name
        type
        valueRequired
        inputType
        entityType
        choices(first: $choiceFirst, after: $choiceAfter) {
          edges {
            node {
              id
              name
              value
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}`;

import type { AttributeWhereInput } from '$lib/gql/graphql';
import { gql } from '@urql/core';

export type AttributesVariable = {
  first: number;
  channel: string;
  where?: AttributeWhereInput;
  choiceFirst: number;
  choiceAfter?: string;
};

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

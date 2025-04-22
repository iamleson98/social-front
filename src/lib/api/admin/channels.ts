import { gql } from "@urql/core";

export const CHANNEL_DELETE_MUTATION = gql`
  mutation DeleteChannel($id: ID!, $input: ChannelDeleteInput!) {
    channelDelete(id: $id, input: $input) {
      errors {
        field
        message
      }
    }
  }
`
export const CHANNEL_DETAILS_QUERY = gql`
  query ChannelDetails($slug: String!) {
    channel(slug: $slug) {
      id
      name
      slug
      isActive
      currencyCode
    }
  }
`
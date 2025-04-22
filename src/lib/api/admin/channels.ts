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
`;

export const CHANNEL_UPDATE_MUTATION = gql`
  mutation UpdateChannel($id: ID!, $input: ChannelUpdateInput!) {
    channelUpdate(id: $id, input: $input) {
      channel {
        id
        name
        slug
        isActive
        currencyCode
      }
      errors {
        field
        message
      }
    }
  }
`;
import { gql } from "@urql/core";

export const CHANNEL_DELETE_MUTATION = gql`
  mutation DeleteChannel($id: ID!, $input: ChannelDeleteInput) {
    channelDelete(id: $id, input: $input) {
      errors {
        field
        message
      }
    }
  }
`

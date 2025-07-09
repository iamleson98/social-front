import { gql } from "@urql/core";

export const CHANNEL_CREATE_MUTATION = gql`
  mutation CreateChannel($input: ChannelCreateInput!) {
    channelCreate(input: $input) {
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

export const CHANNEL_DELETE_MUTATION = gql`
  mutation DeleteChannel($id: ID!, $input: ChannelDeleteInput) {
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

export const CHANNEL_WAREHOUSES_QUERY = gql`
	query ChannelWarehouses($slug: String!) {
		channel(slug: $slug) {
			id
			name
			warehouses {
				id
				name
			}
		}
	}
`;

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

export const SHIPPING_ZONES_QUERY = gql`
query ShippingZones($channel: String, $filter: ShippingZoneFilterInput, $before: String, $after: String, $first: Int, $last: Int) {
  shippingZones(channel: $channel, filter: $filter, before: $before, after: $after, first: $first, last: $last) {
    edges {
      node {
        id
        name
      }
    }
  }
}`;

export const WAREHOUSES_QUERY = gql`
	query ChannelWarehouses($filter: WarehouseFilterInput, $before: String, $after: String, $first: Int, $last: Int) {
		warehouses(filter: $filter, before: $before, after: $after, first: $first, last: $last) {
			edges {
				node {
					id
					name
				}
			}
		}
	}
`;

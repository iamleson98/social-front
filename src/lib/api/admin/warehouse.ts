import { gql } from "@urql/core";

export const WAREHOUSE_LIST_QUERY = gql`
query Warehouses($first: Int, $before: String, $after: String, $last: Int, $filter: WarehouseFilterInput, $sortBy: WarehouseSortingInput) {
  warehouses(first: $first, after: $after, before: $before, filter: $filter, sortBy: $sortBy, last: $last) {
    edges {
      node {
        id
        name
        shippingZones(first: 100) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
  }
}`;

export const WAREHOUSE_DELETE_MUTATION = gql`
mutation DeleteWarehouse($id: ID!) {
  deleteWarehouse(id: $id) {
    errors {
      field
      message
    }
  }
}`;

export const WAREHOUSE_UPDATE_MUTATION = gql`
mutation UpdateWarehouse($id: ID!, $input: WarehouseUpdateInput!, $externalReference: String) {
  updateWarehouse(id: $id, input: $input, externalReference: $externalReference) {
    errors {
      field
      message
    }
  }
}`;

export const WAREHOUSE_DETAIL_QUERY = gql`
query Warehouse($id: ID!) {
  warehouse(id: $id) {
    name
    slug
    email
    isPrivate
    externalReference
    metadata {
      key
      value
    }
    privateMetadata {
      key
      value
    }
    clickAndCollectOption
    address {
      id
      firstName
      lastName
      companyName
      countryArea
      streetAddress1
      streetAddress2
      cityArea
      city
      postalCode
      phone
      country {
        code
        country
      }
    }
  }
}`;

export const WAREHOUSE_CREATE_MUTATION = gql`
mutation CreateWarehouse($input: WarehouseCreateInput!) {
  warehouseCreate(input: $input) {
    warehouse {
      id
    }
    errors {
      field
      message
    }
  }
}`;


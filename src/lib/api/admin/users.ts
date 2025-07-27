import { gql } from "@urql/core";

export const CUSTOMER_LIST_QUERY = gql`
query Customers($filter: CustomerFilterInput, $sortBy: UserSortingInput, $first: Int, $after: String, $last: Int, $before: String) {
  customers(filter: $filter, sortBy: $sortBy, first: $first, after: $after, last: $last, before: $before) {
    edges {
      node {  
        id
        firstName
        lastName
        email
        isStaff
        isActive
        dateJoined
        avatar(size: 100, format: WEBP) {
          url
          alt
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}`;

export const USER_DETAIL_QUERY = gql`
query UserDetail($id: ID, $email: String) {
  user(id: $id, email: $email) {
    id
    firstName
    lastName
    email
    addresses {
      phone
      companyName
      streetAddress1
      streetAddress2
      cityArea
      city
      postalCode
      isDefaultShippingAddress
      isDefaultBillingAddress
      countryArea
      firstName
      lastName
      metadata {
        key
        value
      }
      country {
        code
        country
      }
    }
    orders(first: 5) {
      edges {
        node {
          id
          number
          paymentStatus
          total {
            gross {
              amount
              currency
            }
          }
          created
        }
      }
    }
    isStaff
    isActive
    lastLogin
    dateJoined
    metadata {
      key
      value
    }
    note
    privateMetadata {
      key
      value
    }
    avatar(size: 100, format: WEBP) {
      url
      alt
    }
  }
}`;

export const PERMISSION_GROUP_LIST_QUERY = gql`
query PermissionGroups($first: Int, $after: String, $last: Int, $before: String, $sortBy: PermissionGroupSortingInput, $filter: PermissionGroupFilterInput) {
  permissionGroups(first: $first, after: $after, last: $last, before: $before, sortBy: $sortBy, filter: $filter) {
    edges {
      node {
        id
        name
        users {
          id
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}`;

export const PERMISSION_GROUP_DETAIL_QUERY = gql`
query PermissionGroupDetail($id: ID!) {
  permissionGroup(id: $id) {
    id
    name
    restrictedAccessToChannels
    permissions {
      code
      name
    }
    userCanManage
    users {
      id
      firstName
      lastName
      email
      avatar(size: 100, format: WEBP) {
        url
        alt
      }
    }
    accessibleChannels {
      id
      name
      slug
    }
  }
}`;

export const PERMISSION_GROUP_UPDATE_MUTATION = gql`
mutation UpdatePermissionGroup($id: ID!, $input: PermissionGroupUpdateInput!) {
  permissionGroupUpdate(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

export const PERMISSION_GROUP_DELETE_MUTATION = gql`
mutation DeletePermissionGroup($id: ID!) {
  permissionGroupDelete(id: $id) {
    errors {
      field
      message
    }
  }
}`;

export const PERMISSION_GROUP_CREATE_MUTATION = gql`
mutation CreatePermissionGroup($input: PermissionGroupCreateInput!) {
  permissionGroupCreate(input: $input) {
    group {
      id
    }
    errors {
      field
      message
    }
  }
}`;

export const CREATE_USER_MUTATION = gql`
mutation CreateUser($input: UserCreateInput!) {
  customerCreate(input: $input) {
    user {
      id
    }
    errors {
      field
      message
    }
  }
}`;

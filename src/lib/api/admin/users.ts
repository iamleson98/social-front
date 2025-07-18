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
    # totalCount
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
}`

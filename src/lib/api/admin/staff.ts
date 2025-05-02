import { gql } from "@urql/core";

export const STAFFS_QUERY = gql`
query StaffList {
  staffUsers(first: 100) {
    edges {
      node {
        id
        email
        firstName
        lastName
        isActive
      }
    }
  }
}`;

export const STAFF_DETAILS_QUERY = gql`
query UserDetails($id: ID!) {
  user(id: $id) {
    id
    email
    firstName
    lastName
    isActive
    avatar {
      url
      alt
    }
  }
}`;

export const STAFF_UPDATE_MUTATION = gql`
mutation UserUpdate($id: ID!, $input: UserInput!) {
  userUpdate(id: $id, input: $input) {
    user {
      id
      email
      firstName
      lastName
      isActive
    }
  }
}`;


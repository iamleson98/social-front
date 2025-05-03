import { gql } from "@urql/core";


export const STAFFS_QUERY = gql`
query StaffList($first: Int, $after: String, $last: Int, $before: String, $sortBy: UserSortingInput, $filter: StaffUserInput) {
  staffUsers(first: $first, after: $after, last: $last, before: $before, sortBy: $sortBy, filter: $filter) {
    edges {
      node {
        id
        email
        firstName
        lastName
        isActive
        avatar(size: 100, format: WEBP) {
          url
          alt
        }
      }
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


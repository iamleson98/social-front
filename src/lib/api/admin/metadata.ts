import { gql } from "@urql/core";

export const METADATA_UPDATE_MUTATION = gql`
mutation UpdateMetadata($id: ID!, $input: [MetadataInput!]!) {
  updateMetadata(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

export const PRIVATE_METADATA_UPDATE_MUTATION = gql`
mutation UpdatePrivateMetadata($id: ID!, $input: [MetadataInput!]!) {
  updatePrivateMetadata(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

export const METADATA_DELETE_MUTATION = gql`
mutation DeleteMetadata($id: ID!, $keys: [String!]!) {
  deleteMetadata(id: $id, keys: $keys) {
    errors {
      field
      message
    }
  }
}`;

export const PRIVATE_METADATA_DELETE_MUTATION = gql`
mutation DeletePrivateMetadata($id: ID!, $keys: [String!]!) {
  deletePrivateMetadata(id: $id, keys: $keys) {
    errors {
      field
      message
    }
  }
}`;

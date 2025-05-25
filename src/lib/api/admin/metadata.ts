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

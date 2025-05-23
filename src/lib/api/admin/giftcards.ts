import { gql } from "@urql/core"

export const GIFT_CARD_CREATE_MUTATION = gql`
mutation GiftCardCreate($input: GiftCardCreateInput!) {
  giftCardCreate(
    input: $input
  ) {
    errors {
      field
      message
    }
    giftCard {
      id
      code
    }
  }
}`;

export const GIFT_CARD_TAGS_QUERY = gql`
query SearchGiftCardTags($first: Int!, $after: String, $last: Int, $before: String, $filter: GiftCardTagFilterInput) {
  giftCardTags(filter: $filter, first: $first, after: $after, last: $last, before: $before) {
    edges {
      node {
        id
        name
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

export const GIFT_CARD_ACTIVATE_MUTATION = gql`
mutation GiftcardActivate($id: ID!) {
  giftCardActivate(id: $id) {
    errors {
      field
      message
    }
  }
}`;

export const GIFT_CARD_DEACTIVATE_MUTATION = gql`
mutation GiftcardDeactivate($id: ID!) {
  giftCardDeactivate(id: $id) {
    errors {
      field
      message
    }
  }
}`;

export const GIFT_CARD_DELETE_MUTATION = gql`
mutation DeleteGiftcard($id: ID!) {
  giftCardDelete(id: $id) {
    errors {
      field
      message
    }
  }
}`;


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

export const GIFTCARD_LIST_QUERY = gql`
query Giftcards($first: Int, $last: Int, $before: String, $after: String, $sortBy: GiftCardSortingInput, $filter: GiftCardFilterInput, $search: String) {
  giftCards(first: $first, last: $last, before: $before, after: $after, sortBy: $sortBy, search: $search, filter: $filter) {
    edges {
      node {
        id
        code
        displayCode
        isActive
        created
        tags {
          id
          name
        }
        product {
          name
          slug
        }
        currentBalance {
          amount
          currency
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

export const GIFT_CARD_DETAIL_QUERY = gql`
query Giftcard($id: ID!) {
  giftCard(id: $id) {
    id
    metadata {
      key
      value
    }
    privateMetadata {
      key
      value
    }
    displayCode
    last4CodeChars
    code
    created
    createdByEmail
    lastUsedOn
    expiryDate
    tags {
      id
      name
    }
    isActive
    initialBalance {
      amount
      currency
    }
    currentBalance {
      amount
      currency
    }
  }
}`;

export const GIFT_CARD_EVENTS_QUERY = gql`
query GiftCardEvents($id: ID!, $filter: GiftCardEventFilterInput) {
  giftCard(id: $id) {
    events(filter: $filter) {
      id
      expiryDate
      oldExpiryDate
      date
      type
      message
      email
      orderId
      orderNumber
      tags
      oldTags
      balance {
        initialBalance {
          amount
          currency
        }
        currentBalance {
          amount
          currency
        }
      }
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
}`;

export const GIFT_CARD_ADD_NOTE_MUTATION = gql`
mutation GiftcardAddNote($id: ID!, $input: GiftCardAddNoteInput!) {
  giftCardAddNote(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

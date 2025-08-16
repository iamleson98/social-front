import { gql } from "@urql/core";

export const SHOP_UPDATE_MUTATION = gql`
mutation UpdateShop($input: ShopSettingsInput!) {
  shopSettingsUpdate(input: $input) {
    shop {
      id
    }
    errors {
      field
      message
    }
  }
}`;

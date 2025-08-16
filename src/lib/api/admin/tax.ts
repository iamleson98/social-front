import { gql } from "@urql/core";

export const TAX_CONFIG_LIST_QUERY = gql`
query TaxConfigs($first: Int, $after: String, $last: Int, $before: String, $filter: TaxConfigurationFilterInput) {
  taxConfigurations(first: $first, after: $after, before: $before, last: $last, filter: $filter) {
    edges {
      node {
        id
        channel {
          id
          name
        }
        displayGrossPrices
        pricesEnteredWithTax
        chargeTaxes
        taxCalculationStrategy
        taxAppId
        countries {
          chargeTaxes
          country {
            code
            country
          }
          taxCalculationStrategy
          displayGrossPrices
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
      hasPreviousPage
      startCursor
    }
  }
}`;

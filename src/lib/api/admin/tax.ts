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

export const TAX_CONFIG_DETAIL_QUERY = gql`
query TaxConfig($id: ID!) {
  taxConfiguration(id: $id) {
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
}`;

export const TAX_CONFIG_UPDATE_MUTATION = gql`
mutation UpdateTaxConfig($id: ID!, $input: TaxConfigurationUpdateInput!) {
  taxConfigurationUpdate(id: $id, input: $input) {
    taxConfiguration {
      id
    }
    errors {
      field
      message
    }
  }
}`;

export const TAX_COUNTRY_CONFIGURATION_UPDATE_MUTATION = gql`
mutation TaxCountryConfigurationUpdate($countryCode: CountryCode!, $updateTaxClassRates: [TaxClassRateInput!]!) {
  taxCountryConfigurationUpdate(countryCode: $countryCode, updateTaxClassRates: $updateTaxClassRates) {
    errors {
      field
      message
    }
  }
}`;

export const GET_TAX_COUNTRY_CONFIGURATIONS_QUERY = gql`
query TaxCountryConfigurations {
  taxCountryConfigurations {
    country {
      code
      country
    }
    taxClassCountryRates {
      taxClass {
        id
        name
      }
      rate
      country {
        code
        country
      }
    }
  }
}`;

export const GET_TAX_COUNTRY_CONFIGURATION_DETAIL_QUERY = gql`
query TaxCountryConfigurationDetail($countryCode: CountryCode!) {
  taxCountryConfiguration(countryCode: $countryCode) {
    country {
      code
      country
    }
    taxClassCountryRates {
      taxClass {
        id
        name
      }
      rate
      country {
        code
        country
      }
    }
  }
}`;

export const TAX_COUNTRY_CONFIGURATION_DELETE_MUTATION = gql`
mutation TaxCountryConfigurationDelete($countryCode: CountryCode!) {
  taxCountryConfigurationDelete(countryCode: $countryCode) {
    errors {
      field
      message
    }
  }
}`;

export const TAX_CLASS_UPDATE_MUTATION = gql`
mutation TaxClassUpdate($id: ID!, $input: TaxClassUpdateInput!) {
  taxClassUpdate(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

export const TAX_CLASS_DELETE_MUTATION = gql`
mutation TaxClassDelete($id: ID!) {
  taxClassDelete(id: $id) {
    errors {
      field
      message
    }
  }
}`;

export const TAX_CLASS_CREATE_MUTATION = gql`
mutation TaxClassCreate($input: TaxClassCreateInput!) {
  taxClassCreate(input: $input) {
    taxClass {
      id
    }
    errors {
      field
      message
    }
  }
}`;


import { gql } from "@urql/core";

export const USER_ADDRESS_CREATE_MUTATION = gql`
mutation CreateUserAddress($address: AddressInput!, $type: AddressTypeEnum) {
  accountAddressCreate(type: $type, input: $address) {
    user {
      id
      email
      addresses {
        id
        city
        phone
        postalCode
        companyName
        cityArea
        streetAddress1
        streetAddress2
        countryArea
        country {
          country
          code
        }
        firstName
        lastName
      }
      defaultBillingAddress {
        id
        city
        phone
        postalCode
        companyName
        cityArea
        streetAddress1
        streetAddress2
        countryArea
        country {
          country
          code
        }
        firstName
        lastName
      }
      defaultShippingAddress {
        id
        city
        phone
        postalCode
        companyName
        cityArea
        streetAddress1
        streetAddress2
        countryArea
        country {
          country
          code
        }
        firstName
        lastName
      }
    }
    errors {
      message
      field
    }
    address {
      id
      city
      phone
      postalCode
      companyName
      cityArea
      streetAddress1
      streetAddress2
      countryArea
      country {
        country
        code
      }
      firstName
      lastName
    }
  }
}`;

export const ADDRESS_VALIDATION_RULES_QUERY = gql`
query AddressValidationRules($countryCode: CountryCode!) {
  addressValidationRules(countryCode: $countryCode) {
    addressFormat
		allowedFields
		requiredFields
		countryAreaType
		postalCodeType
		cityType
		countryAreaChoices {
			raw
			verbose
		}
  }
}`;

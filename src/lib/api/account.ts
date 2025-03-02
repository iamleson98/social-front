import { gql } from "@urql/core";


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

/**
 * NOTE: This action requires Administration role
 */
export const USER_UPDATE_MUTATION = gql`
mutation UserUpdate($id: ID!, $input: CustomerInput!) {
  customerUpdate(id: $id, input: $input) {
    errors {
      field
      message
    }
    user {
      firstName
      lastName
      email
    }
  }
}`;

/**
 * NOTE: This action does not require Administration role
 */
export const ACCOUNT_UPDATE_MUTATION = gql`
mutation AccountUpdate($input: AccountInput!) {
  accountUpdate(input: $input) {
    errors {
      field
      message
    }
    user {
      firstName
      lastName
      email
      languageCode
    }
  }
}`;

export const PASSWORD_UPDATE_MUTATION = gql`
mutation UpdatePassword($oldPassword: String!, $newPassword: String!) {
  passwordChange(oldPassword: $oldPassword, newPassword: $newPassword) {
    errors {
      field
      message
    }
  }
}`;

/**
 * NOTE: This action requires Administration role
 */
export const ADDRESS_CREATE_MUTATION = gql`
mutation AddressCreate($userId: ID!, $input: AddressInput!) {
  addressCreate(userId: $userId, input: $input) {
    errors {
      field
      message
    }
    address {
      id
      firstName
      lastName
      companyName
      streetAddress1
      streetAddress2
      cityArea
      city
      postalCode
      countryArea
      phone
      isDefaultShippingAddress
      isDefaultBillingAddress
      country {
        code
        country
      }
    }
  }
}`;

/**
 * NOTE: Requires Administration role
 */
export const ADDRESS_DELETE_MUTATION = gql`
mutation DeleteAddress($id: ID!) {
  addressDelete(id: $id) {
    errors {
      field
      message
    }
  }
}`;

/**
 * NOTE: This action does not require Administration role
 */
export const ACCOUNT_ADDRESS_CREATE_MUTATION = gql`
mutation AccountAddressCreate($input: AddressInput!, $type: AddressTypeEnum) {
  accountAddressCreate(input: $input, type: $type) {
    errors {
      field
      message
    }
    user {
      addresses {
        id
        firstName
        lastName
        companyName
        streetAddress1
        streetAddress2
        cityArea
        city
        postalCode
        countryArea
        phone
        isDefaultShippingAddress
        isDefaultBillingAddress
        country {
          code
          country
        }
      }
    }
  }
}`

/**
 * NOTE: This action does not require Administration role
 */
export const ACCOUNT_ADDRESS_DELETE_MUTATION = gql`
mutation AccountAddressDelete($id: ID!) {
  accountAddressDelete(id: $id) {
    errors {
      field
      message
    }
  }
}`

/**
 * NOTE: This action does not require Administration role
 */
export const ACCOUNT_SET_DEFAULT_ADDRESS_MUTATION = gql`
mutation AccountSetDefaultAddress($id: ID!, $type: AddressTypeEnum!) {
  accountSetDefaultAddress(id: $id, type: $type) {
    errors {
      field
      message
    }
    user {
      addresses {
        id
        firstName
        lastName
        companyName
        streetAddress1
        streetAddress2
        cityArea
        city
        postalCode
        countryArea
        phone
        isDefaultShippingAddress
        isDefaultBillingAddress
        country {
          code
          country
        }
      }
    }
  }
}`

/**
 * NOTE: This action does not require Administration role
 */
export const ACCOUNT_ADDRESS_UPDATE_MUTATION = gql`
mutation AccountAddressUpdate($id: ID!, $input: AddressInput!) {
  accountAddressUpdate(id: $id, input: $input) {
    errors {
      field
      message
    }
    user {
      addresses {
        id
        firstName
        lastName
        companyName
        streetAddress1
        streetAddress2
        cityArea
        city
        postalCode
        countryArea
        phone
        isDefaultShippingAddress
        isDefaultBillingAddress
        country {
          code
          country
        }
      }
    }
  }
}`;

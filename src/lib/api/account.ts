import { gql } from "@urql/core";

// export const USER_ADDRESS_CREATE_MUTATION = gql`
// mutation CreateUserAddress($address: AddressInput!, $type: AddressTypeEnum) {
//   accountAddressCreate(type: $type, input: $address) {
//     user {
//       id
//       email
//       addresses {
//         id
//         city
//         phone
//         postalCode
//         companyName
//         cityArea
//         streetAddress1
//         streetAddress2
//         countryArea
//         country {
//           country
//           code
//         }
//         firstName
//         lastName
//       }
//       defaultBillingAddress {
//         id
//         city
//         phone
//         postalCode
//         companyName
//         cityArea
//         streetAddress1
//         streetAddress2
//         countryArea
//         country {
//           country
//           code
//         }
//         firstName
//         lastName
//       }
//       defaultShippingAddress {
//         id
//         city
//         phone
//         postalCode
//         companyName
//         cityArea
//         streetAddress1
//         streetAddress2
//         countryArea
//         country {
//           country
//           code
//         }
//         firstName
//         lastName
//       }
//     }
//     errors {
//       message
//       field
//     }
//     address {
//       id
//       city
//       phone
//       postalCode
//       companyName
//       cityArea
//       streetAddress1
//       streetAddress2
//       countryArea
//       country {
//         country
//         code
//       }
//       firstName
//       lastName
//     }
//   }
// }`;

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

export const PASSWORD_UPDATE_MUTATION = gql`
mutation UpdatePassword($oldPassword: String!, $newPassword: String!) {
  passwordChange(oldPassword: $oldPassword, newPassword: $newPassword) {
    errors {
      field
      message
    }
  }
}`;

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
      country {
        code
        country
      }
    }
  }
}`;

export const ADDRESS_DELETE_MUTATION = gql`
mutation DeleteAddress($id: ID!) {
  addressDelete(id: $id) {
    errors {
      field
      message
    }
  }
}`;

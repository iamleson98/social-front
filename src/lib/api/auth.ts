import { gql } from '@urql/core';

export const USER_LOGIN_MUTATION_STORE = gql`
	mutation TokenCreate($email: String!, $password: String!) {
		tokenCreate(email: $email, password: $password) {
			token
			csrfToken
			refreshToken
			user {
				id
				email
				firstName
				lastName
				isStaff
				restrictedAccessToChannels
				languageCode
				metadata {
					key
					value
				}
				userPermissions {
					code
					name
				}
				avatar(size: 100, format: WEBP) {
					url
					alt
				}
				accessibleChannels {
					id
					name
					slug
					isActive
					currencyCode
					defaultCountry {
						code
						country
					}
					stockSettings {
						allocationStrategy
					}
				}
				addresses {
					id
					streetAddress1
					streetAddress2
					city
					postalCode
					cityArea
					phone
					isDefaultShippingAddress
					isDefaultBillingAddress
					companyName
					countryArea
					firstName
					lastName
					country {
						country
						code
					}
				}
			}
			errors {
				code
				message
				field
			}
		}
	}
`;

export const USER_SIGNUP_MUTATION_STORE = gql`
	mutation Signup($input: AccountRegisterInput!) {
		accountRegister(input: $input) {
			user {
				id
				email
			}
			errors {
				field
				message
			}
			requiresConfirmation
		}
	}
`;

export const MY_GIFTCARDS_QUERY = gql`
query MyGiftcards($first: Int, $last: Int, $before: String, $after: String) {
	me {
		giftCards(first: $first, last: $last, before: $before, after: $after) {
			edges {
				node {
					id
					displayCode
					last4CodeChars
					created
					lastUsedOn
					expiryDate
					product {
						id
						slug
						name
					}
					tags {
						id
						name
					}
					boughtInChannel
					isActive
					initialBalance {
						amount
						currency
					}
					currentBalance {
						amount
						currency
					}
					events {
						id
						date
						type
						message
						orderId
						orderNumber
						# balance {

						# }
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
	}
}`;

export const USER_ME_QUERY_STORE = gql`
	query Me {
		me {
			id
			email
			firstName
			lastName
			isStaff
			restrictedAccessToChannels
			languageCode
			isConfirmed
			metadata {
				key
				value
			}
			userPermissions {
				code
				name
			}
			editableGroups {
				id
			}
			avatar(size: 100, format: WEBP) {
				url
				alt
			}
			accessibleChannels {
				id
				name
				slug
				isActive
				currencyCode
				defaultCountry {
					code
					country
				}
				stockSettings {
					allocationStrategy
				}
			}
			addresses {
				id
				streetAddress1
				streetAddress2
				city
				postalCode
				cityArea
				phone
				isDefaultShippingAddress
				isDefaultBillingAddress
				companyName
				countryArea
				firstName
				lastName
				country {
					country
					code
				}
			}
		}
	}
`;

export const USER_REFRESH_TOKEN_MUTATION_STORE = gql`
	mutation TokenRefresh($csrfToken: String, $refreshToken: String) {
		tokenRefresh(csrfToken: $csrfToken, refreshToken: $refreshToken) {
			token
			user {
				id
				email
				firstName
				lastName
				isStaff
				restrictedAccessToChannels
				languageCode
				metadata {
					key
					value
				}
				userPermissions {
					code
					name
				}
				avatar(size: 100, format: WEBP) {
					url
					alt
				}
				# accessibleChannels {
				# 	id
				# 	name
				# 	slug
				# 	isActive
				# 	currencyCode
				# 	defaultCountry {
				# 		code
				# 		country
				# 	}
				# 	stockSettings {
				# 		allocationStrategy
				# 	}
				# }
				addresses {
					id
					streetAddress1
					streetAddress2
					city
					postalCode
					cityArea
					phone
					isDefaultShippingAddress
					isDefaultBillingAddress
					companyName
					countryArea
					firstName
					lastName
					country {
						country
						code
					}
				}
			}
			errors {
				code
				message
				field
			}
		}
	}
`;

export const USER_REQUEST_PASSWORD_RESET_MUTATION_STORE = gql`
	mutation RequestPasswordReset($email: String!, $redirectUrl: String!, $channel: String) {
		requestPasswordReset(email: $email, redirectUrl: $redirectUrl, channel: $channel) {
			errors {
				field
				message
				code
			}
		}
	}
`;

/** used for authenticated user update t¥his password  */
export const USER_CHANGE_PASSWORD_MUTATION_STORE = gql`
	mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
		passwordChange(newPassword: $newPassword, oldPassword: $oldPassword) {
			errors {
				field
				message
				code
			}
			user {
				id
			}
		}
	}
`;

/** used for resetting password */
export const USER_SET_PASSWORD_MUTATION_STORE = gql`
	mutation SetPassword($token: String!, $email: String!, $password: String!) {
		setPassword(email: $email, token: $token, password: $password) {
			errors {
				field
				message
				code
			}
		}
	}
`;

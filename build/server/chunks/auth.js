import { gql } from "@urql/core";
const USER_LOGIN_MUTATION_STORE = gql`
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
				avatar {
					url
					alt
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
const USER_SIGNUP_MUTATION_STORE = gql`
	mutation Signup($input: AccountRegisterInput!) {
		accountRegister(input: $input) {
			user {
				id
			}
			errors {
				field
				message
			}
			requiresConfirmation
		}
	}
`;
const USER_ME_QUERY_STORE = gql`
	query Me {
		me {
			id
			email
			firstName
			lastName
			avatar {
				url
				alt
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
			}
		}
	}
`;
gql`
	mutation TokenRefresh($csrfToken: String, $refreshToken: String) {
		tokenRefresh(csrfToken: $csrfToken, refreshToken: $refreshToken) {
			token
			errors {
				code
				message
				field
			}
		}
	}
`;
const USER_REQUEST_PASSWORD_RESET_MUTATION_STORE = gql`
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
gql`
	mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
		passwordChange(newPassword: $newPassword, oldPassword: $oldPassword) {
			errors {
				field
				message
				code
			}
		}
	}
`;
const USER_SET_PASSWORD_MUTATION_STORE = gql`
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
export {
  USER_SET_PASSWORD_MUTATION_STORE as U,
  USER_ME_QUERY_STORE as a,
  USER_REQUEST_PASSWORD_RESET_MUTATION_STORE as b,
  USER_LOGIN_MUTATION_STORE as c,
  USER_SIGNUP_MUTATION_STORE as d
};

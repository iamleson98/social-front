import { graphql } from "$houdini";

export const USER_LOGIN_MUTATION_STORE = graphql(`mutation TokenCreate($email: String!, $password: String!) {
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
}`);

export const USER_SIGNUP_MUTATION_STORE = graphql(`
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
	`);

export const USER_ME_QUERY_STORE = graphql(`query Me {
  me {
    id
    email
    firstName
    lastName
    avatar {
      url
      alt
    }
    }
}`);

export const USER_REFRESH_TOKEN_MUTATION_STORE = graphql(`mutation TokenRefresh($csrfToken: String, $refreshToken: String) {
  tokenRefresh(csrfToken: $csrfToken, refreshToken: $refreshToken) {
    token
    errors {
      code
      message
      field
    } 
  }
}`);

export const USER_REQUEST_PASSWORD_RESET_MUTATION_STORE = graphql(`mutation RequestPasswordReset(
  $email: String!,
  $redirectUrl: String!
  $channel: String
) {
  requestPasswordReset(email: $email, redirectUrl: $redirectUrl, channel: $channel) {
    errors {
      field
      message
      code
    }
  }
}`);

export const USER_CHANGE_PASSWORD_MUTATION_STORE = graphql(`mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
  passwordChange(newPassword: $newPassword, oldPassword: $oldPassword) {
    errors {
      field
      message
      code
    }
  }
}`);

export const USER_SET_PASSWORD_MUTATION_STORE = graphql(`mutation SetPassword($token: String!, $email: String!, $password: String!) {
  setPassword(email: $email, token: $token, password: $password) {
    errors {
      field
      message
      code
    }
  }
}`)


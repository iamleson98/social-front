import { graphql } from "$houdini";

export const loginStore = graphql(`mutation TokenCreate($email: String!, $password: String!) {
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

export const signupStore = graphql(`
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

export const queryUserStore = graphql(`query Me {
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

export const UserRefreshTokenMutationStore = graphql(`mutation TokenRefresh($csrfToken: String, $refreshToken: String) {
  tokenRefresh(csrfToken: $csrfToken, refreshToken: $refreshToken) {
    token
    errors {
      code
      message
      field
    } 
  }
}`);

export const UserRequestPasswordResetMutationStore = graphql(`mutation RequestPasswordReset(
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

export const UserChangePasswordMutationStore = graphql(`mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
  passwordChange(newPassword: $newPassword, oldPassword: $oldPassword) {
    errors {
      field
      message
      code
    }
  }
}`);

export const UserSetPasswordMutationStore = graphql(`mutation SetPassword($token: String!, $email: String!, $password: String!) {
  setPassword(email: $email, token: $token, password: $password) {
    errors {
      field
      message
      code
    }
  }
}`)


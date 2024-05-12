import { graphql } from "$houdini";

export const loginStore = graphql(`mutation TokenCreate($email: String!, $password: String!) {
  tokenCreate(email: $email, password: $password) {
    token
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

// export const a = fragment()

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


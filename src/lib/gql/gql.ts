/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "fragment UserDetail on User {\n  id\n  email\n  firstName\n  lastName\n  avatar {\n    url\n    alt\n  }\n}": types.UserDetailFragmentDoc,
    "mutation TokenCreate($email: String!, $password: String!) {\n  tokenCreate(email: $email, password: $password) {\n    token\n    user {\n      id\n      email\n      firstName\n      lastName\n      avatar {\n        url\n        alt\n      }\n    }\n  }\n}\n\nmutation AccountCreate($input: AccountRegisterInput!) {\n  accountRegister(input: $input) {\n    requiresConfirmation\n  }\n}": types.TokenCreateDocument,
    "query CurrentUser {\n  me {\n    ...UserDetail\n  }\n}": types.CurrentUserDocument,
    "fragment ProductItem on Product {\n  id\n  name\n  slug\n  pricing {\n    priceRange {\n      start {\n        gross {\n          amount\n          currency\n        }\n      }\n      stop {\n        gross {\n          amount\n          currency\n        }\n      }\n    }\n  }\n  category {\n    id\n    name\n  }\n  thumbnail(size: 1000, format: WEBP) {\n    url\n    alt\n  }\n}": types.ProductItemFragmentDoc,
    "query ProductList($first: Int, $last: Int, $before: String, $after: String, $channel: String, $search: String, $sortBy: ProductOrder, $filter: ProductFilterInput, $where: ProductWhereInput) {\n  products(\n    first: $first\n    last: $last\n    before: $before\n    after: $after\n    channel: $channel\n    search: $search\n    sortBy: $sortBy\n    filter: $filter\n    where: $where\n  ) {\n    edges {\n      node {\n        ...ProductItem\n      }\n    }\n  }\n}": types.ProductListDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment UserDetail on User {\n  id\n  email\n  firstName\n  lastName\n  avatar {\n    url\n    alt\n  }\n}"): typeof import('./graphql').UserDetailFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation TokenCreate($email: String!, $password: String!) {\n  tokenCreate(email: $email, password: $password) {\n    token\n    user {\n      id\n      email\n      firstName\n      lastName\n      avatar {\n        url\n        alt\n      }\n    }\n  }\n}\n\nmutation AccountCreate($input: AccountRegisterInput!) {\n  accountRegister(input: $input) {\n    requiresConfirmation\n  }\n}"): typeof import('./graphql').TokenCreateDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query CurrentUser {\n  me {\n    ...UserDetail\n  }\n}"): typeof import('./graphql').CurrentUserDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment ProductItem on Product {\n  id\n  name\n  slug\n  pricing {\n    priceRange {\n      start {\n        gross {\n          amount\n          currency\n        }\n      }\n      stop {\n        gross {\n          amount\n          currency\n        }\n      }\n    }\n  }\n  category {\n    id\n    name\n  }\n  thumbnail(size: 1000, format: WEBP) {\n    url\n    alt\n  }\n}"): typeof import('./graphql').ProductItemFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ProductList($first: Int, $last: Int, $before: String, $after: String, $channel: String, $search: String, $sortBy: ProductOrder, $filter: ProductFilterInput, $where: ProductWhereInput) {\n  products(\n    first: $first\n    last: $last\n    before: $before\n    after: $after\n    channel: $channel\n    search: $search\n    sortBy: $sortBy\n    filter: $filter\n    where: $where\n  ) {\n    edges {\n      node {\n        ...ProductItem\n      }\n    }\n  }\n}"): typeof import('./graphql').ProductListDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

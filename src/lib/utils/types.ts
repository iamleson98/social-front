
import type { LanguageCodeEnum, QueryCheckoutArgs } from "$lib/gql/graphql";

export type CustomQueryCheckoutArgs = { languageCode?: LanguageCodeEnum } & QueryCheckoutArgs;

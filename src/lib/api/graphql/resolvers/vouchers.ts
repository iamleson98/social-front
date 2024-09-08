// import { graphqlClient } from "$lib/client";
import type { QueryVouchersArgs, VoucherCountableConnection } from "$lib/gql/graphql";
import type { YogaInitialContext } from "graphql-yoga";

export const resolveVouchers = async function (root: unknown, { first, last, sortBy, before, after }: QueryVouchersArgs, context: YogaInitialContext): Promise<VoucherCountableConnection> {
  // graphqlClient.query
}

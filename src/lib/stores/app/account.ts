// import { graphqlClient } from "$lib/client";
// import type { AddressValidationData, Query, QueryAddressValidationRulesArgs } from "$lib/gql/graphql";
// import { defaultChannel } from "$lib/utils/consts";
// import { get, writable } from "svelte/store";
// import { ADDRESS_VALIDATION_RULES_QUERY } from "../api/account";
// import { preHandleGraphqlResult } from "$lib/utils/utils";


// const createAddressValidationRulesManager = () => {
// 	const _store = writable<AddressValidationData>();

// 	const setupRulesForCountry = async (countryCode = defaultChannel.countryCode) => {
// 		const existingRules = get(_store);
// 		if (existingRules && existingRules.countryCode.toUpperCase() === countryCode) return;

// 		const result = await graphqlClient
// 			.query<Pick<Query, 'addressValidationRules'>, QueryAddressValidationRulesArgs>(
// 				ADDRESS_VALIDATION_RULES_QUERY,
// 				{ countryCode },
// 				{ requestPolicy: 'network-only' }
// 			)
// 			.toPromise();

// 		if (preHandleGraphqlResult(result)) return;

// 		_store.set(result.data?.addressValidationRules as AddressValidationData);
// 	};

// 	return {
// 		setupRulesForCountry,
// 		subscribe: _store.subscribe,
// 	};
// };

// export const addressValidationRules = createAddressValidationRulesManager();


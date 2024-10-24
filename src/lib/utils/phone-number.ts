import type { CountryCode } from "$lib/gql/graphql";
import {
	parsePhoneNumberWithError,
	type CountryCode as PhoneNumberLibCountryCode,
	type PhoneNumber,
} from "libphonenumber-js/max";

export const getPhoneNumberInstance = (phone: string, countryCode: CountryCode | undefined): PhoneNumber | null => {
	try {
		const phoneNumber = parsePhoneNumberWithError(phone, countryCode as PhoneNumberLibCountryCode);
		return phoneNumber;
	} catch (error) {
		return null;
	}
};


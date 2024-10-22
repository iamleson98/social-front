import {
	parsePhoneNumberWithError,
	type CountryCode as PhoneNumberLibCountryCode,
	type PhoneNumber,
} from "libphonenumber-js/max";

const getPhoneNumberInstance = (phone: string, countryCode: CountryCode | undefined): PhoneNumber | null => {
	try {
		const phoneNumber = parsePhoneNumberWithError(phone, countryCode as PhoneNumberLibCountryCode);
		return phoneNumber;
	} catch (error) {
		return null;
	}
};


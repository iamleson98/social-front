import { tClient } from "$i18n";
import { CountryCode, type Address, type AddressValidationData, type Maybe } from "$lib/gql/graphql";
import { uniq } from "lodash-es";
import camelCase from 'lodash-es/camelCase';
import { numberRegex } from "./utils";
import { parsePhoneNumberWithError, type CountryCode as PhoneCountryCode } from "libphonenumber-js/max";

export type LocalizedAddressFieldLabel =
  | "province"
  | "district"
  | "state"
  | "zip"
  | "postal"
  | "postTown"
  | "prefecture";

export const localizedAddressFieldMessages: Record<LocalizedAddressFieldLabel, string> = {
  province: "Province",
  district: "District",
  state: "State",
  zip: "Zip code",
  postal: "Postal code",
  postTown: "Post town",
  prefecture: "Prefecture",
};

export type AddressField =
  | "city"
  | "firstName"
  | "lastName"
  | "countryArea"
  | "cityArea"
  | "postalCode"
  | "countryCode"
  | "companyName"
  | "streetAddress1"
  | "streetAddress2"
  | "phone";

type AddressFieldObj = {
  value: string | number;
  error: string | null;
};

export const addressFieldsOrder: AddressField[] = [
  "firstName",
  "lastName",
  "companyName",
  "streetAddress1",
  "streetAddress2",
  "city",
  "countryCode",
  "postalCode",
  "cityArea",
  "countryArea",
  "phone",
];

export const addressToFieldValues = (addr: Address): Record<AddressField, AddressFieldObj> => {
  const result: Record<AddressField, AddressFieldObj> = defaultAddressFormValues;
  for (const key in addr) {
    if (key === "country") {
      result.countryCode.value = addr.country.code;
      continue;
    }
    if (key in result) {
      result[key as AddressField].value = addr[key as keyof Address] as string | number;
    }
  }

  return result;
};

export const defaultAddressFormValues: Record<AddressField, AddressFieldObj> = addressFieldsOrder
  .reduce((prev, acc) => ({ ...prev, [acc]: { value: "", error: null } }), {} as Record<AddressField, AddressFieldObj>);

export type AddressFormData = Omit<Record<AddressField, string>, "country" | "countryCode"> & {
  countryCode: CountryCode;
};

export type AddressFieldValidator = (required: boolean, value?: string | number, countryCode?: CountryCode) => string | null;

export const addressFieldValidators: Record<AddressField, AddressFieldValidator> = {
  city: (required: boolean, value?: string | number) => {
    if (!required) {
      if (!value) return null;
      if (typeof value !== 'string' || numberRegex.test(value)) return "Invalid city";
      return null;
    }

    if (!value || numberRegex.test(value as string)) return "City is required";
    return null;
  },
  firstName: (required: boolean, value?: string | number) => {
    if (!required) {
      if (!value) return null;
      if (typeof value !== 'string') return "Invalid first name";
      return null;
    }

    if (!value) return "First name is required";
    return null;
  },
  lastName: (required: boolean, value?: string | number) => {
    if (!required) {
      if (!value) return null;
      if (typeof value !== 'string') return "Invalid last name";
      return null;
    }

    if (!value) return "Last name is required";
    return null;
  },
  countryArea: (required: boolean, value?: string | number) => {
    if (!required) {
      if (!value) return null;
      if (typeof value !== 'string' || numberRegex.test(value)) return "Invalid country area";
      return null;
    }

    if (!value) return "Country area is required";
    return null;
  },
  cityArea: (required: boolean, value?: string | number) => {
    if (!required) {
      if (!value) return null;
      if (typeof value !== 'string') return "Invalid city area";
      return null;
    }

    if (!value) return "City area is required";
    return null;
  },
  postalCode: (required: boolean, value?: string | number) => {
    if (!required) {
      if (!value) return null;
      if (typeof value !== 'string') return "Invalid postal code";
      return null;
    }

    if (!value) return "Postal code is required";
    return null;
  },
  countryCode: (required: boolean, value?: string | number) => {
    if (!required) {
      if (!value) return null;
      if (typeof value !== 'string') return "Invalid country code";
      return null;
    }

    if (!value || typeof value === 'number' || numberRegex.test(value) || !(value.toUpperCase() in CountryCode)) return "Country code is required";
    return null;
  },
  companyName: (required: boolean, value?: string | number) => {
    if (!required) {
      if (!value) return null;
      if (typeof value !== 'string') return "Invalid company name";
      return null;
    }

    if (!value) return "Company name is required";
    return null;
  },
  streetAddress1: (required: boolean, value?: string | number) => {
    if (!required) {
      if (!value) return null;
      if (typeof value !== 'string') return "Invalid street address";
      return null;
    }

    if (!value) return "Street address is required";
    return null;
  },
  streetAddress2: (required: boolean, value?: string | number) => {
    if (!required) {
      if (!value) return null;
      if (typeof value !== 'string') return "Invalid street address 2";
      return null;
    }

    if (!value) return "Street address 2 is required";
    return null;
  },
  phone: (required: boolean, value?: string | number, countryCode?: CountryCode) => {
    if (!required) {
      if (!value) return null;
      if (typeof value !== 'string') return "Invalid phone number";
    }

    if (!value || typeof value !== 'string') return "Phone number is required";
    try {
      const result = parsePhoneNumberWithError(value, countryCode as PhoneCountryCode);
      if (!result.isValid()) return "Invalid phone number";
      return null;
    } catch {
      return "Invalid phone number";
    }
  }
};

export type AddressFieldLabel = Exclude<AddressField, "countryCode"> | "country";

/** NOTE: this code must be use by client side since it contains client translation */
export const addressFieldMessages: Record<AddressFieldLabel, string> = {
  city: tClient('common.city'),
  firstName: tClient('common.firstName'),
  countryArea: tClient('common.countryArea'),
  lastName: tClient('common.lastName'),
  country: tClient('common.country'),
  cityArea: tClient('common.cityArea'),
  postalCode: tClient('common.postalCode'),
  companyName: tClient('common.companyName'),
  streetAddress1: tClient('common.streetAddress1'),
  streetAddress2: tClient('common.streetAddress2'),
  phone: tClient('common.phone'),
};

export type ApiAddressField = AddressField | "name";

export const getRequiredAddressFields = (requiredFields: AddressField[] = []): AddressField[] => [
  ...requiredFields,
  "firstName",
  "lastName",
  "phone",
];

type LocalizedObj = {
  countryArea: string,
  city: string,
  postalCode: string,
}

export const typeTags: Partial<Record<AddressField, string>> = {
  phone: "tel",
};

export const getFilteredAddressFields = (addressFields: ApiAddressField[]) => {
  const filteredAddressFields = addressFields.filter(
    (addressField: ApiAddressField) => addressField !== "name",
  ) as AddressField[];

  return uniq([...filteredAddressFields, "firstName", "lastName", "phone"]);
};

export const getOrderedAddressFields = (addressFields: AddressField[]) => {
  const filteredAddressFields = getFilteredAddressFields(addressFields);
  const result = addressFieldsOrder.filter(field => filteredAddressFields.includes(field));

  return result;
};

const getLocalizedFieldLabel = (field: AddressField, localizedField?: string) => {
  try {
    const translatedLabel = localizedAddressFieldMessages[camelCase(localizedField) as LocalizedAddressFieldLabel];
    return translatedLabel;
  } catch {
    console.warn(`Missing translation: ${localizedField}`);
    return addressFieldMessages[camelCase(field) as AddressFieldLabel];
  }
};

export const isRequiredField = (field: AddressField, validationRules: AddressValidationData) => {
  if (!validationRules.requiredFields) return false;

  return getRequiredAddressFields(validationRules.requiredFields as AddressField[]).includes(field)
};

export type AddressFragment = {
  __typename?: "Address";
  id: string;
  city: string;
  phone?: string | null;
  postalCode: string;
  companyName: string;
  cityArea: string;
  streetAddress1: string;
  streetAddress2: string;
  countryArea: string;
  firstName: string;
  lastName: string;
  country: { __typename?: "CountryDisplay"; country: string; code: string };
};

const getMissingFieldsFromAddress = (address: Maybe<AddressFragment>, validationRules: AddressValidationData) => {
  if (!address) return [];

  const missingFields: AddressField[] = [];

  for (const field of Object.keys(address)) {
    const value = address[field as keyof typeof address];

    if (!isRequiredField(field as AddressField, validationRules) || !!value) continue;
    missingFields.push(field as AddressField);
  }

  return missingFields;
};

export const hasAllRequiredFields = (address: Maybe<AddressFragment>, validationRules: AddressValidationData) => {
  return !getMissingFieldsFromAddress(address, validationRules).length;
};

export const getFieldLabel = (field: AddressField, localizedFields: LocalizedObj) => {
  const localizedField = localizedFields[field as keyof typeof localizedFields];
  const isLocalizedField = !!localizedField && localizedField !== field;

  if (isLocalizedField) {
    return getLocalizedFieldLabel(field, localizedField);
  }

  return addressFieldMessages[camelCase(field) as AddressFieldLabel];
};

const countryNames = new Intl.DisplayNames("EN-US", {
  type: "region",
});

export const getCountryName = (countryCode: string): string =>
  countryNames.of(countryCode) || countryCode;

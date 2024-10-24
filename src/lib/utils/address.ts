import type { AddressValidationData, Maybe } from "$lib/gql/graphql";
import camelCase from 'lodash-es/camelCase';

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

export type AddressFieldLabel = Exclude<AddressField, "countryCode"> | "country";


export const addressFieldMessages: Record<AddressFieldLabel, string> = {
  city: "City",
  firstName: "First name",
  countryArea: "Country area",
  lastName: "Last name",
  country: "Country",
  cityArea: "City area",
  postalCode: "Postal code",
  companyName: "Company",
  streetAddress1: "Street address",
  streetAddress2: "Street address (continue)",
  phone: "Phone number",
};

export type ApiAddressField = AddressField | "name";

export const getRequiredAddressFields = (requiredFields: AddressField[] = []): AddressField[] => [
  ...requiredFields,
  "firstName",
  "lastName",
];

type LocalizedObj = {
  countryArea: string,
  city: string,
  postalCode: string,
}

export const getFilteredAddressFields = (fields: ApiAddressField[]) => {
  const meetMap: Record<string, boolean> = {};
  for (const field of fields.concat(['firstName', 'lastName', 'phone'])) {
    if (field === 'name') continue;

    meetMap[field] = true;
  }

  return Object.keys(meetMap) as AddressField[];
};

export const getOrderedAddressFields = (addressFields: AddressField[]) => {
  const filteredAddressFields = getFilteredAddressFields(addressFields);
  return addressFieldsOrder.filter(field => filteredAddressFields.includes(field));
};

const getLocalizedFieldLabel = (field: AddressField, localizedField?: string) => {
  try {
    const translatedLabel =
      localizedAddressFieldMessages[camelCase(localizedField) as LocalizedAddressFieldLabel];
    return translatedLabel;
  } catch (e) {
    console.warn(`Missing translation: ${localizedField}`);
    return addressFieldMessages[camelCase(field) as AddressFieldLabel];
  }
};

const isRequiredField = (field: AddressField, validationRules: AddressValidationData) => {
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

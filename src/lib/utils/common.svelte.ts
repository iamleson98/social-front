import { T } from '$i18n';
import { derived } from 'svelte/store';

export const CommonState = derived(T, (func) => ({
	FieldRequiredError: func('helpText.fieldRequired'),
	EditSuccess: func('common.editSuccess'),
	DeleteSuccess: func('common.delSuccess'),
	CreateSuccess: func('common.createSuccess'),
	ConfirmDelete: func('common.confirmDel'),
	NonNegativeError: func('error.negativeNumber'),
	InvalidEmail: func('error.invalidEmail'),
	Picture: func('common.pic'),
	Name: func('common.name'),
	NumberOfProducts: func('collection.noOfPrds'),
	
}));

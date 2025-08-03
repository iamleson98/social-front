import { tranFunc } from "$i18n";
import { get } from "svelte/store";

export class CommonStateCls {
  readonly FieldRequiredError = $derived(get(tranFunc)('helpText.fieldRequired'));
  readonly EditSuccess = $derived(get(tranFunc)('common.editSuccess'));
  readonly DeleteSuccess = $derived(get(tranFunc)('common.delSuccess'));
  readonly CreateSuccess = $derived(get(tranFunc)('common.createSuccess'));
  readonly ConfirmDelete = $derived(get(tranFunc)('common.confirmDel'));
}

export const CommonState = new CommonStateCls();

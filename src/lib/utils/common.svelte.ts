import { tranFunc } from "$i18n";
import { get } from "svelte/store";

class CommonStateCls {
  private tranFunc = $derived(get(tranFunc));
  readonly FieldRequiredError = $derived(this.tranFunc('helpText.fieldRequired'));
  readonly EditSuccess = $derived(this.tranFunc('common.editSuccess'));
  readonly DeleteSuccess = $derived(this.tranFunc('common.delSuccess'));
  readonly CreateSuccess = $derived(this.tranFunc('common.createSuccess'));
  readonly ConfirmDelete = $derived(this.tranFunc('common.confirmDel'));
  readonly NonNegativeError = $derived(this.tranFunc('error.negativeNumber'));
}

export const CommonState = new CommonStateCls();

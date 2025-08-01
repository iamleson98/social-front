import { tranFunc } from "$i18n";
import { get } from "svelte/store";

export class CommonStateCls {
  readonly FieldRequiredError = $derived(get(tranFunc)('helpText.fieldRequired'));
}

export const CommonState = new CommonStateCls();

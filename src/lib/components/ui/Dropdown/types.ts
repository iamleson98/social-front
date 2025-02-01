import type { IconType } from "$lib/components/icons";
import { type Snippet } from "svelte";
import type { EventHandler } from "svelte/elements"

export type DropdownTriggerInterface = {
  onclick?: EventHandler<MouseEvent>;
  onfocus?: EventHandler<FocusEvent>;
};

export type MenuItemProps = {
  children?: Snippet | string;
  /** if provided, display item as a link  */
  href?: string;
  startIcon?: IconType;
  disabled?: boolean;
  onclick?: () => void;
};

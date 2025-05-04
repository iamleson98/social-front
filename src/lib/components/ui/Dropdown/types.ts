import type { IconContent } from "$lib/components/icons";
import type { Placement } from "@floating-ui/dom";
import { type Snippet } from "svelte";
import type { DropdownTriggerInterface } from "../Popover";


export type MenuItemProps = {
  children?: Snippet | string;
  /** if provided, display item as a link  */
  href?: string;
  startIcon?: IconContent;
  disabled?: boolean;
  onclick?: () => void;
  class?: string;
};

export type DropdownProps = {
  /** NOTE: children and options must be provided exclusively */
  options?: MenuItemProps[];
  trigger: Snippet<[DropdownTriggerInterface]>;
  placement?: Placement;
  /** NOTE: children and options must be provided exclusively */
  children?: Snippet;
  /** if `true`, will not recalculate position on window resize nor scroll */
  noReCalculateOnWindowResize?: boolean;
  open?: boolean;
};


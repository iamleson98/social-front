import type { Snippet } from "svelte";
import type { SocialSize } from "../common";

export const modalSizeMap: Record<SocialSize, string> = {
  'lg': 'max-w-4xl',
  'md': 'max-w-2xl',
  'sm': 'max-w-lg',
  'xl': 'max-w-7xl',
  'xs': 'max-w-sm',
};

export type ModalProps = {
  /** @default 'md'  */
  size?: SocialSize;
  open: boolean;
  header: string;
  children: Snippet;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  hideHeader?: boolean;
  hideFooter?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
};

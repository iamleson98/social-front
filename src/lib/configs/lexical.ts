import type { CreateEditorArgs, ElementNode, RangeSelection, TextFormatType, TextNode } from 'lexical';
import { $isAtNodeEnd } from '@lexical/selection';
import { Bold, BulletList, CheckList, Heading2, Heading3, Highlight, Italic, NumberList, Paragraph, Quote, StrikeThrough, Subscript, Superscript, Underline, type IconType } from '$lib/components/icons';
import { IS_APPLE } from '@lexical/utils';
import { ListItemNode, ListNode, type ListType } from '@lexical/list';
import { HeadingNode, QuoteNode, type HeadingTagType } from '@lexical/rich-text';
import { productDescriptionEditorTheme } from './PlaygroundEditorTheme';

export const editorConfig: CreateEditorArgs = {
  namespace: 'MyEditor',
  theme: productDescriptionEditorTheme,
  onError: console.error,
  editable: true,
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
  ],
};

export type InlineType = Exclude<TextFormatType, 'code' | 'lowercase' | 'uppercase' | 'capitalize'>;

export const DEFAULT_INLINE_FORMATS: Readonly<Record<InlineType, Styleformat>> = {
  bold: {
    icon: Bold,
    tip: `Bold (${IS_APPLE ? '⌘' : 'Ctrl'}+B)`,
  },
  italic: {
    icon: Italic,
    tip: `Italic (${IS_APPLE ? '⌘' : 'Ctrl'}+I)`,
  },
  underline: {
    icon: Underline,
    tip: `Underline (${IS_APPLE ? '⌘' : 'Ctrl'}+U)`,
  },
  strikethrough: {
    icon: StrikeThrough,
    tip: `Strikethrough`,
  },
  subscript: {
    icon: Subscript,
    tip: `Subscript`,
  },
  superscript: {
    icon: Superscript,
    tip: `Superscript`,
  },
  highlight: {
    icon: Highlight,
    tip: `Highlight`,
  },
};

export type BlockType = ListType | Exclude<HeadingTagType, 'h1' | 'h4' | 'h5' | 'h6'> | 'quote' | 'paragraph';

export const defaultBlockFormats: Readonly<Record<BlockType, Styleformat>> = {
  paragraph: {
    icon: Paragraph,
    tip: 'Normal',
  },
  number: {
    icon: NumberList,
    tip: 'Numbered List',
  },
  bullet: {
    icon: BulletList,
    tip: 'Bulleted List',
  },
  check: {
    icon: CheckList,
    tip: 'Check List',
  },
  h2: {
    icon: Heading2,
    tip: 'Heading 2',
  },
  h3: {
    icon: Heading3,
    tip: 'Heading 3',
  },
  quote: {
    icon: Quote,
    tip: 'Quote',
  },
};

export type Styleformat = {
  icon: IconType;
  active?: boolean;
  tip: string;
}

export const blockTypeToBlockName: Readonly<Record<string, string>> = {
  bullet: 'Bulleted List',
  check: 'Check List',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
};

export const getSelectedNode = (selection: RangeSelection): TextNode | ElementNode => {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
  return $isAtNodeEnd(focus) ? anchorNode : focusNode;
};


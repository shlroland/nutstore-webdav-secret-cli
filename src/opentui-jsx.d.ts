import type { BaseRenderable } from "@opentui/core";
import type {
  AsciiFontProps,
  BoxProps,
  CodeProps,
  ExtendedIntrinsicElements,
  InputProps,
  LinkProps,
  MarkdownProps,
  OpenTUIComponents,
  ScrollBoxProps,
  SelectProps,
  SpanProps,
  TabSelectProps,
  TextareaProps,
  TextProps,
} from "../node_modules/@opentui/solid/src/types/elements.js";

export type OpenTUIElement =
  | BaseRenderable
  | OpenTUIArrayElement
  | string
  | number
  | boolean
  | null
  | undefined;

export interface OpenTUIArrayElement extends Array<OpenTUIElement> {}

interface OpenTUIIntrinsicElements
  extends ExtendedIntrinsicElements<OpenTUIComponents> {
  box: BoxProps;
  text: TextProps;
  span: SpanProps;
  input: InputProps;
  select: SelectProps;
  ascii_font: AsciiFontProps;
  tab_select: TabSelectProps;
  scrollbox: ScrollBoxProps;
  code: CodeProps;
  textarea: TextareaProps;
  markdown: MarkdownProps;

  b: SpanProps;
  strong: SpanProps;
  i: SpanProps;
  em: SpanProps;
  u: SpanProps;
  br: Record<string, never>;
  a: LinkProps;
}

declare module "@opentui/solid/jsx-runtime" {
  export function jsx(
    type: unknown,
    props: unknown,
    key?: unknown,
  ): JSX.Element;

  export function jsxs(
    type: unknown,
    props: unknown,
    key?: unknown,
  ): JSX.Element;

  export const Fragment: (props: { children?: JSX.Element }) => JSX.Element;

  export namespace JSX {
    type Element = OpenTUIElement;
    type ArrayElement = OpenTUIArrayElement;

    interface IntrinsicElements extends OpenTUIIntrinsicElements {}

    interface ElementChildrenAttribute {
      children: Record<string, never>;
    }
  }
}

declare global {
  namespace JSX {
    type Element = OpenTUIElement;

    type ArrayElement = OpenTUIArrayElement;

    interface IntrinsicElements extends OpenTUIIntrinsicElements {}

    interface ElementChildrenAttribute {
      children: Record<string, never>;
    }
  }
}

export {};

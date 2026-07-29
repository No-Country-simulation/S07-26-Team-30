import type { MDXComponents } from "mdx/types";
import { Figure, Blockquote, Definition, TableOfContents } from "@/components/report";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Figure,
    Blockquote,
    Definition,
    TableOfContents,
    ...components,
  };
}
import type { MDXComponents } from "mdx/types";
import {
  Figure,
  Blockquote,
  Definition,
  TableOfContents,
  Chart,
} from "@/components/report";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Figure,
    Blockquote,
    Definition,
    TableOfContents,
    Chart,
    ...components,
  };
}

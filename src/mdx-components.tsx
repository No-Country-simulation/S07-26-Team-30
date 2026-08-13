import type { MDXComponents } from "mdx/types";
import { slugify } from "@/lib/utils";
import {
  Figure,
  Blockquote,
  Definition,
  Label,
  TableOfContents,
  Chart,
} from "@/components/report";

function headingId(children: React.ReactNode): string | undefined {
  const text = Array.isArray(children)
    ? children.map((c) => (typeof c === "string" ? c : "")).join("")
    : typeof children === "string"
      ? children
      : "";
  return text ? slugify(text) : undefined;
}

const withId = (Tag: "h2" | "h3" | "h4") => {
  function Heading(props: React.ComponentProps<typeof Tag>) {
    return <Tag id={headingId(props.children)} {...props} />;
  }
  Heading.displayName = `HeadingWithId(${Tag})`;
  return Heading;
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Figure,
    Blockquote,
    Definition,
    Label,
    TableOfContents,
    Chart,
    h2: withId("h2"),
    h3: withId("h3"),
    h4: withId("h4"),
    ...components,
  };
}

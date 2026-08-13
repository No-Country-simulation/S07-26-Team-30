interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Eyebrow / kicker label used for section markers and the
 * "What You See / What It Costs / Why It Occurs" blocks.
 * Uses the `.eyebrow` component class: deep gold (#7A5C15) keeps text
 * contrast WCAG-compliant; the pure brand gold (#C6A15B) is reserved for
 * rules, charts, and decoration.
 */
export function Label({ children, className = "" }: LabelProps) {
  return <p className={`eyebrow mt-8 ${className}`}>{children}</p>;
}
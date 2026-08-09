interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Eyebrow / kicker label used for section markers and the
 * "What You See / What It Costs / Why It Occurs" blocks.
 * Dark gold (#8C6D1F) keeps text contrast WCAG-compliant;
 * the pure brand gold (#D4AF37) is reserved for charts and decoration.
 */
export function Label({ children, className = "" }: LabelProps) {
  return (
    <p
      className={`mt-6 text-xs font-semibold uppercase tracking-widest text-[#8C6D1F] ${className}`}
    >
      {children}
    </p>
  );
}
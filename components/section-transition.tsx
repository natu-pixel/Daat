export function SectionTransition({ direction }: { direction: "into-dark" | "into-light" }) {
  return <div className={`section-transition ${direction}`} aria-hidden="true" />;
}

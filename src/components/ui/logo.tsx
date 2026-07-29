export function Logo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="text-2xl font-extrabold leading-none tracking-tight">
        <span className="text-foreground">ser</span>
        <span className="text-brand">com</span>
      </div>
      <div className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand">
        soluciones
      </div>
    </div>
  );
}

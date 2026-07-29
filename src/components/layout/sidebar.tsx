"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";

export type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: string;
};

export function Sidebar({ general, rrhh }: { general: NavItem[]; rrhh: NavItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <Logo className="px-2" />

      <nav className="mt-8 flex flex-1 flex-col gap-6">
        <NavSection title="General" items={general} pathname={pathname} />
        {rrhh.length > 0 ? <NavSection title="RRHH" items={rrhh} pathname={pathname} /> : null}
      </nav>

      <div className="rounded-[var(--radius-card)] bg-brand-tint p-4 text-sm">
        <p className="text-lg leading-none text-brand">&ldquo;</p>
        <p className="mt-1 font-semibold text-foreground">¿Dudas con el portal?</p>
        <p className="text-muted-foreground">Escribe a rrhh@sercom.es</p>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">Portal RRHH · piloto</p>
    </aside>
  );
}

function NavSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="mt-2 flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-tint text-brand"
                  : "text-foreground hover:bg-background"
              }`}
            >
              {item.icon}
              {item.label}
              {item.badge ? (
                <span className="ml-auto rounded-full bg-info-tint-strong px-2 py-0.5 text-[0.65rem] font-bold text-info">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { BellIcon, LogOutIcon, MenuIcon, MoonIcon } from "@/components/ui/icons";

// Tope de seguridad: si por lo que sea el pathname nunca cambia (navegación
// a la misma ruta, fallo de red, etc.) el overlay no debe quedar colgado.
const NAVEGACION_TIMEOUT_MS = 5000;

export type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
};

export function PortalShell({
  general,
  rrhh,
  title,
  userName,
  userInitials,
  userDepartamento,
  children,
}: {
  general: NavItem[];
  rrhh: NavItem[];
  title: string;
  userName: string;
  userInitials: string;
  userDepartamento?: string | null;
  children: React.ReactNode;
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const navTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // La ruta ya cambió -> la navegación terminó (el nuevo contenido está en
  // el DOM). No depende de un timer fijo: se corta en cuanto Next.js
  // termina de renderizar la nueva página.
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setIsNavigating(false);
      if (navTimeout.current) clearTimeout(navTimeout.current);
    }
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (navTimeout.current) clearTimeout(navTimeout.current);
    };
  }, []);

  const empezarNavegacion = (href: string) => {
    if (href === pathname) return;
    setIsNavigating(true);
    if (navTimeout.current) clearTimeout(navTimeout.current);
    navTimeout.current = setTimeout(() => setIsNavigating(false), NAVEGACION_TIMEOUT_MS);
  };

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Barra de progreso de navegación */}
      {isNavigating && (
        <div
          className="vf-bar fixed left-0 top-0 z-[100] h-[3px] w-full bg-brand"
          style={{
            animation: "vf-bar 500ms ease-out forwards",
            boxShadow: "0 0 8px rgba(227, 6, 19, 0.6)",
          }}
        />
      )}

      {/* Backdrop móvil */}
      {menuAbierto && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* Sidebar: estático en desktop, drawer off-canvas en móvil/tablet */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          menuAbierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Logo className="px-2" />

        <nav className="mt-8 flex flex-1 flex-col gap-6 overflow-y-auto">
          <NavSection
            title="General"
            items={general}
            pathname={pathname}
            onNavigate={(href) => {
              setMenuAbierto(false);
              empezarNavegacion(href);
            }}
          />
          {rrhh.length > 0 ? (
            <NavSection
              title="RRHH"
              items={rrhh}
              pathname={pathname}
              onNavigate={(href) => {
                setMenuAbierto(false);
                empezarNavegacion(href);
              }}
            />
          ) : null}
        </nav>

        <div className="mt-4 border-t border-border pt-4">
          <div className="rounded-[var(--radius-card)] bg-brand-tint p-4 text-sm">
            <p className="text-lg leading-none text-brand">&ldquo;</p>
            <p className="mt-1 font-semibold text-foreground">¿Dudas con el portal?</p>
            <p className="text-muted-foreground">Escribe a rrhh@sercom.es</p>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">Portal RRHH · piloto</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 sm:px-6">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setMenuAbierto(true)}
            className="rounded-full p-2 text-muted-foreground hover:bg-background lg:hidden"
          >
            <MenuIcon />
          </button>
          <h1 className="truncate text-lg font-bold text-foreground">{title}</h1>
          <div className="flex-1" />
          <button
            type="button"
            aria-label="Notificaciones"
            className="rounded-full p-2 text-muted-foreground hover:bg-background"
          >
            <BellIcon />
          </button>
          <button
            type="button"
            aria-label="Cambiar tema"
            className="rounded-full p-2 text-muted-foreground hover:bg-background"
          >
            <MoonIcon />
          </button>
          <div className="flex items-center gap-2 border-l border-border pl-2 sm:pl-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint-strong text-sm font-bold text-brand">
              {userInitials}
            </div>
            <span className="hidden items-center gap-2 sm:flex">
              <span className="text-sm font-medium text-foreground">{userName}</span>
              {userDepartamento ? (
                <span className="rounded-full bg-border px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground">
                  {userDepartamento}
                </span>
              ) : null}
            </span>
            <button
              type="button"
              aria-label="Cerrar sesión"
              className="rounded-full p-2 text-muted-foreground hover:bg-background"
              onClick={() => signOut({ redirectTo: "/login" })}
            >
              <LogOutIcon />
            </button>
          </div>
        </header>
        <main className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          {isNavigating && (
            <div
              aria-busy="true"
              className="absolute inset-0 z-10 flex items-center justify-center bg-background py-[120px]"
            >
              <span
                className="vf-spin inline-block h-11 w-11"
                style={{ animation: "vf-spin 900ms linear infinite" }}
                aria-label="Cargando"
                role="status"
              >
                <Image src="/vodafone-logo.png" alt="" width={44} height={44} priority />
              </span>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

function NavSection({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  onNavigate: (href: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="mt-2 flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNavigate(item.href)}
              className={`flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-brand-tint text-brand" : "text-foreground hover:bg-background"
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

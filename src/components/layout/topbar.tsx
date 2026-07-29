"use client";

import { signOut } from "next-auth/react";
import { BellIcon, LogOutIcon, MoonIcon } from "@/components/ui/icons";

export function Topbar({
  title,
  userName,
  userInitials,
}: {
  title: string;
  userName: string;
  userInitials: string;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-surface px-6">
      <h1 className="text-lg font-bold text-foreground">{title}</h1>
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
      <div className="flex items-center gap-2 border-l border-border pl-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-tint-strong text-sm font-bold text-brand">
          {userInitials}
        </div>
        <span className="hidden text-sm font-medium text-foreground sm:block">{userName}</span>
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
  );
}

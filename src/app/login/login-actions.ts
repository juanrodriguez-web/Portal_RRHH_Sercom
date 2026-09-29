"use server";

import { signIn } from "@/lib/auth";

// callbackUrl puede llegar como ruta relativa o como URL absoluta (así la
// genera el middleware al redirigir a /login). En ambos casos nos quedamos
// solo con el path+query, descartando cualquier host -- evita un open
// redirect si alguien manipula el parámetro para apuntar a otro dominio.
function safeRedirectPath(url: string | undefined, fallback: string): string {
  if (!url) return fallback;
  try {
    const parsed = new URL(url, "http://internal");
    return parsed.pathname.startsWith("/") ? parsed.pathname + parsed.search : fallback;
  } catch {
    return fallback;
  }
}

export async function signInMicrosoft(callbackUrl?: string) {
  await signIn("microsoft-entra-id", { redirectTo: safeRedirectPath(callbackUrl, "/inicio") });
}

export async function signInDemo(email: string, callbackUrl?: string) {
  await signIn("demo", { email, redirectTo: safeRedirectPath(callbackUrl, "/inicio") });
}

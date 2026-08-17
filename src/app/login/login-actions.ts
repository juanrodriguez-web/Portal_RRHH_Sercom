"use server";

import { signIn } from "@/lib/auth";

export async function signInMicrosoft() {
  await signIn("microsoft-entra-id", { redirectTo: "/inicio" });
}

export async function signInDemo(email: string) {
  await signIn("demo", { email, redirectTo: "/inicio" });
}

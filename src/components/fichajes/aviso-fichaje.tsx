"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BellIcon } from "@/components/ui/icons";
import { marcarFichaje } from "@/app/(portal)/fichajes/actions";
import { suscribirPush } from "@/app/(portal)/fichajes/push-actions";

const DISMISS_KEY = "aviso_fichaje_ahora_no_hasta";
const REPETICION_MIN = 15; // spec §6.4: repetición tras "Ahora no"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function AvisoFichaje({
  accionPendiente,
  etiquetaAccion,
}: {
  accionPendiente: boolean;
  etiquetaAccion?: string;
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [pushEstado, setPushEstado] = useState<"desconocido" | "disponible" | "activo" | "no-soportado">(
    "desconocido"
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    Promise.resolve().then(() => {
      if (!accionPendiente) {
        setVisible(false);
        return;
      }
      const hasta = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
      setVisible(Date.now() > hasta);
    });
  }, [accionPendiente]);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      Promise.resolve().then(() => setPushEstado("no-soportado"));
      return;
    }
    navigator.serviceWorker
      .register("/sw.js")
      .then(async (reg) => {
        const existente = await reg.pushManager.getSubscription();
        setPushEstado(existente ? "activo" : "disponible");
      })
      .catch((err) => {
        console.error("Error registrando service worker:", err);
        setPushEstado("no-soportado");
      });
  }, []);

  function ahoraNo() {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + REPETICION_MIN * 60_000));
    setVisible(false);
  }

  function ficharAhora() {
    startTransition(async () => {
      const result = await marcarFichaje();
      if (result.ok) {
        setVisible(false);
        router.refresh();
      }
    });
  }

  async function activarAvisos() {
    try {
      if (!("Notification" in window)) {
        alert("Este navegador no soporta notificaciones.");
        return;
      }

      // Pedir el permiso ANTES de cualquier otro await: varios navegadores
      // (sobre todo Safari/iOS) solo muestran el diálogo si se llama dentro
      // del gesto de click del usuario, sin ningún await previo. Si se pide
      // después de esperar el service worker, lo ignoran en silencio y la
      // promesa se queda colgada para siempre (parece que "no hace nada").
      console.log("1. Pidiendo permiso de notificaciones...");
      const permiso = await Notification.requestPermission();
      console.log("2. Permiso de notificaciones:", permiso);
      if (permiso !== "granted") {
        alert("Necesitas permitir notificaciones para recibir avisos de fichaje");
        return;
      }

      console.log("3. Esperando service worker...");
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("El service worker tardó demasiado en activarse.")), 10_000)
        ),
      ]);
      console.log("4. Service Worker listo");

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      console.log("5. Clave VAPID pública:", publicKey ? "✓" : "✗");
      if (!publicKey) {
        alert("Claves VAPID no configuradas");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      console.log("6. Suscripción push creada");

      const json = sub.toJSON();
      console.log("7. Datos de suscripción:", { endpoint: json.endpoint?.substring(0, 50), keys: !!json.keys });
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        alert("Error: datos de suscripción incompletos");
        return;
      }

      console.log("8. Guardando en servidor...");
      await suscribirPush({ endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } });
      console.log("9. ✓ Guardado en servidor");

      setPushEstado("activo");
      alert("✓ Avisos de fichaje activados");
    } catch (err) {
      console.error("ERROR:", err);
      alert(`Error al activar avisos: ${err}`);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {visible ? (
        <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-border border-l-[3px] border-l-warning bg-surface px-4 py-3 shadow-sm">
          <BellIcon className="text-warning" />
          <p className="text-sm text-foreground">
            Vemos que ya estás activo. ¿Fichamos tu <strong>{etiquetaAccion?.toLowerCase()}</strong>?
          </p>
          <div className="ml-auto flex gap-2">
            <Button size="sm" onClick={ficharAhora} disabled={pending} loading={pending}>
              Fichar {etiquetaAccion}
            </Button>
            <Button size="sm" variant="ghost" onClick={ahoraNo}>
              Ahora no
            </Button>
          </div>
        </div>
      ) : null}

      {pushEstado === "disponible" ? (
        <button
          type="button"
          onClick={activarAvisos}
          className="self-start text-xs font-semibold text-muted-foreground underline hover:text-foreground"
        >
          Activar avisos de fichaje en el navegador
        </button>
      ) : null}
    </div>
  );
}

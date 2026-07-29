import "server-only";
import webPush from "web-push";
import { prisma } from "@/lib/prisma";

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? "mailto:rrhh@sercom.es",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
  process.env.VAPID_PRIVATE_KEY ?? ""
);

export async function enviarPushAUsuario(userId: string, payload: { title: string; body: string; tag?: string }) {
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch (err: unknown) {
        // 404/410 = la suscripción ya no es válida (navegador desinstalado, permiso revocado…)
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    })
  );
}

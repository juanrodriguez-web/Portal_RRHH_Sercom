// Service worker mínimo: solo recibe pushes de avisos de fichaje y los
// muestra como notificación del sistema. No cachea nada de la app (no es
// un objetivo de este piloto tener soporte offline).

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: "Portal RRHH", body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Portal RRHH", {
      body: data.body || "",
      tag: data.tag || "fichaje",
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsArr) => {
      const existente = clientsArr.find((c) => c.url.includes("/inicio"));
      if (existente) return existente.focus();
      return self.clients.openWindow("/inicio");
    })
  );
});

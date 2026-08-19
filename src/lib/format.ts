export function formatHora(fecha: Date | null | undefined) {
  if (!fecha) return "—";
  return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(fecha);
}

export function formatFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(fecha);
}

export function formatFechaCorta(fecha: Date) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" }).format(fecha);
}

export function formatMinutos(totalMinutos: number) {
  const h = Math.floor(totalMinutos / 60);
  const m = totalMinutos % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

const ENTIDADES_HTML: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

// Extrae texto plano de HTML sin usar el DOM (debe funcionar en SSR, donde
// `document` no existe).
export function htmlATexto(html: string, maxChars: number): string {
  const texto = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, (m) => ENTIDADES_HTML[m])
    .replace(/\s+/g, " ")
    .trim();
  return texto.slice(0, maxChars).trim() + (texto.length > maxChars ? "..." : "");
}

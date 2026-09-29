"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body>
        <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", fontFamily: "system-ui, sans-serif", padding: "1rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Algo no salió bien</h1>
          <p style={{ color: "#71717a", maxWidth: "24rem" }}>
            Ha ocurrido un error inesperado. Podés intentar de nuevo o volver más tarde.
          </p>
          <button
            onClick={() => reset()}
            style={{ borderRadius: "0.65rem", background: "#e30613", color: "#fff", padding: "0.6rem 1.2rem", fontWeight: 600, border: "none", cursor: "pointer" }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}

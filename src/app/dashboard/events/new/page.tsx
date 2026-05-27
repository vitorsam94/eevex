"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao criar evento");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="container">
      <div className="card grid">
        <h1>Novo evento</h1>
        <form className="grid" action={onSubmit}>
          <input name="name" placeholder="Nome do evento" required />
          <div className="row">
            <input name="eventDate" type="date" required />
            <input name="eventTime" type="time" required />
          </div>
          <input name="openTime" type="time" required />
          <input name="address" placeholder="Endereço do evento" required />
          <input name="priceBRL" type="number" min="1" step="1" placeholder="Valor do ingresso em centavos (ex: 12500)" required />
          <select name="status" defaultValue="PUBLISHED">
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="CLOSED">Encerrado</option>
          </select>
          <button type="submit">Salvar evento</button>
        </form>
        {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      </div>
    </main>
  );
}

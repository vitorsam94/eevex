"use client";

import { useEffect, useMemo, useState } from "react";

type EventOption = { id: string; name: string; priceBRL: number };

export default function NewTicketPage() {
  const [events, setEvents] = useState<EventOption[]>([]);
  const [error, setError] = useState("");
  const [successLink, setSuccessLink] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data.events ?? []));
  }, []);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  async function onSubmit(formData: FormData) {
    setError("");
    setSuccessLink("");
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/tickets/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Falha ao emitir ingresso");
      return;
    }

    setSuccessLink(`/print/${data.ticketId}`);
  }

  return (
    <main className="container">
      <div className="card grid">
        <h1>Emitir ingresso</h1>
        <form className="grid" action={onSubmit}>
          <select name="eventId" required value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
            <option value="">Selecione o evento</option>
            {events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
          </select>
          <input
            value={
              selectedEvent
                ? (selectedEvent.priceBRL / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                : ""
            }
            placeholder="Valor do ingresso (definido no evento)"
            readOnly
          />
          <input name="holderName" placeholder="Nome do portador" required />
          <div className="row">
            <input name="cpf" placeholder="CPF" required />
            <input name="phone" placeholder="Telefone (opcional)" />
          </div>
          <input name="cv" placeholder="CV da maquininha POS" required />
          <button type="submit">Emitir ingresso</button>
        </form>
        {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
        {successLink ? <a href={successLink} target="_blank">Ingresso emitido. Abrir para impressão.</a> : null}
      </div>
    </main>
  );
}

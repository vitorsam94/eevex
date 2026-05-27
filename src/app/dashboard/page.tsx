import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const events = await prisma.event.findMany({ orderBy: { createdAt: "desc" }, take: 10 });
  const tickets = await prisma.ticket.findMany({
    include: { event: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <main className="container grid">
      <div className="header">
        <h1>eevex · Painel</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/dashboard/events/new"><button>Novo evento</button></Link>
          <Link href="/dashboard/tickets/new"><button>Novo ingresso</button></Link>
          <Link href="/logout"><button>Sair</button></Link>
        </div>
      </div>

      <div className="card">
        <h2>Eventos</h2>
        <table className="table">
          <thead><tr><th>Nome</th><th>Data</th><th>Valor</th><th>Status</th></tr></thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.name}</td>
                <td>{new Date(event.eventDate).toLocaleDateString("pt-BR")}</td>
                <td>{(event.priceBRL / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td>{event.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Ingressos Emitidos</h2>
        <table className="table">
          <thead><tr><th>Evento</th><th>Portador</th><th>Status</th><th>Imprimir</th></tr></thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.event.name}</td>
                <td>{ticket.holderName}</td>
                <td>{ticket.status}</td>
                <td><Link href={`/print/${ticket.id}`} target="_blank">Abrir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import QRCode from "qrcode";
import { getSessionUser } from "@/lib/auth";
import { decryptField } from "@/lib/crypto";
import { formatCpf } from "@/lib/cpf";
import { prisma } from "@/lib/prisma";

export default async function PrintTicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ format?: "a4" | "thermal80" }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { format = "a4" } = await searchParams;

  const ticket = await prisma.ticket.findUnique({ where: { id }, include: { event: true } });
  if (!ticket) notFound();

  const qrText = JSON.stringify({ payload: ticket.qrPayload, signature: ticket.qrSignature });
  const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 1, width: format === "thermal80" ? 180 : 220 });

  const cpf = formatCpf(decryptField(ticket.cpfEncrypted));
  const phone = ticket.phoneEncrypted ? decryptField(ticket.phoneEncrypted) : "";
  const price = (ticket.priceBRL / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const ticketDate = new Date(ticket.event.eventDate).toLocaleDateString("pt-BR");
  const issuedAt = new Date(ticket.issuedAt).toLocaleString("pt-BR");
  const shortCode = ticket.id.slice(-8).toUpperCase();

  const width = format === "thermal80" ? "80mm" : "210mm";
  const padding = format === "thermal80" ? "6mm" : "15mm";
  const qrSize = format === "thermal80" ? 180 : 220;
  const compact = format === "thermal80";

  return (
    <main style={{ padding: compact ? "6px" : "20px", background: "#f3f4f6" }}>
      <div
        style={{
          width,
          margin: "0 auto",
          background: "#fff",
          padding,
          border: "1px solid #d7dce5",
          borderRadius: compact ? "0" : "10px",
          color: "#111827",
          fontSize: compact ? 11 : 14,
          lineHeight: 1.35,
        }}
      >
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: compact ? 18 : 24 }}>eevex</h2>
            <p style={{ margin: "2px 0 0 0", fontSize: compact ? 10 : 12, color: "#4b5563" }}>
              Emissão segura de ingressos
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontWeight: 700 }}>INGRESSO OFICIAL</p>
            <p style={{ margin: 0, fontSize: compact ? 10 : 12 }}>Código: {shortCode}</p>
          </div>
        </header>

        <div
          style={{
            marginTop: 10,
            padding: compact ? "6px" : "10px",
            border: "1px dashed #9ca3af",
            borderRadius: 8,
            background: "#f9fafb",
          }}
        >
          <p style={{ margin: 0, fontSize: compact ? 10 : 12 }}>
            Logo institucional (placeholder). Substituir pela identidade visual oficial.
          </p>
        </div>

        <hr style={{ border: 0, borderTop: "1px solid #d1d5db", margin: "12px 0" }} />
        <h3 style={{ margin: "0 0 8px 0", fontSize: compact ? 15 : 20 }}>{ticket.event.name}</h3>

        <div style={{ display: "grid", gap: 4 }}>
          <p style={{ margin: 0 }}><strong>Data:</strong> {ticketDate}</p>
          <p style={{ margin: 0 }}><strong>Horário do evento:</strong> {ticket.event.eventTime}</p>
          <p style={{ margin: 0 }}><strong>Abertura dos portões:</strong> {ticket.event.openTime}</p>
          <p style={{ margin: 0 }}><strong>Endereço:</strong> {ticket.event.address}</p>
        </div>

        <hr style={{ border: 0, borderTop: "1px solid #d1d5db", margin: "12px 0" }} />
        <div style={{ display: "grid", gap: 4 }}>
          <p style={{ margin: 0 }}><strong>Portador:</strong> {ticket.holderName}</p>
          <p style={{ margin: 0 }}><strong>CPF:</strong> {cpf}</p>
          {phone ? <p style={{ margin: 0 }}><strong>Telefone:</strong> {phone}</p> : null}
          <p style={{ margin: 0 }}><strong>Valor pago:</strong> {price}</p>
          <p style={{ margin: 0 }}><strong>CV POS:</strong> {ticket.cv}</p>
          <p style={{ margin: 0 }}><strong>Status:</strong> {ticket.status}</p>
          <p style={{ margin: 0 }}><strong>Emitido em:</strong> {issuedAt}</p>
        </div>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Image src={qrDataUrl} alt="QR code do ingresso" width={qrSize} height={qrSize} unoptimized />
          <p style={{ margin: "6px 0 0 0", fontSize: compact ? 9 : 12, color: "#374151" }}>
            QR assinado digitalmente para validação única de entrada.
          </p>
        </div>

        <hr style={{ border: 0, borderTop: "1px solid #d1d5db", margin: "12px 0" }} />
        <section style={{ display: "grid", gap: 5, fontSize: compact ? 9 : 11, color: "#374151" }}>
          <p style={{ margin: 0 }}>
            1) Este ingresso é pessoal e poderá ser exigida conferência de documento oficial com foto na entrada.
          </p>
          <p style={{ margin: 0 }}>
            2) A validação do QR Code é de uso único. Após o primeiro check-in válido, novas tentativas serão bloqueadas.
          </p>
          <p style={{ margin: 0 }}>
            3) Ingressos adulterados, duplicados, ilegíveis ou obtidos por meio fraudulento serão cancelados sem reembolso.
          </p>
          <p style={{ margin: 0 }}>
            4) Em caso de cancelamento ou alteração do evento, aplicam-se as políticas do organizador e a legislação brasileira.
          </p>
          <p style={{ margin: 0 }}>
            5) Dados pessoais são tratados para emissão, controle de acesso e segurança operacional, conforme LGPD.
          </p>
          <p style={{ margin: 0 }}>
            6) Ao portar este ingresso, o participante declara ciência e concordância com os termos de acesso do evento.
          </p>
        </section>

        <p style={{ margin: "12px 0 0 0", fontSize: compact ? 8 : 10, color: "#6b7280", textAlign: "center" }}>
          eevex | comprovante digital seguro | código interno {shortCode}
        </p>
      </div>
      {!compact ? (
        <p style={{ textAlign: "center", marginTop: 12, color: "#4b5563", fontSize: 12 }}>
          Use o atalho de impressão do navegador (Ctrl/Cmd + P) para gerar o ingresso físico.
        </p>
      ) : null}
    </main>
  );
}

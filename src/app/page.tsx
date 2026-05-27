import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <main className="container">
        <div className="card grid">
          <h1>eevex</h1>
          <p>Emissão segura de ingressos com QR assinado.</p>
          <Link href="/login"><button>Entrar</button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card grid">
        <h1>eevex</h1>
        <p>Usuário autenticado: <strong>{user}</strong></p>
        <Link href="/dashboard"><button>Ir para painel</button></Link>
      </div>
    </main>
  );
}

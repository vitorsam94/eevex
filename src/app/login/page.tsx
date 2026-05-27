"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Falha no login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="container">
      <div className="card grid" style={{ maxWidth: 420, margin: "40px auto" }}>
        <h1>Login eevex</h1>
        <form className="grid" onSubmit={onSubmit}>
          <input placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Entrar</button>
        </form>
        {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      </div>
    </main>
  );
}

import os from "node:os";
import { spawn } from "node:child_process";

const port = process.env.PORT || "3000";

function getLanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    const addresses = nets[name] || [];
    for (const addr of addresses) {
      if (addr && addr.family === "IPv4" && !addr.internal) {
        return addr.address;
      }
    }
  }
  return null;
}

const lanIp = getLanIp();
console.log("\n== eevex server ==");
console.log(`Local:   http://localhost:${port}`);
if (lanIp) {
  console.log(`Rede:    http://${lanIp}:${port}`);
} else {
  console.log("Rede:    IP LAN nao encontrado automaticamente.");
}
console.log("");

const child = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", "dev", "--hostname", "0.0.0.0", "--port", port],
  { stdio: "inherit", env: process.env }
);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

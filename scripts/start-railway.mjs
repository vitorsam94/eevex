import { spawnSync, spawn } from "node:child_process";

const port = process.env.PORT || "3000";
const host = process.env.HOST || "0.0.0.0";

const migrate = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

if (migrate.status !== 0) {
  process.exit(migrate.status ?? 1);
}

const app = spawn("npx", ["next", "start", "--hostname", host, "--port", port], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

app.on("exit", (code) => process.exit(code ?? 0));

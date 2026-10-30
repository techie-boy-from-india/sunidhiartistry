import { scryptSync, randomBytes } from "node:crypto";

async function hiddenPrompt(message) {
  process.stdout.write(message);
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    throw new Error("Run this script in an interactive terminal.");
  }
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise((resolve, reject) => {
    let password = "";
    const onData = (chunk) => {
      const value = chunk.toString("utf8");
      if (value === "\u0003") { cleanup(); reject(new Error("Cancelled")); return; }
      if (value === "\r" || value === "\n") { cleanup(); process.stdout.write("\n"); resolve(password); return; }
      if (value === "\u007f" || value === "\b") { password = password.slice(0, -1); return; }
      if (!value.startsWith("\u001b")) password += value;
    };
    const cleanup = () => { process.stdin.off("data", onData); process.stdin.setRawMode(false); };
    process.stdin.on("data", onData);
  });
}
try {
  const first = await hiddenPrompt("Admin password (minimum 14 characters, hidden): ");
  const second = await hiddenPrompt("Repeat password (hidden): ");
  if (first.length < 14 || first !== second) throw new Error("Passwords must match and be at least 14 characters.");
  const salt = randomBytes(16);
  const hash = scryptSync(first, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  console.log("\nCopy this value to ADMIN_PASSWORD_HASH in Vercel (never share it publicly):\n");
  console.log(`scrypt$16384$8$1$${salt.toString("base64url")}$${hash.toString("base64url")}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Unable to generate hash.");
  process.exitCode = 1;
} finally { process.stdin.pause(); }

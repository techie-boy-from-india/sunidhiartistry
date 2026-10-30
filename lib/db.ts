import postgres from "postgres";

let client: ReturnType<typeof postgres> | undefined;

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not configured");
  if (!client) client = postgres(url, { max: 2, connect_timeout: 8, idle_timeout: 20 });
  return client;
}

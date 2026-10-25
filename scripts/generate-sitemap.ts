import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "vite";

const BASE_URL = "https://prevejabr.afsm.me";
const env = { ...loadEnv("production", process.cwd(), "VITE_"), ...process.env };
const backendUrl = env.VITE_SUPABASE_URL;
const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!backendUrl || !publishableKey) {
  throw new Error("Sitemap generation requires the public backend configuration.");
}

const client = createClient(backendUrl, publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Market detail pages are publicly readable regardless of status.
const paths = ["/", "/markets", "/leaderboard", "/termos", "/instalar"];
const pageSize = 1000;
for (let offset = 0; ; offset += pageSize) {
  const { data, error } = await client
    .from("markets")
    .select("id")
    .order("id", { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (error) throw new Error(`Cannot retrieve public markets for sitemap: ${error.message}`);
  for (const market of data ?? []) paths.push(`/markets/${encodeURIComponent(market.id)}`);
  if (!data || data.length < pageSize) break;
}

const escapeXml = (value: string) => value.replace(/[&<>"']/g, (character) => {
  const entities: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  };
  return entities[character] ?? character;
});

// No lastmod: there is no authoritative timestamp for significant page changes.
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...[...new Set(paths)].map((path) => `  <url><loc>${escapeXml(BASE_URL + path)}</loc></url>`),
  "</urlset>",
  "",
].join("\n");

writeFileSync(resolve("public/sitemap.xml"), xml);
console.log(`Sitemap generated with ${new Set(paths).size} public pages.`);
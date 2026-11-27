import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync } from "fflate";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const extensionRoot = resolve(projectRoot, "public/extension");
const archivePath = resolve(projectRoot, "public/buddy-extension.zip");
const files = ["manifest.json", "popup.html", "auth.js", "api.js", "popup.js", "README.md"];
const entries = {};

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://nextapi.vpnpro.in";
let apiBase = "";
{
  const apiUrl = new URL(configuredApiUrl);
  const local = apiUrl.hostname === "localhost" || apiUrl.hostname === "127.0.0.1";
  if ((apiUrl.protocol !== "https:" && !(local && apiUrl.protocol === "http:")) || apiUrl.pathname !== "/" || apiUrl.search || apiUrl.hash) {
    throw new Error("The configured FastAPI URL must be an HTTPS origin (HTTP is allowed only for localhost).");
  }
  apiBase = apiUrl.origin;
}
for (const filename of files) {
  entries[filename] = new Uint8Array(await readFile(resolve(extensionRoot, filename)));
}
entries["config.js"] = new TextEncoder().encode(`window.BUDDY_CONFIG = Object.freeze({ apiBase: ${JSON.stringify(apiBase)} });`);

await writeFile(archivePath, zipSync(entries, { level: 9 }));
console.info(`Packaged Buddy extension (${Object.keys(entries).length} files) at public/buddy-extension.zip`);

import { mkdir, cp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

async function copyRecursive(source, target) {
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, { recursive: true });
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await copyRecursive(path.join(root, "index.html"), path.join(dist, "index.html"));
await copyRecursive(path.join(root, "public"), dist);
await copyRecursive(path.join(root, "src"), path.join(dist, "src"));

await writeFile(
  path.join(dist, "_headers"),
  `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Cache-Control: public, max-age=0, must-revalidate
\n`
);


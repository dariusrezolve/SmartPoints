import { spawn, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { assertIsolatedConfig, assertLocalApiUrl } from "./safety.mjs";

const root = resolve(import.meta.dirname, "../..");
const cli = join(root, "node_modules/.bin/supabase");
const webPort = 3100;
const apiPort = 55321;
const workdir = mkdtempSync(join(tmpdir(), "smartpoints-e2e-"));
const supabaseDir = join(workdir, "supabase");
const generatedFiles = ["next-env.d.ts", "tsconfig.json", "tsconfig.tsbuildinfo", "public/sw.js"].map((path) => ({ path: join(root, path), contents: existsSync(join(root, path)) ? readFileSync(join(root, path)) : null }));
let web;
let stackStarted = false;
let webFailure = "";

function cliCall(args) {
  // Both cwd and --workdir point to the freshly generated local-only project.
  const cliEnv = Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("SUPABASE_") && name !== "DB_URL" && name !== "DATABASE_URL"));
  const result = spawnSync(cli, [...args, "--workdir", workdir], {
    cwd: workdir,
    encoding: "utf8",
    env: { ...cliEnv, SUPABASE_WORKDIR: workdir },
    timeout: 300_000,
  });
  if (result.status !== 0) throw new Error(`Local Supabase ${args[0]} failed (exit ${result.status ?? "unknown"}). CLI output withheld because it may contain credentials.`);
  return result.stdout;
}

function prepareConfig() {
  mkdirSync(supabaseDir);
  let config = readFileSync(join(root, "supabase/config.toml"), "utf8");
  config = config.replace('project_id = "SmartPoints"', 'project_id = "SmartPointsE2E"');
  for (const [from, to] of [[54321, 55321], [54322, 55322], [54320, 55320], [54323, 55323], [54324, 55324], [54329, 55329], [54327, 55327], [8083, 55328]]) {
    config = config.replaceAll(String(from), String(to));
  }
  config = config.replaceAll("127.0.0.1:3000", `127.0.0.1:${webPort}`);
  assertIsolatedConfig(config);
  writeFileSync(join(supabaseDir, "config.toml"), config);
  writeFileSync(join(supabaseDir, "seed.sql"), "-- E2E data is created through the UI.\n");
  cpSync(join(root, "supabase/migrations"), join(supabaseDir, "migrations"), { recursive: true });
  cpSync(join(root, "supabase/tests"), join(supabaseDir, "tests"), { recursive: true });
  // No .temp/project-ref or Supabase link file is copied into this workdir.
}

async function waitForWeb() {
  for (let attempt = 0; attempt < 90; attempt++) {
    if (web.exitCode !== null) throw new Error(`E2E Next.js server exited before it became ready. ${webFailure.slice(-500)}`);
    try {
      const response = await fetch(`http://127.0.0.1:${webPort}/sign-in`, { signal: AbortSignal.timeout(2000) });
      if (response.ok) return;
    } catch { /* server is still starting */ }
    await delay(1000);
  }
  throw new Error("E2E Next.js server did not become ready.");
}

async function run() {
  prepareConfig();
  console.log("Starting dedicated local SmartPointsE2E Supabase stack.");
  cliCall(["start"]);
  stackStarted = true;
  // Start applies migrations; reset guarantees a clean browser run on a reused E2E volume.
  assertIsolatedConfig(readFileSync(join(supabaseDir, "config.toml"), "utf8"));
  cliCall(["db", "reset", "--local"]);
  const status = JSON.parse(cliCall(["status", "--output", "json"]));
  const apiUrl = status.API_URL ?? status.api_url;
  const publicKey = status.ANON_KEY ?? status.anon_key ?? status.PUBLISHABLE_KEY ?? status.publishable_key;
  assertLocalApiUrl(apiUrl, apiPort);
  if (!publicKey) throw new Error("Dedicated local Supabase stack did not provide a public key.");
  console.log("Running pgTAP against the dedicated local E2E database.");
  cliCall(["test", "db", "--local"]);

  const webEnv = {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: apiUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publicKey,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: publicKey,
    NEXT_PUBLIC_APP_URL: `http://127.0.0.1:${webPort}`,
    SMARTPOINTS_E2E: "1",
  };
  console.log("Building dedicated local Next.js app.");
  const build = spawnSync(join(root, "node_modules/.bin/next"), ["build", "--webpack"], { cwd: root, env: webEnv, encoding: "utf8", timeout: 300_000 });
  if (build.status !== 0) throw new Error(`E2E Next.js build failed (exit ${build.status ?? "unknown"}): ${String(build.stderr).replaceAll(publicKey, "[redacted]").slice(-1000)}`);
  console.log("Starting dedicated local Next.js server.");
  web = spawn(join(root, "node_modules/.bin/next"), ["start", "-p", String(webPort)], {
    cwd: root,
    env: webEnv,
    stdio: ["ignore", "ignore", "pipe"],
  });
  web.stderr.on("data", (chunk) => { webFailure += String(chunk).replaceAll(publicKey, "[redacted]"); });
  await waitForWeb();
  const result = spawnSync(join(root, "node_modules/.bin/playwright"), ["test", ...process.argv.slice(2)], {
    cwd: root,
    env: { ...process.env, E2E_BASE_URL: `http://127.0.0.1:${webPort}` },
    stdio: "inherit",
  });
  if (result.status !== 0) process.exitCode = result.status ?? 1;
}

try {
  await run();
} catch (error) {
  console.error(error instanceof Error ? error.message : "E2E runner failed.");
  process.exitCode = 1;
} finally {
  if (web) web.kill("SIGTERM");
  if (stackStarted) {
    try { cliCall(["stop", "--no-backup"]); } catch { console.error("Could not stop the dedicated local E2E stack; stop SmartPointsE2E manually."); }
  }
  rmSync(workdir, { recursive: true, force: true });
  for (const file of generatedFiles) {
    if (file.contents) writeFileSync(file.path, file.contents);
    else if (existsSync(file.path)) rmSync(file.path);
  }
}

// One-off ops-dashboard user bootstrap — there is no signup route by design.
// Generates a `wrangler d1 execute` command that inserts the user directly,
// using the exact same PBKDF2 scheme as src/lib/auth.ts so the app can
// verify the password at login.
//
// Usage:
//   node scripts/create-user.mjs you@example.com "your-password" "Your Name" super_admin
//   # then run the printed command, e.g.:
//   wrangler d1 execute 10kprinter --remote --command "..."
//   (drop --remote to run against the local dev database instead)

const [, , email, password, name = "", role = "super_admin"] = process.argv;

if (!email || !password) {
  console.error("Usage: node scripts/create-user.mjs <email> <password> [name] [role]");
  process.exit(1);
}

const PBKDF2_ITERATIONS = 100_000; // must match src/lib/auth.ts — Workers' WebCrypto caps PBKDF2 at 100k

function toHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(pw) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return `${PBKDF2_ITERATIONS}:${toHex(salt)}:${toHex(bits)}`;
}

const id = crypto.randomUUID();
const hash = await hashPassword(password);
const esc = (s) => String(s).replace(/'/g, "''");

const sql = `INSERT INTO users (id, email, name, password_hash, role) VALUES ('${id}', '${esc(
  email.toLowerCase(),
)}', ${name ? `'${esc(name)}'` : "NULL"}, '${hash}', '${esc(role)}');`;

console.log("\nRun this against your D1 database:\n");
console.log(`wrangler d1 execute 10kprinter --remote --command "${sql.replace(/"/g, '\\"')}"`);
console.log("\n(drop --remote to run it against the local dev database instead)\n");

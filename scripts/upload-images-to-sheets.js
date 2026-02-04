// Bulk upload images to Cloudflare Images and append filename + URL to a Google Sheet tab "Images".
// Usage (PowerShell example):
//   $env:CF_IMAGES_ACCOUNT_ID="your_account_id"
//   $env:CF_IMAGES_TOKEN="your_token"
//   $env:SHEET_ID="your_sheet_id"
//   node scripts/upload-images-to-sheets.js
//
// Optional env:
//   IMAGES_FOLDER (default: ./imagesmockup)
//   SERVICE_ACCOUNT_PATH (default: ./worker/secretgogle/service-account.json)
//   SHEET_TAB (default: Images)

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { Blob } from "buffer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ACCOUNT_ID = process.env.CF_IMAGES_ACCOUNT_ID || "";
const API_TOKEN = process.env.CF_IMAGES_TOKEN || "";
const SHEET_ID = process.env.SHEET_ID || "";
const IMAGES_FOLDER = process.env.IMAGES_FOLDER || path.resolve(__dirname, "..", "imagesmockup");
const SERVICE_ACCOUNT_PATH =
  process.env.SERVICE_ACCOUNT_PATH || path.resolve(__dirname, "..", "worker", "secretgogle", "service-account.json");
const SHEET_TAB = process.env.SHEET_TAB || "Images";

if (!ACCOUNT_ID || !API_TOKEN || !SHEET_ID) {
  console.error("Missing required env: CF_IMAGES_ACCOUNT_ID, CF_IMAGES_TOKEN, SHEET_ID");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));

async function getGoogleAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claimSet = base64url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  );
  const unsigned = `${header}.${claimSet}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  const signature = signer.sign(serviceAccount.private_key, "base64");
  const jwt = `${unsigned}.${base64url(signature, true)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Token request failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

function base64url(input, skipEncode) {
  const str = skipEncode ? input : Buffer.from(input).toString("base64");
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function uploadImage(filePath) {
  const stat = fs.statSync(filePath);
  if (!stat.isFile()) return null;
  const filename = path.basename(filePath);

  const buffer = fs.readFileSync(filePath);
  const blob = new Blob([buffer]);

  const form = new FormData();
  form.append("file", blob, filename);

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: form,
  });

  const text = await res.text();
  let parsed = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    // ignore
  }
  if (!res.ok || !parsed?.success) {
    throw new Error(`Upload failed for ${filename}: ${text}`);
  }
  const id = parsed.result?.id;
  const variant = parsed.result?.variants?.[0] || "";
  return { filename, id, variant };
}

async function appendRows(token, rows) {
  if (!rows.length) return;
  const range = `${SHEET_TAB}!A:C`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: rows,
      }),
    },
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`Sheets append failed: ${text}`);
}

async function main() {
  console.log("Folder:", IMAGES_FOLDER);
  const files = fs.readdirSync(IMAGES_FOLDER).map((f) => path.join(IMAGES_FOLDER, f));
  const rows = [];

  for (const file of files) {
    try {
      const result = await uploadImage(file);
      if (!result) continue;
      console.log("Uploaded:", result.filename, "->", result.id);
      rows.push([result.filename, result.variant || "", result.id]);
    } catch (err) {
      console.error(err.message);
    }
  }

  if (rows.length === 0) {
    console.log("No uploads to write.");
    return;
  }

  const token = await getGoogleAccessToken();
  await appendRows(token, rows);
  console.log(`Appended ${rows.length} rows to sheet '${SHEET_TAB}'.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

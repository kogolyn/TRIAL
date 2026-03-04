import crypto from "crypto";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "dev-token-secret-change-me";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function toBase64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  const padded = pad ? normalized + "=".repeat(4 - pad) : normalized;
  return Buffer.from(padded, "base64").toString("utf8");
}

function signPayload(payloadB64) {
  return crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(payloadB64)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createToken(payload) {
  const now = Date.now();
  const body = {
    ...payload,
    iat: now,
    exp: now + TOKEN_TTL_MS,
  };

  const payloadB64 = toBase64Url(JSON.stringify(body));
  const signature = signPayload(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expectedSignature = signPayload(payloadB64);
  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(fromBase64Url(payloadB64));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

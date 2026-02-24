const encoder = new TextEncoder();

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const buffer = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export async function signToken(email: string, secret: string): Promise<string> {
  const key = await getKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(email));
  return `${email}:${bytesToHex(new Uint8Array(signature))}`;
}

export async function verifyToken(
  token: string,
  secret: string,
): Promise<string | null> {
  const idx = token.lastIndexOf(":");
  if (idx === -1) return null;

  const email = token.substring(0, idx);
  const hex = token.substring(idx + 1);

  if (!email || !hex) return null;

  const key = await getKey(secret);
  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    hexToBytes(hex),
    encoder.encode(email),
  );

  return isValid ? email : null;
}

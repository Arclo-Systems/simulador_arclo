import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signToken } from "@/lib/auth";

function parseUsers(): Map<string, string> {
  const raw = process.env.AUTH_USERS ?? "";
  const map = new Map<string, string>();
  for (const entry of raw.split(",")) {
    const [email, password] = entry.split(":");
    if (email && password) {
      map.set(email.trim(), password.trim());
    }
  }
  return map;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { email?: string; password?: string };
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Correo y contraseña requeridos" },
      { status: 400 },
    );
  }

  const users = parseUsers();
  const storedPassword = users.get(email);

  if (!storedPassword || storedPassword !== password) {
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 },
    );
  }

  const secret = process.env.AUTH_SECRET ?? "";
  const token = await signToken(email, secret);

  const cookieStore = await cookies();
  cookieStore.set("arclo-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { auth, isAuthConfigured } from "@/auth";

export const dynamic = "force-dynamic";

/** Who am I? Used by the client shell to render the account menu / guest banner. */
export async function GET() {
  const configured = isAuthConfigured();
  const session = configured ? await auth() : null;
  return NextResponse.json(
    {
      configured,
      user: session?.user ? { name: session.user.name ?? null, email: session.user.email ?? null, image: session.user.image ?? null } : null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

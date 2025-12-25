import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  // 1. Get Session using the standard NextAuth v4 method
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { orgId } = body;

  if (!orgId) {
    return NextResponse.json({ error: "Missing Org ID" }, { status: 400 });
  }

  // 2. Verify the user actually belongs to this Org
  // (We check the session data, which is populated by your jwt callback)
  const allowed = session.user.organizations.some(
    (org: { id: string }) => org.id === orgId
  );

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Create the response
  const res = NextResponse.json({ success: true });

  // 4. Set the cookie so the Dashboard middleware/page knows what to load
  res.cookies.set("active_org", orgId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}
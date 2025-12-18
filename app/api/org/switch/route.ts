import { auth } from "@/lib/auth-helper";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgId } = await req.json();

  const allowed = session.user.organizations.some(
    (org: { id: string }) => org.id === orgId
  );

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const res = NextResponse.json({ success: true });

  res.cookies.set("active_org", orgId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}

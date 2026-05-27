import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { unauthorized } from "@/lib/api";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "a4";
  return NextResponse.redirect(new URL(`/print/${id}?format=${format}`, url.origin));
}

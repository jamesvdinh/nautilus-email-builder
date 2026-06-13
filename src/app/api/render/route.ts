import { NextRequest, NextResponse } from "next/server";
import { renderEmailHtml, type PuckData } from "@/app/lib/renderEmail";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data: PuckData = body.data;

  if (!data) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const html = renderEmailHtml(data);
  return NextResponse.json({ html });
}

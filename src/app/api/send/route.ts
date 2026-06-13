import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { renderEmailHtml, type PuckData } from "@/app/lib/renderEmail";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { to, subject, data }: { to: string; subject: string; data: PuckData } = body;

  if (!to || !subject || !data) {
    return NextResponse.json({ error: "Missing required fields: to, subject, data" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured. Add it to your .env.local file." },
      { status: 500 }
    );
  }

  const html = renderEmailHtml(data);
  const resend = new Resend(apiKey);

  const { data: sendData, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Nautilus <onboarding@resend.dev>",
    to,
    subject,
    html,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: sendData?.id });
}

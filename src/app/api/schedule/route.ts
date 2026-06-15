import { Client, Connection } from "@temporalio/client";
import { NextRequest, NextResponse } from "next/server";
import { renderEmailHtml, type PuckData } from "@/app/lib/renderEmail";

const TASK_QUEUE = "email-scheduler";

async function getClient() {
  const address = process.env.TEMPORAL_ADDRESS ?? "localhost:7233";
  const connection = await Connection.connect({ address });
  return new Client({ connection });
}

// POST /api/schedule — start a scheduled email workflow
export async function POST(req: NextRequest) {
  const { to, subject, data, scheduledAt } = (await req.json()) as {
    to: string;
    subject: string;
    data: PuckData;
    scheduledAt: number;
  };

  if (!to || !subject || !data || !scheduledAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let client: Client;
  try {
    client = await getClient();
  } catch {
    return NextResponse.json(
      { error: "Cannot connect to Temporal. Is the server running?" },
      { status: 503 }
    );
  }

  const html = renderEmailHtml(data);
  const workflowId = `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  await client.workflow.start("scheduleEmailWorkflow", {
    taskQueue: TASK_QUEUE,
    workflowId,
    args: [{ to, subject, html, scheduledAt }],
    memo: { to, subject, scheduledAt },
  });

  return NextResponse.json({ workflowId });
}

// GET /api/schedule — list running scheduled email workflows
export async function GET() {
  let client: Client;
  try {
    client = await getClient();
  } catch {
    return NextResponse.json(
      { error: "Cannot connect to Temporal. Is the server running?" },
      { status: 503 }
    );
  }

  const workflows: {
    workflowId: string;
    status: string;
    to: string;
    subject: string;
    scheduledAt: number;
    startTime: string;
  }[] = [];

  const iter = client.workflow.list({
    query: `TaskQueue='${TASK_QUEUE}' AND ExecutionStatus='Running'`,
  });

  for await (const wf of iter) {
    const memo = (wf.memo ?? {}) as Record<string, unknown>;
    workflows.push({
      workflowId: wf.workflowId,
      status: wf.status.name,
      to: String(memo.to ?? ""),
      subject: String(memo.subject ?? ""),
      scheduledAt: Number(memo.scheduledAt ?? 0),
      startTime: wf.startTime.toISOString(),
    });
  }

  // Show soonest first
  workflows.sort((a, b) => a.scheduledAt - b.scheduledAt);

  return NextResponse.json({ workflows });
}

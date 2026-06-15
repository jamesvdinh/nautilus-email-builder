import { Client, Connection } from "@temporalio/client";
import { NextRequest, NextResponse } from "next/server";

async function getClient() {
  const address = process.env.TEMPORAL_ADDRESS ?? "localhost:7233";
  const connection = await Connection.connect({ address });
  return new Client({ connection });
}

// DELETE /api/schedule/[workflowId] — cancel a scheduled email
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;

  let client: Client;
  try {
    client = await getClient();
  } catch {
    return NextResponse.json(
      { error: "Cannot connect to Temporal. Is the server running?" },
      { status: 503 }
    );
  }

  try {
    await client.workflow.getHandle(workflowId).cancel();
    return NextResponse.json({ cancelled: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

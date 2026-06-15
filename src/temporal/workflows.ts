import { proxyActivities, sleep } from "@temporalio/workflow";
import type { createActivities } from "./activities";

type Activities = ReturnType<typeof createActivities>;

const { sendScheduledEmail } = proxyActivities<Activities>({
  startToCloseTimeout: "2 minutes",
});

export interface ScheduleEmailParams {
  to: string;
  subject: string;
  html: string;
  scheduledAt: number; // unix ms
}

export async function scheduleEmailWorkflow(
  params: ScheduleEmailParams
): Promise<void> {
  const delayMs = params.scheduledAt - Date.now();
  if (delayMs > 0) {
    await sleep(delayMs);
  }
  await sendScheduledEmail(params);
}

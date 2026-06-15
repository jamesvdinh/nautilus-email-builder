import { Worker, NativeConnection } from "@temporalio/worker";
import { createActivities } from "./activities";
import path from "path";

async function run() {
  const address = process.env.TEMPORAL_ADDRESS ?? "localhost:7233";

  const connection = await NativeConnection.connect({ address });

  const worker = await Worker.create({
    connection,
    namespace: "default",
    taskQueue: "email-scheduler",
    // Temporal bundles this file; __dirname resolves to src/temporal/ at runtime
    workflowsPath: path.join(__dirname, "workflows"),
    activities: createActivities(),
  });

  console.log(`Temporal worker listening on task queue: email-scheduler`);
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

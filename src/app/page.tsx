"use client";

import { useState, useCallback, useEffect } from "react";
import { Editor, type EmailData } from "./components/Editor";

type Tab = "compose" | "preview" | "send";
type SendMode = "now" | "later";

interface ScheduledEmail {
  workflowId: string;
  status: string;
  to: string;
  subject: string;
  scheduledAt: number;
  startTime: string;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("compose");
  const [emailData, setEmailData] = useState<EmailData | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  // scheduling
  const [sendMode, setSendMode] = useState<SendMode>("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handlePublish = useCallback(async (data: EmailData) => {
    setEmailData(data);
    setLoadingPreview(true);
    setTab("preview");

    const res = await fetch("/api/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    const json = await res.json();
    setPreviewHtml(json.html ?? "");
    setLoadingPreview(false);
  }, []);

  const fetchScheduled = useCallback(async () => {
    setLoadingScheduled(true);
    try {
      const res = await fetch("/api/schedule");
      if (res.ok) {
        const json = await res.json();
        setScheduledEmails(json.workflows ?? []);
      }
    } finally {
      setLoadingScheduled(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "send") fetchScheduled();
  }, [tab, fetchScheduled]);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emailData) return;
    setSending(true);
    setSendResult(null);

    if (sendMode === "now") {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, data: emailData }),
      });
      const json = await res.json();
      setSendResult(
        json.success
          ? { ok: true, message: `Email sent! ID: ${json.id}` }
          : { ok: false, message: json.error ?? "Unknown error" }
      );
    } else {
      if (!scheduledAt) {
        setSendResult({ ok: false, message: "Pick a date and time first." });
        setSending(false);
        return;
      }
      const ts = new Date(scheduledAt).getTime();
      if (ts <= Date.now()) {
        setSendResult({ ok: false, message: "Scheduled time must be in the future." });
        setSending(false);
        return;
      }
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, data: emailData, scheduledAt: ts }),
      });
      const json = await res.json();
      if (json.workflowId) {
        setSendResult({ ok: true, message: `Scheduled! Workflow: ${json.workflowId}` });
        fetchScheduled();
      } else {
        setSendResult({ ok: false, message: json.error ?? "Unknown error" });
      }
    }

    setSending(false);
  };

  const handleCancel = async (workflowId: string) => {
    setCancellingId(workflowId);
    try {
      await fetch(`/api/schedule/${workflowId}`, { method: "DELETE" });
      await fetchScheduled();
    } finally {
      setCancellingId(null);
    }
  };

  const tabs: Tab[] = ["compose", "preview", "send"];

  // min attribute for datetime-local: now + 1 minute
  const minDatetime = new Date(Date.now() + 60_000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <span className="font-semibold text-zinc-900 dark:text-white tracking-tight">
          Nautilus Email Builder
        </span>
        <nav className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors cursor-pointer ${
                tab === t
                  ? "bg-blue-600 text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      {/* Main — keep Editor mounted so drag-and-drop state is preserved across tab switches */}
      <main className="flex-1 overflow-hidden">
        <div className={tab === "compose" ? "h-full" : "hidden"}>
          <Editor
            onPublish={handlePublish}
            initialData={emailData ?? undefined}
          />
        </div>

        {tab === "preview" && (
          <div className="h-full flex flex-col items-center overflow-auto p-8 bg-zinc-100 dark:bg-zinc-900">
            <div className="w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  Email Preview
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTab("compose")}
                    className="px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setTab("send")}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Send Email →
                  </button>
                </div>
              </div>

              {loadingPreview ? (
                <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-zinc-200">
                  <p className="text-sm text-zinc-400">Rendering preview…</p>
                </div>
              ) : previewHtml ? (
                <div className="rounded-lg overflow-hidden border border-zinc-200 shadow-sm">
                  <iframe
                    srcDoc={previewHtml}
                    title="Email Preview"
                    className="w-full bg-white"
                    style={{ height: 600, border: "none" }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-zinc-200 text-zinc-400">
                  <p className="text-sm">No preview yet.</p>
                  <p className="text-xs mt-1">
                    Compose your email and click Publish.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "send" && (
          <div className="h-full overflow-auto p-8">
            <div className="flex flex-col gap-8 max-w-md mx-auto">
              {/* ── Send / Schedule form ── */}
              <div>
                <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-6">
                  Send Email
                </h2>

                {!emailData && (
                  <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm">
                    No email composed yet.{" "}
                    <button
                      className="underline font-medium"
                      onClick={() => setTab("compose")}
                    >
                      Go to Compose
                    </button>{" "}
                    and click Publish first.
                  </div>
                )}

                <form onSubmit={handleSend} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      To
                    </label>
                    <input
                      type="email"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="recipient@example.com"
                      required
                      className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Your email subject"
                      required
                      className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Send mode toggle */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      When
                    </label>
                    <div className="flex rounded-md border border-zinc-300 dark:border-zinc-700 overflow-hidden text-sm">
                      {(["now", "later"] as SendMode[]).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSendMode(m)}
                          className={`flex-1 py-2 font-medium transition-colors ${
                            sendMode === m
                              ? "bg-blue-600 text-white"
                              : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                          }`}
                        >
                          {m === "now" ? "Send now" : "Schedule for later"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {sendMode === "later" && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Send at
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        min={minDatetime}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {sendResult && (
                    <div
                      className={`px-4 py-3 rounded-md text-sm ${
                        sendResult.ok
                          ? "bg-green-50 border border-green-200 text-green-700"
                          : "bg-red-50 border border-red-200 text-red-700"
                      }`}
                    >
                      {sendResult.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={sending || !emailData}
                    className="w-full py-2 px-4 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending
                      ? sendMode === "now"
                        ? "Sending…"
                        : "Scheduling…"
                      : sendMode === "now"
                        ? "Send Email"
                        : "Schedule Email"}
                  </button>
                </form>

                <p className="mt-4 text-xs text-zinc-400">
                  Requires <code>RESEND_API_KEY</code> in{" "}
                  <code>.env.local</code>. Scheduling also requires a running
                  Temporal worker (<code>npm run worker</code>).
                </p>
              </div>

              {/* ── Scheduled emails list ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    Scheduled Emails
                  </h3>
                  <button
                    type="button"
                    onClick={fetchScheduled}
                    disabled={loadingScheduled}
                    className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors disabled:opacity-40"
                  >
                    {loadingScheduled ? "Refreshing…" : "Refresh"}
                  </button>
                </div>

                {scheduledEmails.length === 0 ? (
                  <p className="text-sm text-zinc-400 py-4 text-center border border-dashed border-zinc-200 dark:border-zinc-700 rounded-md">
                    {loadingScheduled ? "Loading…" : "No scheduled emails."}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {scheduledEmails.map((email) => (
                      <li
                        key={email.workflowId}
                        className="flex items-start justify-between gap-3 px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">
                            {email.subject || "(no subject)"}
                          </p>
                          <p className="text-xs text-zinc-500 truncate">
                            To: {email.to}
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {email.scheduledAt
                              ? new Date(email.scheduledAt).toLocaleString()
                              : "—"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCancel(email.workflowId)}
                          disabled={cancellingId === email.workflowId}
                          className="shrink-0 px-2.5 py-1 text-xs font-medium border border-red-200 text-red-600 rounded hover:bg-red-50 disabled:opacity-40 transition-colors"
                        >
                          {cancellingId === email.workflowId
                            ? "Cancelling…"
                            : "Cancel"}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { CheckCircle2, Clock, Terminal, XCircle } from "lucide-react";

export interface TestCaseResult {
  passed: boolean;
  actual?: unknown;
  expected?: unknown;
  error?: string;
}

export interface CodeExecutionResponse {
  success: boolean;
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  testResults: TestCaseResult[];
  error: string | null;
}

interface TestCasePanelProps {
  output: CodeExecutionResponse | null;
  isRunning: boolean;
}

export default function TestCasePanel({ output, isRunning }: TestCasePanelProps) {
  if (isRunning) {
    return (
      <div className="rounded-card border border-border bg-[#181825] p-5 text-xs text-white/70 animate-pulse flex items-center gap-3">
        <Terminal className="h-5 w-5 text-primary animate-spin" />
        <span>Executing code in sandboxed runner and evaluating test cases...</span>
      </div>
    );
  }

  if (!output) {
    return null;
  }

  const passedCount = output.testResults.filter((t) => t.passed).length;
  const totalCount = output.testResults.length;

  return (
    <div className="rounded-card border border-border bg-[#181825] p-5 text-white shadow-card space-y-4 font-mono text-xs">
      {/* Test summary header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 font-bold">
          <Terminal className="h-4 w-4 text-primary" /> Execution Results
        </div>
        <div className="flex items-center gap-3 text-white/60">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {output.executionTimeMs}ms
          </span>
          {totalCount > 0 && (
            <span
              className={`rounded-pill px-2.5 py-0.5 font-extrabold ${
                passedCount === totalCount ? "bg-success/20 text-success" : "bg-error/20 text-error"
              }`}
            >
              {passedCount}/{totalCount} Passed
            </span>
          )}
        </div>
      </div>

      {/* Stdout / Console output */}
      {output.stdout && (
        <div>
          <span className="text-white/40 uppercase tracking-wider text-[10px] font-bold">stdout</span>
          <pre className="mt-1 rounded bg-[#11111b] p-3 text-[#a6adc8] whitespace-pre-wrap leading-5">
            {output.stdout}
          </pre>
        </div>
      )}

      {/* Stderr / Errors */}
      {output.stderr && (
        <div>
          <span className="text-error uppercase tracking-wider text-[10px] font-bold">stderr / error</span>
          <pre className="mt-1 rounded bg-error/10 border border-error/30 p-3 text-error whitespace-pre-wrap leading-5">
            {output.stderr}
          </pre>
        </div>
      )}

      {/* Individual Test Cases List */}
      {output.testResults.length > 0 && (
        <div className="space-y-2">
          <span className="text-white/40 uppercase tracking-wider text-[10px] font-bold">Test Cases</span>
          <div className="space-y-2">
            {output.testResults.map((tc, idx) => (
              <div
                key={idx}
                className={`rounded border p-3 flex items-start justify-between gap-3 ${
                  tc.passed
                    ? "bg-success/5 border-success/30 text-success"
                    : "bg-error/5 border-error/30 text-error"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {tc.passed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold">Test Case #{idx + 1}: {tc.passed ? "PASSED" : "FAILED"}</span>
                    {tc.error && <p className="mt-1 text-error/90 font-normal">{tc.error}</p>}
                    {!tc.passed && tc.expected !== undefined && (
                      <div className="mt-1.5 space-y-0.5 text-[11px] text-white/70">
                        <div>Expected: <code className="text-success font-bold">{JSON.stringify(tc.expected)}</code></div>
                        <div>Actual: <code className="text-error font-bold">{JSON.stringify(tc.actual)}</code></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

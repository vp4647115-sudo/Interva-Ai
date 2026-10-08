"use client";

import { Code2, Play, RotateCcw } from "lucide-react";

interface CodeEditorComponentProps {
  code: string;
  language: string;
  onCodeChange: (newCode: string) => void;
  onLanguageChange: (newLang: string) => void;
  onRunCode: () => void;
  isRunning: boolean;
}

const STARTER_TEMPLATES: Record<string, string> = {
  python: `def solution(nums, target):\n    # Write your algorithmic solution here\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n`,
  javascript: `function solution(nums, target) {\n  // Write your algorithmic solution here\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n`,
  typescript: `function solution(nums: number[], target: number): number[] {\n  // Write your algorithmic solution here\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff)!, i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n`,
};

export default function CodeEditorComponent({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  onRunCode,
  isRunning,
}: CodeEditorComponentProps) {
  const lines = (code || STARTER_TEMPLATES[language] || "").split("\n");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const nextVal = val.substring(0, start) + "    " + val.substring(end);
      onCodeChange(nextVal);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="rounded-card border border-border bg-[#181825] text-white shadow-card overflow-hidden">
      {/* Top Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-[#1e1e2e] px-4 py-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-xs text-white/90">
            <Code2 className="h-4 w-4 text-primary" /> Algorithmic Code Workspace
          </div>
          <select
            value={language}
            onChange={(e) => {
              const newLang = e.target.value;
              onLanguageChange(newLang);
              if (!code.trim() || code === STARTER_TEMPLATES[language]) {
                onCodeChange(STARTER_TEMPLATES[newLang] || "");
              }
            }}
            className="rounded-input border border-white/20 bg-[#313244] px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-primary"
          >
            <option value="python">Python 3.12</option>
            <option value="javascript">JavaScript (ES6)</option>
            <option value="typescript">TypeScript</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCodeChange(STARTER_TEMPLATES[language] || "")}
            className="inline-flex items-center gap-1 rounded-pill border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/70 hover:bg-white/10"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Starter Code
          </button>

          <button
            type="button"
            onClick={onRunCode}
            disabled={isRunning || !code.trim()}
            className="inline-flex items-center gap-2 rounded-pill bg-success px-5 py-1.5 text-xs font-extrabold text-white hover:bg-success/90 shadow-md disabled:opacity-40"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> {isRunning ? "Executing..." : "Run Test Cases"}
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers & Code Input */}
      <div className="flex min-h-[280px] bg-[#181825] font-mono text-sm leading-6">
        {/* Line numbers column */}
        <div className="shrink-0 select-none bg-[#11111b] px-3 py-4 text-right text-xs text-white/30 border-r border-white/5 min-w-[40px]">
          {lines.map((_, idx) => (
            <div key={idx}>{idx + 1}</div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <textarea
          value={code || STARTER_TEMPLATES[language] || ""}
          onChange={(e) => onCodeChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="w-full resize-none bg-transparent p-4 font-mono text-xs leading-6 text-[#cdd6f4] outline-none border-none focus:ring-0"
        />
      </div>
    </div>
  );
}

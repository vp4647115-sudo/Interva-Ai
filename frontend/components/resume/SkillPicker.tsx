"use client";

import { useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { Plus, Search, X } from "lucide-react";
import { SKILL_TAXONOMY } from "@/lib/skills/taxonomy";

const fuse = new Fuse(SKILL_TAXONOMY, { includeScore: true, threshold: 0.35 });

/** Case-insensitive partial match first, then fuzzy fallback for typos. */
export function searchSkills(query: string, limit = 8): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const partial = SKILL_TAXONOMY.filter((s) => s.toLowerCase().includes(q));
  if (partial.length >= limit) return partial.slice(0, limit);
  const fuzzy = fuse.search(q).map((r) => r.item);
  return Array.from(new Set([...partial, ...fuzzy])).slice(0, limit);
}

export default function SkillPicker({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => searchSkills(query).filter((s) => !skills.includes(s)), [query, skills]);

  const add = (skill: string) => {
    if (!skills.includes(skill)) onChange([...skills, skill]);
    setQuery("");
    setOpen(false);
  };

  const remove = (skill: string) => onChange(skills.filter((s) => s !== skill));

  return (
    <div ref={boxRef} className="relative">
      <label className="block">
        <span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Skills</span>
        <div className="flex items-center rounded-input border border-border bg-surface-alt px-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
          <Search className="h-4 w-4 shrink-0 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (suggestions[0]) add(suggestions[0]); else if (query.trim()) add(query.trim()); } }}
            placeholder="Type to search — try “ja”, “ai”, “web”…"
            className="w-full bg-transparent px-3 py-3 text-sm outline-none"
            aria-label="Search skills"
          />
        </div>
      </label>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-card border border-border bg-white shadow-modal" role="listbox">
          {suggestions.map((skill) => (
            <li key={skill}>
              <button type="button" onClick={() => add(skill)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-primary-soft" role="option" aria-selected={false}>
                <Plus className="h-3.5 w-3.5 text-primary" /> {skill}
              </button>
            </li>
          ))}
        </ul>
      )}

      {skills.length > 0 && (
        <div className="mt-3">
          <span className="mb-2 block text-xs font-extrabold text-ink-secondary">Selected skills</span>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <button key={skill} type="button" onClick={() => remove(skill)} className="inline-flex items-center gap-1.5 rounded-pill bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white">
                {skill} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

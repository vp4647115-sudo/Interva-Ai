"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";

/** Case-insensitive partial match first, then fuzzy fallback for typos. */
function suggest(list: string[], query: string, limit = 8): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const fuse = new Fuse(list, { includeScore: true, threshold: 0.35 });
  const partial = list.filter((s) => s.toLowerCase().includes(q));
  if (partial.length >= limit) return partial.slice(0, limit);
  const fuzzy = fuse.search(q).map((r) => r.item);
  return Array.from(new Set([...partial, ...fuzzy])).slice(0, limit);
}

/**
 * Text input with a suggestion dropdown from a curated taxonomy.
 * Typing a partial name shows full matches; click (or Enter) to fill.
 */
export default function TaxonomyInput({
  id,
  value,
  onChange,
  options,
  placeholder,
  className,
  ariaLabel,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  className: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => suggest(options, value), [options, value]);
  const showList = open && value.trim() !== "" && suggestions.length > 0;

  return (
    <div className="relative">
      <input
        id={id}
        className={className}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={`${id}-suggestions`}
        aria-label={ariaLabel}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && showList) {
            e.preventDefault();
            onChange(suggestions[0]);
            setOpen(false);
          }
        }}
      />
      {showList && (
        <ul
          id={`${id}-suggestions`}
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-white shadow-card"
        >
          {suggestions.map((s) => (
            <li key={s} role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-primary-soft"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

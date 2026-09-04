"use client";

import React from "react";

export interface SelectOption {
  id: string;
  label: string;
  isArchived?: boolean;
}

interface MultiSelectProps {
  label: string;
  options: SelectOption[];
  selectedIds: string[];
  onChange: (newIds: string[]) => void;
  placeholder?: string;
}

export function RelationshipMultiSelect({
  label,
  options,
  selectedIds,
  onChange,
  placeholder = "Select options...",
}: MultiSelectProps) {
  function toggleOption(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  // Preserve any selected options that might be missing from the active options list (e.g. archived)
  const optionMap = new Map<string, SelectOption>();
  for (const opt of options) {
    optionMap.set(opt.id, opt);
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
        {label}
      </label>
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 space-y-2 max-h-48 overflow-y-auto">
        {options.length === 0 && selectedIds.length === 0 ? (
          <p className="text-xs text-neutral-500 italic">{placeholder}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {options.map((opt) => {
              const isSelected = selectedIds.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleOption(opt.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-750"
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.isArchived && (
                    <span className="text-[10px] bg-neutral-700 text-neutral-400 px-1 rounded">Archived</span>
                  )}
                  <span className="text-neutral-500 text-[10px]">{isSelected ? "✓" : "+"}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface SingleSelectProps {
  label: string;
  options: SelectOption[];
  selectedId?: string | null;
  onChange: (newId: string | null) => void;
  placeholder?: string;
}

export function RelationshipSingleSelect({
  label,
  options,
  selectedId,
  onChange,
  placeholder = "-- None --",
}: SingleSelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
        {label}
      </label>
      <select
        value={selectedId || ""}
        onChange={(e) => onChange(e.target.value ? e.target.value : null)}
        className="w-full rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label} {opt.isArchived ? "(Archived)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

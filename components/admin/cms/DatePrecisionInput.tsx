"use client";

import React from "react";
import { DatePrecision } from "@/lib/cms/types";

interface DatePrecisionInputProps {
  label: string;
  dateValue: string;
  precision: DatePrecision | "";
  onChange: (dateValue: string, precision: DatePrecision | "") => void;
  optional?: boolean;
  disabled?: boolean;
}

export function DatePrecisionInput({
  label,
  dateValue,
  precision,
  onChange,
  optional = true,
  disabled = false,
}: DatePrecisionInputProps) {
  function handlePrecisionChange(newPrec: DatePrecision | "") {
    if (!newPrec) {
      onChange("", "");
    } else {
      onChange(dateValue, newPrec);
    }
  }

  function handleDateValueChange(val: string) {
    if (!val.trim()) {
      onChange("", precision);
    } else {
      // Auto-infer precision if not yet set
      let autoPrec = precision;
      if (!autoPrec) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) autoPrec = "day";
        else if (/^\d{4}-\d{2}$/.test(val)) autoPrec = "month";
        else if (/^\d{4}$/.test(val)) autoPrec = "year";
        else autoPrec = "month";
      }
      onChange(val, autoPrec);
    }
  }

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-zinc-300">
          {label} {optional ? <span className="text-zinc-500 font-normal">(Optional)</span> : <span className="text-red-400">*</span>}
        </label>
        {precision && (
          <span className="text-[10px] uppercase font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
            Precision: {precision}
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        <select
          disabled={disabled}
          value={precision}
          onChange={(e) => handlePrecisionChange(e.target.value as DatePrecision | "")}
          className="col-span-2 px-2.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-orangeWeb/50 disabled:opacity-50"
        >
          <option value="">-- Not Set --</option>
          <option value="month">Month (e.g. Aug 2026)</option>
          <option value="year">Year (e.g. 2027)</option>
          <option value="day">Day (e.g. 11 Jul 2026)</option>
        </select>

        <div className="col-span-3">
          {precision === "day" && (
            <input
              type="date"
              disabled={disabled}
              value={dateValue}
              onChange={(e) => handleDateValueChange(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-orangeWeb/50 disabled:opacity-50"
            />
          )}

          {precision === "month" && (
            <input
              type="month"
              disabled={disabled}
              value={dateValue.slice(0, 7)}
              onChange={(e) => handleDateValueChange(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-orangeWeb/50 disabled:opacity-50"
            />
          )}

          {precision === "year" && (
            <input
              type="number"
              min="1990"
              max="2100"
              placeholder="e.g. 2026"
              disabled={disabled}
              value={dateValue.slice(0, 4)}
              onChange={(e) => handleDateValueChange(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-orangeWeb/50 disabled:opacity-50"
            />
          )}

          {!precision && (
            <input
              type="text"
              disabled
              placeholder="Select precision first"
              className="w-full px-3 py-2 bg-zinc-950/40 border border-zinc-800/40 rounded-lg text-zinc-600 text-xs cursor-not-allowed"
            />
          )}
        </div>
      </div>
    </div>
  );
}

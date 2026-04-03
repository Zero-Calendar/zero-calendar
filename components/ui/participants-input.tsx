"use client";

import { XIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ParticipantsInputProps {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmails(rawValue: string) {
  return rawValue
    .split(/[\n,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function ParticipantsInput({
  className,
  inputClassName,
  placeholder = "Add email and press Enter",
  value,
  onChange,
}: ParticipantsInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedValues = useMemo(
    () => value.map((email) => email.toLowerCase()),
    [value]
  );

  const commitDraft = () => {
    const nextEmails = normalizeEmails(draft);
    if (nextEmails.length === 0) {
      setDraft("");
      return;
    }

    const nextValue = [...value];

    for (const email of nextEmails) {
      const normalizedEmail = email.toLowerCase();
      if (!EMAIL_REGEX.test(email) || normalizedValues.includes(normalizedEmail)) {
        continue;
      }

      nextValue.push(email);
    }

    onChange(nextValue);
    setDraft("");
  };

  const removeParticipant = (email: string) => {
    onChange(value.filter((participant) => participant !== email));
  };

  return (
    <div
      className={cn(
        "flex min-h-10 w-full flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2",
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((email) => (
        <span
          className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/80"
          key={email}
        >
          <span className="max-w-[12rem] truncate">{email}</span>
          <button
            className="rounded-full p-0.5 text-white/35 transition-colors hover:bg-white/[0.08] hover:text-white/75"
            onClick={(event) => {
              event.stopPropagation();
              removeParticipant(email);
            }}
            type="button"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </span>
      ))}

      <input
        className={cn(
          "min-w-[9rem] flex-1 bg-transparent text-xs text-white/85 outline-none placeholder:text-white/25",
          inputClassName
        )}
        onBlur={commitDraft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commitDraft();
          }

          if (event.key === "Backspace" && draft.length === 0 && value.length > 0) {
            event.preventDefault();
            removeParticipant(value[value.length - 1]);
          }
        }}
        placeholder={value.length === 0 ? placeholder : "Add another participant"}
        ref={inputRef}
        value={draft}
      />
    </div>
  );
}

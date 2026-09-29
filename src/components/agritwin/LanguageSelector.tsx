import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { LANGUAGE_OPTIONS } from "@/lib/agritwin/translations";
import { LanguageCode } from "@/lib/agritwin/types";

export function LanguageSelector({
  variant = "button",
  className,
}: {
  variant?: "button" | "select" | "cards";
  className?: string;
}) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const current = LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "cards") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-border">
        {LANGUAGE_OPTIONS.map((opt) => {
          const selected = opt.code === language;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLanguage(opt.code)}
              className={`bg-card py-3 text-center text-[12px] ${
                selected ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.nativeLabel}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "select") {
    return (
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        className={`border border-border bg-card px-2 py-1.5 text-[12px] ${className || ""}`}
      >
        {LANGUAGE_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.nativeLabel}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`px-2 h-8 text-[12px] text-muted-foreground hover:text-foreground ${className || ""}`}
        aria-label="Change Language"
      >
        {current.code.toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] border border-border bg-popover p-1">
          {LANGUAGE_OPTIONS.map((opt) => {
            const selected = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setLanguage(opt.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-2 py-1.5 text-[12px] ${
                  selected ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
              >
                {opt.nativeLabel}
                {selected && <Check className="size-3" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

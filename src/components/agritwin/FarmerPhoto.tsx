import { useRef } from "react";
import { fileToAvatarDataUrl, initialsFrom } from "@/lib/farmer-identity";

export function FarmerPhoto({
  url,
  name,
  sizeClass = "size-16",
  onChange,
}: {
  url: string;
  name: string;
  sizeClass?: string;
  onChange?: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const initials = initialsFrom(name);

  async function pick(file: File | undefined) {
    if (!file || !onChange) return;
    try {
      onChange(await fileToAvatarDataUrl(file));
    } catch {
      /* ignore unreadable files */
    }
  }

  const inner = url ? (
    <img src={url} alt="" className={`${sizeClass} object-cover`} />
  ) : (
    <span className={`${sizeClass} grid place-items-center bg-primary/20 font-display text-[13px] text-primary`}>
      {initials}
    </span>
  );

  if (!onChange) return inner;

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="relative shrink-0 overflow-hidden ring-1 ring-border"
      aria-label="Change photo"
    >
      {inner}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </button>
  );
}

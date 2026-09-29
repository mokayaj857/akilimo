import { Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function AudioReaderButton({
  text,
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const { speak, stopSpeaking, isSpeaking, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => (isSpeaking ? stopSpeaking() : speak(text))}
      className={`grid size-8 place-items-center border border-border text-muted-foreground hover:text-foreground ${className || ""}`}
      title={isSpeaking ? t.stopListening : t.listen}
      aria-label={isSpeaking ? t.stopListening : t.listen}
    >
      {isSpeaking ? <VolumeX className="size-3.5 text-risk" /> : <Volume2 className="size-3.5" />}
    </button>
  );
}

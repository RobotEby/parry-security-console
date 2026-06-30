import { redactDeep } from "@/lib/utils/redact";

export function JsonPreview({ value }: { value: unknown }) {
  const safe = redactDeep(value);
  let text: string;
  try {
    text = JSON.stringify(safe, null, 2);
  } catch {
    text = "[unserializable]";
  }
  return (
    <pre className="rounded-md border border-border bg-surface-1 p-3 text-xs font-mono text-foreground/90 overflow-auto max-h-80">
      {text}
    </pre>
  );
}

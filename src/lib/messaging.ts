import type { PageSignals } from "./analysis/types";

export interface ExtractSignalsMessage {
  type: "EXTRACT_SIGNALS";
}

export interface ExtractSignalsResponse {
  ok: true;
  signals: PageSignals;
}

export interface ExtractSignalsError {
  ok: false;
  error: string;
}

export type ExtractResponse = ExtractSignalsResponse | ExtractSignalsError;

export function isExtractResponse(msg: unknown): msg is ExtractResponse {
  return (
    typeof msg === "object" &&
    msg !== null &&
    "ok" in msg &&
    typeof (msg as Record<string, unknown>).ok === "boolean"
  );
}

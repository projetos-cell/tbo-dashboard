import { clicksignUpload } from "./client";
import type { ClicksignDocument } from "./types";

// ─── Documents ───────────────────────────────────────────────────────────────

/**
 * Upload a PDF document to a Clicksign envelope.
 */
export async function uploadDocument(
  envelopeId: string,
  file: File | Blob,
  filename: string
): Promise<ClicksignDocument> {
  const formData = new FormData();
  formData.append("file", file, filename);

  const res = await clicksignUpload<{ data: ClicksignDocument }>(
    `/envelopes/${envelopeId}/documents`,
    formData
  );
  return res.data;
}

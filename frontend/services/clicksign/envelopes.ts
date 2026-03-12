import { clicksignFetch } from "./client";
import type {
  ClicksignEnvelope,
  ClicksignEnvelopeStatus,
  CreateEnvelopeInput,
} from "./types";

// ─── List / Pagination ──────────────────────────────────────────────────────

interface ListEnvelopesOptions {
  status?: ClicksignEnvelopeStatus;
  pageNumber?: number;
  pageSize?: number;
}

interface ListEnvelopesResponse {
  data: ClicksignEnvelope[];
  meta: { record_count: number };
  links: {
    first?: string;
    last?: string;
    next?: string;
    prev?: string;
  };
}

/**
 * List envelopes with optional status filter and pagination.
 * Clicksign API v3 uses JSON:API-style pagination: page[number] & page[size].
 */
export async function listEnvelopes(
  options: ListEnvelopesOptions = {}
): Promise<ListEnvelopesResponse> {
  const params = new URLSearchParams();

  if (options.status) {
    params.set("filter[status]", options.status);
  }

  params.set("page[number]", String(options.pageNumber ?? 1));
  params.set("page[size]", String(options.pageSize ?? 50));

  const query = params.toString();

  return clicksignFetch<ListEnvelopesResponse>({
    method: "GET",
    path: `/envelopes?${query}`,
  });
}

/**
 * Fetch ALL envelopes matching a status by auto-paginating.
 */
export async function listAllEnvelopes(
  status?: ClicksignEnvelopeStatus
): Promise<ClicksignEnvelope[]> {
  const all: ClicksignEnvelope[] = [];
  let page = 1;
  const pageSize = 50;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await listEnvelopes({ status, pageNumber: page, pageSize });
    all.push(...res.data);

    if (all.length >= res.meta.record_count || res.data.length < pageSize) {
      break;
    }
    page++;
  }

  return all;
}

// ─── Envelopes CRUD ──────────────────────────────────────────────────────────

export async function createEnvelope(
  input: CreateEnvelopeInput
): Promise<ClicksignEnvelope> {
  const res = await clicksignFetch<{ data: ClicksignEnvelope }>({
    method: "POST",
    path: "/envelopes",
    body: { data: { ...input } },
  });
  return res.data;
}

export async function getEnvelope(
  envelopeId: string
): Promise<ClicksignEnvelope> {
  const res = await clicksignFetch<{ data: ClicksignEnvelope }>({
    method: "GET",
    path: `/envelopes/${envelopeId}`,
  });
  return res.data;
}

export async function activateEnvelope(
  envelopeId: string
): Promise<ClicksignEnvelope> {
  const res = await clicksignFetch<{ data: ClicksignEnvelope }>({
    method: "POST",
    path: `/envelopes/${envelopeId}/activate`,
  });
  return res.data;
}

export async function cancelEnvelope(
  envelopeId: string
): Promise<ClicksignEnvelope> {
  const res = await clicksignFetch<{ data: ClicksignEnvelope }>({
    method: "POST",
    path: `/envelopes/${envelopeId}/cancel`,
  });
  return res.data;
}

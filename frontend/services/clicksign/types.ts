import { z } from "zod";

// ─── Envelope ────────────────────────────────────────────────────────────────

export const ClicksignEnvelopeStatusSchema = z.enum([
  "draft",
  "running",
  "closed",
  "canceled",
]);

export type ClicksignEnvelopeStatus = z.infer<typeof ClicksignEnvelopeStatusSchema>;

export const ClicksignEnvelopeSchema = z.object({
  id: z.string(),
  status: ClicksignEnvelopeStatusSchema,
  name: z.string().optional(),
  locale: z.string().optional(),
  auto_close: z.boolean().optional(),
  block_after_refusal: z.boolean().optional(),
  deadline_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ClicksignEnvelope = z.infer<typeof ClicksignEnvelopeSchema>;

export const CreateEnvelopeInputSchema = z.object({
  name: z.string().min(1),
  locale: z.string().default("pt-BR"),
  auto_close: z.boolean().default(true),
  block_after_refusal: z.boolean().default(false),
  deadline_at: z.string().nullable().optional(),
});

export type CreateEnvelopeInput = z.infer<typeof CreateEnvelopeInputSchema>;

// ─── Document ────────────────────────────────────────────────────────────────

export const ClicksignDocumentSchema = z.object({
  id: z.string(),
  filename: z.string(),
  content_type: z.string().optional(),
  created_at: z.string(),
});

export type ClicksignDocument = z.infer<typeof ClicksignDocumentSchema>;

// ─── Signer ──────────────────────────────────────────────────────────────────

export const ClicksignSignerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  cpf: z.string().nullable().optional(),
  has_documentation: z.boolean().optional(),
  created_at: z.string(),
});

export type ClicksignSigner = z.infer<typeof ClicksignSignerSchema>;

export const CreateSignerInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  cpf: z.string().optional(),
  has_documentation: z.boolean().default(false),
  qualification: z.string().default("sign"),
  communicate_events: z.boolean().default(true),
});

export type CreateSignerInput = z.infer<typeof CreateSignerInputSchema>;

// ─── Webhook Events ──────────────────────────────────────────────────────────

export const ClicksignWebhookEventSchema = z.object({
  event: z.object({
    name: z.string(),
    occurred_at: z.string(),
  }),
  envelope: z.object({
    id: z.string(),
    status: ClicksignEnvelopeStatusSchema,
    name: z.string().optional(),
  }),
  signer: z
    .object({
      id: z.string(),
      email: z.string(),
      name: z.string().optional(),
    })
    .optional(),
  document: z
    .object({
      id: z.string(),
      filename: z.string().optional(),
    })
    .optional(),
});

export type ClicksignWebhookEvent = z.infer<typeof ClicksignWebhookEventSchema>;

// ─── API Response wrapper ────────────────────────────────────────────────────

export const ClicksignResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
  });

// ─── Notification ────────────────────────────────────────────────────────────

export const NotificationInputSchema = z.object({
  message: z.string().optional(),
});

export type NotificationInput = z.infer<typeof NotificationInputSchema>;

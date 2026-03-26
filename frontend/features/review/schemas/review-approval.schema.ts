import { z } from "zod";

export const SubmitApprovalSchema = z.object({
  status: z.enum(["approved", "rejected", "changes_requested"]),
  notes: z.string().optional(),
});

export type SubmitApprovalInput = z.infer<typeof SubmitApprovalSchema>;

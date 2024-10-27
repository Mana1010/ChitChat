import { z } from "zod";

export const createGroupSchemaValidation = z.object({
  groupName: z.string().min(1).max(30),
  groupProfileIcon: z.string().min(1),
  creatorId: z.string().min(1),
});

export type CreateGroupSchema = z.infer<typeof createGroupSchemaValidation>;

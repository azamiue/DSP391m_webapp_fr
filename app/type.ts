import { z } from "zod";

export const authenSchema = z.object({
  email: z.string().email(),
  loading: z.boolean(),
  success: z.boolean(),
  fail: z.boolean(),
  alreadyReg: z.boolean(),
  name: z.string(),
  organization: z.string(),
  faceStep: z.boolean(),
  ModelsLoaded: z.boolean(),
  faceDirection: z.string(),
  lookingFor: z.string(),
  isDone: z.boolean(),
  zipPath: z.string(),
  isFinish: z.boolean(),
  tempName: z.string(),
  tempOrganization: z.string(),
  selectPlan: z.string(),
  tempSelectPlan: z.string(),
  index: z.string(),
});

export type AuthenticatorSchema = z.infer<typeof authenSchema>;

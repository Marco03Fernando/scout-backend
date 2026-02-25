import { z } from "zod";


//thiss prevents the ai from hallucinating 
export const aiResponseSchema = z.object({
  matches: z.array(
    z.object({
      id: z.number(),
      reason: z.string()
    })
  )
});
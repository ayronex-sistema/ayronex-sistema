import { z } from "zod";

export const checklistFormSchema = z.object({
  company: z.enum(["TCI", "DCF", "NEW_TELECOM"]),
  employeeId: z.string().min(1, "Selecione um funcionário."),
  inspectorName: z.string().min(2, "Informe o nome do fiscal."),
  observations: z.string().max(2000).optional().default(""),
  declarationAccept: z.boolean().refine((value) => value === true, "Confirme a declaração de aceite."),
  signature: z.string().min(32, "Assine para continuar."),
  epis: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        ca: z.string().min(1),
        quantity: z.number().int().positive(),
        selected: z.boolean()
      })
    )
    .min(1, "Selecione ao menos um EPI.")
    .refine((items) => items.some((item) => item.selected), "Selecione ao menos um EPI.")
});

export type ChecklistFormValues = z.infer<typeof checklistFormSchema>;

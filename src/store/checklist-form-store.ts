import { create } from "zustand";
import type { ChecklistFormValues } from "@/lib/checklist-schema";
import { EPI_OPTIONS } from "@/lib/checklist-data";

export type ChecklistDraft = ChecklistFormValues;

type ChecklistStore = {
  step: number;
  draft: ChecklistDraft;
  setStep: (step: number) => void;
  updateDraft: (patch: Partial<ChecklistDraft>) => void;
  toggleEpi: (epiId: string) => void;
  setEpiQuantity: (epiId: string, quantity: number) => void;
  resetDraft: () => void;
};

function createInitialDraft(): ChecklistDraft {
  return {
    company: "TCI",
    employeeId: "",
    inspectorName: "",
    observations: "",
    declarationAccept: false,
    signature: "",
    epis: EPI_OPTIONS.map((item) => ({ ...item, quantity: 1, selected: false }))
  };
}

export const useChecklistStore = create<ChecklistStore>((set) => ({
  step: 0,
  draft: createInitialDraft(),
  setStep: (step) => set({ step }),
  updateDraft: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
  toggleEpi: (epiId) =>
    set((state) => ({
      draft: {
        ...state.draft,
        epis: state.draft.epis.map((item) =>
          item.id === epiId ? { ...item, selected: !item.selected } : item
        )
      }
    })),
  setEpiQuantity: (epiId, quantity) =>
    set((state) => ({
      draft: {
        ...state.draft,
        epis: state.draft.epis.map((item) =>
          item.id === epiId ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      }
    })),
  resetDraft: () => set({ step: 0, draft: createInitialDraft() })
}));

"use client";

import { Check } from "lucide-react";

type StepperProps = {
  steps: string[];
  currentStep: number;
};

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <ol className="grid gap-3 md:grid-cols-3">
      {steps.map((step, index) => {
        const active = index === currentStep;
        const done = index < currentStep;
        return (
          <li
            key={step}
            className={[
              "rounded-2xl border px-4 py-3 text-sm transition",
              active ? "border-amber-400 bg-amber-400/10 text-white" : "border-zinc-800 bg-zinc-900 text-zinc-400",
              done ? "border-emerald-500/60 text-zinc-200" : ""
            ].join(" ")}
          >
            <div className="flex items-center gap-3">
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                  done || active ? "border-amber-400 bg-amber-400 text-black" : "border-zinc-700 bg-zinc-950"
                ].join(" ")}
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <div>
                <p className="font-medium">{step}</p>
                <p className="text-xs opacity-70">Etapa {index + 1}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

"use client";

import { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";
import { RotateCcw } from "lucide-react";

type SignaturePadProps = {
  value: string;
  onChange: (dataUrl: string) => void;
};

export function SignatureField({ value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const lastAppliedValueRef = useRef("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      padRef.current?.clear();
      if (lastAppliedValueRef.current) {
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
        };
        img.src = lastAppliedValueRef.current;
      }
    };

    const handleEndStroke = () => {
      if (padRef.current && !padRef.current.isEmpty()) {
        onChange(padRef.current.toDataURL("image/png"));
      }
    };

    padRef.current = new SignaturePad(canvas, {
      backgroundColor: "rgb(9, 9, 11)",
      penColor: "rgb(245, 158, 11)",
      onEnd: handleEndStroke
    } as any);

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      padRef.current?.off();
      padRef.current = null;
    };
  }, [onChange]);

  useEffect(() => {
    const pad = padRef.current;
    if (!pad) return;

    if (!value) {
      pad.clear();
      lastAppliedValueRef.current = "";
      return;
    }

    if (value !== lastAppliedValueRef.current) {
      pad.fromDataURL(value);
      lastAppliedValueRef.current = value;
    }
  }, [value]);

  const handleClear = () => {
    padRef.current?.clear();
    onChange("");
    lastAppliedValueRef.current = "";
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-4 py-3 text-sm text-zinc-400">
          Assinatura digital do funcionário
        </div>
        <canvas ref={canvasRef} className="h-56 w-full touch-none bg-zinc-950" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">A assinatura é salva como imagem e enviada junto do checklist.</p>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition hover:border-amber-400 hover:text-amber-300"
        >
          <RotateCcw className="h-4 w-4" />
          Limpar
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";

type SignatureCanvasProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SignatureCanvas({ value, onChange }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const currentValueRef = useRef("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      if (currentValueRef.current) {
        const image = new Image();
        image.onload = () => {
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
        };
        image.src = currentValueRef.current;
      }
    };

    padRef.current = new SignaturePad(canvas, {
      backgroundColor: "rgb(9, 9, 11)",
      penColor: "rgb(245, 158, 11)"
    } as any);

    const handleEndStroke = () => {
      if (padRef.current && !padRef.current.isEmpty()) {
        onChange(padRef.current.toDataURL("image/png"));
      }
    };

    padRef.current.addEventListener("endStroke", handleEndStroke);

    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      padRef.current?.removeEventListener("endStroke", handleEndStroke);
      padRef.current?.off();
      padRef.current = null;
    };
  }, [onChange]);

  useEffect(() => {
    if (!padRef.current) {
      return;
    }

    if (!value) {
      currentValueRef.current = "";
      padRef.current.clear();
      return;
    }

    if (value !== currentValueRef.current) {
      currentValueRef.current = value;
      padRef.current.fromDataURL(value);
    }
  }, [value]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-4 py-3 text-sm text-zinc-400">Assinatura digital do funcionário</div>
        <canvas ref={canvasRef} className="h-56 w-full touch-none bg-zinc-950" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">A assinatura é salva como imagem base64 para o envio posterior.</p>
        <Button
          type="button"
          className="bg-transparent text-zinc-200 hover:bg-zinc-900 hover:text-amber-300"
          onClick={() => {
            padRef.current?.clear();
            currentValueRef.current = "";
            onChange("");
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      </div>
    </div>
  );
}

"use client";

type BrandLogoProps = {
  compact?: boolean;
  showSubtitle?: boolean;
};

export function BrandLogo({ compact = false, showSubtitle = true }: BrandLogoProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full border border-[#d6b15a]/50 bg-black shadow-[0_0_24px_rgba(214,177,90,0.18)]">
          <span className="bg-gradient-to-br from-[#f4df9a] via-[#d6b15a] to-[#8b6a20] bg-clip-text text-2xl font-black italic text-transparent">
            A
          </span>
        </div>

        <div>
          <p className="text-[18px] font-extrabold leading-none tracking-tight text-[#f1c44f]">AYRONEX</p>
          {showSubtitle ? <p className="mt-1 text-[10px] tracking-[0.28em] text-slate-400">TELECOM & FIELD</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="grid size-16 shrink-0 place-items-center rounded-[1.25rem] border border-[#d6b15a]/50 bg-black shadow-[0_0_28px_rgba(214,177,90,0.18)]">
        <span className="bg-gradient-to-br from-[#f4df9a] via-[#d6b15a] to-[#8b6a20] bg-clip-text text-[2.5rem] font-black italic leading-none text-transparent">
          A
        </span>
      </div>

      <div>
        <p className="text-[1.9rem] font-black leading-none tracking-tight text-[#f1c44f]">AYRONEX</p>
        {showSubtitle ? <p className="mt-1 text-[0.7rem] tracking-[0.34em] text-slate-400">TELECOM & FIELD</p> : null}
      </div>
    </div>
  );
}

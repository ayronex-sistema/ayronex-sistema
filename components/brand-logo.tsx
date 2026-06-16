"use client";

type BrandLogoProps = {
  compact?: boolean;
  showSubtitle?: boolean;
};

export function BrandLogo({ compact = false, showSubtitle = true }: BrandLogoProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-[#d6b15a]/40 bg-black shadow-[0_0_18px_rgba(214,177,90,0.14)]">
          <span className="bg-gradient-to-br from-[#fff1bf] via-[#d6b15a] to-[#8b6a20] bg-clip-text text-[1.7rem] font-black italic leading-none text-transparent">
            A
          </span>
        </div>

        <div>
          <p className="text-[17px] font-extrabold leading-none tracking-tight text-[#f3c94d]">AYRONEX</p>
          {showSubtitle ? <p className="mt-1 text-[10px] tracking-[0.28em] text-slate-400">TELECOM & FIELD</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="grid size-14 shrink-0 place-items-center rounded-[1.15rem] border border-[#d6b15a]/40 bg-black shadow-[0_0_22px_rgba(214,177,90,0.16)]">
        <span className="bg-gradient-to-br from-[#fff1bf] via-[#d6b15a] to-[#8b6a20] bg-clip-text text-[2.15rem] font-black italic leading-none text-transparent">
          A
        </span>
      </div>

      <div>
        <p className="text-[1.75rem] font-black leading-none tracking-tight text-[#f3c94d]">AYRONEX</p>
        {showSubtitle ? <p className="mt-1 text-[0.68rem] tracking-[0.36em] text-slate-400">TELECOM & FIELD</p> : null}
      </div>
    </div>
  );
}

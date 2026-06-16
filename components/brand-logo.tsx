"use client";

type BrandLogoProps = {
  compact?: boolean;
  showSubtitle?: boolean;
};

const colors = {
  gold: "#f3c94d",
  goldLight: "#fff0b8",
  goldMid: "#d6b15a",
  goldDark: "#8b6a20",
  text: "#0b1020",
  muted: "#94a3b8",
};

export function BrandLogo({ compact = false, showSubtitle = true }: BrandLogoProps) {
  const iconSize = compact ? 40 : 56;
  const titleSize = compact ? 17 : 28;
  const subtitleSize = compact ? 10 : 11;
  const gap = compact ? 12 : 16;

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        gap,
      }}
    >
      <div
        style={{
          alignItems: "center",
          backgroundColor: "#000000",
          border: "1px solid rgba(214, 177, 90, 0.4)",
          borderRadius: compact ? 16 : 18,
          boxShadow: "0 0 22px rgba(214, 177, 90, 0.16)",
          display: "flex",
          flex: "0 0 auto",
          height: iconSize,
          justifyContent: "center",
          width: iconSize,
        }}
      >
        <span
          style={{
            background: `linear-gradient(135deg, ${colors.goldLight} 0%, ${colors.goldMid} 55%, ${colors.goldDark} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            display: "block",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: compact ? 28 : 34,
            fontStyle: "italic",
            fontWeight: 900,
            lineHeight: 1,
            transform: "translateY(-1px)",
          }}
        >
          A
        </span>
      </div>

      <div style={{ minWidth: 0 }}>
        <p
          style={{
            color: colors.gold,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: titleSize,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            margin: 0,
          }}
        >
          AYRONEX
        </p>
        {showSubtitle ? (
          <p
            style={{
              color: colors.muted,
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: subtitleSize,
              fontWeight: 500,
              letterSpacing: compact ? "0.28em" : "0.34em",
              lineHeight: 1,
              margin: "6px 0 0",
              textTransform: "uppercase",
            }}
          >
            TELECOM & FIELD
          </p>
        ) : null}
      </div>
    </div>
  );
}

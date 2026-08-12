export function Skeleton({ width, height, style }: { width?: string; height?: string; style?: React.CSSProperties }) {
  return (
    <div
      className="skeleton"
      style={{
        width: width || "100%",
        height: height || "16px",
        ...style,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <Skeleton width="60%" height="20px" />
          <Skeleton width="40%" height="14px" />
        </div>
        <Skeleton width="60px" height="26px" style={{ borderRadius: "20px" }} />
      </div>
      <Skeleton height="12px" />
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {[80, 60, 70, 55, 65].map((w, i) => (
          <Skeleton key={i} width={`${w}px`} height="22px" style={{ borderRadius: "20px" }} />
        ))}
      </div>
      <Skeleton height="38px" style={{ borderRadius: "10px", marginTop: "8px" }} />
    </div>
  );
}

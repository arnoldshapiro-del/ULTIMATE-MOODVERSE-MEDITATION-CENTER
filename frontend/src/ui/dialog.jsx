/* Lightweight dialog shim so the app can build and run.
   Keeps the same API the component expects. */

import React from "react";

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  const onBackdrop = (e) => {
    // close on backdrop click (optional)
    if (e.target === e.currentTarget && onOpenChange) onOpenChange(false);
  };
  return (
    <div
      onClick={onBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {children}
    </div>
  );
}

export function DialogContent({ children, className }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={className}
      style={{
        background: "white",
        borderRadius: 12,
        boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
        maxWidth: 900,
        width: "100%",
        padding: 16,
      }}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      {children}
    </div>
  );
}

export function DialogTitle({ children }) {
  return (
    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
      {children}
    </div>
  );
}

export function DialogDescription({ children }) {
  return (
    <div style={{ color: "#475569", fontSize: 14 }}>
      {children}
    </div>
  );
}

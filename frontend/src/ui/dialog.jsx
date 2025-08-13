/* Lightweight dialog shim so the app can build and run,
   PLUS a floating Multimedia Center launcher (vanilla JS).
   This file is imported by the app, so the launcher appears
   without editing App.js or other files. */

import React from "react";

/* --- Exports used by the app elsewhere --- */
export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  const onBackdrop = (e) => {
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
  return <div style={{ marginBottom: 8 }}>{children}</div>;
}
export function DialogTitle({ children }) {
  return (
    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
      {children}
    </div>
  );
}
export function DialogDescription({ children }) {
  return <div style={{ color: "#475569", fontSize: 14 }}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* VANILLA MULTIMEDIA LAUNCHER (no React edits required)              */
/* ------------------------------------------------------------------ */
if (typeof window !== "undefined" && typeof document !== "undefined") {
  // avoid duplicate injection
  if (!document.getElementById("umc-launcher-btn")) {
    // Floating button
    const btn = document.createElement("button");
    btn.id = "umc-launcher-btn";
    Object.assign(btn.style, {
      position: "fixed",
      right: "16px",
      bottom: "16px",
      zIndex: 9999,
      background: "#2563EB",
      color: "white",
      border: "none",
      borderRadius: "999px",
      padding: "12px 16px",
      fontWeight: "700",
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      cursor: "pointer",
    });
    btn.textContent = "Open Multimedia Center";
    document.body.appendChild(btn);

    // Overlay container (hidden by default)
    const overlay = document.createElement("div");
    overlay.id = "umc-vanilla-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(15,23,42,0.45)",
      zIndex: 9998,
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
    });

    // Modal content
    const modal = document.createElement("div");
    Object.assign(modal.style, {
      background: "white",
      borderRadius: "12px",
      width: "min(900px, 100%)",
      padding: "16px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
      maxHeight: "90vh",
      overflow: "auto",
      fontFamily:
        "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif",
    });

    modal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-weight:800;font-size:18px">Meditation & Multimedia Center</div>
        <button id="umc-close" style="border:1px solid rgba(0,0,0,.1);border-radius:8px;padding:6px 10px;background:white">Close</button>
      </div>
      <div id="umc-gate" style="display:none;background:#EEF2FF;border:1px solid #C7D2FE;border-radius:10px;padding:12px;margin-bottom:12px">
        <div style="font-weight:700">Enable Audio</div>
        <div style="color:#475569;font-size:14px;margin:6px 0 10px">Tap once to allow audio/video playback. This is required by your browser.</div>
        <button id="umc-enable" style="background:#2563EB;color:white;border:0;border-radius:8px;padding:8px 12px;font-weight:700">Enable & Continue</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr;gap:12px">
        <section style="border:1px solid #E2E8F0;border-radius:10px;padding:12px">
          <div style="font-weight:700;margin-bottom:8px">Breathing (video)</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="umc-video" data-url="https://player.vimeo.com/external/638875633.sd.mp4?s=8a7f66e2c9b7c92e2b6e0b4f1c6a5dd70b8f5c7b&profile_id=164">Box Breathing</button>
            <button class="umc-video" data-url="https://player.vimeo.com/external/637317440.sd.mp4?s=da1f4d45b5f4aed2701d2cd8f1f937ca2b45a092&profile_id=164">Coherent (5s)</button>
          </div>
          <video id="umc-video" controls style="width:100%;margin-top:8px;border-radius:10px;background:black"></video>
        </section>

        <section style="border:1px solid #E2E8F0;border-radius:10px;padding:12px">
          <div style="font-weight:700;margin-bottom:8px">Nature Sounds (loop)</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="umc-sound" data-url="/media/gentle-rain.wav">Gentle Rain</button>
            <button class="umc-sound" data-url="/media/ocean-waves.wav">Ocean Waves</button>
            <button class="umc-sound" data-url="/media/gentle-wind.wav">Gentle Wind</button>
            <button class="umc-sound" data-url="/media/forest-ambience.wav">Forest Ambience</button>
            <button class="umc-sound" data-url="/media/flowing-river.wav">Flowing River</button>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
            <label style="font-size:13px">Volume</label>
            <input id="umc-svol" type="range" min="0" max="1" step="0.01" value="0.7" />
          </div>
        </section>
      </div>
    `;

    modal.querySelectorAll("button.umc-video, button.umc-sound").forEach((b) => {
      Object.assign(b.style, {
        border: "1px solid rgba(0,0,0,.1)",
        borderRadius: "8px",
        padding: "8px 10px",
        background: "white",
        cursor: "pointer",
      });
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const closeBtn = modal.querySelector("#umc-close");
    const videoEl = modal.querySelector("#umc-video");
    const gate = modal.querySelector("#umc-gate");
    const enableBtn = modal.querySelector("#umc-enable");
    const soundVol = modal.querySelector("#umc-svol");

    const soundAudio = new Audio();
    soundAudio.loop = true;
    soundAudio.volume = parseFloat(soundVol.value || "0.7");

    // Audio gate handling
    let userActivated = false;
    const ensureActivation = async () => {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          if (!window.__umc_ac) window.__umc_ac = new AC();
          if (window.__umc_ac.state === "suspended") await window.__umc_ac.resume();
        }
        userActivated = true;
        return true;
      } catch {
        gate.style.display = "block";
        return false;
      }
    };

    enableBtn.addEventListener("click", async () => {
      try {
        await ensureActivation();
        gate.style.display = "none";
      } catch {}
    });

    modal.querySelectorAll(".umc-video").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!userActivated) {
          const ok = await ensureActivation();
          if (!ok) return;
        }
        try {
          videoEl.src = btn.getAttribute("data-url");
          await videoEl.play();
        } catch {
          gate.style.display = "block";
        }
      });
    });

    modal.querySelectorAll(".umc-sound").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!userActivated) {
          const ok = await ensureActivation();
          if (!ok) return;
        }
        try {
          soundAudio.src = btn.getAttribute("data-url");
          soundAudio.volume = parseFloat(soundVol.value || "0.7");
          await soundAudio.play();
        } catch {
          gate.style.display = "block";
        }
      });
    });

    soundVol.addEventListener("input", () => {
      soundAudio.volume = parseFloat(soundVol.value || "0.7");
    });

    // Open / Close logic
    btn.addEventListener("click", () => {
      overlay.style.display = "flex";
    });
    closeBtn.addEventListener("click", () => {
      overlay.style.display = "none";
      try { videoEl.pause(); } catch {}
      try { soundAudio.pause(); } catch {}
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.style.display = "none";
        try { videoEl.pause(); } catch {}
        try { soundAudio.pause(); } catch {}
      }
    });
  }
}

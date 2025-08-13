// Inject a floating "Open Multimedia Center" button and modal — no React edits required.
(function () {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (document.getElementById("umc-launcher-btn")) return;

  // Floating button
  const btn = document.createElement("button");
  btn.id = "umc-launcher-btn";
  Object.assign(btn.style, {
    position: "fixed", right: "16px", bottom: "16px", zIndex: 9999,
    background: "#2563EB", color: "white", border: "none",
    borderRadius: "999px", padding: "12px 16px", fontWeight: "700",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)", cursor: "pointer"
  });
  btn.textContent = "Open Multimedia Center";
  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(btn));

  // Overlay + modal
  const overlay = document.createElement("div");
  overlay.id = "umc-vanilla-overlay";
  Object.assign(overlay.style, {
    position: "fixed", inset: "0", background: "rgba(15,23,42,0.45)",
    zIndex: 9998, display: "none", alignItems: "center",
    justifyContent: "center", padding: "16px"
  });

  const modal = document.createElement("div");
  Object.assign(modal.style, {
    background: "white", borderRadius: "12px", width: "min(900px, 100%)",
    padding: "16px", boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
    maxHeight: "90vh", overflow: "auto",
    fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif"
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
      border: "1px solid rgba(0,0,0,.1)", borderRadius: "8px", padding: "8px 10px", background: "white", cursor: "pointer"
    });
  });

  overlay.appendChild(modal);
  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(overlay));

  // Elements
  let userActivated = false;
  const videoEl = modal.querySelector("#umc-video");
  const gate = modal.querySelector("#umc-gate");
  const enableBtn = modal.querySelector("#umc-enable");
  const soundVol = modal.querySelector("#umc-svol");
  const closeBtn = modal.querySelector("#umc-close");
  const soundAudio = new Audio();
  soundAudio.loop = true;
  soundAudio.volume = parseFloat(soundVol.value || "0.7");

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
    try { await ensureActivation(); gate.style.display = "none"; } catch {}
  });

  // Handlers
  modal.querySelectorAll(".umc-video").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!userActivated) { const ok = await ensureActivation(); if (!ok) return; }
      try { videoEl.src = btn.getAttribute("data-url"); await videoEl.play(); }
      catch { gate.style.display = "block"; }
    });
  });

  modal.querySelectorAll(".umc-sound").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!userActivated) { const ok = await ensureActivation(); if (!ok) return; }
      try { soundAudio.src = btn.getAttribute("data-url"); soundAudio.volume = parseFloat(soundVol.value||"0.7"); await soundAudio.play(); }
      catch { gate.style.display = "block"; }
    });
  });

  soundVol.addEventListener("input", () => {
    soundAudio.volume = parseFloat(soundVol.value || "0.7");
  });

  // Open / close
  btn.addEventListener("click", () => { overlay.style.display = "flex"; });
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
})();

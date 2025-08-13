/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

let sharedAudioContext = null;
function getSharedAudioContext() {
  try {
    if (!sharedAudioContext) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) sharedAudioContext = new AC();
    }
  } catch (e) {
    // ignore
  }
  return sharedAudioContext;
}

export default function UltimateMeditationCenter({
  open,
  onOpenChange,
  standalone = false,
}) {
  const [standaloneMode, setStandaloneMode] = useState(false);
  // Audio permission gate
  const [userActivated, setUserActivated] = useState(false);
  const [showGate, setShowGate] = useState(false);

  // Timer management
  const [sessionActive, setSessionActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef(null);

  // Video & audio refs
  const videoRef = useRef(null);
  const natureAudioRef = useRef(null);
  const guideAudioRef = useRef(null);
  const musicAudioRef = useRef(null);

  // Simple UI state
  const [activeTab, setActiveTab] = useState("breathe"); // breathe | meditate | sounds | music
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [selectedSound, setSelectedSound] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [natureVolume, setNatureVolume] = useState(0.7);
  const [guideVolume, setGuideVolume] = useState(0.8);
  const [musicVolume, setMusicVolume] = useState(0.6);

  // Overlay gate helper
  const ensureActivation = async () => {
    try {
      if (!userActivated) setUserActivated(true);
      const ctx = getSharedAudioContext();
      if (ctx && ctx.state === "suspended") {
        await ctx.resume();
      }
      return true;
    } catch (e) {
      setShowGate(true);
      return false;
    }
  };

  // Keep volumes applied
  useEffect(() => {
    if (natureAudioRef.current) natureAudioRef.current.volume = natureVolume;
  }, [natureVolume]);
  useEffect(() => {
    if (guideAudioRef.current) guideAudioRef.current.volume = guideVolume;
  }, [guideVolume]);
  useEffect(() => {
    if (musicAudioRef.current) musicAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  // Stop everything on close
  useEffect(() => {
    if (!open) {
      stopAll();
    }
  }, [open]);

  const startTimer = (mins) => {
    const secs = Math.max(1, Math.floor(mins * 60));
    setRemainingSeconds(secs);
    setSessionActive(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemainingSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setSessionActive(false);
          stopAll();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    setSessionActive(false);
    setRemainingSeconds(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopAll = () => {
    try {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        videoRef.current.removeAttribute("src");
        videoRef.current.load();
      }
    } catch {}
    try {
      if (natureAudioRef.current) {
        natureAudioRef.current.pause();
        natureAudioRef.current.currentTime = 0;
        natureAudioRef.current.removeAttribute("src");
        natureAudioRef.current.load();
      }
    } catch {}
    try {
      if (guideAudioRef.current) {
        guideAudioRef.current.pause();
        guideAudioRef.current.currentTime = 0;
        guideAudioRef.current.removeAttribute("src");
        guideAudioRef.current.load();
      }
    } catch {}
    try {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        musicAudioRef.current.currentTime = 0;
        musicAudioRef.current.removeAttribute("src");
        musicAudioRef.current.load();
      }
    } catch {}
  };

  // Library (example items; extend as you like)
  const BREATH_VIDEOS = [
    {
      id: "box-breath",
      title: "Box Breathing (4–4–4–4)",
      url:
        "https://player.vimeo.com/external/638875633.sd.mp4?s=8a7f66e2c9b7c92e2b6e0b4f1c6a5dd70b8f5c7b&profile_id=164",
    },
    {
      id: "coherent",
      title: "Coherent Breathing (5s)",
      url:
        "https://player.vimeo.com/external/637317440.sd.mp4?s=da1f4d45b5f4aed2701d2cd8f1f937ca2b45a092&profile_id=164",
    },
  ];

  const MEDITATIONS = [
    {
      id: "body-scan",
      title: "Guided Body Scan (5m)",
      url:
        "https://player.vimeo.com/external/331244137.sd.mp4?s=8b734c720a3a9a3c6d2e3e92f6f39a65c3f3e0af&profile_id=164",
    },
    {
      id: "loving-kindness",
      title: "Loving Kindness (6m)",
      url:
        "https://player.vimeo.com/external/469755103.sd.mp4?s=974b5fbe9fa9b2fcb0c8e7a99c71a3e418f7c1a9&profile_id=164",
    },
  ];

  const NATURE_SOUNDS = [
    { id: "rain", title: "Gentle Rain", url: "/media/gentle-rain.wav", loop: true },
    { id: "ocean", title: "Ocean Waves", url: "/media/ocean-waves.wav", loop: true },
    { id: "wind", title: "Gentle Wind", url: "/media/gentle-wind.wav", loop: true },
    { id: "forest", title: "Forest Ambience", url: "/media/forest-ambience.wav", loop: true },
    { id: "river", title: "Flowing River", url: "/media/flowing-river.wav", loop: true },
  ];

  const MUSIC_CLIPS = [
    // You may add licensed/royalty-free files in /public/media and list them here
    // { id: 'calm-1', title: 'Calm Piano', url: '/media/calm-piano.mp3', loop: true }
  ];

  const playVideo = async (item) => {
    if (!item) return;
    setSelectedMeditation(item.id);
    try {
      const ok = await ensureActivation();
      if (!ok) return;
      if (videoRef.current) {
        videoRef.current.src = item.url;
        await videoRef.current.play();
      }
    } catch (err) {
      setShowGate(true);
    }
  };

  const playNature = async (item) => {
    if (!item) return;
    setSelectedSound(item.id);
    try {
      const ok = await ensureActivation();
      if (!ok) return;
      if (natureAudioRef.current) {
        natureAudioRef.current.src = item.url;
        natureAudioRef.current.loop = !!item.loop;
        natureAudioRef.current.volume = natureVolume;
        await natureAudioRef.current.play();
      }
    } catch (err) {
      setShowGate(true);
    }
  };

  const playMusic = async (item) => {
    if (!item) return;
    setSelectedMusic(item.id);
    try {
      const ok = await ensureActivation();
      if (!ok) return;
      if (musicAudioRef.current) {
        musicAudioRef.current.src = item.url;
        musicAudioRef.current.loop = !!item.loop;
        musicAudioRef.current.volume = musicVolume;
        await musicAudioRef.current.play();
      }
    } catch (err) {
      setShowGate(true);
    }
  };

  const pauseAll = () => {
    try { if (videoRef.current) videoRef.current.pause(); } catch {}
    try { if (natureAudioRef.current) natureAudioRef.current.pause(); } catch {}
    try { if (guideAudioRef.current) guideAudioRef.current.pause(); } catch {}
    try { if (musicAudioRef.current) musicAudioRef.current.pause(); } catch {}
  };

  const timeFmt = (s) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Audio permission overlay */}
      {showGate && !userActivated && (
        <div
          id="audio-gate-overlay"
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,23,42,0.55)",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "24px 28px",
              maxWidth: 520,
              boxShadow: "0 8px 30px rgba(0,0,0,.2)",
            }}
          >
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              Enable Audio
            </h3>
            <p style={{ color: "#475569", marginBottom: 16 }}>
              Tap once to allow audio/video playback. This is required by your
              browser.
            </p>
            <button
              onClick={async () => {
                setUserActivated(true);
                try {
                  const ctx = getSharedAudioContext();
                  if (ctx && ctx.state === "suspended") {
                    await ctx.resume();
                  }
                } catch {}
                setShowGate(false);
              }}
              style={{
                background: "#2563EB",
                color: "white",
                border: 0,
                borderRadius: 12,
                padding: "10px 16px",
                fontWeight: 700,
              }}
            >
              Enable & Continue
            </button>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Meditation & Multimedia Center</DialogTitle>
            <DialogDescription>
              Breathing, guided meditations, nature sounds, and music.
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              className={activeTab === "breathe" ? "btn-primary" : "btn"}
              onClick={() => setActiveTab("breathe")}
            >
              Breathe
            </button>
            <button
              className={activeTab === "meditate" ? "btn-primary" : "btn"}
              onClick={() => setActiveTab("meditate")}
            >
              Meditate
            </button>
            <button
              className={activeTab === "sounds" ? "btn-primary" : "btn"}
              onClick={() => setActiveTab("sounds")}
            >
              Nature Sounds
            </button>
            <button
              className={activeTab === "music" ? "btn-primary" : "btn"}
              onClick={() => setActiveTab("music")}
            >
              Music
            </button>
          </div>

          {/* Breathe */}
          {activeTab === "breathe" && (
            <div className="space-y-3">
              <div className="text-sm text-slate-600">
                Select a breathing guidance and press Play.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BREATH_VIDEOS.map((v) => (
                  <div
                    key={v.id}
                    className={`p-3 rounded border ${
                      selectedMeditation === v.id ? "border-blue-500" : "border-slate-200"
                    }`}
                  >
                    <div className="font-semibold mb-2">{v.title}</div>
                    <div className="flex gap-2">
                      <button className="btn" onClick={() => playVideo(v)}>
                        Play
                      </button>
                      <button className="btn" onClick={pauseAll}>
                        Pause
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <video
                ref={videoRef}
                controls
                style={{ width: "100%", borderRadius: 12, background: "black" }}
              />
            </div>
          )}

          {/* Meditate */}
          {activeTab === "meditate" && (
            <div className="space-y-3">
              <div className="text-sm text-slate-600">
                Choose a guided meditation and press Play.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MEDITATIONS.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded border ${
                      selectedMeditation === m.id ? "border-blue-500" : "border-slate-200"
                    }`}
                  >
                    <div className="font-semibold mb-2">{m.title}</div>
                    <div className="flex gap-2">
                      <button className="btn" onClick={() => playVideo(m)}>
                        Play
                      </button>
                      <button className="btn" onClick={pauseAll}>
                        Pause
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nature Sounds */}
          {activeTab === "sounds" && (
            <div className="space-y-3">
              <div className="text-sm text-slate-600">
                Tap a sound to play (loops). Adjust volume below.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {NATURE_SOUNDS.map((s) => (
                  <div
                    key={s.id}
                    className={`p-3 rounded border ${
                      selectedSound === s.id ? "border-blue-500" : "border-slate-200"
                    }`}
                  >
                    <div className="font-semibold mb-2">{s.title}</div>
                    <div className="flex gap-2">
                      <button className="btn" onClick={() => playNature(s)}>
                        Play
                      </button>
                      <button className="btn" onClick={pauseAll}>
                        Pause
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm">Nature volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={natureVolume}
                  onChange={(e) => setNatureVolume(parseFloat(e.target.value))}
                />
              </div>
              <audio ref={natureAudioRef} />
            </div>
          )}

          {/* Music */}
          {activeTab === "music" && (
            <div className="space-y-3">
              <div className="text-sm text-slate-600">
                Add your licensed files to <code>/public/media</code> and list them here.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MUSIC_CLIPS.length === 0 && (
                  <div className="text-slate-500 text-sm">
                    No clips yet. (We left this empty to avoid licensing issues.)
                  </div>
                )}
                {MUSIC_CLIPS.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded border ${
                      selectedMusic === m.id ? "border-blue-500" : "border-slate-200"
                    }`}
                  >
                    <div className="font-semibold mb-2">{m.title}</div>
                    <div className="flex gap-2">
                      <button className="btn" onClick={() => playMusic(m)}>
                        Play
                      </button>
                      <button className="btn" onClick={pauseAll}>
                        Pause
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm">Music volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                />
              </div>
              <audio ref={musicAudioRef} />
            </div>
          )}

          {/* Session controls */}
          <div className="mt-5 p-3 rounded border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <button className="btn" onClick={() => startTimer(5)}>
                5 min
              </button>
              <button className="btn" onClick={() => startTimer(10)}>
                10 min
              </button>
              <button className="btn" onClick={() => startTimer(15)}>
                15 min
              </button>
              <button className="btn" onClick={stopTimer}>
                Stop
              </button>
              <button className="btn" onClick={pauseAll}>
                Pause All
              </button>
            </div>
            <div className="text-sm text-slate-600">
              {sessionActive ? `Time left: ${timeFmt(remainingSeconds)}` : "No active session"}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
